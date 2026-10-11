# Reach a private service from your Mac with OpenSSH

Use the free [SSH tunnel command builder](https://nexusshell.app/en/tools/ssh-tunnel-command-builder/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609) to create a local forward for PostgreSQL, MySQL, Redis or a private web app. It explains which address belongs to your Mac and which is reached from the SSH server. No account is required; form values are processed in the page without uploads or persistence.

For a PostgreSQL service on the SSH server itself, a complete example is:

```sh
ssh -N -T -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L '127.0.0.1:15432:127.0.0.1:5432' -p 22 'developer@bastion.example'
```

Replace the example endpoint and review the command before running it in a **local Mac Terminal**, not in an SSH session. Verify the SSH host key. Then configure your database client to connect to `127.0.0.1:15432` using your normal database authentication. Keep that Terminal open; Control-C stops the tunnel.

For a service on a separate host, change the second `127.0.0.1` to a host reachable from the SSH server. The tunnel encrypts the path to the SSH endpoint; keep database TLS where needed for the onward hop. A listener starting successfully is not proof the destination is reachable.

## Terminal SSH works, but the database client's SSH connection fails

Use an external tunnel to isolate the client's built-in SSH setup from database authentication. The [builder](https://nexusshell.app/en/tools/ssh-tunnel-command-builder/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609) now includes a copyable client checklist that follows your chosen local port. No database password or private key is collected.

For MySQL/MariaDB on the SSH server itself:

```sh
ssh -N -T -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L '127.0.0.1:13306:127.0.0.1:3306' -p 22 'developer@bastion.example'
```

Replace example addresses before running it in a local Terminal. If the database is on another host, use the service address documented by your hosting provider in the second host position. Some providers require a private name such as `mysql`; the SSH hostname and database hostname are not interchangeable. This example forwards TCP, not a remote Unix socket.

| Client setting | Sequel Ace (MySQL/MariaDB) | DBeaver (matching database driver) |
| --- | --- | --- |
| Connection | Standard | Main connection, built-in SSH tunnel off |
| Host on this Mac | `127.0.0.1` | `127.0.0.1` |
| Local port for MySQL example | `13306` | `13306` |
| Local port for PostgreSQL example above | Not applicable | `15432` |
| Login | Normal database account | Normal database account |
| TLS | Keep the service's requirements | Keep the service's requirements |

Prefer a new or duplicated connection profile while testing. Do not choose Socket or enable another SSH tunnel for this external-tunnel connection. If you change the local port, update the client too. Keep the Terminal open; use Control-C there when finished.

After login, run the read-only query `SELECT 1;`. A result of `1` confirms that this connection can execute the query, not that application data, backups or broader permissions are healthy. Database authentication errors need database-account checks; a TLS hostname mismatch needs the correct certificate/hostname configuration. Do not disable verification or expose the database port publicly as a workaround.

[Sequel Ace's own documentation](https://sequel-ace.com/get-started/remote-connection.html) describes external tunnels and sandbox limits involving SSH agents, files and helper programs. This workflow is not a diagnosis or guaranteed fix for every client/macOS update failure. See also [DBeaver's tunnel model](https://dbeaver.com/docs/dbeaver/SSH-Configuration/) and [fortrabbit's separate SSH/database host example](https://docs.fortrabbit.com/integrations/database-clients/sequel-ace).

## Tunnel active does not establish service health

Separate the local listener, SSH responsiveness and the intended service response. The builder now provides an error selector, an adapted listener command and a copyable verification checklist. It does not execute checks or declare your service healthy.

Run this in a second local Mac Terminal for the PostgreSQL example (adapt the local port if changed):

```sh
lsof -nP -iTCP:15432 -sTCP:LISTEN
```

Confirm the expected SSH process and loopback binding; visibility depends on your account. If the port is occupied by another process, choose another port and update your client. Do not kill an unfamiliar process. A listener or successful TCP connect can coexist with an unavailable destination. Keepalive checks SSH responsiveness; [ExitOnForwardFailure checks forwarding setup](https://man.openbsd.org/ssh_config#ExitOnForwardFailure), not later connections to the destination.

Run SELECT 1 in your authenticated SQL client, or PING in an authenticated Redis client if permitted. A refusal or timeout needs the service address and route checked from the SSH server; administratively prohibited needs its administrator to verify forwarding policy. Authentication or certificate errors need the correct service account and hostname, not weaker security settings.

For a plain HTTP service, first choose a known read-only endpoint. This example uses / and local port 18080; adapt both before running it in a local Terminal:

```sh
curl --disable --noproxy '*' --connect-timeout 3 --max-time 5 --include 'http://127.0.0.1:18080/'
```

Inspect expected status and content. Without --fail, curl can exit 0 for HTTP 401/403/500. A 200 response from the wrong service is not success. This command ignores default curl config, bypasses HTTP proxies, bounds the wait and does not follow redirects. For HTTPS, use the service's supported hostname/certificate setup and retain verification; do not add --insecure.

Reproduce the distinction without a server account:

```sh
node examples/verify-tunnel-health-layers.mjs
```

The [fixture](../examples/verify-tunnel-health-layers.mjs) binds only ephemeral loopback ports, creates a Node TCP relay with a stopped backend and checks HTTP 403, wrong-service 200 and expected-content 200 responses. It requires Node.js 22+ and curl. It cleans up only its own listeners and sockets. The [recorded result](fixtures/tunnel-health-layers-result.json) is dated 2026-10-11. This is not an SSH handshake, real database, customer VPS, macOS sleep or Nexus GUI test. [Chinese steps](zh-CN/ssh-tunnel-workflow.md) explain the same scope.

## Continue the server task

Nexus Shell complements your database client with saved SSH connections, terminal sessions, SFTP and Docker inspection. The generated command uses system OpenSSH; this document does not claim a Nexus Shell tunnel-manager feature. The app requires Apple Silicon and macOS 14.2+. Free use is personal and non-commercial; Pro features and commercial use retain their licensing requirements.

For the next server task, see [remote configuration editing](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609) or [Docker inspection](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609).

The [website offers lifetime Pro](https://nexusshell.app/en/#pricing); the [Mac App Store edition](https://apps.apple.com/cn/app/nexus-shell/id6780150323?mt=12) offers lifetime and annual auto-renewing Pro. Prices currently differ. The website lifetime price is planned to align with the App Store lifetime price; the amount and effective date are not announced here. Agent Bridge requires the website/Homebrew edition. The App Store edition has no Nexus Shell account or Agent Bridge; purchases and data are managed separately, and connections do not migrate automatically.

This is a usage resource maintained by the Nexus Shell developer. The builder checks input and command syntax, not your server's credentials, authorization, availability or security configuration. See the [OpenSSH manual](https://man.openbsd.org/ssh) and [PostgreSQL tunnel documentation](https://www.postgresql.org/docs/current/ssh-tunnels.html) for protocol details.
