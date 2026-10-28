# Mac SSH 隧道启动后，如何确认目标服务可用

使用[免费隧道命令工具](https://nexusshell.app/en/tools/ssh-tunnel-command-builder/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609)生成本地 OpenSSH 转发。无需账号；输入留在浏览器中，不上传、不存储、不自动连接。工具提供故障选择和可复制的检查清单，不报告你的服务器已经健康。

## 分开检查三个层级

本地端口监听、SSH连接响应、目标服务正常响应是不同事实。ExitOnForwardFailure检查转发是否成功建立，不检查后续目标连接；ServerAliveInterval检查SSH响应，不检查数据库或网页健康。

以下示例在Mac本地Terminal运行，不能粘贴进远程终端。替换示例服务器，并核对SSH主机指纹；保持窗口打开，结束时在该窗口按Control-C。

```sh
ssh -N -T -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -L '127.0.0.1:15432:127.0.0.1:5432' -p 22 'developer@bastion.example'
```

第二个127.0.0.1指SSH服务器；数据库在另一台主机时，改为SSH服务器可达的私网地址。数据库客户端在Mac上连接127.0.0.1:15432，关闭该连接里的重复内置SSH隧道，并保留数据库认证及TLS要求。Nexus Shell不是数据库查询工具，本资源也不承诺应用内隧道管理功能。

在第二个Mac本地Terminal只读检查监听：

```sh
lsof -nP -iTCP:15432 -sTCP:LISTEN
```

核对预期SSH进程和loopback地址；只能看到当前账号有权限查看的进程。端口被未知进程占用时换一个本地端口，同时修改客户端，不杀陌生进程。即使TCP连接成功，也可能只是本地监听接受了连接，远端服务仍不可达。

随后在已认证的SQL客户端执行SELECT 1；Redis客户端在权限允许时执行PING。这些不是Terminal命令。连接拒绝/超时要从SSH服务器视角核对服务地址、端口与路由；administratively prohibited要由管理员检查转发策略；数据库拒绝登录或证书不匹配要核对服务账号和证书主机名，不能用SSH密码替代数据库账号。

## HTTP示例：检查响应身份与状态

仅对明确使用普通HTTP的服务，先选择已知只读端点。示例为/和18080，使用前按服务要求修改：

```sh
curl --disable --noproxy '*' --connect-timeout 3 --max-time 5 --include 'http://127.0.0.1:18080/'
```

检查预期状态与内容。不加--fail时，401/403/500仍可能让curl退出0；错误服务返回200也不代表成功。该示例忽略默认curl配置、绕过HTTP代理、限制等待、不跟随跳转。HTTPS应使用服务支持的原主机名及证书设置，保留校验，不能加--insecure规避问题。

## 无需服务器账号的复现

在仓库根目录，用Node.js 22+和curl执行：

```sh
node examples/verify-tunnel-health-layers.mjs
```

[脚本](../../examples/verify-tunnel-health-layers.mjs)只绑定本机临时loopback端口，验证TCP监听成功但后端不可用、HTTP403、错误服务200及预期内容200四种情况。只关闭自己创建的监听与socket。它是Node TCP/HTTP实验，不是SSH握手、真实数据库、客户VPS、Mac休眠或Nexus GUI验收。[英文完整步骤](../ssh-tunnel-workflow.md)。

## localhost、IPv6 和 Unix socket 可能绕过预期监听

此示例绑定Mac的IPv4地址127.0.0.1。客户端若把localhost解析成::1，就在连接另一地址；IPv6上的相同端口甚至可能由另一服务占用。先比较客户端的实际host、local port与lsof的地址，不要先改远端服务器，也不要禁用IPv6、改/etc/hosts、终止陌生进程或开放通配地址。保留服务要求的TLS与证书主机名设置。

Unix上的[MySQL命令行客户端通常为localhost选择Unix socket](https://dev.mysql.com/doc/refman/8.4/en/connecting.html)，单独指定端口并不强制TCP。若已安装MySQL客户端，在第二个Mac本地Terminal使用MySQL示例的本地端口：

```sh
mysql --protocol=TCP --host=127.0.0.1 --port=13306 --user=YOUR_DB_USER --password
```

替换数据库账号占位符，在提示时输入密码；修改过本地端口就同步修改。PostgreSQL的[libpq在省略host时可能使用Unix socket](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-PARAMKEYWORDS)，已安装psql时明确指定TCP地址：

```sh
psql --host=127.0.0.1 --port=15432 --username=YOUR_DB_USER --dbname=YOUR_DB_NAME --password
```

替换数据库账号与库名，保留TLS要求。[工具中的传输方式诊断](https://nexusshell.app/en/tools/ssh-tunnel-command-builder/#localhost-reaches-the-wrong-service-or-misses-the-tunnel)会随所选本地端口更新示例，不收集数据库凭据。查询成功后，仍要按服务的只读检查确认数据库身份。

可在仓库根目录用Node.js 22+运行：

```sh
node examples/verify-loopback-transport.mjs
```

[脚本](../../examples/verify-loopback-transport.mjs)以不同响应标记区分IPv4监听、同端口的IPv6独立服务和临时Unix socket，再验证仅关闭IPv6监听时IPv4仍正常的情况。只关闭自己创建的监听并清理自己的临时socket目录；没有IPv6时明确失败，不伪报通过。[结果](../fixtures/loopback-transport-result.json)保留实际执行时间和该机器的localhost解析结果，不泛化为所有客户端的解析顺序。这四例是Node传输实验，不是SSH、MySQL、PostgreSQL、TLS、真实VPS或Nexus GUI验收；数据库规则依据各自官方手册。

## 后续服务器维护

数据库客户端负责查询；Nexus Shell负责保存的SSH连接、终端、SFTP与Docker检查。需要Apple Silicon和macOS14.2+；免费层限个人非商业SSH，SFTP等Pro功能和商业用途遵循授权要求。

继续[远程文件编辑](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609)或[Docker排查](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=private_database_202609)。官网仅提供lifetime买断；App Store提供lifetime及自动续费年付，价格暂有差异。官网后续计划对齐商店买断价，金额与生效时间未定。Agent Bridge需要官网/Homebrew版；商店版无需Nexus账号、不含Bridge，两版购买和数据分别管理，连接不自动迁移。

依据：[OpenSSH转发失败选项](https://man.openbsd.org/ssh_config#ExitOnForwardFailure)、[curl官方说明](https://curl.se/docs/manpage.html)。
