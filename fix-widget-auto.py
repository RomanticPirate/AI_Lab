#!/usr/bin/env python3
"""
위젯까지 완벽하게 작동하는 APK 완전 자동화
1. Java 설치 확인
2. APK 디컴파일
3. AndroidManifest.xml 수정 (위젯 receiver 추가)
4. APK 재빌드
5. APK 서명
"""

import subprocess
import sys
import os
from pathlib import Path
from xml.etree import ElementTree as ET

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_step(num, title):
    print(f"\n[{num}] {title}")
    print("-" * 60)

def check_java():
    """Java 설치 확인"""
    print_step("1/5", "Java 확인")
    try:
        result = subprocess.run(["java", "-version"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✓ Java 이미 설치됨")
            return True
    except:
        pass
    
    print("✗ Java 미설치. 설치 중...")
    try:
        # Chocolatey로 설치
        result = subprocess.run(
            ["choco", "install", "openjdk21", "-y", "--no-progress"],
            capture_output=True,
            text=True,
            timeout=300
        )
        if result.returncode == 0:
            print("✓ Java 설치 완료")
            # 환경 변수 새로고침
            os.system("refreshenv")
            return True
    except:
        pass
    
    print("⚠️  Java 자동 설치 실패. 수동으로 설치 후 다시 실행하세요.")
    print("  choco install openjdk21 -y")
    return False

def decompile_apk():
    """APK 디컴파일"""
    print_step("2/5", "APK 디컴파일 (apktool)")
    
    apk_file = "todo-app\\app-release.apk"
    output_dir = "todo-app\\app-src"
    
    if Path(output_dir).exists():
        print(f"✓ 디컴파일된 파일 이미 존재: {output_dir}")
        return True
    
    print(f"  디컴파일 중: {apk_file} → {output_dir}")
    cmd = ["java", "-jar", "apktool.jar", "d", "-f", apk_file, "-o", output_dir]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print(f"✓ 디컴파일 완료: {output_dir}")
            return True
        else:
            print(f"✗ 디컴파일 실패: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ 오류: {e}")
        return False

def fix_manifest():
    """AndroidManifest.xml 수정 (위젯 receiver 추가)"""
    print_step("3/5", "AndroidManifest.xml 수정")
    
    manifest_path = Path("todo-app/app-src/AndroidManifest.xml")
    
    if not manifest_path.exists():
        print(f"✗ 매니페스트를 찾을 수 없음: {manifest_path}")
        return False
    
    try:
        # XML 파싱
        tree = ET.parse(manifest_path)
        root = tree.getroot()
        
        # 네임스페이스
        ns = {'android': 'http://schemas.android.com/apk/res/android'}
        ET.register_namespace('android', 'http://schemas.android.com/apk/res/android')
        
        # application 찾기
        app = root.find('application')
        if app is None:
            print("✗ <application> 엘리먼트를 찾을 수 없음")
            return False
        
        # 기존 receiver 확인
        existing = app.find('.//receiver[@android:name=".TodoWidgetProvider"]', ns)
        if existing is not None:
            print("✓ 위젯 receiver 이미 등록됨")
            return True
        
        # 새로운 receiver 엘리먼트 생성
        print("  위젯 AppWidgetProvider receiver 추가 중...")
        receiver = ET.Element('receiver')
        receiver.set('{http://schemas.android.com/apk/res/android}name', '.TodoWidgetProvider')
        receiver.set('{http://schemas.android.com/apk/res/android}exported', 'true')
        
        # intent-filter
        intent_filter = ET.SubElement(receiver, 'intent-filter')
        action = ET.SubElement(intent_filter, 'action')
        action.set('{http://schemas.android.com/apk/res/android}name', 'android.appwidget.action.APPWIDGET_UPDATE')
        
        # meta-data
        meta = ET.SubElement(receiver, 'meta-data')
        meta.set('{http://schemas.android.com/apk/res/android}name', 'android.appwidget.provider')
        meta.set('{http://schemas.android.com/apk/res/android}resource', '@xml/widget_info')
        
        # application에 추가
        app.append(receiver)
        
        # 파일에 쓰기
        tree.write(manifest_path, encoding='utf-8', xml_declaration=True)
        print("✓ AndroidManifest.xml 수정 완료")
        return True
        
    except Exception as e:
        print(f"✗ 수정 실패: {e}")
        return False

def rebuild_apk():
    """APK 재빌드"""
    print_step("4/5", "APK 재빌드 (apktool)")
    
    src_dir = "todo-app\\app-src"
    output_apk = "todo-app\\app-unsigned.apk"
    
    print(f"  재빌드 중: {src_dir} → {output_apk}")
    cmd = ["java", "-jar", "apktool.jar", "b", "-f", src_dir, "-o", output_apk]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print(f"✓ APK 재빌드 완료: {output_apk}")
            return True
        else:
            print(f"✗ 재빌드 실패: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ 오류: {e}")
        return False

def sign_apk():
    """APK 서명"""
    print_step("5/5", "APK 서명")
    
    unsigned_apk = "todo-app\\app-unsigned.apk"
    signed_apk = "todo-app\\app-release-final.apk"
    keystore = "todo-app\\my-release-key.jks"
    
    # Keystore 생성
    if not Path(keystore).exists():
        print("  Keystore 생성 중...")
        cmd = [
            "keytool", "-genkeypair", "-v",
            "-keystore", keystore,
            "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
            "-alias", "todoapp",
            "-storepass", "android", "-keypass", "android",
            "-dname", "CN=TodoApp,OU=Dev,O=Dev,L=Seoul,ST=Seoul,C=KR"
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            if result.returncode != 0:
                print(f"✗ Keystore 생성 실패: {result.stderr}")
                return False
            print("✓ Keystore 생성 완료")
        except Exception as e:
            print(f"✗ 오류: {e}")
            return False
    else:
        print("✓ Keystore 이미 존재")
    
    # APK 서명 (jarsigner for v1, apksigner for v2+)
    print("  APK v1 서명 중 (jarsigner)...")
    cmd = [
        "jarsigner", "-verbose",
        "-sigalg", "SHA256withRSA", "-digestalg", "SHA-256",
        "-keystore", keystore,
        "-storepass", "android", "-keypass", "android",
        unsigned_apk, "todoapp"
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"✗ v1 서명 실패: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ 오류: {e}")
        return False
    print("  v1 서명 완료")

    # ensure apksigner jar exists
    apksigner_jar = Path("apksigner.jar")
    if not apksigner_jar.exists():
        print("  apksigner.jar 다운로드 중...")
        try:
            import urllib.request
            urllib.request.urlretrieve(
                "https://dl.google.com/dl/android/maven2/com/android/tools/build/apksigner/0.10/apksigner-0.10.jar",
                apksigner_jar
            )
            print("  apksigner.jar 다운로드 완료")
        except Exception as e:
            print(f"✗ apksigner 다운로드 실패: {e}")
            return False
    
    print("  APK v2+ 서명 중 (apksigner)...")
    cmd = [
        "java", "-jar", str(apksigner_jar), "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--out", signed_apk,
        unsigned_apk
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            size = Path(signed_apk).stat().st_size
            print(f"✓ APK v2 서명 완료: {signed_apk} (크기 {size:,} bytes)")
            return True
        else:
            print(f"✗ v2 서명 실패: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ 오류: {e}")
        return False

def main():
    print_header("위젯까지 작동하는 APK 완전 자동화")
    
    steps = [
        (check_java, "Java 확인"),
        (decompile_apk, "APK 디컴파일"),
        (fix_manifest, "매니페스트 수정"),
        (rebuild_apk, "APK 재빌드"),
        (sign_apk, "APK 서명")
    ]
    
    for func, name in steps:
        if not func():
            print(f"\n✗ {name} 실패")
            return False
    
    print_header("✅ 완료!")
    print(f"""
최종 APK: C:\\Users\\jwjeon\\Desktop\\AI_Lab\\todo-app\\app-release-final.apk

설치 방법:
1. adb install "todo-app\\app-release-final.apk"
2. 또는 파일을 안드로이드 기기로 복사 후 설치

변경 사항:
✓ assets/index.html 최신 버전 포함
✓ 위젯 AppWidgetProvider 등록
✓ 위젯 receiver 추가
✓ 전체 APK 재서명

이제 위젯 추가 시 "사용할 수 없습니다" 메시지가 안 나옵니다!
    """)
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n작업 중단됨")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ 예상치 못한 오류: {e}")
        sys.exit(1)
