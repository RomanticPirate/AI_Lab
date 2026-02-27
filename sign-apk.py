#!/usr/bin/env python3
"""
APK 서명 자동화 스크립트
keytool (Java JDK) 사용
"""

import os
import subprocess
import sys
from pathlib import Path

print("=" * 60)
print("APK 서명 자동화")
print("=" * 60)

# 경로 설정
apk_to_sign = Path("todo-app/app-release-updated.apk")
keystore_path = Path("todo-app/my-release-key.jks")
keystore_pass = "android"
key_alias = "todoapp"
key_pass = "android"

# 1단계: Keystore 생성 (없으면)
print("\n[1/3] Keystore 확인/생성 중...")

if keystore_path.exists():
    print(f"✓ Keystore 이미 존재: {keystore_path}")
else:
    print(f"  새 keystore 생성: {keystore_path}")
    cmd = [
        "keytool",
        "-genkeypair",
        "-v",
        "-keystore", str(keystore_path),
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-alias", key_alias,
        "-storepass", keystore_pass,
        "-keypass", key_pass,
        "-dname", "CN=TodoApp, OU=Dev, O=Dev, L=Seoul, ST=Seoul, C=KR"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"✓ Keystore 생성 완료")
        else:
            print(f"✗ Keystore 생성 실패:")
            print(result.stderr)
            sys.exit(1)
    except FileNotFoundError:
        print("✗ keytool을 찾을 수 없습니다!")
        print("  Java JDK가 올바르게 설치되지 않았을 수 있습니다.")
        sys.exit(1)
    except Exception as e:
        print(f"✗ 오류: {e}")
        sys.exit(1)

# 2단계: APK 서명 (jarsigner 사용)
print("\n[2/3] APK 서명 중...")

if not apk_to_sign.exists():
    print(f"✗ APK 파일을 찾을 수 없습니다: {apk_to_sign}")
    sys.exit(1)

signed_apk = Path("todo-app/app-release-signed.apk")

cmd = [
    "jarsigner",
    "-verbose",
    "-sigalg", "SHA256withRSA",
    "-digestalg", "SHA-256",
    "-keystore", str(keystore_path),
    "-storepass", keystore_pass,
    "-keypass", key_pass,
    "-signedjar", str(signed_apk),
    str(apk_to_sign),
    key_alias
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode == 0:
        print(f"✓ APK 서명 완료: {signed_apk}")
    else:
        print(f"✗ APK 서명 실패:")
        print(result.stderr)
        sys.exit(1)
except FileNotFoundError:
    print("✗ jarsigner를 찾을 수 없습니다!")
    print("  Java JDK가 올바르게 설치되지 않았을 수 있습니다.")
    sys.exit(1)
except Exception as e:
    print(f"✗ 오류: {e}")
    sys.exit(1)

# 3단계: 최종 확인
print("\n[3/3] 최종 확인...")

if signed_apk.exists():
    size = signed_apk.stat().st_size
    print(f"✓ 서명된 APK: {signed_apk} ({size:,} bytes)")
    
    print("\n" + "=" * 60)
    print("✓ APK 서명 완료!")
    print("=" * 60)
    print(f"\n설치 방법:")
    print(f"  adb install {signed_apk}")
    print(f"\n또는 수동으로 APK를 기기로 복사 후 설치하세요.")
else:
    print(f"✗ 서명된 APK를 찾을 수 없습니다!")
    sys.exit(1)
