# SSH host key changed: verify before reconnecting

Published September 28, 2026 by the Nexus Shell team.

A server fingerprint identifies the server, not your login key. After a VPS rebuild or an unexpected warning, verify the endpoint and its fingerprint through an authenticated provider console or trusted administrator before updating saved trust. Different IPv4/IPv6 destinations or reused addresses can also explain a mismatch.

1. Keep an existing trusted session or provider console available. Confirm host, port, route and the expected change.
2. Compare the complete SHA256 fingerprint for the same host-key type. On a Linux OpenSSH server using the default ED25519 public host key, run `ssh-keygen -l -E sha256 -f /etc/ssh/ssh_host_ed25519_key.pub` in its authenticated console. Other configurations need the actual public host key.
3. On your Mac, inspect the configured hostname, HostKeyAlias and UserKnownHostsFile. For the ordinary trust file and port 2222, `ssh-keygen -F '[server.example]:2222' -f ~/.ssh/known_hosts` finds even hashed entries.
4. Only after independent verification, preserve a backup and use `ssh-keygen -R '[server.example]:2222' -f ~/.ssh/known_hosts` to remove that stale host/port entry. Reconnect using your normal identity and jump route; compare the displayed fingerprint again before accepting it. Port 22 normally uses the plain hostname. Managed CA trust requires its administrator's process.

Do not remove the whole trust file, disable verification or treat an unverified ssh-keyscan result as proof. Replacing trust does not grant login or file permissions. The website/Homebrew v1.7.7 source includes a changed-fingerprint prompt showing saved/current values; choose Cancel until verified. This is source review, not an App Store or GUI test, and clients need not share trust storage.

Read the [complete Mac walkthrough and Nexus Shell version boundaries](https://nexusshell.app/en/guides/ssh-host-key-changed-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=host_key_recovery_202609). Website Pro is lifetime-only; App Store Pro offers lifetime or auto-renewing annual purchasing. The underlying OpenSSH checks do not require Pro.

## Offline command rehearsal

From a checkout of this public repository, with Node.js 18+ and OpenSSH ssh-keygen on PATH:

```sh
node examples/verify-known-hosts-scope.mjs
```

The [script](../examples/verify-known-hosts-scope.mjs) generates disposable keys in its own temporary directory. Six checks cover changed fingerprints, hashed host/port lookup, targeted removal, preservation of unrelated/default-port entries, the backup, and fixture-only replacement. It removes only its temporary directory afterward. It never reads user SSH files or makes a network connection.

[Recorded macOS result](fixtures/known-hosts-scope-result.json). No customer VPS rebuild, network attack, IPv4/IPv6 routing, app GUI or actual login was tested.

Primary references: [ssh-keygen](https://man.openbsd.org/ssh-keygen), [ssh-keyscan](https://man.openbsd.org/ssh-keyscan), [ssh_config](https://man.openbsd.org/ssh_config), [sshd](https://man.openbsd.org/sshd).
