#!/usr/bin/env python3
"""
PlanToUI - 완전 자동 APK 최종 빌드 및 서명
내일 아침에 이 스크립트만 실행하면 완료!
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path
from datetime import datetime

print("=" * 80)
print(" " * 20 + "PlanToUI APK 최종 빌드 시스템")
print("=" * 80)
print(f"시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# 경로 설정
PROJECT_DIR = Path(".")
APK_UPDATED = Path("todo-app/app-release-updated.apk")
KEYSTORE = Path("todo-app/my-release-key.jks")
FINAL_APK = Path("todo-app/app-release-final.apk")

# 1단계: 필수 파일 확인
print("[1/4] 필수 파일 확인...")
required_files = [APK_UPDATED]
missing = [f for f in required_files if not f.exists()]

if missing:
    print(f"✗ 필수 파일 누락: {missing}")
    print("  rebuild-apk.py를 먼저 실행하세요.")
    sys.exit(1)

print(f"✓ {APK_UPDATED} 확인됨 ({APK_UPDATED.stat().st_size:,} bytes)")

# 2단계: Keystore 생성 (없으면)
print("\n[2/4] Keystore 확인/생성...")

if KEYSTORE.exists():
    print(f"✓ Keystore 이미 존재: {KEYSTORE}")
else:
    print(f"  새 keystore 생성...")
    cmd = [
        "keytool",
        "-genkeypair", "-v",
        "-keystore", str(KEYSTORE),
        "-keyalg", "RSA", "-keysize", "2048",
        "-validity", "10000",
        "-alias", "todoapp",
        "-storepass", "android",
        "-keypass", "android",
        "-dname", "CN=TodoApp,OU=Dev,O=Dev,L=Seoul,ST=Seoul,C=KR"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"✗ Keystore 생성 실패: {result.stderr}")
            sys.exit(1)
        print("✓ Keystore 생성 완료")
    except Exception as e:
        print(f"✗ 오류: {e}")
        sys.exit(1)

# 3단계: APK 서명
print("\n[3/4] APK 서명 (jarsigner)...")

cmd = [
    "jarsigner",
    "-verbose",
    "-sigalg", "SHA256withRSA",
    "-digestalg", "SHA-256",
    "-keystore", str(KEYSTORE),
    "-storepass", "android",
    "-keypass", "android",
    "-signedjar", str(FINAL_APK),
    str(APK_UPDATED),
    "todoapp"
]

try:
    print(f"  명령 실행: jarsigner ... (시간이 걸릴 수 있습니다)")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode == 0:
        print("✓ APK 서명 완료")
    else:
        print(f"✗ 서명 실패:")
        print(result.stderr)
        sys.exit(1)
        
except FileNotFoundError:
    print("✗ jarsigner를 찾을 수 없습니다!")
    print("  Java JDK를 다시 설치하세요:")
    print("  choco install openjdk21 -y")
    sys.exit(1)
except Exception as e:
    print(f"✗ 오류: {e}")
    sys.exit(1)

# 4단계: 최종 확인
print("\n[4/4] 최종 확인...")

if FINAL_APK.exists():
    size = FINAL_APK.stat().st_size
    print(f"✓ 최종 APK: {FINAL_APK}")
    print(f"  파일 크기: {size:,} bytes")
    
    # 원본과 비교  
    original_size = APK_UPDATED.stat().st_size
    print(f"  차이: {size - original_size:+,} bytes (서명 추가로 인한 증가)")
    
    print("\n" + "=" * 80)
    print("✅ APK 준비 완료!")
    print("=" * 80)
    print(f"""
다음 단계:

1. APK 설치:
   adb install \"{FINAL_APK}\"

2. 또는 수동 설치:
   - {FINAL_APK}를 안드로드 기기로 복사
   - 파일 매니저에서 터치하여 설치

3. 테스트:
   - 앱 실행 확인
   - 위젯 추가 시도
   - 기능 테스트

문제 해결:
- 설치 안 될 경우: 서명 재확인 또는 온라인 도구 사용
- 위젯 미작동: Java 코드 문제 (전체 소스 재빌드 필요)
    """)
    
    print("=" * 80)
    print(f"완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
else:
    print(f"✗ 파일을 찾을 수 없습니다: {FINAL_APK}")
    sys.exit(1)
