# Reach an internal SSH server through a jump host on Mac

By the Nexus Shell developer · September 30, 2026

A jump host carries the connection to the target; it is not the target's login account. Keep the bastion and destination host, user, port and key separate. Test this route only on systems you are authorized to access. An SSH policy that disallows forwarding cannot be bypassed by choosing another GUI client.

## Configure the two endpoints separately

Save the example in a new file such as `nexus-jump-example.conf`, replace every placeholder with your approved settings, and review it. It is not an instruction to overwrite `~/.ssh/config`. The example addresses are reserved for documentation.

```sshconfig
Host example-jump
  HostName 192.0.2.10
  User gateway
  Port 2222
  IdentityFile ~/.ssh/your-existing-jump-key
  IdentitiesOnly yes

Host example-target
  HostName 198.51.100.20
  User developer
  Port 2200
  IdentityFile ~/.ssh/your-existing-target-key
  IdentitiesOnly yes
  ProxyJump example-jump

Host *
  ForwardAgent no
```

The target address must be reachable from the bastion, not necessarily directly from the Mac. These are two SSH endpoints, not a local forwarded database port. ProxyJump does not require copying the target private key to the bastion or enabling agent forwarding. An external key agent may need its own supported selector; do not export keys merely to fit this file example.

Inspect both configurations from the Mac:

```sh
ssh -G -F ./nexus-jump-example.conf example-jump
ssh -G -F ./nexus-jump-example.conf example-target
```

Check hostname, user, port, identityfile, identitiesonly, forwardagent and proxyjump. A target's IdentityFile does not configure the jump host's identity. `-G` evaluates settings and exits, not a successful login. Only evaluate trusted configs: `Match exec` can run local commands. This standalone file has no Include or Match rules.

After replacing and reviewing the placeholders, connect with `ssh -v -F ./nexus-jump-example.conf example-target`. Verify each host fingerprint through a trusted source before accepting it. Exit the session after the intended check. Do not share unredacted verbose logs.

## Identify the failing stage

| Result | Next check |
| --- | --- |
| Cannot connect/authenticate to the jump host | Its address, SSH port, user and key, from the Mac |
| Jump login works; forwarding reports administratively prohibited | Administrator's effective forwarding policy, destination restrictions and any host security policy; do not disable them |
| Forwarding reports refused/timeout/no route | Bastion-to-target address, port, listener and network path; a direct Mac TCP probe is not equivalent |
| Target rejects the public key | The destination account and identity selection, separately from bastion credentials |
| Target terminal opens but SFTP fails | Target subsystem, file permissions and the client's file-transfer settings |

Do not infer a SELinux problem from this text alone, raise authentication limits, turn off host-key checking, or open the target SSH port to the world as a default repair. A successful bastion login is not proof that direct-tcpip forwarding or target login is allowed.

## Keep the approved route in Nexus Shell

Save the jump server as a connection. Create or edit the destination using the target's own host, port and account, select **Network Routing → Via jump host**, choose the saved jump connection and review the route preview. Test terminal access first, then verify a small authorized file task separately.

This setup was checked in the released v1.7.7 connection-form source, not a fresh GUI or real-bastion test. A saved app connection is not a promise that arbitrary OpenSSH config, external agents, Teleport certificates, RouterOS file semantics or corporate MFA policies are interchangeable.

Nexus Shell runs on Apple Silicon/macOS 14.2+. Personal non-commercial SSH has a free tier; SFTP and other Pro tools require Pro or an eligible trial. [Download and current website lifetime pricing](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=jump_host_202609#pricing). The App Store offers lifetime and auto-renewing annual Pro, without Agent Bridge; purchases/data are managed separately. No new alignment price/date is announced here.

## Reproduce the configuration check

Review and run [verify-jump-host-config.mjs](../examples/verify-jump-host-config.mjs) with Node.js and OpenSSH: `node examples/verify-jump-host-config.mjs`. It creates a temporary config, uses documentation addresses and nonexistent key paths, evaluates both aliases with `ssh -G -F`, checks nine expectations, and removes only its temporary directory. It never reads your SSH config/keys, changes server policy, or opens a server session. [Recorded result](fixtures/jump-host-config-result.json).

Sources: [OpenSSH ProxyJump and per-host configuration](https://man.openbsd.org/ssh_config#ProxyJump), [OpenSSH forwarding controls](https://man.openbsd.org/sshd_config#AllowTcpForwarding). For other failures, use the [Mac connection checklist](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=jump_host_202609#connecting-through-a-jump-host).
