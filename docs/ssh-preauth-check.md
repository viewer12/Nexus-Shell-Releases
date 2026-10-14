# SSH closes before authentication: check the layer first

Published by the Nexus Shell developer. Checked 14 October 2026.

`kex_exchange_identification: Connection closed by remote host` or `Connection reset by peer` does not establish a wrong password or key. TCP can connect while the SSH identification exchange fails. The endpoint, an intermediary or a server policy can close that connection before authentication.

## Preserve access, then gather one bounded observation

Keep an existing administrative session open. Stop automatic reconnect loops and repeated port scans. Check the intended address, port and any jump host, then inspect one bounded `ssh -v` attempt locally. Debug logs may reveal hostnames, usernames and configuration paths; remove those before sharing. Never include a password or private key.

Use an authorized console or administrator to compare SSH service logs at the same time. A missing service entry is not proof of acceptance: a proxy or firewall may close the connection first. Confirm the service and installed server version before interpreting its settings.

Two possible server-side limits have different scopes:

- [MaxStartups](https://man.openbsd.org/sshd_config#MaxStartups) limits concurrent unauthenticated connections.
- [PerSourcePenalties](https://man.openbsd.org/sshd_config#PerSourcePenalties), introduced and enabled by default in [OpenSSH 9.8](https://www.openssh.org/txt/release-9.8), can refuse connections after repeated unauthenticated or failed attempts. Shared NAT addresses matter; the client version alone does not establish the server's behavior.

Neither the disconnect nor a `Not allowed at this time` banner identifies a specific policy. Do not turn off protections, clear keys or disable host-key checks to hide the symptom. Avoid promising a universal waiting time; an administrator must check the effective configuration and logs.

## A credential-free local experiment

With Node.js and the system `/usr/bin/ssh` installed, clone this public repository and run:

```sh
node examples/verify-ssh-identification.mjs
```

The script opens four temporary TCP listeners on `127.0.0.1`, one at a time. It uses an empty SSH configuration, disables authentication and agent access, and keeps strict host-key checking enabled. It does not contact a VPS, read your SSH configuration or alter trust records.

| Fixture | TCP accepted | Remote SSH version received | Authenticated |
| --- | --- | --- | --- |
| Close without a version | Yes | No | No |
| Text refusal, then close | Yes | No | No |
| HTTP response, then close | Yes | No | No |
| SSH version only, then close | Yes | Yes | No |

See the [recorded run](../fixtures/ssh-identification-result.json). The last fixture deliberately ends before key exchange and authentication. This experiment checks protocol layers; it does **not** reproduce a real server's penalty, validate login, or test the Nexus Shell GUI.

## Continue the right workflow

Use the [Mac SSH symptom picker](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=mac_lan_ssh_202609#ssh-closes-before-authentication) to distinguish this from routing, Local Network permission and authentication failures. Only use the [key-selection checklist](ssh-key-selection-on-mac.md) when the evidence reaches authentication. After access works, follow the [first-session checklist](first-session.md) for one app task; website registration alone does not verify SSH or SFTP use.
