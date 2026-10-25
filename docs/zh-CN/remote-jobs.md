# Mac 休眠或 SSH 断线后，继续之前的远程任务

[English checklist](../remote-jobs.md) · 连续性测试：2026-09-26 · 接回命令核对：2026-10-10 · 空闲注销检查：2026-10-25

重新连接服务器，不代表原来的命令还在运行。要让 Linux 服务器上的交互式构建、导出或维护任务在 Mac 断开后继续，应当在**远程服务器的 tmux 会话里先启动任务**，回来后再连接同一服务器、同一远程账号，手动接回该会话。

## 离开之前

在远程终端确认位置与 tmux 是否可用：

```sh
hostname
id -un
command -v tmux
tmux -V
tmux new-session -s maintenance
```

tmux 缺失时，需要按服务器的包管理和权限要求安装；只在 Mac 本地安装不能保护另一台服务器上的进程。如果 maintenance 已存在，先查看已有会话，避免重复运行备份或部署。

先在 tmux 里做一个只打印时间、不改文件的一分钟演练：

```sh
i=0
while [ "$i" -lt 30 ]; do
  i=$((i + 1))
  printf 'tick %s/30 ' "$i"
  date -u '+%H:%M:%S UTC'
  sleep 2
done
printf 'rehearsal finished\n'
```

按 Ctrl-B，松开，再按 D（tmux 默认快捷键）。回到外层远程 shell 后，即可关闭本次测试用的 SSH 连接。无需真的让 Mac 休眠，也可以先练习接回步骤。

## 回来之后

用同一个远程账号连接同一台服务器：

```sh
hostname
id -un
tmux list-sessions
tmux has-session -t '=maintenance'
```

先核对主机和账号。如果 has-session 报错，停下来查看会话列表，不要新建另一份备份或部署。检查通过后再运行：

```sh
tmux attach-session -t '=maintenance'
```

等号要求精确匹配会话名；不加等号时，backup 可能匹配到 backup-old。若已经在同一服务器的 tmux 内，用 `tmux switch-client -t '=maintenance'` 切换当前客户端，避免嵌套挂接。这两种命令都不强制踢掉其他客户端；共享会话输入前应先协调。

[在浏览器本地生成精确接回命令](https://nexusshell.app/en/guides/keep-remote-jobs-running-after-mac-sleep/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609#build-the-return-command-for-an-existing-session)。工具只生成文本，不检查服务器、不重启任务、不保存输入；超出英文字母、数字、下划线、连字符范围的会话名需要手动处理。

计数应当继续推进，或已显示 rehearsal finished。实际任务还要检查自己的日志、退出状态和结果；备份需要验证完整性或恢复能力，不能只看 tmux 会话还在。

会话找不到时，依次检查是否连错主机/账号、会话是否已退出、服务器是否重启，以及管理员是否设置了注销时终止用户进程。对已经在 tmux 外启动的命令，事后创建 tmux 不会自动接管它。先查旧进程和日志，不要直接再跑一次迁移或部署。

测试会话里的工作全部结束后，在该 shell 输入 exit；最后一个窗口/面板关闭时会话结束。不要用 kill-server 批量清理，否则会影响同一 tmux server 中其他会话。

## 开了 keepalive，为什么仍然被注销

SSH 对端回应保活，不等于 shell 正在接受输入，也不等于原任务还在运行。先记录断开时间和原始消息，再分清网络中断、shell 空闲注销和通道策略。

1. 在 Mac 的 Terminal 运行 `ssh -G your-saved-host`，查看 `serveraliveinterval`、`serveralivecountmax`、`controlmaster`、`controlpath`，以及当前版本支持时的 `channeltimeout`。这只展开 OpenSSH 配置，不登录；可信配置里的 `Match exec` 仍可能执行本地命令。不要读取不可信配置或公开完整输出；已有 master 可能保留旧设置。这也不代表 Nexus Shell 已导入这些选项。
2. 在需要检查的远程 Bash 中只读查看版本和计时器：

```sh
printf 'Bash: %s\n' "${BASH_VERSION-not Bash}"
printf 'TMOUT: %s\n' "${TMOUT-unset}"
```

3. 外层登录 shell 与具体 tmux 面板分别检查。Bash 的 TMOUT 在主提示符处等待输入时生效；一个 shell 未设置该值，不代表所有超时策略都不存在。tmux server 仍在，不代表原面板的 shell 或任务还在。
4. 与管理员核对已安装版本、对应时点日志和条件策略。支持 ChannelTimeout 的 OpenSSH 可关闭空闲通道；传输层保活回应不代表该通道有活动。ClientAliveInterval/CountMax 检查对端响应，不检查人是否打字。关闭通道也不保证相关进程全部退出或整个连接关闭。
5. 若时间与 Mac 休眠或网络变化一致，恢复连接后按上方步骤查看原任务。不要默认关闭有意设置的空闲策略，也不要直接再跑一份备份来诊断。

依据：[OpenSSH 保活](https://man.openbsd.org/ssh_config#ServerAliveInterval)、[客户端通道策略](https://man.openbsd.org/ssh_config#ChannelTimeout)、[服务器通道策略](https://man.openbsd.org/sshd_config#ChannelTimeout)、[Bash 交互行为](https://www.gnu.org/software/bash/manual/html_node/Interactive-Shell-Behavior.html)。具体选项随版本而异，不是客户端兼容性承诺。

## 这套方法不覆盖什么

- 服务器重启后恢复服务：需要服务管理器、调度器及应用自身的检查点/重启策略。
- Mac 与服务器之间的文件传输：远程 tmux 无法让休眠的 Mac 继续传文件，需要检查传输结果和客户端明确支持的续传方式。
- Mac 上的数据库隧道：断线后重新建立转发，再重新连接数据库客户端。
- 自动恢复旧命令：Nexus Shell 重连不代表自动接回 tmux，也不保证旧进程还在。请手动执行 attach 并核验。

[完整英文演练与故障排查](https://nexusshell.app/en/guides/keep-remote-jobs-running-after-mac-sleep/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609)

Nexus Shell 要求 Apple Silicon 和 macOS 14.2+。个人非商业 SSH 有免费层；tmux 是独立的服务器工具，并非必须购买 Pro 才能使用。SFTP、Docker 管理和监控属于 Pro 功能。[官网 Pro](https://nexusshell.app/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609#pricing) 仅提供 lifetime 买断；App Store 提供 lifetime 和自动续费年付，无 Nexus Shell 账号及 Agent Bridge。两渠道的购买和数据分别管理，连接配置不会自动迁移。

## 可复现的 shell 空闲注销演练

[两案例源码](../../examples/verify-shell-idle-timeout.mjs) · [原始终端结果](../fixtures/shell-idle-timeout-result.json)。本地已有 Node.js 18+、/usr/bin/python3 与 /bin/bash 时，先阅读源码，再从仓库根目录运行：

```sh
node examples/verify-shell-idle-timeout.mjs
```

脚本创建本机隔离伪终端，不加载 Bash 启动文件，历史定向 /dev/null；不连接 SSH、不读 SSH 配置、不改用户默认 shell，也不需要安装软件。Python 只提供 PTY，超时只清理自己的子进程。

10月25日在 macOS Bash 3.2.57 设置测试用 TMOUT=2：空闲提示符约2秒后自动注销；另一案例的3秒前台命令先完成，再于返回提示符约2秒后注销。断言检查了注销消息，不把退出码0误当普通成功退出。它只验证本机 shell 语义，不验证网络保活、客户服务器策略、物理休眠或 Nexus Shell GUI。下方9月26日、10月10日记录保持原日期和范围。

## 可复现的本地验证

10月10日另做了精确目标实验：backup 匹配到 backup-old，而不存在的 '=backup' 明确失败；切换两个控制模式客户端中的一个后，另一个客户端和两个原面板进程均保留，没有新建替代会话。[记录结果](../fixtures/tmux-exact-target-result.json) · [独立 socket 测试脚本](../../examples/verify-tmux-exact-targets.mjs)。本地已有 tmux 和 Node.js 18+ 时，先阅读脚本，再从仓库根目录运行 `node examples/verify-tmux-exact-targets.mjs "$(command -v tmux)"`。它验证本地会话选择和客户端切换，不验证 SSH 断线、物理休眠或 Nexus Shell GUI。

9月26日使用 tmux 3.7c，在独立 socket 和伪终端中执行了脱离、重新挂接测试：原面板进程不变，计数由第1次推进到第2次，最终30次全部完成。没有读取用户的 tmux 配置，也没有建立 SSH 连接。验证脚本只清理自己创建的 tmux server。

[英文复现步骤及依赖](../remote-jobs.md#reproduce-the-local-continuity-check) · [测试脚本](../../examples/verify-tmux-continuity.mjs) · [记录结果](../fixtures/remote-job-continuity-result.json)。脚本需要本地 macOS、Node.js 18+、/usr/bin/python3 和已有 tmux；先阅读再执行。它会从官网读取上面的计数示例并在本地运行，不安装软件。

这证明本地 tmux 会话连续性，不等于已验证客户服务器的断网恢复、真实业务任务或 Mac 物理休眠。远程步骤依据：[tmux 入门文档](https://github.com/tmux/tmux/wiki/Getting-Started)、[命令手册](https://man.openbsd.org/tmux)。
