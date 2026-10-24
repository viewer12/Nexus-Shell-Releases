# 容器 CPU 和内存读数：先核对范围与分母

核对日期：2026-10-24。[English](../container-resource-readings.md)。

先看[官网远程 Docker 指南的资源读数章节](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_docker_202609#container-cpu-above-100-percent-compare-the-denominator-first)。目的是在重启或购买前识别口径差异，离线样例不需要 Nexus Shell。

## 先确认连到了哪里

SSH 登录 Linux Docker 宿主机、SSH 登录到应用容器内部、Mac 上 Docker Desktop 的 Linux 虚拟机，是不同的统计范围。确认账号、daemon、容器和采样时间。宿主机安装了 Docker，不代表宿主机监控会自动变成某个容器的监控。

在已获授权的 Docker 主机运行下面的只读命令，先把 your-container 替换为准确目标：

```sh
docker stats --no-stream your-container
docker inspect --format 'quota={{.HostConfig.CpuQuota}} period={{.HostConfig.CpuPeriod}} nanoCPUs={{.HostConfig.NanoCpus}} cpuset={{.HostConfig.CpusetCpus}} memoryBytes={{.HostConfig.Memory}}' your-container
```

这些命令不设置配额、不重启服务。父 cgroup 和 cpuset 还可能施加更紧的限制，不能只凭配置字段认定实际容量。读不到文件或权限不足应记为未知，不是零；不要为看图额外挂载 Docker socket 或提权。容器内 cgroup v2 文件路径、命名空间和 v1 差异见官网指南，不能把 /sys/fs/cgroup 根目录一概视为当前容器。

## 本地复算六种差异

下载或克隆仓库后，在仓库根目录使用 Node.js：

```sh
node examples/container-resource-readings.mjs
```

脚本用明确的合成计数检查六种结果，并逐字核对[已记录 JSON](../fixtures/container-resource-readings.json)。没有网络请求，不读 SSH 配置或真实服务器。运行前可检查[源代码](../../examples/container-resource-readings.mjs)。这是算术样例，不是 VPS 抓取、产品解析器测试、GUI 兼容测试或性能测量。

| 输入 | 结果 | 应如何理解 |
|---|---|---|
| 两秒消耗三核秒，容量两核 | 按单核是150%，按容量是75% | 同一工作量可以有不同分母；Docker Linux CLI 采用核当量口径。 |
| 两秒内 PSI some total 增加0.4秒 | 该区间20%时间存在 CPU 等待 | 不是20% CPU 使用率，也不能据此重建 avg10 趋势。 |
| 新增十个调度周期中八个发生限流 | 80%的周期发生限流 | 不是丢失80% CPU 时间；累计非零不等于正在限流。 |
| current 512MiB、非活跃文件缓存128MiB、限额1024MiB | 缓存调整后384MiB，占限额37.5% | 原始 API 与 CLI 数字可能不同，都不是 OOM 预测。 |
| 本层 CPU/内存限制为 max，父级和 cpuset 未知 | 容量占比和限额占比未知 | 没有本层配额，不代表资源无限或容量已知。 |
| 后一次累计使用量反而下降 | 放弃该区间，重新取基线 | 重启/计数重置不是负使用率，也不能当空闲。 |

## 核对实际安装的版本

官网/Homebrew **v1.8.0** 为 SSH 终点位于可识别应用容器内部的连接增加容器感知监控，按可用计数读取 CPU 容量、内存、CPU 压力或支持的限流回退。应比较同一目标和采样区间；宿主机 Docker 视图属于另一个工作流。10月24日中国区 App Store 公开版本仍为 **1.7.6**，不能把官网新版能力直接套到商店已装版本。

v1.8.0 断连后保留最后一次读数并提示连接中断，恢复采样前不能据此认定服务正常。先在非关键服务器完成一次真实任务、确认统计范围，再决定是否购买 Pro；监控需要 Pro 或有效试用。官网仅 lifetime 买断，商店提供买断与自动续费年付且不含 Agent Bridge，两渠道购买和数据分别管理，不承诺连接自动迁移。这不是历史告警、Kubernetes 集群监控或 GPU/显存观测产品。

## 原厂依据

- [Docker stats：API 原始内存与 CLI 口径](https://docs.docker.com/reference/cli/docker/container/stats/)
- [Docker CLI CPU 计算源码](https://github.com/docker/cli/blob/master/cli/command/container/stats_helpers.go)
- [Linux cgroup v2 限制与计数](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html)
- [Linux PSI：等待时间与趋势窗口](https://docs.kernel.org/accounting/psi.html)
- [Nexus Shell v1.8.0 发布说明](https://github.com/viewer12/Nexus-Shell-Releases/releases/tag/v1.8.0)
