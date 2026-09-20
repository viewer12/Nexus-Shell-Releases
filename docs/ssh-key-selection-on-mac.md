# Mac SSH: choose the right key before changing the server

By the Nexus Shell developers · September 20, 2026.

When SSH reports **Too many authentication failures**, the server has ended an authentication attempt after its allowed failures. One common cause on a Mac is that the client offers several agent keys before reaching the intended key. The error alone does not prove that your intended key is valid, or that the server was attacked.

## Inspect the configuration that the client actually uses

For an alias you already trust, run this locally in Apple Terminal:

```sh
ssh -G your-configured-alias | awk '$1 ~ /^(hostname|user|port|identityagent|identityfile|identitiesonly|proxyjump)$/ { print }'
```

Check the destination account, every `identityfile` entry and the selected agent. `ssh -G` prints evaluated configuration instead of opening a login session. Configuration can contain `Match exec`, which runs a local command during evaluation, so do not use a config copied from an untrusted source. Keep the output local; paths and host details can be sensitive even though this command does not print a private key.

## Select a key for one host

For a private key you already keep on disk, a specific host block can contain:

```sshconfig
Host my-project
  HostName 192.0.2.10
  User developer
  IdentityFile ~/.ssh/id_ed25519_project
  IdentitiesOnly yes
```

This is an example, not a replacement for your whole configuration. Substitute the authorized server and key, preserve required ports/jump hosts and back up the config before editing. Recheck `ssh -G my-project`. `IdentitiesOnly yes` limits selection to configured identities; it does **not** guarantee there is only one. `IdentityFile` entries from other matching blocks and included files accumulate. Narrow an overly broad key rule rather than deleting unrelated keys or clearing every key from your running agent.

## Keep a 1Password private key in 1Password

1Password documents using a downloaded **public** key as `IdentityFile`, together with `IdentitiesOnly yes`, while its SSH agent holds the private key. This requires the client to use the correct agent socket. Copy the socket path from your own 1Password setup rather than assuming another Mac's path.

If using its generated SSH Bookmarks configuration, follow the documented generation setting and `Include` setup. A saved bookmark is not evidence that OpenSSH has loaded a per-host selector. Do not hand-edit the generated file: changes are managed by 1Password. Alternatively, configure a host manually using the public-key selector. These are OpenSSH workflows, not a claim that every GUI client supports the same agent integration.

See [1Password's host/key instructions](https://www.1password.dev/ssh/agent/advanced#match-key-with-host) and [SSH Bookmarks configuration](https://www.1password.dev/ssh/bookmarks#ssh-bookmarks-config-file).

## Reproduce key selection without a server or real keys

Inspect [the fixture](fixtures/ssh-key-selection.conf) first. From this repository's root, run:

```sh
ssh -F docs/fixtures/ssh-key-selection.conf -G demo-specific | awk '$1 == "identityfile" || $1 == "identitiesonly" { print }'
ssh -F docs/fixtures/ssh-key-selection.conf -G demo-additive | awk '$1 == "identityfile" || $1 == "identitiesonly" { print }'
ssh -F docs/fixtures/ssh-key-selection.conf -G demo-public-selector | awk '$1 == "identityfile" || $1 == "identityagent" { print }'
```

Expected observations:

| Case | What the evaluated configuration shows |
|---|---|
| `demo-specific` | `identitiesonly yes` and one `/example/project-key.pub` entry |
| `demo-additive` | `identitiesonly yes` but **two** identity files from matching blocks |
| `demo-public-selector` | A `.pub` selector and the explicitly named agent socket |

The fixture uses a documentation-only address and deliberately nonexistent key/socket paths. `-F` selects this file instead of your personal config; `-G` is essential. This experiment checks configuration resolution only: it neither proves those files exist nor demonstrates a successful signature or server login. Do not remove `-G` and treat the fixture as a working connection.

## Verify the real connection deliberately

Once the evaluated configuration is right, use `ssh -v your-configured-alias` only for a server you are authorized to access. Verify the host fingerprint via a trusted source before accepting new trust. Look locally for the identity offered and whether authentication succeeds; if it still fails, check the account's authorized key and the server's authentication requirements. A jump host and the final target may need different keys. Keep an existing administrative session open while troubleshooting; do not raise server authentication limits or disable host-key checks as a default fix.

Terminal success does not prove that a GUI SFTP client uses the same engine, socket or settings. Check both terminal and file-transfer behavior before switching a workflow.

## Where Nexus Shell fits

Nexus Shell lets you assign a saved key to a server connection and keeps terminal, SFTP, Docker and monitoring in one Mac workspace. The OpenSSH instructions above do **not** establish 1Password-agent or SSH Bookmarks compatibility in Nexus Shell; we have not verified that integration and do not recommend exporting a private key just to switch clients.

If you use Nexus Shell's own key storage, choose the intended key in the connection and verify the server fingerprint before continuing. For a different error, use the [Mac SSH symptom picker](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=ssh_key_selection_202609#too-many-authentication-failures-select-the-key-first). Review [edition and purchase choices](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=ssh_key_selection_202609#download-options) before downloading: Apple Silicon/macOS 14.2+, personal non-commercial SSH free, advanced features and commercial use require Pro.

Sources: [OpenSSH configuration reference](https://man.openbsd.org/ssh_config#IdentityFile), [OpenSSH client options](https://man.openbsd.org/ssh.1#G), and the 1Password documentation linked above. The isolated commands were checked with macOS OpenSSH 10.3p1; no live account, server or GUI integration was exercised.
