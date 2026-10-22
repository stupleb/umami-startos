<p align="center">
  <img src="icon.png" alt="Umami Logo" width="21%">
</p>

# Umami on StartOS

> Everything not listed in this document should behave the same as upstream Umami.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[Umami](https://github.com/umami-software/umami) is a cookie-free web analytics dashboard. This
package runs it with its own PostgreSQL database and splits it across two interfaces: the
dashboard, and a tracker-only proxy that is the one part visitors' browsers need to reach.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Three upstream images, unmodified, for x86_64 and aarch64.

| Subcontainer | Image                          | Runs                                                                                                  |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `postgres`   | `postgres` (Alpine)            | PostgreSQL, listening on `127.0.0.1` only                                                             |
| `umami`      | `ghcr.io/umami-software/umami` | the `migrate` oneshot (`scripts/check-db.js`), then the image's own entrypoint, serving port 3000     |
| `nginx`      | `nginx` (Alpine)               | a reverse proxy on port 3001 that forwards only the tracker paths to Umami, using `assets/nginx.conf` |

Start order: `pg-recover` (removes a stale `postmaster.pid`) → `postgres` → `migrate` (applies
Umami's database migrations) → `admin-password` (applies a pending admin password) → `umami` →
`tracker`. Umami's own start script is told to skip the migration it would otherwise repeat
(`SKIP_DB_CHECK`).

## Volume and Data Layout

Two volumes. Umami itself writes nothing outside its database.

| Volume    | Mounted at                          | Holds                                                                           |
| --------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| `startos` | not mounted                         | `store.json`: the generated secrets and the admin password the package set      |
| `db`      | `/var/lib/postgresql` in `postgres` | the PostgreSQL cluster (data directory `18/docker`): every website, user, event |

The GeoLite2 City database that turns visitor IPs into countries and cities ships inside the
Umami image, so it is as current as the image.

## File Models

One file model, `store.json` on the `startos` volume, which holds StartOS-side state rather than
Umami configuration.

| Key                      | Seeded                               | Rewritten by                                                         |
| ------------------------ | ------------------------------------ | -------------------------------------------------------------------- |
| `postgresPassword`       | at install                           | never                                                                |
| `appSecret`              | at install                           | never                                                                |
| `twoFactorEncryptionKey` | at install (64 hex characters)       | never                                                                |
| `adminPassword`          | by **Set Admin Password**            | **Set Admin Password**                                               |
| `adminPasswordPending`   | by **Set Admin Password**            | the `admin-password` oneshot, once the password reaches the database |
| `adminUsername`          | when a password reaches the database | the same                                                             |

`appSecret` signs Umami's logins and salts its visitor hashing; `twoFactorEncryptionKey`
encrypts two-factor secrets in the database. Changing either by hand signs everyone out, splits
the current period's unique visitors, or makes enrolled two-factor codes undecryptable — don't.

Umami is configured entirely by environment variables, set on every start and not editable:

| Variable                                  | Value                                                       |
| ----------------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`                            | the local PostgreSQL                                        |
| `APP_SECRET`, `TWO_FACTOR_ENCRYPTION_KEY` | from `store.json`                                           |
| `CLIENT_IP_HEADER`                        | `x-forwarded-for`                                           |
| `DISABLE_TELEMETRY`                       | `1`                                                         |
| `DISABLE_UPDATES`                         | `1`                                                         |
| `PRIVATE_MODE`                            | `1`                                                         |
| `HOSTNAME`, `PORT`                        | `0.0.0.0`, `3000`                                           |
| `SKIP_DB_CHECK`                           | `1` on the `umami` daemon; the `migrate` oneshot has run it |

`CLIENT_IP_HEADER` makes Umami read the visitor's IP only from `X-Forwarded-For`, which the
StartOS proxy overwrites with the real source address. Left unset, Umami would trust headers such
as `True-Client-IP` and `X-Real-IP` that any visitor can forge. `PRIVATE_MODE` turns off
telemetry, the update check and the referrer favicons Umami would otherwise load from DuckDuckGo
in the dashboard viewer's browser.

`assets/nginx.conf` is shipped in the package and read-only.

## Dependencies

None.

## Network Access and Interfaces

Two interfaces on two separate hosts, so a domain added to one never reaches the other.

| Interface | Id        | Type  | Port | Serves                                                                                                           |
| --------- | --------- | ----- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| Dashboard | `ui`      | `ui`  | 3000 | all of Umami: the dashboard, login, API, share pages                                                             |
| Tracker   | `tracker` | `api` | 3001 | `/script.js`, `/recorder.js`, `/api/send`, `/api/record`, `/p/…` (pixels), `/q/…` (links); 404 for anything else |

Visitors' browsers load `/script.js` from the Tracker and post to `/api/send` on the same host,
so the Tracker needs an address those browsers can reach with a publicly trusted certificate. In
practice that is a public domain. The Dashboard needs no public address.

The StartOS proxy adds `X-Forwarded-For` on both interfaces; nginx passes it through unchanged.

## Installation and First-Run Flow

Install generates the database password, `APP_SECRET` and `TWO_FACTOR_ENCRYPTION_KEY`, and raises
a critical task to run **Set Admin Password**, so the service cannot start before an admin
password exists.

Umami's first migration seeds an `admin` account with the password `umami`. On every start the
package runs the migrations itself, then writes any pending admin password straight into the
database, before the Umami daemon opens its port. The default password is therefore never
reachable. The password is stored as the same bcrypt hash Umami writes itself.

## Actions

**Set Admin Password** (`set-admin-password`) — generates a 32-character password for the
built-in admin account, stores it, and returns the username and password.

- **When to run it:** at install (the task asks for it), or when the admin password is lost.
- **What it changes:** the admin's password in Umami's database, and `adminPassword` in
  `store.json`. It targets the account Umami seeded at install by its id, so it still works after
  the account is renamed in Umami. Two-factor authentication on that account is left as it is.
- **Cost:** seconds; no restart. While the database is running it applies the password at once;
  otherwise it marks it pending and the next start applies it.
- **Repeat safety:** every run replaces the previous password. Umami signs out every session
  that was signed in with the old one.
- **Failure:** if that account has been deleted inside Umami, it fails with "The Umami admin
  account no longer exists"; sign in as another admin and manage users from Umami instead. Run
  while Umami is stopped, the action cannot tell: the next start logs the same message, leaves
  the password pending, and starts Umami anyway.

## Tasks

**Set Admin Password** — `critical`, raised at install while `store.json` holds no admin
password. Running the action clears it, and it does not come back: later runs only rotate the
password.

## Health Checks

| Check     | Probes                                                 | Failure means                                                                                      |
| --------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Dashboard | `GET /api/heartbeat` on port 3000, retried three times | Umami is not serving. Its log shows why; a failed `migrate` oneshot keeps it from starting at all. |
| Tracker   | nginx listening on port 3001                           | nginx did not start. It only starts once the Dashboard check passes.                               |

PostgreSQL has an internal readiness check (`pg_isready`, also retried three times) that gates
the rest and is not shown in the UI. Both retries exist because one failed poll stops every
daemon that depends on the checked one.

## Backups and Restore

The database is dumped with `pg_dump` and replayed on restore; its files are never copied. The
`startos` volume is backed up whole, so the restored instance keeps its secrets, its admin
password and its two-factor encryption key, all matching the restored database.

Nothing is excluded, and a restored instance needs no further steps.

## Limitations and Differences

1. The tracking code Umami shows under a website's **Tracking code** uses the address the
   dashboard was opened on. Replace that address with the Tracker interface's public address
   before pasting it into a site. The same applies to the URLs Umami shows for links and pixels.
2. Share pages (`/share/…`) are served only by the Dashboard interface; the Tracker does not
   forward them.
3. Telemetry, the update notice and referrer favicons are off and cannot be turned on.
4. Renaming the tracker script and collect endpoint (`TRACKER_SCRIPT_NAME`,
   `COLLECT_API_ENDPOINT`) is not exposed.
5. No Redis, ClickHouse, Kafka or MCP endpoint, and no `BASE_PATH`: Umami runs at the root of
   each interface.

---

## Quick Reference for AI Consumers

```yaml
package_id: umami
image: ghcr.io/umami-software/umami
architectures: [x86_64, aarch64]
subcontainers: [postgres, umami, nginx]
volumes:
  startos: not mounted (store.json)
  db: /var/lib/postgresql
file_models:
  - startos/store.json
startos_managed_env_vars:
  - DATABASE_URL
  - APP_SECRET
  - TWO_FACTOR_ENCRYPTION_KEY
  - CLIENT_IP_HEADER
  - DISABLE_TELEMETRY
  - DISABLE_UPDATES
  - PRIVATE_MODE
  - HOSTNAME
  - PORT
  - SKIP_DB_CHECK
dependencies: none
interfaces:
  ui: { type: ui, port: 3000 }
  tracker: { type: api, port: 3001 }
actions:
  - set-admin-password
tasks:
  - { action: set-admin-password, severity: critical }
health_checks:
  - umami
  - tracker
```
