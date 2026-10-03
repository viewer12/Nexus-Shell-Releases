"""Build a deterministic, harmless SFTP round-trip fixture (Python standard library)."""
import hashlib
from pathlib import Path
import sys
import zipfile

README = """SFTP round-trip check / SFTP 往返传输检查
Nexus Shell team · 2026-10-04 · CC0-1.0 test data

This package contains synthetic test data, not an installer. No credentials,
network calls, executable payloads or account are required to inspect it.
The same package works with other SFTP clients.

1. Extract this ZIP into a fresh Mac folder. Keep this original untouched.
2. Upload the WHOLE extracted sftp-transfer-check folder, not just the ZIP,
   to a NEW disposable directory your server account owns. Show hidden files
   in your client and include .hidden-check.txt. Never use a live service path.
3. Wait for completion, then download the remote folder into a DIFFERENT,
   empty Mac folder. Do not merge it with the original: leftover local files
   could hide an incomplete download. No remote shell is needed for this check.
4. In Mac Terminal type cd followed by a space, drag the DOWNLOADED folder
   into Terminal, then press Return. Run:

   shasum -a 256 -c SHA256SUMS

All five payload files should report OK and the command should exit 0.
A missing file or changed bytes must fail. Do not regenerate the manifest
from the downloaded data. Compare its SHA256SUMS with your retained original:

   diff /path/to/original/SHA256SUMS /path/to/downloaded/SHA256SUMS

Quote paths with spaces (dragging folders into Mac Terminal escapes them).
The two placeholder paths above must be replaced with your actual local paths.
An unchanged original manifest is the expected baseline, not a server-provided
claim. If a hidden file is absent, check visibility and selection settings first.

This verifies the five named files: spaces, Chinese filename and UTF-8 text,
dotfile, empty file and binary bytes. It does NOT verify permissions/owner/ACL,
extra files, empty directories, symlinks, large transfers, interruption/resume,
live deployment, server identity, or the safety of arbitrary downloaded files.
This tiny fixture is not a speed benchmark. Only remove the specific disposable
test copies you created when finished; no cleanup command is included.

中文：这是无敏感内容的测试数据，不是安装包。解压后将整个测试文件夹上传到
自己有权限的新建测试目录，包含隐藏文件；不要只上传ZIP，也不要使用生产目录。
传输完成后，下载到另一个空目录，不与原件合并。在Mac终端进入下载后的文件夹，
运行上面的shasum命令，五个文件应全部OK。使用原件保留的SHA256SUMS作基准，
不要根据下载结果重新生成校验清单。检查仅证明列出的文件字节一致，不证明权限、
所有者、同步删除、断点续传、大文件稳定性或服务器身份。可用于任意SFTP客户端。

Guide: https://nexusshell.app/en/guides/winscp-alternative-for-mac/#transfer-check
Nexus Shell SFTP needs Pro or an eligible trial. Website Pro is lifetime-only;
App Store offers lifetime and auto-renewing annual Pro without Agent Bridge.
Testing these files does not require buying Nexus Shell.
"""

def build(output):
    files = {
        "file with spaces.txt": b"Synthetic transfer fixture. Spaces in a filename.\n",
        "中文文件.txt": "Nexus Shell test / 中文内容 / café / 日本語\n".encode("utf-8"),
        ".hidden-check.txt": b"Synthetic hidden file; include me in both transfer directions.\n",
        "empty.txt": b"",
        "bytes.bin": bytes(range(256)) * 4,
    }
    manifest = "".join(hashlib.sha256(data).hexdigest() + "  " + name + "\n" for name, data in files.items())
    entries = {**files, "SHA256SUMS": manifest.encode(), "README.txt": README.encode()}
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_STORED) as archive:
        for name, data in entries.items():
            info = zipfile.ZipInfo("sftp-transfer-check/" + name, date_time=(2026, 10, 4, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    print(f"{hashlib.sha256(output.read_bytes()).hexdigest()}  {output.name}")

if __name__ == "__main__":
    destination = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "assets/downloads/sftp-transfer-check.zip"
    build(destination)
