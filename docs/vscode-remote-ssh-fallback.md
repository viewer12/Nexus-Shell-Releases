# VS Code Remote-SSH hangs, but SSH works: a Mac troubleshooting path

Published by the Nexus Shell developer. Reviewed 16 September 2026.

If a normal SSH session opens but VS Code cannot finish connecting, separate SSH access from the remote editor's startup. You may still be able to inspect logs or retrieve a file while investigating the editor. This guide does not require deleting remote editor folders or changing a server's SSH policy.

## 1. Check the same destination

In a local Mac Terminal, use the same configured SSH alias that you selected in VS Code:

```sh
ssh my-server
```

Replace `my-server` with your own alias. Check that both clients use the intended SSH configuration, account and network route. Verify the host fingerprint through a trusted source; investigate an unexpected change.

If this also fails, resolve the address, VPN, authentication or server availability first. Switching editors will not repair those problems. If it succeeds, keep the session available and note the point where the editor stops.

## 2. Match the symptom before changing settings

| What you observe | Next check |
| --- | --- |
| The editor waits without showing a login prompt | Open the Remote-SSH output and enable `remote.SSH.showLoginTerminal` to reveal an authentication prompt. |
| The log mentions unsupported Linux libraries or architecture | Compare the host with Microsoft's current Linux prerequisites. A working shell does not establish compatibility with the editor's remote server. |
| The log says forwarding is administratively prohibited | Ask the administrator which workflow is allowed. Do not enable forwarding or restart SSH on a managed server yourself. |
| Login succeeds but server startup stalls | Look for the first specific error in the Remote-SSH output, rather than treating the final timeout as the cause. Check host-specific maintenance notices. |

Microsoft documents these diagnostic paths in its [Remote Development troubleshooting guide](https://code.visualstudio.com/docs/remote/troubleshooting) and [Linux prerequisites](https://code.visualstudio.com/docs/remote/linux). Change one setting at a time and record its previous value.

A concrete recent example is [Pawsey's Setonix incident](https://pawsey.atlassian.net/wiki/spaces/US/pages/2004484098/Visual+Studio+Code+hangs+on+SSH+connection+to+Setonix): after September maintenance, the centre documented an Exec Server startup problem and a setting workaround. Follow that guidance for the matching environment; it is not a universal remedy for all SSH timeouts. Nexus Shell has not been validated against that cluster's access requirements.

## 3. Finish a small server task through SSH or SFTP

Inside an already connected Linux shell, these checks can help orient a diagnostic session:

```sh
pwd
df -h .
df -i .
```

They show your current directory, filesystem space and inode usage. A full filesystem is a clue; free space does not rule out a per-user quota or an editor problem. These commands do not free space or modify files.

For file retrieval, use the same approved connection with your SFTP client, or open a separate local Terminal:

```sh
sftp my-server
```

At the SFTP prompt, `pwd` and `ls` inspect the remote location; `bye` exits. Shell access does not guarantee that the server permits the SFTP subsystem. Ask the administrator if it is disabled.

If you need to change one file, follow the [remote file editing workflow](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_ssh_fallback_202609) for remote-version checks, a recoverable copy and conflict handling. Do not blindly overwrite a file another process or person may have changed.

## Where Nexus Shell fits

[Nexus Shell](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_ssh_fallback_202609) provides a native Mac terminal and SFTP workspace for this server-side work. It does not run VS Code's remote extension host and does not replace remote debugging, language servers or an IDE project workflow. Keep VS Code when those are the tasks you need.

Requires Apple Silicon and macOS 14.2+. Personal, non-commercial SSH use has a free tier; SFTP is a Pro feature. Check the current [licensing and trial terms](https://nexusshell.app/pricing.md) before choosing it for work. Custom SSH configurations and institutional authentication need separate compatibility checks.

The diagnostic commands and product boundaries were reviewed against the linked documentation. No external VPS or institutional login was used to claim an end-to-end reproduction.
