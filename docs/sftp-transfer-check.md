# Check one SFTP round trip before moving real files

Nexus Shell team · Published October 4, 2026 · Updated October 23, 2026 · [中文](zh-CN/sftp-transfer-check.md)

[Download the free test ZIP](https://nexusshell.app/assets/downloads/sftp-transfer-check.zip). Five synthetic files cover spaces, a Chinese filename and UTF-8 text, a hidden dotfile, an empty file and binary bytes. A SHA-256 manifest and English/Chinese instructions are included. This works with any SFTP client, is not an installer and contains no credentials or executable payloads. Test data is CC0-1.0.

ZIP SHA-256: `8fb01dafb0893b5edad5b84929db8731a9d8f94bf42ac65d0acde9818786b544`.

[日本語の保存先・往復転送チェック](ja/sftp-transfer-check.md) added October 12, 2026. Distinguish the Mac folder from the remote path before an upload: interactive OpenSSH SFTP uses `pwd` / `cd` for the server and `lpwd` / `lcd` for the Mac. Relative paths start at the corresponding current directory. A restricted account's `/` need not be the server's filesystem root. The original ZIP and its hash are unchanged; this is additional task guidance, not a new server or GUI test.

1. Extract into a fresh Mac folder. Retain this unchanged original as the baseline.
2. Upload the whole extracted folder to a new disposable directory your server account owns. Include the hidden file; do not upload only the ZIP or use a live service directory.
3. Download the remote folder to a different empty Mac directory. Do not merge with the original: leftover files can hide a missing download.
4. In Mac Terminal type `cd` and a space, drag the downloaded folder into Terminal and press Return. Run `shasum -a 256 -c SHA256SUMS`. All five files should report `OK`, exit status 0. README.txt explains how to compare the manifest to the retained original; never regenerate your expected baseline from downloaded data.
5. Verify required permissions separately. Remove only your disposable copies when finished; no cleanup command is provided.

No remote shell is needed: checks run on the Mac after download, including for SFTP-only accounts. Matching hashes prove the five listed files' bytes, not permissions, ownership, ACLs, extra files, empty directories, symlinks, server identity, large-transfer or resume reliability. This tiny fixture is not a speed benchmark, GUI test or server compatibility certification. A manifest changed alongside the data cannot prove the expected original content.

## Check in your browser instead

Open the [local test-file checker](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check). Select all five payload files from the separate **downloaded** copy, not the original folder or ZIP. In the Mac file picker, Command + Shift + . shows hidden files. Use only the synthetic test data.

The checker reports missing, changed, unreadable and duplicate names. It uses the fixed original hashes, so selecting a changed SHA256SUMS cannot redefine the baseline. It does not upload file contents or hashes. Other selected files, including README and the manifest, are explicitly unchecked. Clear selection removes the displayed results. A passing result only verifies the five selected files' bytes; the limits above still apply. Without JavaScript or browser hashing support, use the Terminal command.

## Interrupted transfer: check the prefix before resuming

A completed resume can have the expected size and still contain the wrong bytes. OpenSSH `reget` (download) and `reput` (upload) reuse the existing partial's prefix. They do not establish that those bytes came from the current source version. See the [OpenSSH resume warning](https://man.openbsd.org/sftp.1#a).

Keep the unchanged source and partial separate. Check the server, path, direction and source version before retrying. If the partial cannot be tied to that source, copy the full file to a new staging name or directory and leave the live destination intact. After completion, compare SHA-256 with the retained original. For SFTP-only accounts, download the staged upload to a separate empty Mac folder and check there; a remote shell is not necessary for that comparison. This is a recovery decision, not a recommendation to resume an unknown production partial.

Our local experiment seeded a 4,096-byte partial for a 16,384-byte synthetic file, then ran the actual OpenSSH SFTP client and local subsystem over pipes:

| Starting copy | Download / upload command | Exit / final size | SHA-256 equals source |
| --- | --- | --- | --- |
| Matching prefix | `reget` / `reput` | 0 / 16,384 bytes | Yes, both directions |
| First byte of prefix changed | `reget` / `reput` | 0 / 16,384 bytes | **No, both directions** |
| New destination | `get` / `put` | 0 / 16,384 bytes | Yes, both directions |

[Reproducible source](../examples/sftp-resume-lab.mjs) · [Recorded six-case results](fixtures/sftp-resume-result.json). Run `node examples/sftp-resume-lab.mjs` from this repository on a machine with Node.js and the OpenSSH client/server component. It creates synthetic files in a fresh temporary directory and removes only that directory. It opens no listener, uses no SSH login or credentials, and does not read personal SSH settings. The partials are seeded deliberately; this does not inject a real network failure or exercise Nexus Shell's GUI.

The five-file browser checker only verifies its fixed test pack. It cannot validate an arbitrary export or backup. This experiment does not prove Nexus automatic resume, large-transfer reliability, App Store compatibility or service deployment. Validate the exact client's behavior before relying on it.

## Two Linux files become one on the Mac: check filename case

`report.txt` and `Report.txt` can be separate files on a case-sensitive source. A case-insensitive destination cannot keep both names in the same folder. Depending on the client's handling of an existing destination, the transfer may stop, skip one copy, ask what to do, or overwrite it. A completed progress bar or one matching file size does not prove both files survived.

1. Keep both source files unchanged. Compare the exact source names, including their parent folders, against the downloaded listing. Refresh a filtered or hidden-file view separately; changing visibility does not resolve a name collision.
2. On the Mac, select the **actual destination volume** in Disk Utility and use Info to check its format. Apple distinguishes [APFS from APFS (Case-sensitive)](https://support.apple.com/guide/disk-utility/file-system-formats-dsku19ed921c/mac). Do not assume a folder on an external disk or network mount behaves like the startup disk, or erase a volume to troubleshoot a download.
3. To retain both copies, download them into **separate, distinctly named parent folders**, or use an existing, verified case-sensitive destination. An approved server-side archive can retain the entries inside the archive while stored as one file; extracting it onto an incompatible volume reintroduces the collision. Do not rename production source files or choose overwrite-all just to finish a test.
4. Verify both downloaded copies against their separate retained source baselines before cleanup. The fixed five-file ZIP/checker does **not** test case collisions or arbitrary source trees. Switching SSH clients or buying Pro cannot make a case-insensitive folder store two conflicting names.

On October 23, 2026 (Singapore time), our local macOS 27.0.1 experiment found:

| Synthetic operation on the tested temporary filesystem | Result |
| --- | --- |
| Create `report.txt`, then create `Report.txt` exclusively | Second creation refused with `EEXIST`; original intact |
| Ordinary writes to both names in one parent | One directory entry; still 6 bytes, but the first copy's SHA-256 changed |
| Two distinct names in one parent | Both contents retained |
| Case-only names in two distinctly named parents | Both contents retained |

[Experiment source](../examples/mac-filename-case-lab.mjs) · [Recorded four-case results](fixtures/mac-filename-case-result.json). Optional reproduction: `node examples/mac-filename-case-lab.mjs` with Node.js already available. It creates and removes only its own synthetic temporary directory; no network, account, personal file access, disk formatting or mounting. Results describe that tested destination, not every Mac volume, Unicode normalization, SFTP transfer behavior, Nexus Shell GUI or App Store compatibility. Fetch also documents this [same-name download limitation](https://fetchsoftworks.com/fetch/help/Contents/FAQ/TroubleshootingFAQ.html); it is not evidence of a new Nexus-specific fault.

## Reproduce the offline validation

Run `python3 examples/build-sftp-transfer-check.py` from this repository, then `python3 examples/verify-sftp-transfer-check.py assets/downloads/sftp-transfer-check.zip` on a Mac with `shasum`. The builder uses Python standard libraries and fixed ZIP metadata. The verifier uses and removes a fresh temporary directory only.

[Recorded results](fixtures/sftp-transfer-check-result.json) cover a clean copy and detection of a missing dotfile, changed UTF-8 text, nonempty empty file and truncated binary. They also demonstrate that an extra unlisted file does not fail a named-file checksum check. [Builder source](../examples/build-sftp-transfer-check.py) · [Verifier source](../examples/verify-sftp-transfer-check.py). These checks do not exercise a network, SFTP server or Nexus Shell GUI.

Continue with [the migration guide](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check), [multi-server workflow](multi-server-files.md) or [write-permission checks](sftp-write-permissions.md).

Test data is free. Nexus Shell SFTP requires Pro or an eligible trial. Website new accounts can receive a seven-day trial without a card or automatic charge, subject to eligibility; website Pro is lifetime-only. App Store Pro offers lifetime or auto-renewing annual purchase without Agent Bridge; data and purchases are separate. Validate the actual task before [website Pro](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#pricing). No new price or alignment date is announced here.
