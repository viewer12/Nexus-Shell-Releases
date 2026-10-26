# SSH 服务器指纹变化：核实后再重新连接

2026年9月28日，Nexus Shell 团队。2026年10月26日更新。

服务器主机密钥用于确认“连接的是哪台服务器”，与你用于登录的私钥不同。VPS 重装可能更换主机密钥，但连错地址、IP 被重新分配、IPv4/IPv6 指向不同机器也可能出现相同警告，不能看到警告就删除旧记录。

1. 保留现有可信会话或服务商控制台，核对主机、端口、跳板/VPN 路径，以及重装或轮换是否符合预期。
2. 通过已登录的服务商控制台或可信管理员取得新指纹。Linux OpenSSH 使用默认 ED25519 主机公钥时，可在该服务器控制台运行 `ssh-keygen -l -E sha256 -f /etc/ssh/ssh_host_ed25519_key.pub`。比较同一算法和完整 SHA256 值；自定义配置、容器或主机证书不能套用默认文件。
3. 在 Mac 本地核对实际 trust 文件与主机别名。普通 known_hosts 的 2222 端口示例为 `ssh-keygen -F '[server.example]:2222' -f ~/.ssh/known_hosts`，哈希过的主机名也能查找。
4. 只有独立核验匹配后，先保留备份，再用 `ssh-keygen -R '[server.example]:2222' -f ~/.ssh/known_hosts` 移除该主机和端口的旧记录。按原登录密钥/跳板配置重连，再次核对指纹后接受。默认22端口通常只用主机名；集中管理的CA或信任文件应由管理员处理。

不要删除整个 known_hosts、关闭主机验证，或把未经核实的 ssh-keyscan 输出直接当成可信身份。变更服务器信任记录不会授予登录或文件权限，也不需要更换你的登录私钥。

官网/Homebrew v1.7.7 源码包含“服务器指纹已变化”提示，展示已保存和当前指纹。未核实前选择取消；独立核实后才选择“信任新指纹并继续”。这里是已发布源码核对，未做本次 GUI 或 App Store 实测，也不承诺不同版本/客户端共用信任库。

完整步骤见[官网排查指南](https://nexusshell.app/en/guides/ssh-host-key-changed-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=host_key_recovery_202609)。官网 Pro 仅 lifetime 买断，App Store 有买断与自动续费年付；OpenSSH 排查命令本身不要求 Pro。

## 已执行 ssh-keygen -R，但警告仍在

退出码为 0 不代表确实移除了记录。10 月 26 日的 macOS 隔离实验中，端口身份写错，以及在错误文件中移除正确别名，都会返回 0 并提示“not found”；实际记录仍在。

先保留警告中的具体主机、端口和 offending-file 路径。检查 OpenSSH 配置时沿用报错命令的目标和参数；例如 `ssh -G server-alias` 只评估配置、不连接服务器，但可信配置中的 `Match exec` 仍可能执行本地命令。分享结果前遮盖内部主机名和路径。

- 非默认端口：查找 `'[server.example]:2222'`，而非仅查 `'server.example'`；引号可避免 macOS zsh 把方括号当作通配符。
- `HostKeyAlias`：按实际警告和有效配置确定信任身份，不能把连接昵称直接当成存储身份，也不要猜测端口后缀。
- `UserKnownHostsFile`：`-f` 指向实际文件。多个用户或全局文件、`KnownHostsCommand`、CA/吊销策略，以及其他 GUI 客户端可能有独立来源；集中管理的信任由管理员处理。

只有实际警告/配置明确指向 `~/.ssh/project_known_hosts` 中的 `logical-blue` 时，才使用这个只读示例；哈希记录也能查找：

```sh
ssh-keygen -F 'logical-blue' -f ~/.ssh/project_known_hosts
```

未找到只说明该文件中没有这次查找的匹配项，不证明服务器可信。独立核实新指纹、备份正确文件后再移除；`-R` 会移除该文件内指定身份的全部密钥，而非仅一个算法。按原路线重连并再次核对指纹，不要为消除警告盲删更多文件。

仓库内使用 Node.js 18+ 及 PATH 中的 `ssh`、`ssh-keygen`，可运行：

```sh
node examples/verify-known-hosts-selection.mjs
```

[实验代码](../../examples/verify-known-hosts-selection.mjs) · [10 月 26 日 macOS 原始结果](../fixtures/known-hosts-selection-result.json)。六项检查包括受控 `ssh -G` 配置、两种退出码为 0 却未匹配的情形、哈希别名查找、定点移除与备份、保留其他记录。别名记录是模拟数据；未测试 SSH 握手、真实服务器身份、证书策略或 GUI，不读用户 SSH 文件、不联网，仅清理实验自己的临时目录。

## 可复现的离线实验

在本公开仓库目录内，使用 Node.js 18+ 与 PATH 中的 ssh-keygen：

```sh
node examples/verify-known-hosts-scope.mjs
```

[脚本](../../examples/verify-known-hosts-scope.mjs)只在自己的临时目录生成一次性密钥与模拟 known_hosts，核验六项行为：不同指纹、哈希主机+端口查找、定点移除、保留默认端口与其他主机、备份、已知测试新钥替换。结束后仅清理自己的临时目录，不读取用户 SSH 文件、不联网。

[macOS 实测结果](../fixtures/known-hosts-scope-result.json)。不等于真实 VPS 重装、网络攻击、IPv4/IPv6 路由、App GUI 或账号登录测试。

一手参考：[ssh-keygen](https://man.openbsd.org/ssh-keygen)、[ssh-keyscan](https://man.openbsd.org/ssh-keyscan)、[ssh_config](https://man.openbsd.org/ssh_config)、[sshd](https://man.openbsd.org/sshd)。
