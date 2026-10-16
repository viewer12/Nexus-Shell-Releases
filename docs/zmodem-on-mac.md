# rz/sz on Mac: choose ZMODEM or SFTP before troubleshooting

Published by the Nexus Shell team, 2026-10-16. Nexus Shell is our product. This checklist distinguishes in-terminal transfers from SFTP; it is not a claim that every jump server or tmux setup is compatible.

`sz` sends a file from the machine where you run it. `rz` receives files into that machine's current directory. When those commands run in a remote SSH shell, your Mac terminal must handle ZMODEM too. Installing lrzsz only on the server does not make an unsupported terminal open a file dialog.

## Check the actual remote shell

Run these read-only checks in the shell where you intend to transfer:

```sh
hostname
id -un
pwd
command -v rz
command -v sz
printf 'TMUX=%s\n' "${TMUX-}"
```

Confirm the machine, account and directory privately before continuing. An interactive bastion menu can leave you on a different host from a separately saved SFTP connection. Do not post these outputs unchanged: they may identify internal systems. A missing command requires an administrator-approved server package or another permitted transfer method, not a password reset.

## First transfer in Nexus Shell

For the website / Homebrew v1.7.11 implementation, Settings → ZMODEM → **Auto-detect ZMODEM** controls detection. The default download folder initializes the save dialog; confirm the final location in that dialog. These instructions were checked against the release-tag source and built-in help, not a new App Store or customer-server GUI test.

1. Start a normal, authorized remote shell outside tmux or screen. Keep any running job in its existing session; open another connection for the test rather than killing or detaching someone else's work.
2. Choose a small disposable file you are permitted to download. On that remote host, run `sz './transfer-check.txt'` (substitute your actual test filename). Confirm the save dialog on the Mac and wait for completion.
3. To test upload, enter a separate remote directory you own, run `rz`, and choose a disposable local file in the Mac file picker. Check the remote directory afterward. Avoid overwrite flags and production files.
4. Compare the original and downloaded bytes independently. For a Linux source, `sha256sum './transfer-check.txt'`; for the saved Mac copy, `shasum -a 256 './transfer-check.txt'`. Matching hashes check bytes, not ownership, ACLs or service deployment. The [existing five-file test pack and browser-local checker](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check) can also check individual returned sample files; that tool never opens an SSH connection.

## Symptoms and next checks

| Symptom | What to check next |
| --- | --- |
| `rz: command not found` | Server-side command availability and PATH in this shell; the Mac's Homebrew packages do not install server software |
| Protocol-looking text or no file picker | Terminal protocol support and auto-detection; do not run several transfer handlers at once |
| Works in a plain shell but stalls inside tmux/screen | The intervening terminal/multiplexer path; test a separate plain shell and use an explicitly supported transfer setup |
| SSH works but SFTP is denied | The server's SFTP subsystem and access policy; an interactive menu is not automatically an OpenSSH ProxyJump route |
| Transfer finishes but the app/site is unchanged | Exact destination, bytes and consuming service; upload does not restart or reload a service |

ZMODEM and trzsz are different protocols. Nexus Shell's ZMODEM support is not a promise of native `trz`/`tsz`, tmux relay or automatic compatibility with arbitrary interactive bastions. If your policy permits SFTP, use a separately verified SFTP connection instead. If it does not, ask the administrator which in-session transfer is approved; do not bypass the policy.

If tmux-aware trzsz is your requirement, consult the [trzsz-go project's own local/remote/relay instructions](https://trzsz.github.io/go.html). They describe a separate toolchain, not a Nexus Shell integration. ZOC also documents its [terminal-side ZMODEM workflow](https://emtec.com/zoc/help/en/10381/zmodem-file-transfer).

## Choose by the task, then evaluate the client

The [Mac file-transfer guide](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#zmodem-rz-sz-on-mac) compares the protocols and links to remote editing. Basic Nexus Shell SSH is free for personal, non-commercial use; visual SFTP, Docker and monitoring require Pro or an eligible trial. Website Pro remains lifetime-only, with an eligible new-account seven-day trial and no card or automatic charge. [Website download and pricing](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#pricing).

The App Store offers lifetime and auto-renewing annual Pro through Apple, without a Nexus Shell account or Agent Bridge. Prices currently differ and website lifetime alignment is planned; no new amount or date is specified here. Connections and purchases are managed separately. macOS 14.2+ on Apple Silicon is required. No cross-channel entitlement or automatic migration is promised.
