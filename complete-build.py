#!/usr/bin/env python3
"""
PlanToUI APK 완전 자동 처리 (2026-02-27)
1. APK 재패킹
2. APK 서명
3. 최종 확인
"""

import os
import sys
import zipfile
import subprocess
from pathlib import Path
from datetime import datetime

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_step(step, title):
    print(f"\n[{step}] {title}")
    print("-" * 60)

def rebuild_apk():
    """APK 재패킹"""
    print_step("1/3", "APK 재패킹")
    
    apk_extract = Path("todo-app/apk_contents")
    html_path = Path("todo-app/assets/index.html")
    output_apk = Path("todo-app/app-release-updated.apk")
    
    # 확인
    if not apk_extract.exists():
        print("✗ APK 추출 폴더 없음")
        return False
    
    print(f"✓ APK 추출 폴더: {apk_extract}")
    print(f"✓ HTML 파일: {html_path} ({html_path.stat().st_size:,} bytes)")
    
    # 기존 파일 삭제
    if output_apk.exists():
        output_apk.unlink()
    
    # ZIP으로 압축
    print(f"  생성 중: {output_apk}")
    try:
        with zipfile.ZipFile(output_apk, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(apk_extract):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, apk_extract)
                    zipf.write(file_path, arcname)
        
        size = output_apk.stat().st_size
        print(f"✓ APK 재패킹 완료: {size:,} bytes")
        return True
    except Exception as e:
        print(f"✗ 재패킹 실패: {e}")
        return False

def sign_apk():
    """APK 서명"""
    print_step("2/3", "APK 서명")
    
    apk_to_sign = Path("todo-app/app-release-updated.apk")
    keystore = Path("todo-app/my-release-key.jks")
    final_apk = Path("todo-app/app-release-final.apk")
    
    if not apk_to_sign.exists():
        print(f"✗ APK를 찾을 수 없음: {apk_to_sign}")
        return False
    
    # Keystore 생성
    if not keystore.exists():
        print("  Keystore 생성 중...")
        cmd = [
            "keytool", "-genkeypair", "-v",
            "-keystore", str(keystore),
            "-keyalg", "RSA", "-keysize", "2048",
            "-validity", "10000",
            "-alias", "todoapp",
            "-storepass", "android", "-keypass", "android",
            "-dname", "CN=TodoApp,OU=Dev,O=Dev,L=Seoul,ST=Seoul,C=KR"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if result.returncode != 0:
                print(f"✗ Keystore 생성 실패")
                print(result.stderr)
                return False
            print("✓ Keystore 생성 완료")
        except FileNotFoundError:
            print("✗ keytool을 찾을 수 없음 (Java 미설치?)")
            return False
        except Exception as e:
            print(f"✗ 오류: {e}")
            return False
    else:
        print(f"✓ Keystore 이미 존재")
    
    # APK 서명
    print("  APK 서명 중 (jarsigner)...")
    cmd = [
        "jarsigner", "-verbose",
        "-sigalg", "SHA256withRSA", "-digestalg", "SHA-256",
        "-keystore", str(keystore),
        "-storepass", "android", "-keypass", "android",
        "-signedjar", str(final_apk),
        str(apk_to_sign), "todoapp"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"✗ 서명 실패")
            print(result.stderr)
            return False
        print("✓ APK 서명 완료")
        return True
    except FileNotFoundError:
        print("✗ jarsigner을 찾을 수 없음 (Java 미설치?)")
        return False
    except Exception as e:
        print(f"✗ 오류: {e}")
        return False

def verify_final():
    """최종 확인"""
    print_step("3/3", "최종 확인")
    
    final_apk = Path("todo-app/app-release-final.apk")
    
    if not final_apk.exists():
        print(f"✗ 최종 APK를 찾을 수 없음: {final_apk}")
        return False
    
    size = final_apk.stat().st_size
    print(f"✓ 최종 APK: {final_apk}")
    print(f"✓ 파일 크기: {size:,} bytes")
    print(f"✓ 설치 준비 완료!")
    return True

def main():
    print_header("PlanToUI APK 완전 자동 빌드")
    print(f"시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. 재패킹
    if not rebuild_apk():
        print("\n✗ 재패킹 실패")
        sys.exit(1)
    
    # 2. 서명
    if not sign_apk():
        print("\n⚠️  서명 실패 (Java 미설치일 수 있음)")
        print("온라인 도구(https://www.7xsecurity.com/apk-signer/) 사용 추천")
        sys.exit(1)
    
    # 3. 확인
    if not verify_final():
        print("\n✗ 최종 확인 실패")
        sys.exit(1)
    
    print_header("✅ 완료!")
    print(f"""
최종 파일: C:\\Users\\jwjeon\\Desktop\\AI_Lab\\todo-app\\app-release-final.apk

다음 단계:
1. adb install "todo-app\\app-release-final.apk"
2. 또는 파일을 안드로이드 기기로 복사 후 설치

완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n작업 중단됨")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ 예상치 못한 오류: {e}")
        sys.exit(1)
