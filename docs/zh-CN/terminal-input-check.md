# 终端符号需要按两次？先检查 Mac 输入方式

Nexus Shell 团队 · 2026年10月9日 · [English](../terminal-input-check.md) · [日本語](../ja/terminal-input-check.md)

中文或日文输入法开启时，`*`、`:`、`~`、`!` 等符号偶尔需要按两次，先检查安装版本。[Nexus Shell v1.7.10](https://github.com/viewer12/Nexus-Shell-Releases/releases/tag/v1.7.10) 已在官网 / Homebrew 发布版修复这一 Shift 符号输入问题，不代表解决了所有输入法或粘贴问题。

## 1. 确认版本和具体表现

在**关于 Nexus Shell**中查看版本。官网版使用应用的更新检查或[官方下载入口](https://nexusshell.app/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610)，当前安装包以[发布清单](https://nexusshell.app/releases/latest.json)为准，不要长期使用旧 DMG 地址。Homebrew 用户可按原有方式更新已安装的 cask。

**Mac App Store 版**通过 Apple 检查更新。本文不证明你所在商店已提供同一版本。两渠道购买和数据分别管理，不要为排查输入问题切换购买渠道或重复购买 Pro。

| 观察到的表现 | 下一步 |
|---|---|
| 中、日文输入法下，Shift 符号偶尔需要第二次按键 | 检查官网 / Homebrew v1.7.10 修复，再做本地对照 |
| 某个按键总是输出另一个符号 | 检查输入源与实体键盘布局 |
| 手打正常，粘贴后变化 | 检查原文、智能标点和真实换行 |
| 终端密码提示下不显示字符或圆点 | 密码输入通常关闭回显，仅凭这一点不能判断丢键 |

## 2. 用虚构文本做本地对照

打开本地文本编辑器，输入 **Aa 1 ! * : ~**。这是测试文本，不是 shell 命令。不要用 SSH 密码、私钥或生产命令做测试。

用 macOS [键盘检视器](https://support.apple.com/guide/mac-help/use-the-keyboard-viewer-mchlp1015/mac)检查当前输入源和修饰键。实体键盘布局不同，不要默认所有键盘都使用美式 Shift 组合。对比常用输入法与 ABC 等拉丁字母输入源，再切回原输入法，记录差异。

编辑器测试只提供本地基线，不能证明远程终端实际收到什么。更新后仍有问题时，记录是否只在 Nexus Shell 出现、是否依赖输入法。描述问题使用虚构字符，不要把这段样本文本粘贴到服务器 shell 后执行。

## 3. 单独检查粘贴内容

全角冒号 `：` 与半角 `:` 不同，弯引号与直引号也不同。视觉自动折行不一定改变内容，真实换行却可能提交或拆分命令；纯文本文件也可能保留之前插入的智能标点。

使用前对照原始内容检查。不要自动删换行、替换标点，或让 Agent 改写不熟悉的命令后未经检查就执行。本次键盘修复不负责验证粘贴命令及其服务器影响。

## 4. 提供可复现的信息，再继续原任务

仍有异常时，提供应用版本、安装渠道、macOS 版本、输入源、键盘布局，以及期望和实际出现的**虚构**字符。说明本地编辑器是否正常、切换输入源是否改变结果。不要发送完整终端历史、含服务器信息的截图、密码、密钥或登录回调网址。[支持入口](https://nexusshell.app/contact?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610)。

输入恢复后，返回[首次使用清单](first-session.md)，完成一个有权操作的非关键服务器任务，再决定是否购买 Pro。更新或本地输入成功，不等于已经完成服务器任务。
