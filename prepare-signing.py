#!/usr/bin/env python3
"""
온라인 APK 서명 서비스 (7xsecurity.com) 자동화
또는 로컬 jarsigner 사용 (Python 대체 방법)
"""

import os
import sys
from pathlib import Path

print("=" * 70)
print("APK 서명 옵션")
print("=" * 70)

apk_to_sign = Path("todo-app/app-release-updated.apk")

if not apk_to_sign.exists():
    print(f"✗ APK를 찾을 수 없습니다: {apk_to_sign}")
    sys.exit(1)

print(f"\n서명할 APK: {apk_to_sign}")
print(f"파일 크기: {apk_to_sign.stat().st_size:,} bytes")

print("\n" + "=" * 70)
print("온라인 도구를 사용한 서명 준비 완료!")
print("=" * 70)

print(f"""
온라인 APK 서명 방법:

1. 7xsecurity.com 서명 도구:
   URL: https://www.7xsecurity.com/apk-signer/
   - 파일 업로드: {apk_to_sign}
   - 서명된 APK 다운로드
   - 설치: adb install <signed-apk>

2. App Zip Signer (appwork.io):
   URL: https://appwork.io/apk/signer/
   - 파일 업로드 및 서명

3. 또는 로컬 커맨드 (Java 설치 완료 후):
   keytool -genkeypair -v \\
     -keystore todo-app/my-release-key.jks \\
     -alias todoapp \\
     -keyalg RSA -keysize 2048 -validity 10000 \\
     -storepass android -keypass android \\
     -dname "CN=TodoApp, OU=Dev, O=Dev, L=Seoul, ST=Seoul, C=KR"
   
   jarsigner -verbose \\
     -sigalg SHA256withRSA -digestalg SHA-256 \\
     -keystore todo-app/my-release-key.jks \\
     -storepass android -keypass android \\
     -signedjar todo-app/app-release-signed.apk \\
     {apk_to_sign} todoapp

현재 상태:
✓ APK 생성 완료: {apk_to_sign}
✓ 다음 단계: 위 방법 중 하나로 서명하세요

참고:
- 온라인 도구 사용 시 보안에 주의하세요
- Java 설치가 완료되면 로컬 명령어 사용 가능합니다
""")

# Java 설치 상태 다시 확인 시도
print("\nJava 설치 상태 확인 중...")
try:
    import subprocess
    result = subprocess.run(["java", "-version"], capture_output=True, text=True, timeout=5)
    if result.returncode == 0:
        print("✓ Java 설치됨! 로컬 서명 가능합니다.")
        print("  다음 명령으로 진행하세요:")
        print("  python sign-apk-local.py")
    else:
        print("✗ Java 아직 미설치. 온라인 도구 사용 권장.")
except:
    print("✗ Java 아직 미설치. 온라인 도구 사용 권장.")

print("\n" + "=" * 70)
