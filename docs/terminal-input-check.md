# Terminal symbols need two presses? Check input on your Mac

Nexus Shell team · 9 October 2026 · [中文](zh-CN/terminal-input-check.md) · [日本語](ja/terminal-input-check.md)

If symbols such as `*`, `:`, `~` or `!` sometimes need two presses while a Chinese or Japanese input method is active, check your installed version first. [Nexus Shell v1.7.10](https://github.com/viewer12/Nexus-Shell-Releases/releases/tag/v1.7.10) fixes this specific Shift-symbol issue in the website / Homebrew release. It is not a claim that every input-method or paste problem has been fixed.

## 1. Check the version and the symptom

Check the version in **About Nexus Shell**. For the website edition, use the app's update check or the [official download](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610). The [current release manifest](https://nexusshell.app/releases/latest.json) identifies the current installer; do not keep an old DMG URL as your update source. Homebrew users can update their existing cask normally.

For the **Mac App Store edition**, check updates through Apple. This note does not establish that the same version is already available in your storefront. Website and Store purchases and data are separate; switching editions or buying Pro again is not an input troubleshooting step.

| What you observe | What to check next |
|---|---|
| Shift symbols intermittently need a second press with Chinese/Japanese input active | Website / Homebrew v1.7.10 release fix, then the local comparison below |
| A key consistently produces a different symbol | Active input source and physical keyboard layout |
| Typed text is correct but pasted text changes | Original text, smart punctuation and real line breaks |
| No characters or dots appear at a terminal password prompt | Password entry commonly disables echo; this alone is not evidence of dropped keys |

## 2. Make a local comparison with dummy text

Open a local text editor and type **Aa 1 ! * : ~**. This is a sample, not a shell command. Never test with your SSH password, private key or a real production command.

Use macOS [Keyboard Viewer](https://support.apple.com/guide/mac-help/use-the-keyboard-viewer-mchlp1015/mac) to inspect the active input source and modifier keys. Physical keyboard layouts differ, so do not assume a US Shift-key mapping. Compare your usual input method with a Latin input source such as ABC, then switch back. Record which source changes the result.

An editor test establishes a local baseline; it does not prove what reaches the remote terminal. If the issue persists after updating, note whether it occurs only in Nexus Shell and whether it depends on the input method. Use dummy text when documenting it; do not paste the sample into a server shell and execute it.

## 3. Treat paste problems separately

A full-width colon `：` differs from ASCII `:`, and curly quotes differ from straight quotes. A visual line wrap may be harmless, while a real newline can submit or split a command. A plain-text document can still contain smart punctuation inserted earlier.

Inspect copied text against its original before using it. Do not automatically remove line breaks, substitute punctuation or ask an agent to rewrite an unfamiliar command and then run the result unchecked. This release's keyboard fix does not validate pasted commands or their effects on your server.

## 4. Report a reproducible input problem, then resume your task

If it still happens, provide the app version, installation channel, macOS version, input source, keyboard layout and expected versus actual **dummy** characters. Say whether the same typing works in your local editor and whether switching input source changes it. Avoid full terminal histories and screenshots containing server details; never include passwords, keys or login callback URLs. [Contact support](https://nexusshell.app/en/contact?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610).

Once typing works, return to the [first-session checklist](first-session.md) and verify one authorized, non-critical server task before deciding on Pro. An update or successful local typing test alone is not a completed server task.
