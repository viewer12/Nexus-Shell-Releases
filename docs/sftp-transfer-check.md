# Check one SFTP round trip before moving real files

Nexus Shell team · Published October 4, 2026 · Updated October 7, 2026 · [中文](zh-CN/sftp-transfer-check.md)

[Download the free test ZIP](https://nexusshell.app/assets/downloads/sftp-transfer-check.zip). Five synthetic files cover spaces, a Chinese filename and UTF-8 text, a hidden dotfile, an empty file and binary bytes. A SHA-256 manifest and English/Chinese instructions are included. This works with any SFTP client, is not an installer and contains no credentials or executable payloads. Test data is CC0-1.0.

ZIP SHA-256: `8fb01dafb0893b5edad5b84929db8731a9d8f94bf42ac65d0acde9818786b544`.

1. Extract into a fresh Mac folder. Retain this unchanged original as the baseline.
2. Upload the whole extracted folder to a new disposable directory your server account owns. Include the hidden file; do not upload only the ZIP or use a live service directory.
3. Download the remote folder to a different empty Mac directory. Do not merge with the original: leftover files can hide a missing download.
4. In Mac Terminal type `cd` and a space, drag the downloaded folder into Terminal and press Return. Run `shasum -a 256 -c SHA256SUMS`. All five files should report `OK`, exit status 0. README.txt explains how to compare the manifest to the retained original; never regenerate your expected baseline from downloaded data.
5. Verify required permissions separately. Remove only your disposable copies when finished; no cleanup command is provided.

No remote shell is needed: checks run on the Mac after download, including for SFTP-only accounts. Matching hashes prove the five listed files' bytes, not permissions, ownership, ACLs, extra files, empty directories, symlinks, server identity, large-transfer or resume reliability. This tiny fixture is not a speed benchmark, GUI test or server compatibility certification. A manifest changed alongside the data cannot prove the expected original content.

## Check in your browser instead

Open the [local test-file checker](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check). Select all five payload files from the separate **downloaded** copy, not the original folder or ZIP. In the Mac file picker, Command + Shift + . shows hidden files. Use only the synthetic test data.

The checker reports missing, changed, unreadable and duplicate names. It uses the fixed original hashes, so selecting a changed SHA256SUMS cannot redefine the baseline. It does not upload file contents or hashes. Other selected files, including README and the manifest, are explicitly unchecked. Clear selection removes the displayed results. A passing result only verifies the five selected files' bytes; the limits above still apply. Without JavaScript or browser hashing support, use the Terminal command.

## Reproduce the offline validation

Run `python3 examples/build-sftp-transfer-check.py` from this repository, then `python3 examples/verify-sftp-transfer-check.py assets/downloads/sftp-transfer-check.zip` on a Mac with `shasum`. The builder uses Python standard libraries and fixed ZIP metadata. The verifier uses and removes a fresh temporary directory only.

[Recorded results](fixtures/sftp-transfer-check-result.json) cover a clean copy and detection of a missing dotfile, changed UTF-8 text, nonempty empty file and truncated binary. They also demonstrate that an extra unlisted file does not fail a named-file checksum check. [Builder source](../examples/build-sftp-transfer-check.py) · [Verifier source](../examples/verify-sftp-transfer-check.py). These checks do not exercise a network, SFTP server or Nexus Shell GUI.

Continue with [the migration guide](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check), [multi-server workflow](multi-server-files.md) or [write-permission checks](sftp-write-permissions.md).

Test data is free. Nexus Shell SFTP requires Pro or an eligible trial. Website new accounts can receive a seven-day trial without a card or automatic charge, subject to eligibility; website Pro is lifetime-only. App Store Pro offers lifetime or auto-renewing annual purchase without Agent Bridge; data and purchases are separate. Validate the actual task before [website Pro](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#pricing). No new price or alignment date is announced here.
