# Files across two servers from a Mac

[中文操作说明](zh-CN/multi-server-files.md) · Applies to Nexus Shell 1.7.7 · Updated September 25, 2026

Nexus Shell combines SSH session tabs and a local/remote Files view. For an occasional file copy between servers, download from the source to your Mac, then upload that copy to the destination. This is a staged copy through your Mac, not a direct server-to-server transfer.

## Check whether this is your workflow

| Need | Nexus Shell 1.7.7 behavior |
| --- | --- |
| Keep several SSH sessions open | Use session tabs; confirm the active server before entering commands. |
| Browse files side by side | Files shows a local Mac pane and one selected remote server. |
| Copy a file from server A to B | Download to a local folder, switch the selected server, then upload. |
| See two remote file trees or terminal sessions simultaneously | Do not assume session tabs or dual-pane Files provide this layout. |
| Repeat deployments or mirror directory trees | Use a separately validated deployment/synchronization workflow; copying files is not deployment automation. |

## Complete one small transfer

Use a harmless test file and directories you own before handling a live configuration. You need permission to read the source and create the destination file, as well as SFTP access to both servers.

1. Create a fresh local folder, for example `server-a-to-b-test`, in Finder. Use a folder whose contents are appropriate for your Mac and its backup or sync settings.
2. In **Files**, select server A and confirm the remote path. Download the test file into that local folder. Wait for the transfer to complete; do not upload a partly downloaded file.
3. Select server B using the Files connection selector. Confirm both the server name and destination directory. Choose a separate staging directory you own instead of the live service directory.
4. Upload the local test file. If the app reports a naming conflict, stop and check the destination rather than automatically replacing the existing file.
5. Verify the destination contents and permissions. For a stronger byte check, download the destination into a different fresh folder and compare the two local files. In Mac Terminal, `shasum -a 256` followed by the two quoted local file paths prints a SHA-256 digest for each; compare the digest column, not the filenames. Matching hashes establish byte equality, not suitability of the content or metadata preservation.
6. Keep the source intact until verification finishes. Any subsequent move into a service directory, reload, permission change or cleanup is a separate operation. Remove only the specific disposable copies you created when you no longer need them.

The local copy remains on your Mac. Consider available disk space and whether your local folder is synchronized or backed up. This route uses both server connections and the Mac's network; it is a poor fit for large ongoing replication or data that must never be stored locally. It does not imply preservation of ownership, ACLs or all extended attributes.

## Edit a path closer to where you are looking

In the Files path bar, right-click the breadcrumb area and choose **Edit path**, or double-click the breadcrumb area to enter editing. The pencil button is another entry point. Type the path and press Return; Escape cancels.

A single click on an ancestor breadcrumb navigates to that directory. In the terminal's Files panel, the path breadcrumb also has a double-click and **Edit path** context-menu action. Labels follow the app's language. If a gesture does not reach the expected control, use the context menu or the full Files view's pencil button.

## Choose the right transfer route

For command-line work, current OpenSSH [`scp -3`](https://man.openbsd.org/scp#3) relays a remote-to-remote copy through the computer running the command. That is different from a direct route; the local computer remains in the data path even without an explicitly staged local file. The [`-R` option](https://man.openbsd.org/scp#R) runs the copy from the origin host and requires that host to authenticate to the destination. Check your Mac's installed `man scp` before choosing flags. This is a separate system OpenSSH workflow, not a Nexus Shell file-transfer toggle.

## Try before deciding on Pro

Nexus Shell requires an Apple Silicon Mac with macOS 14.2 or later. SFTP needs Pro or an eligible trial. The website edition grants eligible new accounts a seven-day Pro trial without a card or automatic charge. Website Pro is lifetime-only.

- [Official download](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609)
- [Website Pro pricing](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#pricing)
- [Before migrating from WinSCP](https://nexusshell.app/en/guides/winscp-alternative-for-mac/#before-moving)
- [When saving a remote file fails](sftp-write-permissions.md)

Prefer Apple billing? The [Mac App Store edition](https://apps.apple.com/cn/app/nexus-shell/id6780150323?mt=12) offers lifetime Pro and an auto-renewing annual subscription. It has no Nexus Shell account or Agent Bridge. Purchases and data are managed separately; connections do not migrate automatically. Prices currently differ; website lifetime is planned to align with App Store lifetime, with no new amount or effective date specified here.
