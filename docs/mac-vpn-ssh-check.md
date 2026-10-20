# Mac VPN online, SSH still fails: a comparison checklist

Nexus Shell maintainer notes · October 20, 2026. For a Mac connecting to an authorized Linux server or homelab over Tailscale. These are diagnostic steps, not a claim that Nexus Shell has passed every Tailscale configuration.

## Record four separate results

| Check | What success establishes | What it does not establish |
| --- | --- | --- |
| Tailscale peer probe | A Tailscale path answered that probe | TCP reachability or SSH authorization |
| macOS name lookup | The Mac resolved that peer name | A listener at the SSH port |
| One TCP connection | That IP/port accepted a connection | Host identity or a valid SSH account |
| SSH login | That specific client completed that login | Another client's login, SFTP or Docker access |

## Make one like-for-like comparison

1. Confirm the peer's identity, current Tailscale IP and full MagicDNS name through your authorized device list. Keep the same SSH port and remote OS username in Terminal and the app. A public address can take another route.
2. If the CLI is already available, inspect one bounded probe: `tailscale ping --c 1 --timeout=5s your-peer`. A relay is not automatically an error. Mac Tailscale editions expose the CLI differently.
3. If the IP works but the name does not, inspect `scutil --dns` and `dscacheutil -q host -a name your-peer.your-tailnet.ts.net` locally. A failing `host` or `nslookup` alone can be misleading on macOS because it can bypass the system resolver. Shared peers can require a full name.
4. Distinguish ordinary OpenSSH over the tailnet from Tailscale SSH. For the former, inspect the configured listener and network policy. For the latter, tailnet port 22 and both network and SSH access rules matter; check mode can require browser reauthentication.
5. Retest one authorized connection with host-key verification. Keep an existing administrative session. Do not open public SSH, enable another server, replace global DNS or relax policy as a default fix.

Use the [interactive symptom picker and complete Mac checks](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=mac_lan_ssh_202609#tailscale-ping-works-but-ssh-fails-on-mac) for bounded macOS TCP/SSH commands and the next step for each failure. Its choices stay in the page; it does not contact your peer. Review output locally before sharing: resolver and SSH diagnostics can reveal private names, accounts and paths.

## Verify the task before choosing a client

Once Terminal can reach the intended server, compare the saved destination in Nexus Shell and verify one non-critical task. Do not assume an OpenSSH alias or existing multiplexed session is imported or reused by another client. A successful terminal login does not validate file transfer or container permissions.

Nexus Shell requires Apple Silicon and macOS 14.2+. Basic SSH is free for personal non-commercial use; commercial use and SFTP/Docker/monitoring require Pro or eligible trial access. Website Pro is lifetime-only. The App Store offers lifetime or auto-renewing annual Pro and has no Agent Bridge; purchases and data are separate. See [current terms and pricing](https://nexusshell.app/en/#pricing). This checklist does not enable or administer your VPN, promise check-mode compatibility, or prove a customer issue has recovered.

## Primary references

- [Tailscale CLI ping variants](https://tailscale.com/docs/reference/tailscale-cli#ping)
- [MagicDNS and the macOS resolver caveat](https://tailscale.com/docs/features/magicdns)
- [Tailscale SSH authorization and check mode](https://tailscale.com/docs/features/tailscale-ssh)
