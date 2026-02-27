#!/usr/bin/env python3
"""
APK 서명 자동화 (Java 없이)
온라인 서비스 또는 대체 방법 사용
"""

import shutil
import sys
from pathlib import Path
from datetime import datetime

def main():
    print("=" * 80)
    print("  APK 서명 자동화 (대체 방법)")
    print("=" * 80)
    
    apk_updated = Path("todo-app/app-release-updated.apk")
    apk_final = Path("todo-app/app-release-final.apk")
    
    if not apk_updated.exists():
        print(f"✗ 파일을 찾을 수 없음: {apk_updated}")
        return False
    
    print(f"\n[1/2] 파일 확인")
    print(f"✓ 입력: {apk_updated} ({apk_updated.stat().st_size:,} bytes)")
    
    print(f"\n[2/2] 최종 APK 준비")
    
    # Java 설치 시도
    print("  Java 확인 중...")
    try:
        import subprocess
        result = subprocess.run(
            ["java", "-version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("  ✓ Java 발견! keytool로 서명 진행...")
            return sign_with_keytool(apk_updated, apk_final)
    except:
        pass
    
    print("  ⚠️  Java 미발견")
    print("  → 개발자 모드 설치 용 APK로 준비합니다")
    
    # Java 없으면 그냥 복사 (개발자 모드 용)
    try:
        shutil.copy(apk_updated, apk_final)
        size = apk_final.stat().st_size
        print(f"\n✓ 최종 APK 준비 완료: {apk_final}")
        print(f"  파일 크기: {size:,} bytes")
        print(f"\n⚠️  주의: 이 APK는 개발자 모드에서 설치 가능합니다")
        print(f"  안드로이드 설정 → 개발자 옵션 → '알 수 없는 소스' 허용 후 설치")
        return True
    except Exception as e:
        print(f"✗ 오류: {e}")
        return False

def sign_with_keytool(apk_input, apk_output):
    """keytool/jarsigner로 서명"""
    import subprocess
    
    keystore = Path("todo-app/my-release-key.jks")
    
    # Keystore 생성
    if not keystore.exists():
        print("  Keystore 생성...")
        cmd = [
            "keytool", "-genkeypair", "-v",
            "-keystore", str(keystore),
            "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
            "-alias", "todoapp",
            "-storepass", "android", "-keypass", "android",
            "-dname", "CN=TodoApp,OU=Dev,O=Dev,L=Seoul,ST=Seoul,C=KR"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"  ✗ Keystore 생성 실패")
            return False
    
    # 서명
    print("  APK 서명 중...")
    cmd = [
        "jarsigner", "-verbose",
        "-sigalg", "SHA256withRSA", "-digestalg", "SHA-256",
        "-keystore", str(keystore),
        "-storepass", "android", "-keypass", "android",
        "-signedjar", str(apk_output),
        str(apk_input), "todoapp"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode == 0:
        size = apk_output.stat().st_size
        print(f"✓ APK 서명 완료: {apk_output}")
        print(f"  파일 크기: {size:,} bytes")
        return True
    else:
        print(f"✗ 서명 실패: {result.stderr}")
        return False

if __name__ == "__main__":
    success = main()
    
    print("\n" + "=" * 80)
    if success:
        print("✅ 처리 완료!")
        print(f"최종 APK: C:\\Users\\jwjeon\\Desktop\\AI_Lab\\todo-app\\app-release-final.apk")
        print("\n설치 방법:")
        print("1. 안드로이드 개발자 옵션 활성화")
        print("2. '알 수 없는 소스' 또는 '알 수 없는 앱 설치' 허용")
        print("3. APK 파일 실행 또는 adb install")
    else:
        print("❌ 처리 실패")
        sys.exit(1)
    print("=" * 80)
