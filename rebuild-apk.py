#!/usr/bin/env python3
"""
APK 처리 자동화 스크립트
1. APK 추출
2. assets/index.html 검증 및 준비
3. APK 재패킹 (간단한 방식 - 서명은 나중에)
"""

import os
import shutil
import zipfile
import sys
from pathlib import Path

print("=" * 60)
print("APK 처리 자동화 시스템 시작")
print("=" * 60)

# 경로 설정
apk_path = Path("todo-app/app-release.apk")
apk_extract = Path("todo-app/apk_contents")
html_path = Path("todo-app/assets/index.html")
output_apk = Path("todo-app/app-release-updated.apk")

# 1단계: HTML 검증
print("\n[1/4] assets/index.html 검증 중...")
if not html_path.exists():
    print(f"✗ {html_path} 파일을 찾을 수 없습니다!")
    sys.exit(1)

html_size = html_path.stat().st_size
print(f"✓ {html_path} 발견 ({html_size:,} bytes)")

# 2단계: 기존 추출 파일 확인
print("\n[2/4] APK 추출 상태 확인 중...")
if apk_extract.exists():
    print(f"✓ APK 이미 추출됨: {apk_extract}")
else:
    print(f"✗ APK 추출 디렉토리 없음: {apk_extract}")
    print("  build.sh 또는 apktool로 APK를 추출하세요.")
    sys.exit(1)

# 3단계: 재패킹 준비
print("\n[3/4] APK 재패킹 준비 중...")

# 기존 output 삭제
if output_apk.exists():
    output_apk.unlink()
    print(f"  기존 파일 삭제: {output_apk}")

# ZIP으로 재압축 (APK는 ZIP 형식)
print(f"  새 APK 생성 중: {output_apk}")

def zipdir(path, ziph):
    """재귀적으로 디렉토리를 ZIP에 추가"""
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

try:
    with zipfile.ZipFile(output_apk, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipdir(apk_extract, zipf)
    print(f"✓ APK 재패킹 완료: {output_apk}")
except Exception as e:
    print(f"✗ 재패킹 실패: {e}")
    sys.exit(1)

# 4단계: 결과 확인
print("\n[4/4] 최종 확인...")
output_size = output_apk.stat().st_size
print(f"✓ 생성된 APK 크기: {output_size:,} bytes")

print("\n" + "=" * 60)
print("✓ APK 처리 완료!")
print("=" * 60)
print(f"\n다음 단계:")
print(f"1. APK 서명: apksigner 또는 온라인 도구 사용")
print(f"2. 결과 파일: {output_apk}")
print(f"3. 설치: adb install {output_apk}")
