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

## Phase 7 — Scaling, load balancing, and rate limiting

### Configuration and verification

`BACKEND_REPLICAS=3` in `.env` controls the Compose `deploy.replicas` value.
The backend has no fixed `container_name`, so Compose can create multiple
instances. Nginx defines `backend_pool`, resolves Docker DNS dynamically through
`127.0.0.11`, and sends `/api/` requests to that pool with the default
round-robin policy. The upstream is dynamic so it discovers all replicas rather
than retaining only the IP returned during Nginx startup.

The API response includes `X-Backend-Hostname` solely to make this deployment
verifiable. With three healthy replicas, six successive public requests returned:

```text
X-Backend-Hostname: 1326f51ec395
X-Backend-Hostname: b0cf360f36be
X-Backend-Hostname: 59788145450c
X-Backend-Hostname: 1326f51ec395
X-Backend-Hostname: b0cf360f36be
X-Backend-Hostname: 59788145450c
```

`nginx -t` reported that the configuration syntax was OK. `docker compose ps`
reported all three `containerisation-backend-*` containers healthy, with only the
proxy published on host ports 80 and 443.

API traffic is limited per client IP to 100 requests/sec with a burst allowance
of 100 and returns HTTP 429 when exceeded. The allowance lets the controlled
100-request comparison run without accidental throttling, while limiting a
larger abusive burst.

### Load-test method

The public, unauthenticated `GET /api/events` endpoint was tested over the
reverse proxy's self-signed HTTPS endpoint using the system ApacheBench 2.3:

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

The scaled run improved mean throughput from 390.03 to 393.66 requests/sec
(about 0.9%) and reduced the longest request from 47ms to 37ms. This modest
change is expected: the endpoint is a small read against one shared local
PostgreSQL instance, so it is not CPU-bound enough for three Node processes to
produce a linear gain. The distinct alternating hostname headers prove requests
were nevertheless distributed across all three replicas.

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

The 177 non-2xx responses in the burst run are the configured 429 rate-limit
responses; the preceding health check and successful comparison runs rule out an
upstream failure. This demonstrates that normal short bursts are admitted while
larger bursts are rejected before reaching the backend pool. The proxy access log
confirmed the status explicitly:

```text
"GET /api/events HTTP/1.0" 429 169 "-" "ApacheBench/2.3" "-"
```
