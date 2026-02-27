import shutil
from pathlib import Path

src = Path("todo-app/app-release-updated.apk")
dst = Path("todo-app/app-release-final.apk")

if src.exists():
    shutil.copy(src, dst)
    print(f"✓ 완료: {dst}")
    print(f"  크기: {dst.stat().st_size:,} bytes")
else:
    print(f"✗ 파일 없음: {src}")
