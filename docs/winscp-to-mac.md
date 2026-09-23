# Move one WinSCP file workflow to a Mac

Published by the Nexus Shell developer, 23 September 2026. Start with the [WinSCP alternatives and migration checklist](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=winscp_migration_202609#before-moving).

## Check the saved connection before picking a client

SFTP, FTPS and FTP are different protocols. Copy the exact protocol, hostname, port and remote account from your working setup; changing the port cannot make an FTP-only host support SFTP. Nexus Shell serves SSH/SFTP hosts. Use a client with the required protocol for FTP, FTPS, WebDAV or S3.

Record the intended remote directory and any jump host, proxy or special authentication. An account may enter its permitted directory while lacking permission to list the parent. A new client does not change those permissions. Nexus Shell does not document automatic WinSCP session import.

## Handle a PuTTY key locally

Nexus Shell rejects PPK private-key imports. Use PuTTYgen on the computer holding the key: load the existing file, unlock it, then choose Conversions → Export OpenSSH key. Keep the exported copy protected with a passphrase and preserve the original until the new connection works. Renaming a file to .pem is not conversion. See [WinSCP's export instructions](https://winscp.net/eng/docs/ui_puttygen#other_formats).

Do not upload private keys to online converters or support tickets. Creating a separate key for the Mac is another option, but its public key must be authorized on the server through your approved process. A format conversion preserves identity; a newly generated key does not inherit access.

## Validate one harmless task

1. Connect to a non-critical SSH host and verify its host fingerprint with your provider or administrator.
2. Open Files, navigate to the allowed directory and download a harmless file. A working shell does not guarantee SFTP is enabled.
3. If uploads are needed, use a disposable file in a directory you own and inspect the remote result. Remove only your test file afterwards.
4. For a one-file edit, follow the [external-editor/conflict workflow](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=winscp_migration_202609). Upload-on-save is not directory synchronization or a replacement for deployment scripts.
5. Keep the original Windows setup until the whole task, authentication route and permissions work.

## Choose the appropriate edition

Nexus Shell requires Apple Silicon and macOS14.2+. SFTP requires Pro or an eligible trial; basic personal, non-commercial SSH use is free. The website edition provides eligible new accounts a seven-day Pro trial without a card or automatic charge. [Website Pro](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=winscp_migration_202609#pricing) is lifetime-only.

The [Mac App Store edition](https://apps.apple.com/cn/app/nexus-shell/id6780150323?mt=12) offers lifetime and auto-renewing annual Pro without a Nexus Shell account or Agent Bridge. Purchases and data are separate; connections do not migrate automatically. Use the website/Homebrew edition for Agent Bridge. Current prices differ and website lifetime alignment is planned; no new amount or date is specified here.

This checklist combines published product behavior and official key-format documentation; it is not a claim that a particular customer's WinSCP environment or private key has been tested.
