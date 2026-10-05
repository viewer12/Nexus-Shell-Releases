# From download to your first verified server task

Nexus Shell team · October 5, 2026 · [中文](zh-CN/first-session.md)

For the **website / Homebrew edition**, checked against release v1.7.9. You need an Apple Silicon Mac running macOS 14.2 or later and a server you are authorized to access. Installing a client does not provide a VPS or server account.

## Finish signing in inside the app

Open Nexus Shell, select **Membership** in the sidebar, then **Sign In**. Finish account sign-in in the browser window opened by the app and allow it to return to Nexus Shell. Check the account and membership status in the app. Being signed in to the website alone does not establish the app's session.

If the app is still waiting, finish that app-initiated browser flow or start Sign In again from the app. Do not share callback URLs or tokens. If the account is present but the plan seems stale, use **Refresh** in Membership. Check the account and its eligibility before buying again or creating another account.

Eligible new website accounts receive a one-time seven-day Pro trial without a card, granted through registration. Installing or signing in again does not restart it; confirm the displayed status and expiry. It ends without an automatic charge. Free SSH is for personal, non-commercial use; SFTP, Docker and monitoring require Pro or an eligible trial.

**Mac App Store users:** skip the website account steps. Use the app's Apple purchase/restore flow and the terms shown by Apple. Store Pro offers lifetime or auto-renewing annual purchase, without Agent Bridge. Website and Store purchases and data are separate; buying one does not promise an entitlement in the other.

## Confirm one connection, then one task

Keep your existing client and choose a non-critical server. Enter its host, port, remote username and supported authentication method. Your Nexus account is not your server login. Verify a new or changed fingerprint through your provider or administrator before trusting it; do not disable host verification to remove an error.

Run a harmless read-only command such as `uptime` and confirm the intended server. If login fails, use the [connection checklist](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610). Do not assume OpenSSH aliases, external agents or another client's configuration migrate automatically.

- **Files:** use the [disposable SFTP test pack](sftp-transfer-check.md), upload to a new directory your account owns, download to another empty Mac directory, and verify against the original manifest. Successful SSH does not establish write permissions. External editing has additional remote-shell requirements; see [permission checks](sftp-write-permissions.md).
- **Docker:** inspect a container and bounded logs with the [read-only checklist](docker-disk-space-checklist.md). Server-side permissions still apply. Do not delete containers or volumes as a trial exercise.
- **Long-running work:** follow the [remote tmux rehearsal](remote-jobs.md) before trusting a job to a connection that may drop.

Inspect the result before calling the task complete. A trial badge, download or sign-in alone is not a completed server task. If your existing tools meet the need, keep them. If the workflow fits, [review website lifetime Pro](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610#pricing).

## If you need help

Include app version, macOS version, installation channel, the failed step and a redacted error. Do not include SSH passwords, private keys, callback URLs, tokens or full terminal history. Check screenshots for hostnames, usernames and unrelated files. [Support options](https://nexusshell.app/en/contact?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610).

This is a source-checked checklist, not a fresh live-server, app GUI or purchase test. This document collects no account, server details or diagnostic upload.
