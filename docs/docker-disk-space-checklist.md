# Docker says “no space left”: a Mac operator's checklist

Start with the [interactive disk-space checklist and full Docker workflow](https://nexusshell.app/en/guides/troubleshoot-remote-docker-from-mac/?utm_source=github-releases&utm_medium=repository&utm_campaign=docker_disk_202609#docker-says-no-space-left-locate-the-full-filesystem). It provides read-only checks for a Linux Docker host, without uploading logs or connecting to your server. No Nexus Shell account is needed to use the checklist.

SSH into the intended host. Confirm its Docker client targets the daemon on that same host before comparing results; a Docker context or DOCKER_HOST override may target another machine.

```sh
hostname
docker info --format 'daemon={{.Name}} root={{.DockerRootDir}} driver={{.Driver}}'
df -h
df -i
docker system df
```

| Observation | Next check |
| --- | --- |
| Relevant filesystem has no free bytes | Match the exact failing path to its mount; identify the application, logs, backups or Docker objects consuming it. |
| Free bytes but no available inodes | Investigate the owner of many small files and its retention policy. Filesystem-specific accounting can differ. |
| Hypervisor has space but VM/LXC is full | Inspect the guest's allocation and mounted filesystem. Spare pool capacity is not automatically available inside the guest. |
| Docker reports reclaimable space | Review `docker system df -v` and ownership. Unattached volumes or stopped containers may contain needed recovery data. |
| Bytes and inodes both look available | Recheck the path, daemon and failure time; investigate quotas, tmpfs and separate storage. An inotify watch-limit error is not a disk-full diagnosis. |

Docker Engine 29+ fresh installations normally use a containerd image store. Image/snapshot storage may be under `/var/lib/containerd` while volumes and other daemon data remain under `/var/lib/docker`; custom configurations and upgraded installations differ. Check the actual setup. A bind mount can point to another filesystem outside both paths.

Do not delete Docker's directories, blindly prune volumes, or truncate a database file. Select a targeted retention, log-rotation or expansion plan after identifying ownership and backup needs. Verify the same filesystem and the actual application afterwards; freed space alone does not prove recovery.

The commands inspect state, but their output can reveal hostnames, paths and image names. Review before sharing. This document has not reproduced disk exhaustion on a customer server and does not prescribe a universal disk size or automatic resize.

## Continue from your Mac

Nexus Shell combines terminal, Docker inspection, monitoring and SFTP for repeated server maintenance. It is not an automatic storage-cleanup or hypervisor-management tool. Apple Silicon and macOS 14.2+ are required; Docker, monitoring and SFTP need Pro or an eligible trial. Basic SSH is free for personal, non-commercial use.

[Website Pro](https://nexusshell.app/en/?utm_source=github-releases&utm_medium=repository&utm_campaign=docker_disk_202609#pricing) is lifetime-only. The [Mac App Store edition](https://apps.apple.com/cn/app/nexus-shell/id6780150323?mt=12) offers lifetime and auto-renewing annual Pro, without a Nexus Shell account or Agent Bridge. Purchases and data are managed separately; connections do not migrate automatically. Use the website/Homebrew edition for Agent Bridge. Current prices differ; no future alignment amount or date is specified here.

Sources: [Docker disk usage](https://docs.docker.com/reference/cli/docker/system/df/), [daemon storage](https://docs.docker.com/engine/daemon/), [pruning boundaries](https://docs.docker.com/engine/manage-resources/pruning/) and [GNU df](https://www.man7.org/linux/man-pages/man1/df.1.html).
