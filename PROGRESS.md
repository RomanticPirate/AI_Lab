# PlanToUI APK 수정 작업 진행 상황

## ✅ 완료된 작업

### 1. APK 분석
- ✓ Androguard로 AndroidManifest.xml 분석 완료
- ✓ APK 내용 추출 (`todo-app/apk_contents/`)
- ✓ assets/index.html 상태 확인 (1831줄, 정상 작동)

### 2. APK 재패킹
- ✓ assets/index.html이 포함된 새 APK 생성 (`app-release-updated.apk`)
- ✓ APK 구조 재구성 완료
- ✓ 파일 크기 확인: ~8.5MB

### 3. 준비 작업
- ✓ apktool.jar 다운로드 완료 (23.1MB)
- ✓ Python 자동화 스크립트 작성
- ✓ 온라인 서명 도구 가이드 준비

## 🔄 진행 중인 작업

### Java/Android SDK 설치
- ⏳ JDK 21 다운로드 완료 (173MB)
- ⏳ Chocolatey로 OpenJDK 설치 진행 중 (시간이 오래 걸릴 수 있음)
- ⏳ keytool, jarsigner 설치 대기

## 📋 다음 단계

### 방법 1: Java 설치 완료 후 (권장)
1. Java 설치 완료 대기
2. `python rebuild-with-apktool.py` 실행 (apktool로 APK 재빌드)
3. `python sign-apk.py` 실행 (keytool/jarsigner로 서명)
4. 최종 APK 생성

### 방법 2: 온라인 도구 사용
1. 현재 생성된 APK 업로드:
   ```
   C:\Users\jwjeon\Desktop\AI_Lab\todo-app\app-release-updated.apk
   ```
2. 온라인 서명 도구 사용:
   - https://www.7xsecurity.com/apk-signer/
   - 또는 https://appwork.io/apk/signer/
3. 서명된 APK 다운로드 및 설치

## ⚠️ 알려진 문제 & 해결 계획

### 문제 1: 앱 설치 안 됨
- **원인**: APK 서명 부재 또는 오류
- **해결**: 위의 Java 설치 후 재서명 또는 온라인 도구 사용

### 문제 2: 위젯이 "사용할 수 없습니다" 메시지
- **원인**: Java 코드의 AppWidgetProvider 미작동 또는 매니페스트 미등록
- **현황**: 
  - AndroidManifest.xml에서 위젯 리시버(`<receiver>`) 엘리먼트 확인 필요
  - Java 코드는 `classes.dex` (바이너리, 수정 불가)
- **완전 해결**: Android Studio에서 전체 소스코드로 재빌드 필요
- **임시 해결**: 현재 APK는 웹뷰 기반이므로 HTML은 정상 작동

## 📁 생성된 파일 목록

```
C:\Users\jwjeon\Desktop\AI_Lab\
├── rebuild-apk.py          # APK 재패킹 스크립트
├── sign-apk.py             # APK 서명 스크립트
├── prepare-signing.py      # 서명 옵션 가이드
├── rebuild-with-apktool.py # apktool 재빌드 스크립트
├── apktool.jar             # APK 빌드 도구
├── todo-app/
│   ├── app-release.apk          # 원본 APK
│   ├── app-release-updated.apk  # ✅ 업데이트된 APK (서명 필요)
│   ├── apk_contents/            # 추출된 APK 내용
│   │   ├── assets/index.html    # ✅ 웹뷰 소스 (정상)
│   │   ├── res/                 # 리소스 폴더
│   │   ├── AndroidManifest.xml  # ⚠️ 바이너리 XML
│   │   └── ...
│   └── ...
└── ...
```

## 🎯 최종 목표

1. ✅ `assets/index.html` 포함된 APK 생성 완료
2. ⏳ APK 서명 (Java 설치 완료 시 또는 온라인 도구)
3. 📦 설치 가능한 APK 배포

## 🚀 실행 방법

### 현재 상황 (아침 10시 업데이트 예상)

**옵션 A: Java 설치 완료됨**
```powershell
python rebuild-with-apktool.py    # APK 재빌드
python sign-apk.py                # 서명
```
→ 최종 파일: `todo-app/app-release-signed.apk`

**옵션 B: Java 미설치**
```powershell
python prepare-signing.py          # 온라인 도구 가이드
# 온라인 도구로 서명 후 설치
```

## 📞 계속 진행

- Java 설치가 완료되면 자동으로 다음 단계 진행
- 또는 사용자 지시 대기

---

**생성 시간**: 2026-02-26 22:40 KST  
**상태**: 80% 완료 (서명 대기)
