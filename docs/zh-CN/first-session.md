# 下载之后：完成登录和第一个服务器任务

Nexus Shell 团队 · 2026年10月5日 · [English](../first-session.md)

2026年10月8日新增：[日本語](../ja/first-session.md) · [한국어](../ko/first-session.md)。

应用登录步骤适用于**官网 / Homebrew 版**，按v1.7.9发布源码核对。需要Apple Silicon Mac、macOS 14.2以上，以及你有权访问的服务器。安装客户端不会附赠VPS或服务器账号。

## 在应用中完成账号登录

打开Nexus Shell，在侧栏进入**会员**，点击**登录账号**。在应用打开的浏览器窗口完成登录，允许浏览器返回Nexus Shell，再检查应用内账号和会员状态。只在官网登录，不等于应用已经建立登录会话。

应用仍在等待时，完成这次由应用发起的浏览器流程，或回到应用重新登录。不要分享回调网址或令牌。应用已有账号但权益似乎未更新时，点击会员中心的**刷新**。先确认账号与试用资格，不要为了刷新状态重复购买或新建账号。

符合条件的官网新账号可通过注册获得一次性7天Pro试用，不需要绑卡。每次安装或登录不会重新获得7天，请核对实际显示的状态与到期时间；到期不自动扣费。免费SSH限个人非商业用途，SFTP、Docker和监控需要Pro或有效试用。

**Mac App Store用户**跳过官网账号步骤，使用应用内Apple购买/恢复流程，以Apple展示的条款为准。商店Pro有终身买断和自动续费年付，不含Agent Bridge；官网与商店购买、数据分别管理，不承诺买一份在另一版自动生效。

## 先确认连接，再完成一个任务

保留原客户端，选择非关键服务器，填写主机地址、端口、远程用户名和支持的认证方式。Nexus账号不是服务器登录账号。首次或指纹变化时，通过服务商控制台或管理员独立核实后再信任；不要关闭主机身份校验来消除报错。

运行`uptime`等只读命令，确认连接的是预期服务器。无法登录时按[连接检查清单](https://nexusshell.app/en/guides/fix-mac-ssh-no-route-to-host/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610)分诊；不要假设OpenSSH别名、外部agent或其他客户端配置会自动迁移。

- **文件：**用[临时SFTP测试包](sftp-transfer-check.md)，上传到自己有权限的新测试目录，下载到另一个空目录，与保留的原始清单比对。SSH成功不代表可写文件；外部编辑还有远程shell条件，参考[权限说明（英文）](../sftp-write-permissions.md)。
- **Docker：**按[只读清单（英文）](../docker-disk-space-checklist.md)查看容器和有限日志，服务器权限仍然生效，不为试用而删除容器或卷。
- **长任务：**先完成[远程tmux演练](remote-jobs.md)，再处理断线后仍需继续的工作。

检查任务结果后才算完成验证。下载、登录或显示试用标记，都不等于完成服务器任务。原工具够用时无需更换；流程适合后，再看[官网终身Pro](https://nexusshell.app/?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610#pricing)。

## 需要帮助时

中、日文输入法下，Shift 符号偶尔需要按两次时，查看官网 / Homebrew v1.7.10 修复与[终端输入检查清单](terminal-input-check.md)，区分键盘布局、密码不回显和粘贴问题。

提供应用版本、macOS版本、安装渠道、失败步骤和脱敏错误即可。不要提供SSH密码、私钥、回调网址、令牌或完整终端历史。截图分享前检查主机名、用户名和无关文件。[支持入口](https://nexusshell.app/contact?utm_source=github-releases&utm_medium=repository&utm_campaign=first_session_202610)。

本清单按发布源码核对，不代表本次完成了真实服务器、应用GUI或真实购买测试。文档不收集账号、服务器资料或诊断上传。
