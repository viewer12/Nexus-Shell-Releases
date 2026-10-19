# SSH works, but SFTP closes before showing files on a Mac

Nexus Shell team · October 19, 2026

An SSH login and an SFTP file listing are separate checks. If SFTP closes immediately, identify the failing stage before changing file permissions. An EOF, a refused subsystem request and an implausibly large packet length are different evidence; none establishes that a different Mac client will fix the server.

## Match the observed stage

| Observation | Next check |
| --- | --- |
| Authentication fails before SFTP starts | Confirm the same host, port, remote account and key; follow the [connection checklist](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610). |
| Authentication succeeds, then EOF / connection closed before any listing | Ask the administrator to inspect that account's subsystem startup, restricted shell, server logs and connection limits at the recorded time. EOF alone does not identify which one failed. |
| `subsystem request failed on channel 0` | Confirm the account and server actually permit SFTP. A working interactive SSH shell does not establish that. |
| `Received message too long` with a huge decimal number | Unexpected text may have entered the binary SFTP stream. Inspect subsystem wrappers and non-interactive startup output; do not start by increasing transfer buffers. |
| File listing works, but saving fails | Move to the [write-permission and rename checks](sftp-write-permissions.md). |

For a server you are authorized to access, compare the exact endpoint and identity using your existing client and the Mac's OpenSSH SFTP client. Start without a remote path that could trigger an automatic download. Once connected, `pwd`, `ls` and `quit` suffice for a listing check; no upload is needed. Do not guess a provider's subsystem executable or change a restricted account to an unrestricted shell as a workaround.

Retain the error stage and timestamp locally. Verbose logs can expose hosts, usernames and filesystem paths; redact them before sharing. Keep SSH host verification enabled.

## What the large number can mean

In our isolated fixture, the four bytes `Welc` at the start of a welcome line became the unsigned big-endian length `1466264675` (`0x57656c63`). The client stopped before a listing. This number describes what it read as a packet length; it is not a file size.

Our all-binary length `4294967295` also produced the same error category. A large number alone therefore does not prove a welcome banner is the cause. An EOF had no large-packet message at all. Keep these distinctions when discussing a real failure.

Ordinary text written to subsystem stdout differs from SSH's protocol-level authentication `Banner`. Do not remove a required legal banner merely because it appears during login. Ask the administrator to isolate the actual source. Shell startup files, wrappers and server launch errors depend on the server; do not delete an entire profile or suppress all stderr.

## Reproduce five startup outcomes without a server

Inspect [the complete fixture](../examples/verify-sftp-startup.mjs), then, with Node.js 20+ and `/usr/bin/sftp` available, run from this repository:

```sh
node examples/verify-sftp-startup.mjs
```

The script creates one temporary minimal subsystem and uses OpenSSH's `sftp -D` direct-process mode. It opens no socket, contacts no host, reads no SSH credentials or config, and performs no transferred-file operations. It removes only its own temporary directory. Run without sudo.

Recorded on macOS/Darwin 27.0.0 with Node.js 25.6.1 and OpenSSH 10.3p1:

| Synthetic subsystem | Observed exit | Result |
| --- | ---: | --- |
| Valid version and directory response | 0 | Startup and quit succeeded |
| Welcome line on stdout | 255 | Large packet length 1466264675 |
| Same line on stderr, valid protocol on stdout | 0 | Startup succeeded; diagnostic remained visible |
| Exit without a response | 255 | Connection closed |
| Binary oversized length | 255 | Large packet length 4294967295 |

The [recorded JSON](fixtures/sftp-startup-result.json) includes every exit and diagnostic. This fixture tests protocol startup, not authentication, file transfer, a real hosting provider, Cyberduck, or Nexus Shell's GUI. Other systems have not been verified. A clean protocol startup does not establish write permission or external-editor compatibility.

## Continue with one verified task

Once SFTP can list files, use the [disposable round-trip files](sftp-transfer-check.md) in an authorized test directory before editing anything important. The [Mac editing walkthrough](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610#sftp-closes-before-listing) explains visible sessions and conflict handling.

Nexus Shell combines SSH and SFTP on Apple Silicon Macs running macOS 14.2+. SFTP needs Pro or an eligible trial; website-edition external editing additionally uses remote shell commands, so a pure SFTP-only account is insufficient for that workflow. Website Pro is lifetime-only; App Store Pro separately offers lifetime and auto-renewing annual purchase. Check [current website trial and purchase terms](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610#pricing). Purchases/data are separate, and this guide does not promise a server-compatibility fix.

## Primary references

- [OpenSSH sftp manual](https://man.openbsd.org/sftp.1): direct subsystem mode and interactive commands.
- [OpenSSH client source](https://github.com/openssh/openssh-portable/blob/master/sftp-client.c): message-length handling.
- [WinSCP's large-packet explanation](https://winscp.net/eng/docs/message_large_packet): startup text and other server-side causes.
- [OpenSSH Banner directive](https://man.openbsd.org/sshd_config#Banner): a message sent before authentication, distinct from subsystem stdout.

Written and tested with Codex assistance by the Nexus Shell team. No third-party troubleshooting thread is claimed to be resolved by this experiment.
