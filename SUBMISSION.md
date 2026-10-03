# Containerisation Submission Evidence

## Final reproduction and verification (Phases 1–8)

### Prerequisites

- Docker Desktop or Docker Engine with the Compose v2 plugin
- `curl`; ApacheBench (`ab`) only for the optional Phase 7 benchmark

### Start the complete stack

```sh
git clone <your-private-repository-url>
cd Containerisation
cp .env.example .env
# Replace the example values before any non-local deployment.
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

The checked-in `.env.example` is a local development template; `.env` is ignored
and must not be committed. The final Compose configuration starts PostgreSQL,
three backend replicas (the `BACKEND_REPLICAS` value controls this), the
unprivileged frontend, and the HTTPS reverse proxy. Only the proxy publishes
host ports, which default to 80 and 443.

### Final verification commands

```sh
# HTTP redirects; HTTPS serves frontend and public API traffic.
curl -I http://localhost/
curl --fail --insecure https://localhost/ -o /dev/null
curl --fail --insecure https://localhost/api/events -o /dev/null

# Validate the proxy and the unprivileged frontend configuration.
docker compose exec -T proxy nginx -t
docker compose exec -T frontend nginx -t

# Show the runtime identities.
docker compose exec -T backend whoami
docker compose exec -T frontend whoami
```

The final clean verification on 2026-09-30 used `docker compose down` (without
`-v`) followed by `docker compose up --build -d`. It produced three healthy
backend containers, a healthy database, and running frontend/proxy containers.
The host checks produced a `301 Moved Permanently` from HTTP and
`API_STATUS=200` from `https://localhost/api/events`.

## Phase 1 — End-to-end build and verification

### Historical diagnostics and fixes

The Phase 1 changes are recorded in commit `dde9e5b`. Contemporaneous terminal
logs from that earlier work were not retained, so this document does not invent
raw output for them. The committed diff identifies these diagnosed faults and
their fixes:

- The backend image generated Prisma before its schema and dependencies were
  available. Dependency manifests are now copied before `npm ci`, the Prisma
  schema is copied before client generation, and OpenSSL is installed for Prisma.
- The backend could start before PostgreSQL was ready. A PostgreSQL healthcheck
  and health-gated backend dependency were added; the entrypoint applies Prisma
  migrations before starting Node.
- The backend was placed on the wrong network and the proxy targeted the
  non-existent `backend-api` hostname. Both now use the Compose `backend`
  service on the backend network.
- The frontend defaulted to a direct host backend URL. It now uses the reverse
  proxy path, avoiding browser-to-container addressing failures.

The current final run provides the retained raw runtime evidence:

```text
20 migrations found in prisma/migrations
No pending migrations to apply.
Starting backend server...
Server running on port 4000
Database connected successfully
```

## Phase 2 — Frontend image optimization

The frontend is a multi-stage build: Node and all build dependencies exist only
in the builder stage, while the runtime contains the static Vite bundle and
unprivileged Nginx. The final checked image was below the 110MB requirement:

```text
containerisation-frontend:latest 83.8MB
```

## Phase 3 — Database configuration and persistence

PostgreSQL receives `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from
`.env`; the backend receives its connection string from the same file. No
database port is published. Data is stored in the named `postgres_data` volume.

For the final persistence test, a temporary table and record were inserted,
containers and networks were removed with `docker compose down` (without
`-v`), the stack was rebuilt, and the record was queried before the temporary
table was dropped. Raw output:

```text
CREATE TABLE
INSERT 0 1
    id
----------
 20260930
(1 row)

    id
----------
 20260930
(1 row)

DROP TABLE
```

## Phase 4 — Network segmentation and isolation

The final topology has a frontend network containing only frontend and proxy,
and a backend network containing database, three backend replicas, and proxy.
The complete raw `docker network inspect` output from the final run is tracked
in [`evidence/final-network-inspect.json`](evidence/final-network-inspect.json).

Host and internal connectivity verification produced:

```text
BACKEND_HOST_PORT=unreachable
DATABASE_HOST_PORT=unreachable
INTERNAL_DATABASE=reachable
```

This is consistent with Compose publishing only the proxy's 80 and 443 ports.

## Phase 5 — HTTPS termination and HTTP redirection

Nginx terminates TLS with the checked-in self-signed localhost certificate and
redirects port 80 to HTTPS. Final raw HTTP and TLS output:

```text
HTTP/1.1 301 Moved Permanently
Location: https://localhost/

Protocol version: TLSv1.3
Ciphersuite: TLS_AES_256_GCM_SHA384
Peer certificate: CN=localhost
Verification error: self-signed certificate
```

The self-signed verification warning is expected for a local certificate;
`curl --insecure` was used only for local verification.

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

## Phase 7 — Scaling, load balancing, and rate limiting

### What I changed

I set `BACKEND_REPLICAS=3` in `.env`, so Compose starts three backend
containers. Nginx has a `backend_pool` for `/api/` requests. It sends one request
to each backend in turn (round-robin), instead of sending every request to only
one container. Docker's internal DNS lets Nginx find the backend containers.

I added the `X-Backend-Hostname` response header only as a simple way to check
which backend answered a request. Six requests gave three different names,
repeating in order:

```text
X-Backend-Hostname: 1326f51ec395
X-Backend-Hostname: b0cf360f36be
X-Backend-Hostname: 59788145450c
X-Backend-Hostname: 1326f51ec395
X-Backend-Hostname: b0cf360f36be
X-Backend-Hostname: 59788145450c
```

`nginx -t` passed and `docker compose ps` showed all three backends as healthy.
Only the proxy is published on ports 80 and 443.

I also added an Nginx rate limit for the API: one client can make 100 requests
per second, with a burst of 100. Requests above that return HTTP 429. This is a
basic protection against one client flooding the API.

I repeated the check after the hardening changes. It still used all three
backends, and the larger test still produced 429 responses:

```text
X-Backend-Hostname: c462f7d0d3b6
X-Backend-Hostname: 5053745bcea9
X-Backend-Hostname: 81e8bf137a26
X-Backend-Hostname: c462f7d0d3b6
X-Backend-Hostname: 5053745bcea9
X-Backend-Hostname: 81e8bf137a26
Complete requests:      250
Failed requests:        106
Non-2xx responses:      106
"GET /api/events HTTP/1.0" 429 169 "-" "ApacheBench/2.3" "-"
```

### Load test

I used ApacheBench (`ab`) against the public `GET /api/events` endpoint. First I
ran it with one backend, then with three backends. The 100-request tests stay
within the rate-limit burst allowance. The final bigger test is only to check
that the rate limit returns 429:

```sh
# baseline
docker compose up --build -d --force-recreate --scale backend=1
ab -n 100 -c 10 https://localhost/api/events

# scaled
docker compose up --build -d --force-recreate --scale backend=3
ab -n 100 -c 10 https://localhost/api/events

# rate-limit verification
ab -n 250 -c 50 https://localhost/api/events
```

### Raw single-replica output

```text
This is ApacheBench, Version 2.3 <$Revision: 1913912 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient).....done


Server Software:        nginx/1.31.6
Server Hostname:        localhost
Server Port:            443
SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES256-GCM-SHA384,2048,256
Server Temp Key:        ECDH X25519 253 bits
TLS Server Name:        localhost

Document Path:          /api/events
Document Length:        2 bytes

Concurrency Level:      10
Time taken for tests:   0.256 seconds
Complete requests:      100
Failed requests:        0
Total transferred:      36900 bytes
HTML transferred:       200 bytes
Requests per second:    390.03 [#/sec] (mean)
Time per request:       25.639 [ms] (mean)
Time per request:       2.564 [ms] (mean, across all concurrent requests)
Transfer rate:          140.55 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        5   12   2.1     12      16
Processing:     4   13   5.7     11      35
Waiting:        3   12   5.5     11      34
Total:         10   24   6.8     23      47

Percentage of the requests served within a certain time (ms)
  50%     23
  66%     24
  75%     25
  80%     25
  90%     35
  95%     44
  98%     47
  99%     47
 100%     47 (longest request)
```

### Raw three-replica output

```text
This is ApacheBench, Version 2.3 <$Revision: 1913912 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient).....done


Server Software:        nginx/1.31.6
Server Hostname:        localhost
Server Port:            443
SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES256-GCM-SHA384,2048,256
Server Temp Key:        ECDH X25519 253 bits
TLS Server Name:        localhost

Document Path:          /api/events
Document Length:        2 bytes

Concurrency Level:      10
Time taken for tests:   0.254 seconds
Complete requests:      100
Failed requests:        0
Total transferred:      36900 bytes
HTML transferred:       200 bytes
Requests per second:    393.66 [#/sec] (mean)
Time per request:       25.402 [ms] (mean)
Time per request:       2.540 [ms] (mean, across all concurrent requests)
Transfer rate:          141.86 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        4   13   2.2     12      19
Processing:     2   11   3.2     12      20
Waiting:        2   10   3.1     11      17
Total:          7   24   4.3     24      37

Percentage of the requests served within a certain time (ms)
  50%     24
  66%     25
  75%     25
  80%     26
  90%     27
  95%     37
  98%     37
  99%     37
 100%     37 (longest request)
```

The one-backend run handled 390.03 requests/sec and the three-backend run handled
393.66 requests/sec. This is only a small difference because the endpoint is a
small database read on one local machine. The important check here is that the
hostname headers show that Nginx really used all three containers.

### Rate-limit burst output

```text
This is ApacheBench, Version 2.3 <$Revision: 1913912 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)


Server Software:        nginx/1.31.6
Server Hostname:        localhost
Server Port:            443
SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES256-GCM-SHA384,2048,256
Server Temp Key:        ECDH X25519 253 bits
TLS Server Name:        localhost

Document Path:          /api/events
Document Length:        2 bytes

Concurrency Level:      50
Time taken for tests:   0.496 seconds
Complete requests:      250
Failed requests:        177
   (Connect: 0, Receive: 0, Length: 177, Exceptions: 0)
Non-2xx responses:      177
Total transferred:      84816 bytes
HTML transferred:       30059 bytes
Requests per second:    503.62 [#/sec] (mean)
Time per request:       99.281 [ms] (mean)
Time per request:       1.986 [ms] (mean, across all concurrent requests)
Transfer rate:          166.86 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        4   65  14.2     62      87
Processing:     3   25  20.9     15      87
Waiting:        2   20  20.0     12      72
Total:          8   90  25.7     83     160

Percentage of the requests served within a certain time (ms)
  50%     83
  66%     88
  75%     93
  80%     96
  90%    150
  95%    158
  98%    158
  99%    158
 100%    160 (longest request)
```

The 177 failed requests in this test are expected 429 rate-limit responses, not
backend crashes. The earlier 100-request runs worked, and the proxy log also
showed 429 explicitly:

```text
"GET /api/events HTTP/1.0" 429 169 "-" "ApacheBench/2.3" "-"
```

## Phase 8 — Container hardening and CI

### Runtime hardening

The main idea in this phase was to make the final containers less risky if
something goes wrong inside them.

Both Dockerfiles now use a non-root user. The backend runs as `node`. The
frontend runs as `nginx` on port 8080, which is not a privileged port. The
backend build creates Prisma and production dependencies before the final image,
so the final image does not need build tools. The frontend final image contains
only the generated static files and unprivileged Nginx.

I also expanded both `.dockerignore` files. They leave out `.env` files, keys,
Git files, dependencies, build output, logs, coverage, and other local files.
That keeps accidental secrets and unnecessary files out of Docker build
contexts. The observed contexts were 5.56kB for the backend and 2.84kB for the
frontend.

### Non-root and end-to-end evidence

After rebuilding, the three backends and database were healthy; frontend and
proxy were running. I used these checks to make sure the application containers
were not running as root and that both Nginx configurations were valid:

```sh
docker compose exec -T backend whoami
docker compose exec -T backend id
docker compose exec -T frontend whoami
docker compose exec -T frontend id
docker compose exec -T frontend nginx -t
docker compose exec -T proxy nginx -t
curl --fail --insecure https://localhost/ -o /dev/null
curl --fail --insecure https://localhost/api/events -o /dev/null
```

Raw identity and Nginx validation output:

```text
node
uid=1000(node) gid=1000(node) groups=1000(node)
nginx
uid=101(nginx) gid=101(nginx) groups=101(nginx)
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
containerisation-frontend:latest 83.8MB
containerisation-backend:latest 339MB
```

### CI pipeline

`.github/workflows/docker-build.yml` runs on pushes and pull requests. It checks
both Dockerfiles with Hadolint and builds both images. I also ran the same checks
locally:

```sh
docker run --rm -i hadolint/hadolint hadolint --failure-threshold error - < backend/Dockerfile
docker run --rm -i hadolint/hadolint hadolint --failure-threshold error - < frontend/Dockerfile
docker build -t orbis-backend:ci ./backend
docker build -t orbis-frontend:ci ./frontend
```

Hadolint had no errors. It showed only warnings about the OpenSSL package not
being version-pinned and about named non-root users. The workflow treats errors
as failures, so the warnings did not fail the build.

After pushing the private repository, GitHub Actions ran successfully on `main`
for commit `a94f275` in 52 seconds. A screenshot of the green
`Docker build and lint` run was captured for the Phase 8 submission evidence.

## Post-review frontend integration verification

After the project review, the requirement was clarified: the supplied frontend
must work through the containerized deployment, rather than only the backend API.
The initial frontend build exposed a supplied configuration defect: several pages
formed requests directly as `${import.meta.env.VITE_API_URL}/api/...`. With no
`VITE_API_URL` supplied at build time, the browser therefore requested
`/undefined/api/events`.

The deployment now passes the public `VITE_*` build arguments explicitly from
the root `.env` through Compose to the frontend image. `VITE_API_URL` defaults to
an empty string, deliberately making all API requests same-origin (`/api/...`)
and therefore routing them through the HTTPS Nginx proxy. `.env.example` records
the optional settings and explains that a blank API URL is the intended default.

The frontend also no longer mounts Auth0 with missing browser credentials. When
`VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are absent, public pages render
normally and Login/Register show a clear configuration message. Real Auth0
login cannot be verified or enabled with the starter repository alone: it needs
a real Auth0 browser application, its client ID/domain, and an allowed callback
URL. Those credentials are intentionally not invented or committed.

### Reproduction and raw verification

From the repository root, use the following command after copying
`.env.example` to `.env` and choosing non-secret local database values:

```sh
docker compose up --build -d --force-recreate
docker compose ps
curl --insecure --fail https://localhost/events -o /dev/null
curl --insecure --fail https://localhost/api/events
```

The final rebuilt deployment returned:

```text
containerisation-backend-1   Up (healthy)
containerisation-backend-2   Up (healthy)
containerisation-backend-3   Up (healthy)
orbis-db                      Up (healthy)
orbis-frontend                Up
orbis-proxy                   Up   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
events_page=200
events_api=200 body=2
[]
compiled_bundle_has_no_undefined_api_url
```

The browser bundle was fetched from the live proxy and searched after the
rebuild; it contains `/api/events` references and no `undefined/api` string.
Proxy access logs recorded successful `GET /events`, `GET /assets/...js`, and
`GET /api/events` requests, all with status `200`.

For an interactive check, open `https://localhost/events` and accept the local
development certificate warning if the browser displays one. The Events page
should load through the same-origin proxy rather than request `/undefined/api`.
Authentication-dependent actions require the Auth0 values described above; the
unconfigured Login/Register screens are expected to show their setup message.
