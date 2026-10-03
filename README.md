# Containerisation task

This is my submission for the WebClub NITK Systems & Security SIG
containerisation task. The starter project is Orbis, an event-management app
with a React frontend, Express backend, PostgreSQL database, and Nginx.

The main goal here was to make the whole stack run with Docker Compose instead
of starting each part separately.

## What is included

- `docker compose up --build` starts the app, database, frontend, and reverse
  proxy.
- Only Nginx is exposed on the host: HTTP redirects to HTTPS and the app is at
  `https://localhost`.
- The backend has three replicas behind Nginx, with API rate limiting.
- PostgreSQL data is stored in a named Docker volume.
- The frontend and backend runtime images run as non-root users.
- GitHub Actions builds and lints both Docker images on each push.

More detailed commands, diagnostics, raw outputs, the load-test comparison, and
the Docker build-cache notes are in [SUBMISSION.md](SUBMISSION.md).

## Running it

You need Docker Desktop and Docker Compose.

```sh
cp .env.example .env
docker compose up --build
```

Then open [https://localhost](https://localhost). The certificate is
self-signed, so the browser will show a local certificate warning the first
time. The Events page can be checked at
[https://localhost/events](https://localhost/events).

To stop the stack:

```sh
docker compose down
```

The database volume is kept by `docker compose down`. Use
`docker compose down -v` only if you intentionally want to remove local
database data.

## Authentication note

The supplied app uses Auth0. Public pages and the public Events API work without
Auth0 configuration. Actual sign-in needs a real Auth0 domain and client ID,
which are not included in the starter repository. Add them as the `VITE_AUTH0_*`
values in `.env` and rebuild if those credentials are available.

## Useful files

- `docker-compose.yml` — services, networks, volume, and public ports
- `nginx/default.conf` — HTTPS redirect, proxying, load balancing, rate limit
- `.env.example` — local configuration template
- `SUBMISSION.md` — phase-by-phase evidence for the recruitment task
