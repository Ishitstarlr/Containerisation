# Containerisation Submission Evidence

## Phase 6 — Consolidated orchestration and build cache analysis

### Reproduce

1. Copy the tracked environment template and set deployment-specific values:

   ```sh
   cp .env.example .env
   ```

   `.env` is intentionally ignored by Git. It supplies the PostgreSQL credentials,
   backend connection string, Auth0 configuration, and the reverse-proxy host ports.
   The Compose file has no fallback credentials: a missing required value causes
   configuration expansion to fail with a useful error.

2. Start and build every service:

   ```sh
   docker compose up --build -d
   ```

3. Verify the resolved configuration and application path:

   ```sh
   docker compose config --quiet
   docker compose ps
   curl --fail --insecure https://localhost/ -o /dev/null
   curl --fail --insecure https://localhost/api/events -o /dev/null
   ```

`proxy` waits until PostgreSQL is healthy, migrations have finished, and the
backend is listening. This prevents the reverse proxy from accepting API traffic
while the backend is still starting.

### Verification evidence

The final `docker compose up --build -d` run reported:

```text
NAME             IMAGE                       SERVICE    STATUS
orbis-backend    containerisation-backend    backend    Up 5 seconds (healthy)
orbis-db         postgres:15-alpine          database   Up 2 hours (healthy)
orbis-frontend   containerisation-frontend   frontend   Up 6 seconds
orbis-proxy      nginx:alpine                proxy      Up 23 minutes
```

The HTTPS frontend request completed successfully and the API request produced:

```text
200
```

Backend startup logs also confirmed `No pending migrations to apply.`, `Server
running on port 4000`, and `Database connected successfully`.

### Build-cache experiment

The frontend API client was changed by one source line:

```diff
-  baseURL: import.meta.env.VITE_API_URL || '',
+  baseURL: import.meta.env.VITE_API_URL || '/',
```

The `/` fallback keeps API URLs rooted at the reverse proxy even while a user is
on a nested frontend route. After that edit, `docker compose up --build -d` gave
these relevant BuildKit results:

```text
#12 [frontend builder 3/6] COPY package.json package-lock.json ./
#12 CACHED
#13 [frontend builder 4/6] RUN npm ci
#13 CACHED
#23 [frontend builder 5/6] COPY . .
#23 DONE 0.0s
#25 [frontend builder 6/6] RUN npm run build
#25 DONE 5.8s
#28 [frontend stage-1 3/3] COPY --from=builder /app/dist /usr/share/nginx/html
#28 DONE 0.0s
#15 [backend  7/10] RUN npx prisma generate
#15 CACHED
#21 [backend  5/10] RUN npm ci --omit=dev
#21 CACHED
#18 [backend  8/10] COPY . .
#18 CACHED
```

The dependency manifests are copied before application source, so their unchanged
content preserves the expensive `npm ci` cache layer. The changed frontend source
invalidated only the later source copy, Vite build, and final static-bundle copy.
All backend layers remained cached because its context did not change. The backend
also excludes local dependencies, Git metadata, and environment files through
`backend/.dockerignore`, preventing those files from invalidating build layers or
entering the build context.

### Defects found and fixed during verification

The first clean build intentionally used `npm ci` and exposed an invalid frontend
lockfile. Docker returned:

```text
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: function.prototype.name@1.2.0 from lock file
npm error Invalid: lock file's hasown@2.0.2 does not satisfy hasown@2.0.4
npm error Missing: is-document.all@1.0.0 from lock file
```

Diagnosis: the lockfile did not describe the package graph requested by
`package.json`. Fix: regenerated only `frontend/package-lock.json` with
`npm install --package-lock-only --ignore-scripts`; the subsequent clean Docker
build completed with `npm ci`.

An immediate API request after a backend recreation initially returned `502`
because Compose treated the migration-running backend process as started before
it was ready to accept connections. Fix: added a TCP backend healthcheck and made
the proxy depend on `backend: condition: service_healthy`. The final verification
above returned `200` after Compose waited for readiness.
