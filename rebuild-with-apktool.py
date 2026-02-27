#!/usr/bin/env python3
"""
apktool.jar를 사용한 APK 재빌드
"""

import subprocess
import sys
from pathlib import Path

print("=" * 70)
print("APK 재빌드 (apktool 사용)")
print("=" * 70)

apktool_path = Path("apktool.jar")
apk_contents = Path("todo-app/apk_contents")
output_apk = Path("todo-app/app-release-rebuilt.apk")

# 1단계: apktool 확인
print("\n[1/2] apktool 확인중...")
if not apktool_path.exists():
    print(f"✗ apktool.jar를 찾을 수 없습니다: {apktool_path}")
    sys.exit(1)
print(f"✓ apktool.jar 발견: {apktool_path}")

# 2단계: APK 재빌드
print("\n[2/2] APK 재빌드 중...")
print("  (Java가 필요합니다)")

cmd = [
    "java",
    "-jar", str(apktool_path),
    "b",  # build
    "-f",  # force
    str(apk_contents),
    "-o", str(output_apk)
]

try:
    print(f"  명령: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    print("\n--- apktool 출력 ---")
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    print("--- 출력 끝 ---\n")
    
    if result.returncode == 0:
        print(f"✓ APK 재빌드 완료: {output_apk}")
        if output_apk.exists():
            size = output_apk.stat().st_size
            print(f"  파일 크기: {size:,} bytes")
    else:
        print(f"✗ APK 재빌드 실패 (exit code: {result.returncode})")
        sys.exit(1)
        
except FileNotFoundError:
    print("✗ Java를 찾을 수 없습니다!")
    print("  Java JDK 설치가 필요합니다.")
    print("  설치 방법: choco install openjdk21")
    sys.exit(1)
except subprocess.TimeoutExpired:
    print("✗ 빌드 타임아웃 (120초 초과)")
    sys.exit(1)
except Exception as e:
    print(f"✗ 오류: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("✓ 완료! 다음 파일을 설치하세요:")
print(f"  {output_apk}")
print("=" * 70)
