---
name: git-save
description: Use when user wants to save current code state. Triggers on "저장", "세이브", "save", "커밋", "푸시", "올려줘", "저장해줘", "세이브포인트 만들어" etc.
---

# git-save — 세이브포인트 저장하기

## Overview

현재 코드 상태를 세이브포인트로 저장하고 GitHub에 업로드한다. 커밋 메시지는 변경 내용을 분석하여 자동 생성한다. git 용어는 사용자에게 절대 노출하지 않는다.

## 실행 흐름

### 1. repo 확인
```bash
git rev-parse --is-inside-work-tree
```
- 실패 시: "이 폴더는 아직 저장소가 설정되지 않았어요." 안내 후 중단

### 2. 변경사항 확인
```bash
git status --porcelain
```
- 출력 없음: "저장할 변경사항이 없어요! 이미 최신 상태입니다 ✅" 안내 후 중단

### 3. 원격 최신화 (예방)
```bash
git pull --rebase
```
- 성공 → 4단계로
- 실패(충돌) → **충돌 해결 플로우**로 이동

### 4. 스테이징
```bash
git add -A
```

### 5. 커밋 메시지 자동 생성
```bash
git diff --cached --stat
git diff --cached
```
- 위 결과를 분석하여 한국어 커밋 메시지를 생성한다
- 형식: 변경 내용을 간결하게 요약 (예: "로그인 페이지 UI 구현 및 비밀번호 유효성 검사 추가")

### 6. 커밋 및 푸시
```bash
git commit -m "자동생성된 메시지"
git push
```
- push 실패 시 → **충돌 해결 플로우**로 이동

### 7. 완료 안내
```
✅ 세이브포인트 저장 완료!
   저장 내용: [커밋 메시지 요약]
```

## 충돌 해결 플로우

자동 머지를 시도하고, 실패하면 사용자에게 쉬운 한국어로 선택지를 제안한다.

### 자동 해결 시도
```bash
git rebase --abort  # 진행 중인 rebase가 있다면 중단
git pull --no-rebase  # 일반 머지로 재시도
```

### 자동 해결 실패 시 — AskUserQuestion으로 선택지 제안

아래 내용을 사용자에게 보여준다:

```
⚠️ 다른 곳에서 저장한 내용과 겹치는 부분이 있어요!
```

선택지:
1. **[추천] 내가 방금 작업한 내용을 우선으로 저장하기** — `git checkout --ours .` 후 add/commit/push
2. **GitHub에 있는 내용으로 덮어쓰기 (내 작업은 사라져요)** — `git checkout --theirs .` 후 add/commit/push
3. **Claude가 두 내용을 합쳐보기** — 충돌 파일을 읽고 수동으로 병합 시도

선택 후 결과를 안내한다.

## 중요 규칙

- commit, push, merge, rebase, conflict 같은 git 용어를 안내 메시지에 사용하지 않는다
- 커밋 메시지는 항상 한국어로 생성한다
- 모든 안내는 한국어로 한다
- 에러 발생 시 기술적 메시지를 그대로 보여주지 말고, 쉬운 말로 바꿔서 안내한다
