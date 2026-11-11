# SFTP 上传成功，网站却没更新：先核对文件，再核对网页

Nexus Shell 团队 · 2026-11-02 · [English](../website-publish-check.md)

上传完成、远端副本正确、网站实际使用该副本，是三个不同的结果。先保留原件，将准确远端路径下载到另一个 Mac 目录比对，再查看真实网页响应；换客户端、购买 Pro 或反复上传，不能修复尚未确认的发布路径或缓存问题。

## 按证据逐步检查

1. 从服务商面板或发布定义确认域名、站点账号和当前文档根目录。SFTP 登录目录可能是家目录或受限根；`public_html`、`httpdocs`、`/var/www/html` 都只是例子，不能照搬。staging、旧 release 或源码目录可能不对外提供网页。
2. 将准确远端文件取回新的 Mac 目录，与保留原件用[浏览器本地两文件比对工具](https://nexusshell.app/en/guides/winscp-alternative-for-mac/?utm_source=github-releases&utm_medium=repository#compare-your-sftp-files)或既有工具比对。网页工具每个文件上限 16 MiB、不上传文件，并区分字节差异和换行转换。大小或时间一致不等于内容一致；内容一致也不证明网站使用这一路径。
3. 在浏览器 Network 面板查看准确域名和资源的最终 URL、状态、响应内容及 CSS/JS 路径。200 也可能是应用回退 HTML；404 也可能来自路由或访问规则，不能仅凭状态断定目录对错。直接访问服务器 IP 可能命中另一虚拟站点。
4. 按站点既有发布流程构建、激活和刷新。静态源码可能需构建；CMS、容器挂载、release 软链接可能使用别的文件。核实上传与路由后，再定位浏览器/Service Worker、主机或 CDN 层。强制刷新或添加查询参数不保证每层缓存失效；不要凭猜测重启生产、改 DNS、删除 index 或放宽权限。

如服务商允许，在有权操作的测试站点用全新、无敏感内容且名称唯一的文本文件演练，结束后只删除自己的测试文件。不要用 `.env`、密钥、备份或私有配置探测公网路径，不关闭主机身份验证，不绕过 SFTP-only 限制。

## 本机复现四种不同结果

需要 Node.js 22 或以上，在仓库根目录运行：

```sh
node docs/fixtures/website-publish-lab.mjs
```

[完整源码](../fixtures/website-publish-lab.mjs)仅创建本次临时目录，在本机回环随机端口提供 HTTP，使用虚构文本，结束后关闭服务并删除自身临时目录。四例分别验证：副本在未启用 staging、正确文件但刻意模拟旧响应、HTTP 200 却是回退 HTML、准确新文本的 SHA-256 匹配。

这不是 SFTP 传输、真实 CDN、托管平台、Nexus GUI 或业务健康实测；模拟旧响应不验证任何缓存协议，也不替你的服务器诊断原因。文本正确不等于 CMS 和全部资源都正确。[本次 macOS 原始结果](../fixtures/website-publish-lab-result.json)。

## 首次使用怎么衔接

保留原客户端，按[首次会话清单](first-session.md)确认应用账号与试用，然后先完成[临时文件往返](sftp-transfer-check.md)，再处理真实站点。官网/Homebrew 版需要 Apple Silicon、macOS 14.2+；基础 SSH 限个人非商业免费，SFTP/外部编辑需要 Pro 或合格试用。合格官网新账号一次性七天试用，无需绑卡、不自动扣费。

官网 Pro 新购 US$24.99，一次买断。已购 lifetime 权益不变，不补差价。[以当前官网购买区为准](https://nexusshell.app/?utm_source=github-releases&utm_medium=repository#pricing)。App Store 买断/自动续费年付按地区条款管理，无需 Nexus 账号、不含 Agent Bridge；不承诺跨渠道授权或连接自动迁移。

临时编辑副本、同步和保存失败另见[原编辑指南](https://nexusshell.app/en/guides/edit-remote-file-macos-sftp/?utm_source=github-releases&utm_medium=repository#upload-succeeded-but-website-unchanged)。本文不收集服务器资料或上传诊断文件。

一手依据：[MDN 网站上传](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/Upload_files_to_a_web_server)、[nginx 请求处理](https://nginx.org/en/docs/http/request_processing.html)、[MDN HTTP 缓存](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)。
