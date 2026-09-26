# Returning to a remote job after an SSH disconnect

[中文操作说明](zh-CN/remote-jobs.md) · Reviewed September 26, 2026 · Nexus Shell 1.7.7

Reconnecting a saved SSH connection gives you access to the server again. It does not establish that the old shell or job survived. For an interactive Linux server job that should continue while your Mac disconnects, start it inside **tmux on the server**, then explicitly reattach.

## Before you leave

1. Confirm the remote hostname and user. Check `command -v tmux` and `tmux -V` on that host; a local Mac installation alone does not protect a remote process.
2. Run `tmux new-session -s maintenance` before starting work. If the session already exists, inspect it rather than launching a second job.
3. First try the [one-minute counter rehearsal](https://nexusshell.app/en/guides/keep-remote-jobs-running-after-mac-sleep/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609). It prints timestamps without changing files.
4. Detach with **Ctrl-B**, release, then **D** (default tmux keys). You can close the SSH connection after detaching.

## When you return

In the same server account, run:

```sh
hostname
id -un
tmux list-sessions
tmux attach-session -t maintenance
```

Inspect the existing output, process and application logs. A new prompt, an attached session or a reconnected client is not proof that a build, backup or migration succeeded. Do not blindly run the command again.

If the session is missing, check the host/user, whether the session exited, a server reboot and the administrator's logout policy. Creating tmux after an interruption does not automatically adopt a job started outside it. Once all work in your test session has finished, `exit` its shell; do not kill every tmux session as cleanup.

## Choose the right recovery mechanism

- Server reboot recovery: use the server's service manager/scheduler and application checkpoint or restart rules.
- A Mac-to-server upload/download: check the file transfer's result and documented resume support. Remote tmux cannot keep a sleeping Mac's transfer process running.
- A local database tunnel: recreate the forward and reconnect the client; see the [tunnel walkthrough](ssh-tunnel-workflow.md).
- File and container inspection after reconnecting: Nexus Shell's SFTP, Docker and monitoring features require Pro. tmux is a separate server tool, not a paid Nexus Shell feature.

Nexus Shell requires Apple Silicon and macOS 14.2+. Its free tier covers personal, non-commercial SSH use. Website Pro is lifetime only; [review current website terms](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609#pricing). The App Store offers lifetime and auto-renewing annual options, without a Nexus Shell account or Agent Bridge. Purchases/data are managed separately and connections do not migrate automatically.

Sources: [tmux Getting Started](https://github.com/tmux/tmux/wiki/Getting-Started), [tmux manual](https://man.openbsd.org/tmux). The counter's shell execution is checked separately; this document does not claim a physical sleep/disconnect test on your server.
