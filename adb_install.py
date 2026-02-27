"""
APK 설치 스크립트
- 서명 충돌 시 자동으로 기존 앱 삭제 후 재설치
"""
import subprocess
import sys
import os
from pathlib import Path

JAVA = r"C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot\bin\java.exe"
APK_PATH = r"c:\Users\jwjeon\Desktop\AI_Lab\todo-app\app-release-final.apk"
PACKAGE = "com.todoapp"

def find_adb():
    # 1. PATH에서 찾기
    try:
        result = subprocess.run(["adb", "version"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            return "adb"
    except:
        pass

    # 2. Platform-tools 경로에서 찾기
    candidates = [
        r"C:\Users\jwjeon\AppData\Local\Microsoft\WinGet\Packages\Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe\platform-tools\adb.exe",
        r"C:\Users\jwjeon\AppData\Local\Android\Sdk\platform-tools\adb.exe",
        r"C:\Android\platform-tools\adb.exe",
        r"C:\Program Files\Android\platform-tools\adb.exe",
    ]
    for path in candidates:
        if Path(path).exists():
            return path

    return None

def run(cmd, timeout=60):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.returncode, result.stdout + result.stderr
    except Exception as e:
        return -1, str(e)

def main():
    adb = find_adb()
    if not adb:
        print("✗ adb를 찾을 수 없습니다.")
        print("  https://developer.android.com/studio/releases/platform-tools 에서 다운로드하세요")
        print("  또는: winget install Google.PlatformTools")
        return False

    print(f"✓ adb 발견: {adb}")

    # 기기 연결 확인
    code, out = run([adb, "devices"])
    print(f"연결된 기기:\n{out}")
    if "device" not in out or out.count("\n") < 2:
        print("✗ 연결된 기기 없음. USB 연결 및 개발자 모드/USB 디버깅을 확인하세요.")
        return False

    # 설치 시도 (-r: 기존 앱 유지하며 업데이트)
    print(f"\n설치 시도: {APK_PATH}")
    code, out = run([adb, "install", "-r", APK_PATH], timeout=60)
    print(out)

    if code == 0 and "Success" in out:
        print("✓ 설치 성공!")
        return True

    # 서명 충돌 감지
    if "INSTALL_FAILED_UPDATE_INCOMPATIBLE" in out or "signatures do not match" in out.lower():
        print("\n⚠ 서명 충돌 - 기존 앱을 삭제하고 재설치합니다 (앱 데이터 삭제됨)")
        code, out = run([adb, "uninstall", PACKAGE])
        print(f"  uninstall: {out.strip()}")

        code, out = run([adb, "install", APK_PATH], timeout=60)
        print(out)
        if code == 0 and "Success" in out:
            print("✓ 재설치 성공!")
            return True
        else:
            print(f"✗ 재설치 실패: {out}")
            return False
    else:
        print(f"✗ 설치 실패: {out}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
