"""Offline fixture checks only; no app, SSH connection or server is exercised."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile

archive = Path(sys.argv[1]).resolve()
cases = []
with tempfile.TemporaryDirectory(prefix="nexus-sftp-fixture-") as folder:
    root = Path(folder)
    with zipfile.ZipFile(archive) as z:
        names = z.namelist()
        assert len(names) == 7 and all(n.startswith("sftp-transfer-check/") and ".." not in Path(n).parts for n in names)
        z.extractall(root)
    original = root / "sftp-transfer-check"
    manifest = (original / "SHA256SUMS").read_bytes()
    assert len(manifest.splitlines()) == 5
    def check(name, change, expected):
        destination = root / name
        shutil.copytree(original, destination)
        change(destination)
        result = subprocess.run(["shasum", "-a", "256", "-c", "SHA256SUMS"], cwd=destination, capture_output=True, text=True)
        assert (result.returncode == 0) == expected, (name, result.stdout, result.stderr)
        cases.append({"case": name, "expected_checksum_pass": expected, "exit_code": result.returncode, "passed": True})
    check("clean-local-copy", lambda p: None, True)
    check("missing-hidden-file", lambda p: (p / ".hidden-check.txt").unlink(), False)
    check("changed-unicode-content", lambda p: (p / "中文文件.txt").write_text("changed\n"), False)
    check("nonempty-empty-file", lambda p: (p / "empty.txt").write_bytes(b"x"), False)
    check("truncated-binary", lambda p: (p / "bytes.bin").write_bytes(b"\x00"), False)
    check("extra-file-not-covered", lambda p: (p / "extra.txt").write_text("not listed"), True)
    assert (original / "SHA256SUMS").read_bytes() == manifest
print(json.dumps({"scope": "Offline ZIP and macOS shasum checks, not a server/app transfer", "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(), "payload_files": 5, "cases": cases}, indent=2))
