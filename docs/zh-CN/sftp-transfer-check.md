# 用无敏感文件检查一次 SFTP 往返传输

Nexus Shell 团队 · 首发2026-10-04 · 更新2026-10-21 · [English](../sftp-transfer-check.md)

[下载免费测试 ZIP](https://nexusshell.app/assets/downloads/sftp-transfer-check.zip)。五个合成文件覆盖空格文件名、中文文件名与 UTF-8 正文、隐藏文件、空文件和二进制数据，附带 SHA-256 清单及中英文说明。可用于任意 SFTP 客户端，不是安装包，无密码、密钥或可执行载荷。测试数据按 CC0-1.0 提供。

ZIP SHA-256：`8fb01dafb0893b5edad5b84929db8731a9d8f94bf42ac65d0acde9818786b544`。

1. 解压到新的 Mac 文件夹，保留原件不变作为基准。
2. 将整个解压后的文件夹上传到自己有权限的新建测试目录，包含隐藏文件。不要只上传 ZIP，也不要使用生产目录。
3. 下载到另一个空的本地目录，不能与原件合并，否则原始文件可能掩盖下载遗漏。
4. 在 Mac 终端输入 `cd` 和空格，将下载后的文件夹拖入终端，回车。运行 `shasum -a 256 -c SHA256SUMS`，五个文件应全部 `OK`、退出状态为0。按 README.txt 比较下载清单和原始清单，不要根据下载结果重建基准。
5. 权限另行核验；仅清理自己创建的测试副本，不提供可能误删的清理命令。

校验在 Mac 执行，不要求远程 shell，SFTP-only 账户也可使用。仅证明清单内五个文件字节一致，不证明权限、所有者、ACL、额外文件、空目录、符号链接、服务器身份、大文件或断点续传能力，也不是性能跑分。清单若随数据一起改变，不能作为原始内容证明。

也可直接打开[浏览器本地校验工具](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check)，从单独下载回来的副本选中五个测试文件，不要选择原件或ZIP。Mac文件选择窗口按Command + Shift + .可显示隐藏文件。工具使用固定的原始SHA-256值，报告缺失、内容变化、无法读取或重名；不会以你选择的清单重新定义基准，也不会上传文件内容或哈希。额外文件（包括README和清单）不在校验范围，界面会注明。只选择合成测试文件，不选择私密文档。清除选择可移除结果；无JavaScript或浏览器不支持时继续使用上述终端命令。通过仅证明选中的五个文件字节一致，不改变前述限制。

[生成脚本](../../examples/build-sftp-transfer-check.py)、[离线验证脚本](../../examples/verify-sftp-transfer-check.py)及[结果](../fixtures/sftp-transfer-check-result.json)公开可复现。六项检查覆盖正确副本、四种缺失/损坏，并说明额外文件不在命名文件清单的校验范围。这些离线检查不是 GUI 或真实服务器传输测试。

## 中断后续传：大小正确，不代表内容正确

OpenSSH 的 `reget`（继续下载）和 `reput`（继续上传）沿用已有部分文件的前缀，不会先确认这些字节属于当前源文件。[原厂续传说明](https://man.openbsd.org/sftp.1#a)也提示了这项假设。

先分开放好未改动的原件和部分副本，核对服务器、路径、上传/下载方向及源文件版本，避免编辑器或导出任务继续改变源文件。不能确认是同一版本时，向新的暂存文件名或独立目录完整复制，保留线上文件；不要把客户端的“重试”“覆盖”和“续传”视为同一操作。

完成后与原件比较SHA-256。只有SFTP权限时，可把暂存上传文件下载到另一个空Mac目录，在本地运行 `shasum -a 256` 比较，不需要远程shell。进度100%、文件存在或长度相同都不能代替内容校验。

[六案例实验源码](../../examples/sftp-resume-lab.mjs)及[实际结果](../fixtures/sftp-resume-result.json)使用16,384字节合成源文件、4,096字节预置部分副本。正确前缀续传和新目标完整复制在上传/下载两个方向均校验一致；只改变部分副本的第一个字节，续传仍返回0、最终大小仍为16,384，但哈希不一致。从仓库运行 `node examples/sftp-resume-lab.mjs` 可复现，需要Node.js及OpenSSH客户端/本地SFTP子系统；仅操作新建临时目录并清理该目录，不联网、不登录或读取个人SSH配置。

这是本地子系统通过管道传输、主动预置部分文件的实验，不是真实断网、Nexus界面、大文件可靠性或App Store兼容实测，也不承诺Nexus自动断点续传。现有五文件浏览器工具只认识固定测试包，不能用来验证任意备份或生产文件。

继续看[多服务器流程](multi-server-files.md)或[官网迁移指南](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#transfer-check)。数据免费；Nexus Shell SFTP 需 Pro 或符合资格的试用。官网新账号按资格发放七天免绑卡试用、不自动扣款，Pro 仅买断。App Store 可选买断或自动续费年付、不含 Agent Bridge，两渠道购买和数据独立。先验证任务，再决定是否[购买官网 Pro](https://nexusshell.app/?utm_source=github-releases&utm_medium=repository&utm_campaign=multi_server_files_202609#pricing)，本文不宣布新价格或生效日。
