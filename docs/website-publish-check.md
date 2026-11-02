# SFTP upload succeeded, but the website still shows the old version

Nexus Shell team · November 2, 2026 · [中文](zh-CN/website-publish-check.md)

An upload, a verified remote copy and a website serving that copy are different outcomes. Keep the original, read back the exact uploaded path, and inspect the actual web response. Buying a new client or repeating the upload does not resolve an unconfirmed document root, deployment or cache problem.

## Follow the evidence in order

1. Confirm the domain, site account and active document root from your host or deployment definition. Your SFTP login directory may be a home or restricted root; `public_html`, `httpdocs` and `/var/www/html` are examples, not defaults you can assume. A staging folder, inactive release or source directory may not be served.
2. Download the exact remote file into a new Mac folder. Compare it against the retained original with the [browser-local two-file checker](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository#compare-your-sftp-files), or your established byte-comparison tool. The checker accepts up to 16 MiB per file, does not upload files, and distinguishes byte integrity from CRLF/LF conversion. Equal size or timestamps alone do not prove equal contents; equal contents do not prove the web server uses that path.
3. Inspect the intended domain and changed resource in the browser's Network panel: final URL, status, response body, content type and the CSS/JS path the HTML requests. A 200 may be a fallback HTML page. A 404 can result from routing or access rules, not just a missing file. A bare server IP can select another virtual host.
4. Use the site's documented build, activation and refresh procedure. Static-site source may require a build; CMS output, container mounts and release symlinks can select other files. Check relevant browser/service-worker, host and CDN layers only after confirming the upload and route. A hard reload or query suffix does not guarantee every cache refreshed. Do not blindly restart production, alter DNS, delete index files or loosen permissions.

If permitted, rehearse on an authorized staging site with a new, harmless, uniquely named text file. Never publish secrets, `.env`, keys, backups or private configuration as a probe. Remove only your own test file afterward. Keep host-key verification enabled and respect SFTP-only account restrictions.

## Reproduce four local cases

Requires Node.js 22 or later. From this repository:

```sh
node docs/fixtures/website-publish-lab.mjs
```

The [complete source](fixtures/website-publish-lab.mjs) creates its own temporary directories and listens only on an ephemeral loopback HTTP port. It uses dummy text, checks four cases, closes the server and removes only its own temporary directory. No external host, daemon, credentials, user SSH configuration or existing files are touched. [Recorded macOS result](fixtures/website-publish-lab-result.json).

| Case | File observation | HTTP observation |
| --- | --- | --- |
| Upload-equivalent copy is in inactive staging | Staging contains desired bytes | Active route still returns old bytes |
| Simulated stale response | Active file contains desired bytes | Deliberately simulated old response, not a real CDN test |
| Application fallback | No conclusion about intended file | HTTP 200 contains HTML rather than expected text |
| Fresh route | Active file contains desired bytes | Response hash matches expected text |

These assertions test local filesystem/HTTP distinctions, not SFTP transport, a real cache, a hosting provider, Nexus Shell's GUI or application health. They do not establish the cause on your server. An exact text response does not validate a CMS or all assets.

## Use it as a first server task

Keep your current client. Follow the [first-session checklist](first-session.md), then verify a disposable [SFTP round trip](sftp-transfer-check.md) before editing a live site. Nexus Shell's website/Homebrew edition needs Apple Silicon and macOS 14.2+. SFTP and external editing require Pro or an eligible trial; basic SSH is free for personal, non-commercial use. Website Pro is lifetime-only; eligible new website accounts get seven days without a card or automatic charge.

Website launch price is US$12.88; the announced new-purchase price is US$24.99 from November 7, 2026, 00:00 UTC+8. Existing lifetime benefits remain unchanged. Registration or a trial does not lock the launch price. [Current website purchase card](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository#pricing). App Store lifetime and auto-renewing annual Pro use separate regional terms, without a Nexus Shell account or Agent Bridge; no cross-channel entitlement or data transfer is promised.

For watched temporary copies or save failures, use the [remote-editing guide](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository#upload-succeeded-but-website-unchanged). This checklist collects no diagnostic upload or server details.

## Primary sources

- [MDN: upload files to a web server](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/Upload_files_to_a_web_server): the host defines the publishing directory; check the website after transfer.
- [nginx request processing](https://nginx.org/en/docs/http/request_processing.html): the requested host and location determine handling.
- [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching): caching, freshness and validation are separate from file transfer.
