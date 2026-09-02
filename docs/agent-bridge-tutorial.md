# Give Claude Code a connection ID, not your SSH key

Staging nginx is returning 502. You want Claude Code or Codex to pull `error.log`, edit the conf, and reload.

The usual way is to put an `id_ed25519` path — or a shell that can already `ssh` — into the agent’s config. That works until it doesn’t. You find out afterwards, in a log.

Nexus Shell is a native SwiftUI workbench on macOS (terminal, SFTP, Docker, monitoring, keys). Agent Bridge turns it into a local MCP server. The agent gets a `connection_id` and tools. Stored passwords and private keys are not returned over MCP.

Give the agent a connection ID, not a root shell.

```bash
brew install --cask viewer12/tap/nexus-shell
```

Apple Silicon, macOS 14.2 or later. English site: https://nexusshell.app/en/

Agent Bridge shipped in v1.5.9. It is in the direct-download and Homebrew builds. Mac App Store and TestFlight builds do not include it (sandbox). Default off. Experimental.

This is not a built-in chatbot, and not the app’s ⌘L / ⌘K assistant. No listening port: a local Unix socket (`0600`, same uid). Traffic does not go through nexusshell.app.

Honest limit: this shrinks blast radius and makes the session reviewable. It does not make the agent correct. Point it at staging first.

## One paste

1. Open Nexus Shell.
2. Settings → Agent Bridge, turn it on.
3. Copy the setup instruction the app generates and paste it into Claude Code or Codex. Do not type a socket path or key path.
4. Approve the agent on its first tool call. You can revoke it later.

Then say one thing, pointed at staging:

> Pull `/var/log/nginx/error.log` and show the last 50 lines.

Next: replace a password login with a new ed25519 key — generate in the app, deploy to the host, verify, then switch the connection.

Docs: https://nexusshell.app/agent-bridge
