# SSH connects, but saving a remote file fails

Updated September 24, 2026. For Mac users making a focused edit on a VPS or a hosted website.

If you can list and read the target over SFTP but cannot save it, first check the account, path and failed operation. A working SSH login proves neither file-write permission nor permission to create and rename a temporary sibling. A GUI client does not elevate the remote account.

## Match the error to the next check

| What you observe | What to check next |
| --- | --- |
| `Permission denied (publickey)` before a file listing | Authentication: compare the destination, port, username and selected key. |
| Listing works, creating a file fails | The actual SFTP path, parent directory ownership/permissions, ACLs and any read-only restriction. |
| Overwriting an existing writable file works, but saving through an editor fails | The editor may create a sibling and rename it over the target. Check directory create/rename rights, not just the file mode. |
| `Failure` with no specific reason | Keep the exact error; check quota, free blocks/inodes, read-only mounts and the server's supported operations. It is not proof of a permissions error. |
| The file changed since editing began | Resolve the content conflict before retrying; do not treat it as an authentication problem. |

For website hosting, use the intended site/deployment user. An administrator's terminal session or `sudo` command does not change the identity of a separate SFTP connection. In a restricted SFTP account, the displayed root may differ from the server's real root. Do not change a provider-managed chroot root to make it writable.

With authorized shell access, inspect the exact target and parent using `id` and `ls -ld`. Check ancestor traversal permissions as well. If those look correct, the administrator should inspect ACLs, quotas, mount state and policy. For SFTP-only hosting, use the provider's documented writable directory and support route; do not assume a shell is available.

## Why a writable file can still fail to save

On September 24 we ran OpenSSH 10.3p1's SFTP client directly against the Mac's local SFTP server. The disposable parent directory had mode 0500 and contained a file owned by the same ordinary user with mode 0600.

| Operation | Observed result |
| --- | --- |
| Read the existing file | Success, exit 0 |
| Upload directly over the existing writable file | Success, exit 0 |
| Upload a new sibling file | Permission denied, exit 1 |
| Rename a pre-existing sibling over the target | Permission denied, exit 1 |
| Restore 0700 on the disposable parent, then create and rename | Both succeed, exit 0 |

This demonstrates a filesystem distinction, not a universal diagnosis. Server ACLs, sticky directories, read-only mounts and SFTP policies can add further restrictions.

The [complete local experiment](fixtures/sftp-write-permissions-lab.mjs) has no dependencies beyond Node.js and macOS OpenSSH. After inspecting the source, run:

```sh
node docs/fixtures/sftp-write-permissions-lab.mjs
```

It uses `sftp -D`, so it opens no network connection and uses no SSH keys, passwords or authentication agent. It creates a private temporary fixture, asserts all six transfer outcomes and removes only that fixture. Run without sudo. Tested with Node.js 25.6.1 on Darwin 27.0.0; other environments are not verified. This is not a Nexus Shell GUI test or a test of your hosting provider.

## Finish one safe edit

Keep a separate copy of unsynced local work. After the intended account's access is corrected, retry using a disposable file in an authorized test directory. Confirm the remote contents and file mode, then use the service's own validation before a reload. Do not overwrite a production configuration merely to test permissions.

Nexus Shell 1.7.7 external editing writes a temporary sibling before replacing the target. File-mode preservation does not grant directory rights or promise preservation of every owner/ACL attribute. The website/Homebrew edition also uses remote shell commands for this editing workflow; a pure SFTP-only account is not sufficient. The Mac App Store edition uses a different transfer engine, and behavior still depends on the server.

For the visible editing-session and conflict workflow, use the [Mac remote-editing walkthrough](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=sftp_write_202609#save-fails).

Nexus Shell requires Apple Silicon and macOS 14.2+. SFTP/external editing requires Pro or an eligible trial. Website Pro is lifetime-only; eligible website registrations receive a seven-day trial without a card or automatic renewal. The App Store separately offers lifetime Pro and auto-renewing annual Pro, with no Nexus account or Agent Bridge. Purchases/data are separate and connections do not migrate automatically. Current choices are explained in the [download guide](https://nexusshell.app/.well-known/agent-skills/download.md).

## Sources and scope

- [OpenSSH sftp manual](https://man.openbsd.org/sftp.1): direct local server mode and batch failure handling.
- [OpenBSD rename manual](https://man.openbsd.org/rename.2): directory write/search permission and other failure conditions.
- [SpinupWP file ownership guidance](https://spinupwp.com/doc/wordpress-file-ownership-permissions/): why the site user matters for hosted website files. Provider-specific repair settings should not be generalized to another host.

Written and tested with Codex assistance by the Nexus Shell team. The experiment establishes the local SFTP outcomes above, not universal server compatibility.
