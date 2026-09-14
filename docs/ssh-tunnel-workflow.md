# Reach a private service from your Mac with OpenSSH

Use the free [SSH tunnel command builder](https://nexusshell.app/en/tools/ssh-tunnel-command-builder/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609) to create a local forward for PostgreSQL, MySQL, Redis or a private web app. It explains which address belongs to your Mac and which is reached from the SSH server. No account is required; form values are processed in the page without uploads or persistence.

For a PostgreSQL service on the SSH server itself, a complete example is:

```sh
ssh -N -T -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L '127.0.0.1:15432:127.0.0.1:5432' -p 22 'developer@bastion.example'
```

Replace the example endpoint and review the command before running it in a **local Mac Terminal**, not in an SSH session. Verify the SSH host key. Then configure your database client to connect to `127.0.0.1:15432` using your normal database authentication. Keep that Terminal open; Control-C stops the tunnel.

For a service on a separate host, change the second `127.0.0.1` to a host reachable from the SSH server. The tunnel encrypts the path to the SSH endpoint; keep database TLS where needed for the onward hop. A listener starting successfully is not proof the destination is reachable.

Nexus Shell complements your database client with saved SSH connections, terminal sessions, SFTP and Docker inspection. The generated command uses system OpenSSH; this document does not claim a Nexus Shell tunnel-manager feature. The app requires Apple Silicon and macOS 14.2+. Free use is personal and non-commercial; Pro features and commercial use retain their licensing requirements.

For the next server task, see [remote configuration editing](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609) or [Docker inspection](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609).

This is a usage resource maintained by the Nexus Shell developer. The builder checks input and command syntax, not your server's credentials, authorization, availability or security configuration. See the [OpenSSH manual](https://man.openbsd.org/ssh) and [PostgreSQL tunnel documentation](https://www.postgresql.org/docs/current/ssh-tunnels.html) for protocol details.
