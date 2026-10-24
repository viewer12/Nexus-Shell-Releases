# Container CPU and memory readings: compare the same scope

Verified October 24, 2026. [中文](zh-CN/container-resource-readings.md).

Start with the [Mac remote-Docker guide](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=remote_docker_202609#container-cpu-above-100-percent-compare-the-denominator-first). This checklist distinguishes accounting differences before a restart or a purchase. It does not require Nexus Shell to run the offline examples.

## Identify the endpoint

An SSH login to a Linux Docker host, a login ending inside a container, and Docker Desktop's Linux VM on a Mac are three different scopes. Confirm the account, daemon, container and sample time. A host monitor does not become a selected-container monitor just because Docker is installed.

From the authorized Docker host, replace `your-container` and inspect existing state:

```sh
docker stats --no-stream your-container
docker inspect --format 'quota={{.HostConfig.CpuQuota}} period={{.HostConfig.CpuPeriod}} nanoCPUs={{.HostConfig.NanoCpus}} cpuset={{.HostConfig.CpusetCpus}} memoryBytes={{.HostConfig.Memory}}' your-container
```

No limits are changed. Parent cgroups and cpusets can restrict capacity beyond these configuration fields. Missing counters or permission errors are unknown, not zero. Do not add Docker-socket mounts or privileges for monitoring. For cgroup v2 shell counters and path/namespace limitations, follow the guide; cgroup v1 paths differ.

## Reproduce six reading differences offline

After downloading or cloning this repository, run from its root with Node.js:

```sh
node examples/container-resource-readings.mjs
```

The script uses fixed synthetic inputs, checks the six outcomes and matches the [recorded JSON](fixtures/container-resource-readings.json). It makes no network requests and reads no server or SSH configuration. [Inspect its source](../examples/container-resource-readings.mjs) before running it. These are arithmetic examples, not captured workloads, app parser tests, GUI tests or performance measurements.

| Input | Result | Interpretation |
|---|---|---|
| 3 CPU-seconds in 2 seconds, 2-core capacity | 150% core-equivalent; 75% of capacity | Same work, different denominator. Docker's Linux CLI uses a core-equivalent convention. |
| CPU PSI `some total` rises 0.4 seconds over 2 seconds | 20% interval waiting | Not 20% CPU utilization. This calculation does not reconstruct `avg10`. |
| 8 throttled periods out of 10 observed periods | 80% of periods | Not 80% CPU time lost; a lifetime counter alone is not a current rate. |
| 512 MiB current, 128 MiB inactive file cache, 1024 MiB limit | 384 MiB cache-adjusted; 37.5% of limit | Raw API usage and cache-adjusted CLI displays can differ. Not an OOM forecast. |
| Local CPU/memory limits are `max`, ancestors and cpuset unknown | Normalized capacity/limit percentages unknown | No local cap does not mean infinite resources or known capacity. |
| Cumulative usage falls between samples | Discard interval; take a fresh baseline | A reset is not negative usage or evidence of an idle workload. |

## Compare with the installed app

Website / Homebrew **v1.8.0** adds container-aware monitoring for SSH sessions inside recognized application containers. CPU capacity, cgroup memory, CPU pressure and supported throttling fallback depend on available counters. Check the same target and interval; the Docker view on a host remains a separate workflow. The public China App Store metadata was **1.7.6** on October 24; check the installed Store build separately.

After an interrupted connection, v1.8.0 retains last readings with an interruption state; they are stale until fresh sampling resumes. Verify one non-critical server task and metric scope before deciding on Pro. Monitoring requires Pro or an eligible trial. Website Pro is lifetime-only; the Store offers lifetime and auto-renewing annual Pro and excludes Agent Bridge. Purchases and data are separate; no automatic profile migration is promised. This is not historical alerting, Kubernetes fleet monitoring or GPU/VRAM observability.

## Primary sources

- [Docker stats: raw API versus CLI memory](https://docs.docker.com/reference/cli/docker/container/stats/)
- [Docker CLI CPU calculation](https://github.com/docker/cli/blob/master/cli/command/container/stats_helpers.go)
- [Linux cgroup v2 limits and counters](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html)
- [Linux PSI: waiting time and trend windows](https://docs.kernel.org/accounting/psi.html)
- [Nexus Shell v1.8.0 release notes](https://github.com/viewer12/Nexus-Shell-Releases/releases/tag/v1.8.0)
