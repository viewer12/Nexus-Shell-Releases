# Mac 改好了 VPS 上的 .env，容器为什么仍用旧值？

2026-11-01 核对。先在有权限的非关键服务上验证。

远程文件保存、Compose 解析、容器创建时的环境、应用当前设置，是四个不同状态。先确认上传结果与实际路径；重启无法补上传。`docker compose restart` 不会把修改后的环境配置应用到现有容器。

## 先确认检查的是同一个部署

在目标 Linux 主机的 SSH 终端核对账号、Docker endpoint、项目名、Compose 文件与覆盖顺序。Mac 本地运行 Compose 时，即使 Docker context 指向 VPS，解析的也仍是本地文件；不要混淆两种操作位置。

对简单的单文件部署，把英文清单中的路径、项目名和服务名替换为实际值，保留原有所有覆盖文件、profiles 与 flags，先运行 `config --quiet`、`config --services` 和 `ps -a`。第一条只校验配置，不证明变量值正确或应用已健康。完整 `config`、`config --environment`、inspect 和日志可能包含秘密，应本地私下检查，不要整段贴到公开帖子或 AI 对话。错误信息也可能带路径、变量名。

## 区分不生效的环节

| 看到的情况 | 继续查什么 |
| --- | --- |
| 远端文件没变 | 编辑会话、上传状态、真正的部署路径 |
| 文件对了，Compose 值不对 | 指定的 env 文件、覆盖顺序、当前 shell 中同名导出变量 |
| .env 有值，service 没有 | 插值输入不会自动全部注入容器，核对 environment 映射或 service env_file |
| env_file 生效，其他位置的变量插值失败 | service 环境和 Compose 插值的输入不是一回事 |
| 只点了 Restart | 评审该服务是否需要按原部署流程重建容器 |
| 容器环境已对，应用仍不对 | 应用自己的 reload、缓存、构建时变量或挂载配置 |

[英文完整命令与九项隔离样例](../compose-env-after-edit.md)、[可审阅源码](../fixtures/compose-env-lab.mjs)。在已有 Node.js 和 standalone Compose 的机器上，通过 `COMPOSE_BIN` 指定该二进制的绝对路径执行。实测 Compose v5.6.1 / Darwin arm64 九项配置解析断言通过：不连接 daemon、不启动容器、不读取凭据，只用临时目录和假值。不是 VPS、Restart、业务应用或 Nexus Shell GUI 实测。

确认配置和变更窗口后，按正常部署流程评审单服务 `up -d --no-deps app`。保留同一个项目名、文件和 env 参数；它会写入并可能中断流量，数据库或多服务依赖要另评审。不要为环境变量问题执行 `down -v`、全局 prune。最后检查服务状态、有限日志和应用健康，挂载文件/构建时值/数据库设置分别用应用自己的流程。

Nexus Shell 将 SSH、远程文件和 Docker 检查放在同一 Mac 工作区，文件保存成功不代表部署完成。Apple Silicon、macOS 14.2+；SFTP/Docker 需要 Pro 或合资格试用。[首次会话](first-session.md)后先验证一个实际任务，再决定购买。官网仅 lifetime，当前 US$12.88，已公告 2026-11-07 00:00 UTC+8 起新购 US$24.99；已购 lifetime 权益不变。注册、试用或未付款会话不自动锁价。App Store 的买断/自动续费年付另行管理，本轮不改各地区商店价。

主要依据：[Docker 插值](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/)、[环境优先级](https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/)、[config](https://docs.docker.com/reference/cli/docker/compose/config/)、[restart](https://docs.docker.com/reference/cli/docker/compose/restart/)、[up](https://docs.docker.com/reference/cli/docker/compose/up/)。由 Nexus Shell 团队借助 Codex 编写。
