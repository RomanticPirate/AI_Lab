# 복식 상태 변경 규칙

## 1. 개요

### ※ (참고) 복식 데미지 전체 흐름

```text
[전투 중 특수 공격 피격]
        ↓
[해당 공격의 CostumeDamagePoint 확인]
        ↓
[복식 데미지 점수 누적]
        ↓
[다음 복식 상태 변경 기준 도달 여부 확인]
        ├─ 아니오
        │    ↓
        │ [현재 비주얼 단계 유지]
        └─ 예
             ↓
          [복식 데미지 다음 단계 비주얼 반영]
                ↓
          [복식 데미지 상태 유지]
                ↓
          [원상 복구 트리거 발생 여부 확인]
                ├─ 아니오 → 현재 상태 유지
                └─ 예
                     ├─ 복식 교체
                     ├─ 지역 이동(로딩 순간 이동)
                     ├─ 웨이포인트 휴식
                     └─ 컷씬 시작(DT_CutScene.Damage = Reset)
                             ↓
                        [복식 기본 상태 복구]
                             ↓
                        [다시 피격 흐름으로 복귀]
```

### ※ (참고) 복식 젖음 전체 흐름

```text
[Water Volume 접촉]
        ↓
[닿은 부위 젖음 적용]
        ↓
[같은 부위가 다시 젖었는지 확인]
        ├─ 예
        │    ↓
        │ [해당 부위 마름 타이머 초기화]
        └─ 아니오
             ↓
          [현재 젖은 상태 유지]
                ↓
          [Water Volume 이탈 시점 대기]
                ↓
          [Water Volume 이탈]
                ↓
          [해당 부위 마름 타이머 진행]
                ↓
          [마름 시간 도달 여부 확인]
                ├─ 아니오 → 젖은 상태 유지
                └─ 예
                     ↓
                  [동일 Blend 값으로 서서히 마름]
                     ↓
                  [해당 부위 젖음 해제]
```

## 2. 복식 데미지 시스템 규칙

### (1) 기본 내용

- 리더와 동료가 피격한 특수 공격 결과를 기준으로 복식 데미지 진행
- 복식 데미지는 **특수 공격에 설정된 CostumeDamagePoint가 누적되면서 단계적으로 반영**
- 복식 데미지 단계는 누적 점수가 다음 상태 변경 기준에 도달했을 때만 변화
- 누적 점수가 다음 기준에 도달하지 못한 경우
  - 복식 데미지 점수만 증가
  - 복식 비주얼 단계는 유지
- 복식 데미지는 원상 복구 이벤트가 발생하기 전까지 유지
- 복식 데미지 상태는 세이브 / 로드 대상

### (2) 데이터 구조

- DT_StatusEffect
  - 컬럼 추가
    - CostumeDamagePoint
  - 의미
    - 해당 StatusEffect Row가 복식 데미지에 부여하는 점수
  - 운영 방식
    - 피격 시 발동한 StatusEffect Row의 CostumeDamagePoint 참조
    - 해당 점수를 현재 복식 데미지 점수에 누적

- DT_CutScene
  - 컬럼 추가
    - Damage
  - Enum 값
    - Keep
    - Reset
  - 의미
    - Keep
      - 컷씬 시작 시 현재 복식 데미지 상태 유지
    - Reset
      - 컷씬 시작 시 복식 기본 상태로 원상 복구

#### ※ (예시) DT_StatusEffect 데이터 예시

| Row | Type | CostumeDamagePoint | 설명 |
|---|---|---:|---|
| Stagger_Lv0 | Stagger | 1 | 경미한 특수 공격 피격 예시 |
| Knockdown_Lv1 | Knockdown | 2 | 넘어짐을 유발하는 특수 공격 예시 |
| BreakAttacked | Break Attacked | 2 | 강한 반응을 일으키는 특수 공격 예시 |
| Dead | Dead | 0 | 복식 데미지 부여 대상이 아닌 예시 |

### (3) 진행 규칙

- 전투 중 특수 공격 피격 발생
- 발동한 StatusEffect Row 확인
- 해당 Row의 CostumeDamagePoint 누적
- 현재 누적 점수가 다음 복식 데미지 상태 변경 기준에 도달했는지 확인
- 기준 미도달 시
  - 복식 데미지 점수만 갱신
  - 현재 복식 비주얼 단계 유지
- 기준 도달 시
  - 복식 데미지 단계 갱신
  - 다음 복식 비주얼 단계 반영
- 이후 다시 특수 공격 피격이 발생하면 동일 규칙 반복

### ※ (예시) 복식 데미지 데이터 흐름

```text
현재 상태
- 복식 데미지 단계 0
- 누적 점수 0

1차 피격
- Stagger
- +1
- 누적 점수 1
- 다음 기준값 5 미도달
- 비주얼 변화 없음

2차 피격
- Knockdown
- +2
- 누적 점수 3
- 다음 기준값 5 미도달
- 비주얼 변화 없음

3차 피격
- Grabbed
- +2
- 누적 점수 5
- 다음 기준값 5 도달
- 복식 데미지 단계 1 반영
- 다음 단계 비주얼 반영

4차 피격
- Stagger
- +1
- 누적 점수 6
- 다음 기준값 8 미도달
- 비주얼 변화 없음

5차 피격
- Break Attacked
- +2
- 누적 점수 8
- 다음 기준값 8 도달
- 복식 데미지 단계 2 반영
- 다음 단계 비주얼 반영

이후
- 복식 교체 / 지역 이동 / 웨이포인트 휴식 / 컷씬 Reset 발생 시
- 복식 기본 상태 복구
```

### (4) 원상 복구 규칙

- 원상 복구 의미
  - 복식 데미지 단계와 복식 비주얼을 기본 상태로 되돌리는 처리
- 원상 복구 트리거
  - 복식 교체
  - 지역 이동
    - 로딩을 하는 모든 순간 이동
  - 웨이포인트 휴식
  - 컷씬 시작
    - DT_CutScene.Damage = Reset 인 경우만 적용
- ※ (참고) 컷씬 Reset 사용 의도
  - 컷씬에서 복식 데미지가 그대로 유지되면 연출이 의도한 분위기와 느낌을 해칠 수 있음
  - 중요 컷씬만 Reset 적용
  - 짧은 지역 진입 컷씬, 경량 시퀀스는 Keep 적용 가능

### (5) 저장 / 로드 규칙

- 복식 데미지 상태는 저장 대상
- 세이브 시 현재 복식 데미지 단계 저장
- 로드 시 저장된 복식 데미지 단계 복원

## 3. 복식 젖음 시스템 규칙

### (1) 기본 내용

- Water Volume과 접촉한 부위에만 복식 젖음 적용
- 젖음은 부위 단위로 관리
- 같은 부위가 다시 젖으면 **해당 부위의 마름 타이머를 초기화하고 다시 전체 유지 시간부터 진행**
- 다른 부위가 젖는 경우 각 부위는 서로 독립적으로 젖음 / 마름 진행
- 젖음 시각 Blend 값은 Fade In / Fade Out에 같은 값 사용
- 컷씬 중에도 젖음 유지, 갱신, 마름 진행 적용
- 젖음 상태는 세이브 / 로드 대상 아님

### (2) 적용 규칙

- Water Volume 접촉 시
  - 접촉한 부위에 즉시 젖음 시작
  - 부위별 시각 Blend 값에 따라 서서히 젖음 반영
- Water Volume 이탈 시
  - 해당 부위의 마름 타이머 시작
- 같은 부위 재접촉 시
  - 해당 부위의 마름 타이머 초기화
  - 해당 부위는 다시 전체 유지 시간부터 진행
- 마름 시간 도달 시
  - 부위별 시각 Blend 값에 따라 서서히 마름
  - 완전히 마르면 해당 부위 젖음 해제

### (3) 데이터 운영 개념

- 젖음 상태는 부위 단위로 개별 관리
- 부위별로 필요한 정보
  - 현재 젖음 여부
  - 마름 타이머 진행 여부
  - 남은 마름 시간
- 부위 분할 수는 프로그램 / 그래픽 협의 영역

### ※ (예시) 젖음 데이터 흐름 타임라인

| 부위 / 시점 | T0 | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|---|
| A | A 젖음 시작 | 젖음 유지 | 이탈, 마름 타이머 시작 | 마름 진행 | 마름 완료 | 건조 유지 |
| B | B 젖음 시작 | 젖음 유지 | 이탈, 마름 타이머 시작 | B 재접촉, 타이머 초기화 | 이탈, 새 타이머 진행 | 마름 완료 |
| C | 건조 | 건조 | 건조 | C 젖음 시작 | 젖음 유지 | 이탈 후 마름 진행 |

- ※ (참고)
  - B는 T2에 마름 타이머가 시작되지만 T3에 다시 젖음 발생
  - B의 마름 타이머는 초기화
  - 이후 B는 새 유지 시간과 새 마름 시간을 다시 진행

### (4) 원상 복구 규칙

- 원상 복구 의미
  - 젖은 부위가 모두 마름 완료 상태로 돌아가는 처리
- 원상 복구 방향
  - 부위별 개별 처리
  - 같은 부위 재접촉 시 해당 부위만 타이머 초기화
  - 다른 부위는 기존 타이머 유지
- 세이브 / 로드
  - 젖음 상태 미저장
  - 로드 후 기본 건조 상태 시작

## 4. 설정 변수 표

| 항목 | 설명 | 설정 위치 |
|---|---|---|
| CostumeDamagePoint | 특수 공격이 복식 데미지에 부여하는 점수 | DT_StatusEffect |
| 복식 데미지 상태 변경 기준값 | 다음 복식 비주얼 단계로 넘어가는 기준 점수 | 복식 데미지 단계 데이터 |
| 젖음 유지 시간 | Water Volume 이탈 후 마름 타이머가 모두 진행되기 전까지 유지되는 시간 | 젖음 전역 설정값 |
| 젖음 시각 Blend 값 | Fade In / Fade Out 공용 전환 시간 | 젖음 전역 설정값 |
| Damage | 컷씬 시작 시 복식 데미지 Keep / Reset 제어 | DT_CutScene |

## 5. 레퍼런스 조사

### (1) Far Cry 6

![Far Cry 6 대표 이미지](https://staticctf.ubisoft.com/8aefmxkxpxwl/36TZ8Qahfpnqsgw5loD0M/2b5585af31dbd6395a7ebeb71cbcc728/character-wetness.jpg?w=1920)


- 확인 가능한 내용
  - Ubisoft 공식 기술 문서에서 wetness를 정적 / 동적 두 축으로 분리해 설명
  - 캐릭터, 무기, 차량은 dynamic wetness 대상으로 분류
  - dynamic wetness는 rain exposure를 위한 ray casts와 local wetness를 함께 사용
  - local wetness는 물 잠김 상황과 직접 접촉 상황을 처리하는 용도로 소개
- 문서에 주는 시사점
  - 대형 오픈월드 게임도 젖음을 단순 On / Off가 아니라 조건 기반으로 제어
  - 본 기획서 본문에는 구현 방법을 넣지 않고, 규칙만 가져가는 것이 적절
  - 젖음의 핵심은 접촉 시 시작 / 노출이 끊기면 서서히 마름 / 전환이 즉시 끊기지 않음
- 우리 기획서에 적용할 점
  - 젖음은 부위 단위로 시작 / 유지 / 해제 규칙을 명확히 두는 방향이 자연스러움
  - Fade In / Fade Out 공용 값으로 전환 시간을 통일하는 방식도 무리 없음
- 출처
  - https://www.ubisoft.com/en-us/company/how-we-make-games/technology/articles/simulating-tropical-weather-in-far-cry-6

### (2) Ghost of Yōtei

![Ghost of Yōtei 대표 이미지](https://blog.playstation.com/uploads/2024/09/18bcb3eae57654c7b3a259528bf3c4ffcb65ee6a.jpg)


- 확인 가능한 내용
  - PlayStation 공식 기술 딥다이브에서 캐릭터가 wet / bloody / muddy / snowy 상태로 레이어링된다고 직접 설명
  - 캐릭터 주변 directional grid에 정보를 splat한 뒤, 그 결과를 캐릭터 표면 효과로 사용한다고 설명
- 문서에 주는 시사점
  - 상태 표현은 단일 효과가 아니라 여러 외형 상태가 함께 공존하는 체계로 발전 가능
  - 현재 범위는 복식 데미지 / 젖음이지만, 이후 피 / 진흙 / 눈 같은 상태 확장 여지 판단에 참고 가능
- 우리 기획서에 적용할 점
  - 현재는 젖음만 다루되, 부위별 상태 관리 구조는 다른 상태 표현 확장에도 재사용 가능하도록 정리하는 편이 좋음
- 출처
  - https://blog.playstation.com/2025/10/23/ghost-of-yotei-tech-deep-dive/?smcid=psapp

### (3) The Last of Us Part II

![The Last of Us Part II 대표 이미지](https://live.staticflickr.com/65535/49517550436_07dec369d7_h.jpg)


- 확인 가능한 내용
  - GDC Vault와 SIGGRAPH 인터뷰에서 moving character 위에 water drips, blood, snow 같은 동적 효과를 올리는 기술을 설명
  - character UV space와 render target을 활용해 움직이는 캐릭터 표면에 동적 효과를 안정적으로 기록하는 방향을 소개
  - cloth와 skin에 다른 반응을 주는 내용도 확인 가능
- 문서에 주는 시사점
  - 젖음과 피 같은 표면 상태는 컷씬과 근접 카메라에서도 설득력이 중요
  - cloth / skin 구분이나 surface behavior 차별화는 아트 / 프로그래머 구현 레벨 참고점이 큼
- 우리 기획서에 적용할 점
  - 본문에는 구현 기술을 넣지 않음
  - 대신 젖음이 컷씬 중에도 유지 / 변화 / 건조 진행된다는 정책은 충분히 정당화 가능
- 출처
  - https://www.gdcvault.com/play/1027356/Enhancement-of-Particle-Simulation-Using
  - https://blog.siggraph.org/2021/02/creating-the-highly-anticipated-the-last-of-us-part-ii.html/

### (4) Red Dead Redemption 2

![Red Dead Redemption 2 대표 이미지](https://image.api.playstation.com/cdn/UP1004/CUSA03041_00/FREE_CONTENTvJKvL7yfxIr782YEPFC1/PREVIEW_SCREENSHOT10_166081.jpg)


- 확인 가능한 내용
  - DigiPen 인터뷰에서 Arthur가 진흙탕에 넘어지면 옷이 젖고 더러워지며, 사냥한 동물의 피가 재킷에 묻고, 총에 맞아 날아간 모자에는 탄흔이 남는다고 설명
  - 피, 진흙, 물, 탄흔처럼 외형 상태 변화가 복장에 직접 남는 구조가 확인 가능
- 문서에 주는 시사점
  - 복장 상태 변화는 단순 연출이 아니라 캐릭터를 세계에 붙여두는 역할
  - RDR2 사례는 복식 파손 단계 시스템보다 현실 반응형 표면 상태 누적에 더 가까움
- 우리 기획서에 적용할 점
  - 복식 데미지를 과하게 시스템화하지 않고, 전투와 연동된 누적형 비주얼 변화로 두는 방향이 설득력 있음
  - 원상 복구 트리거를 명시적으로 제한해 두는 것도 현실감 유지에 도움
- 출처
  - https://www.digipen.edu/showcase/news/digipen-grad-andy-kibler-puts-the-clothes-on-the-cowboy-in-red-dead-redemption-2

### (5) Baldur's Gate 3

![Baldur's Gate 3 대표 이미지](https://i.ytimg.com/vi_webp/UgTFtD2sHdE/maxresdefault.webp)


- 확인 가능한 내용
  - 공개 패치 / 보도 기준으로 캐릭터가 dirty, sweaty, bloodied, bruised 상태가 누적된다고 확인 가능
  - Patch 4 이후에는 sponges와 soap으로 grime, blood, bad odours를 제거할 수 있게 됨
  - 물이 닿는 것만으로도 blood / dirt가 정리되는 플레이 패턴이 알려져 있음
- 문서에 주는 시사점
  - 복장 외형 상태는 전투 후에도 남아 있다가, 특정 행위로 해제되는 구조가 충분히 유효
  - 컷씬 직전 정리하고 싶어지는 플레이 욕구가 실제로 존재
- 우리 기획서에 적용할 점
  - 복식 데미지는 저장 대상
  - 젖음은 미저장 대상
  - 원상 복구 이벤트를 명확하게 두는 기획 방향에 참고 가능
- 출처
  - https://www.gamesradar.com/baldurs-gate-3-patch-lets-your-characters-get-literally-battered-and-bruised/
  - https://www.gamesradar.com/the-most-important-change-in-the-new-baldurs-gate-3-patch-is-the-ability-to-take-a-nice-sponge-bath/
  - https://screenrant.com/baldurs-gate-3-cutscenes-blood-use-soap-sponges/

### (6) Marvel's Spider-Man 2

![Marvel's Spider-Man 2 대표 이미지](https://i.ytimg.com/vi_webp/bgqGdIoa52s/maxresdefault.webp)


- 확인 가능한 내용
  - 공식 기술 문서보다는 프리뷰 / 가이드 / 플레이 관찰 자료 비중이 높음
  - 전투를 반복하면 suit damage가 쌓이고, 작은 scuff에서 큰 찢어짐까지 단계적으로 심해지는 사례가 다수 보도됨
  - 일부 가이드는 일반 전투, 강한 피격, 낙하 피해가 손상 원인으로 작동한다고 설명
  - 수트 손상이 일정 시간 탐험 중에도 유지된다는 관찰도 존재
- 문서에 주는 시사점
  - 전투 피격 → 외형 손상 누적 → 시간이 지나도 유지되는 패턴은 플레이어가 쉽게 이해
  - 정확한 내부 규칙이 공개되지 않았기 때문에 TAL에는 관찰 가능한 현상만 참고하는 편이 안전
- 우리 기획서에 적용할 점
  - 복식 데미지는 전투 기반 누적형 외형 상태로 정의
  - 누적 점수와 상태 변경 기준을 별도로 두는 현재 기획 구조가 더 관리하기 쉬움
- 출처
  - https://playerassist.com/does-marvels-spider-man-2-have-suit-damage-answered/
  - https://www.gameskinny.com/tips/how-to-repair-suits-in-spider-man-2/

### (7) Dragon's Dogma 계열

![Dragon's Dogma 2 대표 이미지](https://i.ytimg.com/vi_webp/cT0rIgaiPWA/maxresdefault.webp)


- 확인 가능한 내용
  - 공개 가이드 기준으로 Drenched 상태는 물 접촉, 강, 비 등의 환경 노출로 발생
  - 드래곤즈 도그마 계열은 젖음이 단순 외형 변화가 아니라 속성 반응까지 연결되는 디버프 성격이 강함
- 문서에 주는 시사점
  - 현재 기획서는 외형 상태 표현 중심
  - 장기적으로는 젖음 상태를 전투 속성 반응과 연결할 확장 가능성 검토 가능
- 우리 기획서에 적용할 점
  - 현재 범위에서는 외형 상태 표현까지만 확정
  - 전투 효과 연계는 추후 별도 시스템으로 분리 검토하는 편이 적절
- 출처
  - https://dragonsdogma2.wiki.fextralife.com/Drenched
  - https://dragonsdogma.fandom.com/wiki/Drenched
