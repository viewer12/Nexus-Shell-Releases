# Edited a Compose .env over SSH, but the container still uses the old value

Verified November 1, 2026. Start with one authorized, non-critical service.

A saved file, a resolved Compose model, a container's creation-time environment and an application's live settings are separate states. Confirm the remote upload before changing a running service. `docker compose restart` does not apply configuration changes to existing containers.

## Check the same deployment, without printing secrets

Run on the Linux Docker host reached by SSH. First confirm the account, Docker endpoint, project name, Compose files and override order used by the existing deployment. Commands run locally on your Mac resolve local files even when its Docker context targets a remote engine. Changing daemon context does not turn a local `.env` into a remote file.

For a simple single-file deployment, replace all example paths and the project name with the actual deployment's choices:

```sh
docker compose version
docker compose --project-directory /srv/my-app --env-file /srv/my-app/.env -f /srv/my-app/compose.yaml -p my-app config --quiet
docker compose --project-directory /srv/my-app --env-file /srv/my-app/.env -f /srv/my-app/compose.yaml -p my-app config --services
docker compose --project-directory /srv/my-app --env-file /srv/my-app/.env -f /srv/my-app/compose.yaml -p my-app ps -a
```

Keep all deployment override files, profiles and flags when adapting these commands. `config --quiet` validates; it does not prove the expected value or successful application startup. Error messages can still reveal paths or variable names. Plain `config`, `config --environment`, `inspect` and logs can expose secrets; review them privately rather than pasting full output into a post or agent conversation.

## Locate the mismatch

| Observation | Next check |
| --- | --- |
| Remote file is unchanged | Check the editing session, upload result and actual path; restarting cannot upload the file. |
| Correct file, wrong Compose value | Confirm the explicit file, override order and exported shell variable of the same name. |
| `.env` value exists, but service has none | Compose interpolation is not automatic container injection. Map a value under `environment`, or use a service `env_file` as appropriate. |
| Service `env_file` works, `${VARIABLE}` elsewhere is missing | Service environment and Compose interpolation use different inputs. |
| Changed container environment, then only restarted | Review recreation of the intended service; a restart reuses the container's configuration. |
| Container environment is correct, application is not | Check application-specific reload/cache behavior, build-time values and mounted files. Rebuilding or recreation is not a universal fix. |

## Rehearse the configuration distinction offline

Inspect [the nine-case fixture](fixtures/compose-env-lab.mjs), then use an existing standalone Compose binary:

```sh
COMPOSE_BIN=/absolute/path/to/docker-compose node docs/fixtures/compose-env-lab.mjs
```

We used the official Docker Compose v5.6.1 Darwin arm64 binary, comparing its SHA-256 with the checksum published in the same release. This is a same-source integrity check, not an independent signature verification. The fixture creates a private temporary directory, uses only dummy values, calls `config` and removes that exact directory. It does not download images, start containers, contact a daemon or read credentials. Node.js and a standalone Compose binary are prerequisites; it does not install either.

Observed: all nine assertions passed. Explicit env mapping, an unmapped value, shell precedence, alternate env files, a different working directory, service env versus interpolation, inline overrides and missing required values are covered. This is a Compose-model experiment, not a VPS, restart, application or Nexus Shell GUI test.

## Apply a reviewed change, then verify

After backing up the intended deployment settings and reviewing downtime/dependencies, use the normal deployment procedure. For a simple Compose service, `up -d --no-deps app` with the same verified project/file/env options can recreate that service when its configuration changes. It is a write operation, can interrupt traffic, and is not automatically safe for a database or multi-service change. Do not use `down -v` or global prune as an environment-variable fix.

Confirm container state, bounded logs, application health and the intended non-secret setting. Use the application's own procedure for bind-mounted configuration, build-time variables or settings stored in its database. Do not assume recreation applies every kind of setting.

## Continue on your Mac

The [remote Docker guide](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository#compose-env-changed-but-the-container-still-uses-the-old-value) links this to remote editing, logs and an existing server task. Nexus Shell brings those views into one Mac workspace; it does not make a successful file save proof of a deployed change. Apple Silicon and macOS 14.2+ are required. SFTP and Docker management require Pro or an eligible trial. See the [first-session checklist](first-session.md) and [current website pricing](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository#pricing).

Website Pro costs US$24.99 for a new lifetime purchase. Existing lifetime benefits remain unchanged. App Store lifetime and auto-renewing annual purchases are separate; check Apple for regional pricing.

## Primary sources

- [Compose interpolation inputs](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/)
- [Service environment precedence](https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/)
- [Compose config](https://docs.docker.com/reference/cli/docker/compose/config/)
- [Restart does not apply configuration changes](https://docs.docker.com/reference/cli/docker/compose/restart/)
- [Compose up recreates changed service containers](https://docs.docker.com/reference/cli/docker/compose/up/)
- [Compose v5.6.1 release and integrity files](https://github.com/docker/compose/releases/tag/v5.6.1)

Written with Codex assistance by the Nexus Shell team. [中文核对清单](zh-CN/compose-env-after-edit.md).
