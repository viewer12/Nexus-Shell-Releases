# Mac 休眠或 SSH 断线后，继续之前的远程任务

[English checklist](../remote-jobs.md) · 2026-09-26 核对 · Nexus Shell 1.7.7

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
tmux attach-session -t maintenance
```

计数应当继续推进，或已显示 rehearsal finished。实际任务还要检查自己的日志、退出状态和结果；备份需要验证完整性或恢复能力，不能只看 tmux 会话还在。

会话找不到时，依次检查是否连错主机/账号、会话是否已退出、服务器是否重启，以及管理员是否设置了注销时终止用户进程。对已经在 tmux 外启动的命令，事后创建 tmux 不会自动接管它。先查旧进程和日志，不要直接再跑一次迁移或部署。

测试会话里的工作全部结束后，在该 shell 输入 exit；最后一个窗口/面板关闭时会话结束。不要用 kill-server 批量清理，否则会影响同一 tmux server 中其他会话。

## 这套方法不覆盖什么

- 服务器重启后恢复服务：需要服务管理器、调度器及应用自身的检查点/重启策略。
- Mac 与服务器之间的文件传输：远程 tmux 无法让休眠的 Mac 继续传文件，需要检查传输结果和客户端明确支持的续传方式。
- Mac 上的数据库隧道：断线后重新建立转发，再重新连接数据库客户端。
- 自动恢复旧命令：Nexus Shell 重连不代表自动接回 tmux，也不保证旧进程还在。请手动执行 attach 并核验。

[完整英文演练与故障排查](https://nexusshell.app/en/guides/keep-remote-jobs-running-after-mac-sleep/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609)

Nexus Shell 要求 Apple Silicon 和 macOS 14.2+。个人非商业 SSH 有免费层；tmux 是独立的服务器工具，并非必须购买 Pro 才能使用。SFTP、Docker 管理和监控属于 Pro 功能。[官网 Pro](https://nexusshell.app/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_jobs_202609#pricing) 仅提供 lifetime 买断；App Store 提供 lifetime 和自动续费年付，无 Nexus Shell 账号及 Agent Bridge。两渠道的购买和数据分别管理，连接配置不会自动迁移。

依据：[tmux 入门文档](https://github.com/tmux/tmux/wiki/Getting-Started)、[命令手册](https://man.openbsd.org/tmux)。本次只单独执行验证了计数脚本，不声称已验证你服务器上的完整断线恢复或物理休眠过程。
