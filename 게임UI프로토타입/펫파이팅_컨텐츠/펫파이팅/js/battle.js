// battle.js - 전투 시스템 (스킬 시스템 통합)
const 전투시스템 = {
    내펫: null,
    상대펫: null,
    내HP: 0,
    상대HP: 0,
    내최대HP: 0,
    상대최대HP: 0,
    진행중: false,
    내턴완료: false,
    상대턴완료: false,
    내선택: null,
    상대선택: null,
    상대타이머: null,
    종료콜백: null,
    라운드수: 0,
    파티클상태: null,
    좀비사용_나: false,
    좀비사용_상대: false,

    // 가위바위보 상성: 바위>가위, 가위>보, 보>바위
    상성표: {
        '바위': '가위',
        '가위': '보',
        '보': '바위'
    },

    async 초기화(내펫, 상대펫, 종료콜백) {
        this.내펫 = 내펫;
        this.상대펫 = 상대펫;
        this.내HP = 내펫.HP;
        this.상대HP = 상대펫.HP;
        this.내최대HP = 내펫.HP;
        this.상대최대HP = 상대펫.HP;
        this.진행중 = true;
        this.종료콜백 = 종료콜백;
        this.내턴완료 = false;
        this.상대턴완료 = false;
        this.내선택 = null;
        this.상대선택 = null;
        this.라운드수 = 1;
        this.좀비사용_나 = false;
        this.좀비사용_상대 = false;

        // 화면 초기화
        화면.전투초기화(내펫, 상대펫);

        // 전투 파티클 시작
        this.파티클시작();

        // "대전 시작!" 라운드 연출
        await new Promise(resolve => {
            화면.라운드연출('대전 시작!', resolve);
        });

        // 버튼 이벤트 연결
        this.버튼연결();

        // 상대 AI 시작
        this.상대AI시작();
    },

    버튼연결() {
        const 버튼들 = document.querySelectorAll('.battle-action-btn');
        버튼들.forEach(btn => {
            btn.onclick = () => {
                if (!this.진행중 || this.내턴완료) return;
                if (btn.classList.contains('disabled')) return;

                버튼들.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                this.내선택 = btn.dataset.action;
                this.내턴완료 = true;
                버튼들.forEach(b => b.classList.add('disabled'));
                this.선택완료메시지('left');
                this.판정체크();
            };
        });
    },

    선택완료메시지(쪽) {
        const id = 쪽 === 'left' ? '왼쪽선택완료' : '오른쪽선택완료';
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = '공격 선택 완료!';
        el.style.color = 쪽 === 'left' ? '#ffe080' : '#80c0ff';
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1200);
    },

    상대AI시작() {
        const 최소 = 게임데이터.설정.시스템선택최소시간;
        const 최대 = 게임데이터.설정.시스템선택최대시간;
        const 시간 = 최소 + Math.random() * (최대 - 최소);

        // 야바위 스타일: 포커싱이 느리게 이동 (눈으로 추적 가능)
        const 버튼들 = document.querySelectorAll('.battle-sys-btn');
        let 커서위치 = 0;
        const 커서속도 = 200; // ms - 눈으로 따라갈 수 있는 속도
        const 깜빡임 = setInterval(() => {
            버튼들.forEach((btn, i) => {
                if (i === 커서위치 % 버튼들.length) {
                    btn.style.opacity = '1';
                    btn.style.borderColor = 'rgba(255,200,100,.6)';
                    btn.style.boxShadow = '0 0 12px rgba(255,200,100,.3)';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.style.opacity = '0.3';
                    btn.style.borderColor = 'rgba(255,255,255,.03)';
                    btn.style.boxShadow = 'none';
                    btn.style.transform = 'scale(1)';
                }
            });
            커서위치++;
        }, 커서속도);

        this.상대타이머 = setTimeout(() => {
            clearInterval(깜빡임);
            const 액션들 = ['바위', '가위', '보'];
            this.상대선택 = 액션들[Math.floor(Math.random() * 3)];
            this.상대턴완료 = true;
            // 선택 완료 → 포커싱 전부 제거 (뭘 골랐는지 숨김)
            화면.시스템포커싱초기화();
            this.선택완료메시지('right');
            this.판정체크();
        }, 시간);
    },

    판정체크() {
        if (!this.내턴완료 || !this.상대턴완료) return;
        setTimeout(() => this.판정실행(), 500);
    },

    // ========== 스킬 헬퍼 ==========
    _스킬보유(펫, 스킬id) {
        return 게임데이터.스킬보유(펫, 스킬id);
    },

    _확률체크(확률) {
        return Math.random() * 100 < 확률;
    },

    // 더블 패시브 매핑: 액션 → 스킬ID
    _더블스킬: { '바위': 1, '가위': 2, '보': 3 },

    // ========== 판정 실행 ==========
    async 판정실행() {
        const 내 = this.내선택;
        const 상대 = this.상대선택;

        // 적군 선택 공개
        화면.시스템선택공개(상대);
        await this.지연(600);

        let 결과;
        if (내 === 상대) {
            결과 = 'draw';
        } else if (this.상성표[내] === 상대) {
            결과 = 'win';
        } else {
            결과 = 'lose';
        }

        const 결과텍스트 = { win: '때렸다!', lose: '맞았다!', draw: '무승부!' };
        const 결과색 = { win: '#40ff60', lose: '#ff4040', draw: '#ffe080' };

        // idle 멈춤
        this.idle토글(false);

        // 공격 애니메이션
        await this.공격애니메이션(결과, 내, 상대);

        // 대미지 계산 및 적용
        if (결과 === 'win') {
            await this.대미지처리(내, this.내펫, this.상대펫, '상대');
        } else if (결과 === 'lose') {
            await this.대미지처리(상대, this.상대펫, this.내펫, '나');
        } else {
            // 무승부: 양쪽 1 대미지 (판이 끝나지 않는 문제 방지)
            this.내HP = Math.max(0, this.내HP - 1);
            this.상대HP = Math.max(0, this.상대HP - 1);
            화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
            화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
            화면.대미지팝업('왼쪽', 1, false);
            화면.대미지팝업('오른쪽', 1, false);
        }

        화면.전투메시지표시(결과텍스트[결과], 결과색[결과]);

        // idle 복귀
        this.idle토글(true);

        // HP 0 체크 (좀비 스킬 포함)
        await this.지연(1200);
        if (await this.종료체크()) return;

        // 다음 라운드
        this.다음라운드();
    },

    // ========== 대미지 처리 (스킬 통합) ==========
    async 대미지처리(액션, 공격펫, 방어펫, 피격대상) {
        // 1) 기본 대미지 산출
        let 대미지;
        switch (액션) {
            case '바위': 대미지 = 공격펫.바위대미지; break;
            case '가위': 대미지 = 공격펫.가위대미지; break;
            case '보': 대미지 = 공격펫.보대미지; break;
            default: 대미지 = 1;
        }

        let 액티브발동 = false;
        let 발동스킬이름 = '';

        // 2) 패시브: 더블 체크 (바위더블/가위더블/보더블)
        const 더블id = this._더블스킬[액션];
        if (더블id && this._스킬보유(공격펫, 더블id)) {
            대미지 *= 2;
            const 스킬 = 게임데이터.스킬찾기(더블id);
            화면.스킬미니연출(스킬.이름, 스킬.설명, 공격펫.색상);
            await this.지연(1200);
        }

        // 3) 액티브: 분노 체크 (HP 30% 이하 + 60%)
        const 공격HP = 피격대상 === '상대' ? this.내HP : this.상대HP;
        const 공격최대HP = 피격대상 === '상대' ? this.내최대HP : this.상대최대HP;
        if (this._스킬보유(공격펫, 7) && 공격HP <= 공격최대HP * 0.3) {
            const 스킬 = 게임데이터.스킬찾기(7);
            if (this._확률체크(스킬.확률)) {
                대미지 *= 3;
                액티브발동 = true;
                발동스킬이름 = 스킬.이름;
            }
        }

        // 3-1) 액티브: 폭주 체크 (조건 없이 30% 확률 대미지 3배)
        if (!액티브발동 && this._스킬보유(공격펫, 11)) {
            const 스킬 = 게임데이터.스킬찾기(11);
            if (this._확률체크(스킬.확률)) {
                대미지 *= 스킬.배율;
                액티브발동 = true;
                발동스킬이름 = 스킬.이름;
            }
        }

        // 4) 패시브: 철벽 체크 (방어측)
        if (this._스킬보유(방어펫, 4)) {
            대미지 = Math.max(1, 대미지 - 1);
            const 스킬 = 게임데이터.스킬찾기(4);
            화면.스킬미니연출(스킬.이름, 스킬.설명, 방어펫.색상);
            await this.지연(1200);
        }

        // 5) 액티브 발동 시 컷씬
        if (액티브발동) {
            this.오라활성화(피격대상 === '나' ? 'right' : 'left');
            await new Promise(resolve => {
                화면.스킬컷씬표시(공격펫, 발동스킬이름, resolve);
            });
        }

        // 6) 대미지 적용 - 히트이펙트는 맞는 쪽(방어자) 위치에 표시
        화면.화면흔들림();
        화면.전투플래시();
        const 충돌X = 피격대상 === '나' ? 180 : 1060;
        화면.히트이펙트(충돌X, 220);
        this.히트스파크(충돌X, 220, 액티브발동, 공격펫);
        // 액티브 발동 시 추가 임팩트
        if (액티브발동) {
            await this.지연(100);
            화면.전투플래시();
            화면.화면흔들림();
            this.히트스파크(충돌X + (Math.random()-0.5)*40, 220 + (Math.random()-0.5)*30, true, 공격펫);
        }

        if (피격대상 === '나') {
            this.내HP = Math.max(0, this.내HP - 대미지);
            화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
            화면.대미지팝업('왼쪽', 대미지, 액티브발동);
            this.히트애니메이션('왼쪽', 액티브발동 || 대미지 >= 4);
        } else {
            this.상대HP = Math.max(0, this.상대HP - 대미지);
            화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
            화면.대미지팝업('오른쪽', 대미지, 액티브발동);
            this.히트애니메이션('오른쪽', 액티브발동 || 대미지 >= 4);
        }

        if (액티브발동) {
            setTimeout(() => this.오라비활성화(), 800);
        }

        await this.지연(300);

        // 7) 패시브: 흡혈 (공격측 HP 2 회복)
        if (this._스킬보유(공격펫, 5)) {
            if (피격대상 === '상대') {
                this.내HP = Math.min(this.내최대HP, this.내HP + 2);
                화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
            } else {
                this.상대HP = Math.min(this.상대최대HP, this.상대HP + 2);
                화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
            }
            const 스킬 = 게임데이터.스킬찾기(5);
            화면.스킬미니연출(스킬.이름, 'HP +2 회복!', 공격펫.색상);
            await this.지연(1200);
        }

        // 8) 액티브: 연속타 (35% 확률로 추가 2 대미지)
        if (this._스킬보유(공격펫, 8)) {
            const 스킬 = 게임데이터.스킬찾기(8);
            if (this._확률체크(스킬.확률)) {
                const 추가대미지 = 스킬.대미지 || 2;
                화면.스킬미니연출(스킬.이름, `추가 ${추가대미지} 대미지!`, 공격펫.색상);
                await this.지연(1000);
                화면.화면흔들림();
                this.히트스파크(충돌X, 220, true, 공격펫);
                if (피격대상 === '나') {
                    this.내HP = Math.max(0, this.내HP - 추가대미지);
                    화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
                    화면.대미지팝업('왼쪽', 추가대미지, true);
                } else {
                    this.상대HP = Math.max(0, this.상대HP - 추가대미지);
                    화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
                    화면.대미지팝업('오른쪽', 추가대미지, true);
                }
                await this.지연(400);
            }
        }

        // 9) 액티브: 카운터 (방어측 40% 확률로 반격 2 대미지)
        if (this._스킬보유(방어펫, 9)) {
            const 스킬 = 게임데이터.스킬찾기(9);
            if (this._확률체크(스킬.확률)) {
                const 반격대미지 = 스킬.대미지 || 2;
                화면.스킬미니연출(스킬.이름, `반격 ${반격대미지} 대미지!`, 방어펫.색상);
                await this.지연(1000);
                화면.화면흔들림();
                const 반격X = 피격대상 === '나' ? 1060 : 180;
                this.히트스파크(반격X, 220, true, 방어펫);
                if (피격대상 === '나') {
                    this.상대HP = Math.max(0, this.상대HP - 반격대미지);
                    화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
                    화면.대미지팝업('오른쪽', 반격대미지, true);
                } else {
                    this.내HP = Math.max(0, this.내HP - 반격대미지);
                    화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
                    화면.대미지팝업('왼쪽', 반격대미지, true);
                }
                await this.지연(400);
            }
        }
    },

    // ========== HP 0 체크 + 좀비 ==========
    async 종료체크() {
        // 내 HP 체크
        if (this.내HP <= 0) {
            // 좀비 체크
            if (this._스킬보유(this.내펫, 6) && !this.좀비사용_나) {
                const 스킬 = 게임데이터.스킬찾기(6);
                if (this._확률체크(스킬.확률)) {
                    const 부활HP = 스킬.회복량 || 3;
                    this.좀비사용_나 = true;
                    this.내HP = 부활HP;
                    화면.HP업데이트('왼쪽', 부활HP, this.내최대HP);
                    화면.전투메시지표시(`좀비! HP ${부활HP} 부활!`, '#ff4040');
                    await this.지연(1000);
                    return false;
                }
            }
            this.진행중 = false;
            this.idle토글(false);
            await this.패배연출('왼쪽');
            document.getElementById('전투오른쪽펫').classList.add('victory');
            await new Promise(resolve => { 화면.KO연출(resolve); });
            this.종료콜백(false);
            return true;
        }

        // 상대 HP 체크
        if (this.상대HP <= 0) {
            if (this._스킬보유(this.상대펫, 6) && !this.좀비사용_상대) {
                const 스킬 = 게임데이터.스킬찾기(6);
                if (this._확률체크(스킬.확률)) {
                    const 부활HP = 스킬.회복량 || 3;
                    this.좀비사용_상대 = true;
                    this.상대HP = 부활HP;
                    화면.HP업데이트('오른쪽', 부활HP, this.상대최대HP);
                    화면.전투메시지표시(`좀비! HP ${부활HP} 부활!`, '#ff4040');
                    await this.지연(1000);
                    return false;
                }
            }
            this.진행중 = false;
            this.idle토글(false);
            await this.패배연출('오른쪽');
            document.getElementById('전투왼쪽펫').classList.add('victory');
            await new Promise(resolve => { 화면.KO연출(resolve); });
            this.종료콜백(true);
            return true;
        }

        return false;
    },

    // ========== 패배 다단계 연출 ==========
    async 패배연출(쪽) {
        const id = 쪽 === '왼쪽' ? '전투왼쪽펫' : '전투오른쪽펫';
        const el = document.getElementById(id);

        // 1단계: 비틀거림
        el.classList.add('defeat-stagger');
        화면.화면흔들림();
        await this.지연(600);
        el.classList.remove('defeat-stagger');

        // 2단계: 쓰러짐
        el.classList.add('defeat-fall');
        await this.지연(500);

        // 3단계: 바닥 바운스 + 먼지 이펙트
        el.classList.remove('defeat-fall');
        el.classList.add('defeat-bounce');
        화면.화면흔들림();
        this.패배먼지(쪽);
        await this.지연(300);

        // 4단계: 최종 상태 (바닥에 누워있음)
        el.classList.remove('defeat-bounce');
        el.classList.add('defeat-final');

        // 어지러움 별 이펙트
        this.패배별이펙트(쪽);
        await this.지연(400);
    },

    패배먼지(쪽) {
        if (!this.파티클상태) return;
        const x = 쪽 === '왼쪽' ? 160 : 1060;
        const y = 420;
        for (let i = 0; i < 12; i++) {
            const 각도 = -Math.PI * 0.2 + Math.random() * Math.PI * 0.4 + (쪽 === '왼쪽' ? Math.PI : 0);
            this.파티클상태.스파크.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + Math.random() * 10,
                vx: Math.cos(각도) * (1 + Math.random() * 3),
                vy: -Math.random() * 2 - 1,
                크기: Math.random() * 2 + 1,
                수명: 1, 감쇠: 0.03,
                색: ['#a09080', '#c0b0a0', '#8070650', '#d0c0b0'][Math.floor(Math.random() * 4)] || '#a09080',
                꼬리: false
            });
        }
    },

    패배별이펙트(쪽) {
        const 펫el = document.getElementById(쪽 === '왼쪽' ? '전투왼쪽펫' : '전투오른쪽펫');
        const field = document.querySelector('.battle-field');

        const 별 = document.createElement('div');
        별.className = 'defeat-stars show';
        별.style.cssText = `font-size:16px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;`;
        별.innerHTML = '⭐💫⭐';

        // 펫 머리 위에 배치
        const rect = 펫el.getBoundingClientRect();
        const fieldRect = field.getBoundingClientRect();
        별.style.left = (rect.left - fieldRect.left + rect.width * 0.3) + 'px';
        별.style.top = (rect.top - fieldRect.top - 10) + 'px';
        field.appendChild(별);
    },

    // ========== 다음 라운드 (치유 스킬 포함) ==========
    async 다음라운드() {
        this.라운드수++;

        // 라운드 전환 중에는 입력 차단
        this.내턴완료 = true;
        this.상대턴완료 = false;
        this.내선택 = null;
        this.상대선택 = null;

        // 시스템 버튼 초기화
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.borderColor = 'rgba(255,255,255,.06)';
            btn.style.boxShadow = 'none';
            btn.style.transform = 'scale(1)';
            btn.classList.remove('flash');
        });

        // 라운드 연출 (이 동안 버튼 비활성)
        await new Promise(resolve => {
            화면.라운드연출(`ROUND ${this.라운드수}`, resolve);
        });

        // 치유 스킬 체크 (양쪽)
        await this.치유체크();

        // 라운드 연출 끝난 후에 입력 허용 + 버튼 재활성화
        this.내턴완료 = false;
        document.querySelectorAll('.battle-action-btn').forEach(btn => {
            btn.classList.remove('selected', 'disabled');
        });

        // 상대 AI 다시 시작
        this.상대AI시작();
    },

    async 치유체크() {
        // 내 펫 치유 (id 10)
        if (this._스킬보유(this.내펫, 10)) {
            const 스킬 = 게임데이터.스킬찾기(10);
            if (this._확률체크(스킬.확률) && this.내HP < this.내최대HP) {
                this.내HP = Math.min(this.내최대HP, this.내HP + 2);
                화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
                화면.전투메시지표시(`${this.내펫.이름} 치유! HP +2`, '#40ff80');
                await this.지연(800);
            }
        }
        // 상대 펫 치유
        if (this._스킬보유(this.상대펫, 10)) {
            const 스킬 = 게임데이터.스킬찾기(10);
            if (this._확률체크(스킬.확률) && this.상대HP < this.상대최대HP) {
                this.상대HP = Math.min(this.상대최대HP, this.상대HP + 2);
                화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
                화면.전투메시지표시(`${this.상대펫.이름} 치유! HP +2`, '#40ff80');
                await this.지연(800);
            }
        }
    },

    // ========== 기존 유틸 ==========
    _액션클래스: { '바위': 'atk-punch', '가위': 'atk-kick', '보': 'atk-fly' },

    async 공격애니메이션(결과, 내액션, 상대액션) {
        const 왼쪽펫 = document.getElementById('전투왼쪽펫');
        const 오른쪽펫 = document.getElementById('전투오른쪽펫');
        const 내클래스 = this._액션클래스[내액션];
        const 상대클래스 = this._액션클래스[상대액션];

        // 방어자 위치 기준으로 히트이펙트 표시
        const 왼쪽펫X = 180;
        const 오른쪽펫X = 1060;

        if (결과 === 'win') {
            // 내 펫(왼쪽)이 공격 → 상대(오른쪽)가 맞음
            왼쪽펫.classList.add(내클래스, 'move-center-l');
            await this.지연(250);
            // 타격 순간
            화면.전투플래시();
            화면.화면흔들림();
            화면.히트이펙트(오른쪽펫X, 220);
            this.히트스파크(오른쪽펫X, 220, false);
            // 방어자 피격 리액션
            오른쪽펫.classList.add('hit-react', 'hit-flash');
            this.피격이모티콘('오른쪽', false);
            await this.지연(150);
            // 추가 스파크
            this.히트스파크(오른쪽펫X + (Math.random()-0.5)*30, 230, false);
            await this.지연(300);
            왼쪽펫.classList.remove('move-center-l', 내클래스);
            오른쪽펫.classList.remove('hit-react', 'hit-flash');
        } else if (결과 === 'lose') {
            // 상대(오른쪽)가 공격 → 내 펫(왼쪽)이 맞음
            오른쪽펫.classList.add(상대클래스, 'move-center-r');
            await this.지연(250);
            화면.전투플래시();
            화면.화면흔들림();
            화면.히트이펙트(왼쪽펫X, 220);
            this.히트스파크(왼쪽펫X, 220, false);
            왼쪽펫.classList.add('hit-react', 'hit-flash');
            this.피격이모티콘('왼쪽', false);
            await this.지연(150);
            this.히트스파크(왼쪽펫X + (Math.random()-0.5)*30, 230, false);
            await this.지연(300);
            오른쪽펫.classList.remove('move-center-r', 상대클래스);
            왼쪽펫.classList.remove('hit-react', 'hit-flash');
        } else {
            // 무승부 - 양쪽 돌진 후 충돌
            왼쪽펫.classList.add(내클래스, 'move-center-l');
            오른쪽펫.classList.add(상대클래스, 'move-center-r');
            await this.지연(250);
            화면.전투플래시();
            화면.화면흔들림();
            화면.히트이펙트(640, 220);
            this.히트스파크(640, 220, false);
            // 양쪽 모두 약한 리코일
            왼쪽펫.classList.add('hit-flash');
            오른쪽펫.classList.add('hit-flash');
            await this.지연(400);
            왼쪽펫.classList.remove('move-center-l', 내클래스, 'hit-flash');
            오른쪽펫.classList.remove('move-center-r', 상대클래스, 'hit-flash');
        }
    },

    히트애니메이션(쪽, 강한히트 = false) {
        const id = 쪽 === '왼쪽' ? '전투왼쪽펫' : '전투오른쪽펫';
        const el = document.getElementById(id);
        const 클래스 = 강한히트 ? 'hit-heavy' : 'hit-react';
        const 시간 = 강한히트 ? 600 : 400;

        // 빨간 플래시
        el.classList.add('hit-flash');
        setTimeout(() => el.classList.remove('hit-flash'), 300);

        // 히트 리액션
        el.classList.add(클래스);
        setTimeout(() => el.classList.remove(클래스), 시간);

        // 피격 이모티콘 (💢 or 💥)
        this.피격이모티콘(쪽, 강한히트);
    },

    피격이모티콘(쪽, 강한) {
        const 펫el = document.getElementById(쪽 === '왼쪽' ? '전투왼쪽펫' : '전투오른쪽펫');
        const rect = 펫el.getBoundingClientRect();
        const field = document.querySelector('.battle-field');
        const fieldRect = field.getBoundingClientRect();

        const 이모 = document.createElement('div');
        이모.className = 'hit-emotion';
        이모.textContent = 강한 ? '💥' : '💢';
        이모.style.left = (rect.left - fieldRect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4) + 'px';
        이모.style.top = (rect.top - fieldRect.top + 10) + 'px';
        field.appendChild(이모);
        void 이모.offsetWidth;
        이모.classList.add('show');
        setTimeout(() => 이모.remove(), 700);
    },

    idle토글(활성) {
        const 왼쪽 = document.getElementById('전투왼쪽펫');
        const 오른쪽 = document.getElementById('전투오른쪽펫');
        if (활성) { 왼쪽.classList.add('idle'); 오른쪽.classList.add('idle'); }
        else { 왼쪽.classList.remove('idle'); 오른쪽.classList.remove('idle'); }
    },

    오라활성화(쪽) {
        const id = 쪽 === 'left' ? '왼쪽오라' : '오른쪽오라';
        document.getElementById(id)?.classList.add('active');
    },

    오라비활성화() {
        document.getElementById('왼쪽오라')?.classList.remove('active');
        document.getElementById('오른쪽오라')?.classList.remove('active');
    },

    정리() {
        this.진행중 = false;
        if (this.상대타이머) clearTimeout(this.상대타이머);
        this.파티클상태 = null;
        // 패배/승리 이펙트 정리
        document.querySelectorAll('.hit-emotion, .defeat-stars').forEach(el => el.remove());
        ['전투왼쪽펫', '전투오른쪽펫'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('defeat-stagger', 'defeat-fall', 'defeat-bounce', 'defeat-final', 'victory', 'hit-react', 'hit-heavy', 'hit-flash');
        });
    },

    지연(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ========== 히트 스파크 (속성 색상 반영) ==========
    히트스파크(x, y, 강화, 공격펫 = null) {
        if (!this.파티클상태) return;
        const 개수 = 강화 ? 30 : 15;
        let 색상들;
        if (강화 && 공격펫) {
            const 속성 = 게임데이터.속성가져오기(공격펫.속성 || '불');
            색상들 = [...속성.파티클, '#fff'];
        } else {
            색상들 = ['#ffe040', '#ff8020', '#ffaa40', '#fff'];
        }
        for (let i = 0; i < 개수; i++) {
            const 각도 = Math.random() * Math.PI * 2;
            const 속도 = 2 + Math.random() * (강화 ? 8 : 5);
            this.파티클상태.스파크.push({
                x, y,
                vx: Math.cos(각도) * 속도,
                vy: Math.sin(각도) * 속도 - 2,
                크기: Math.random() * 3 + 1,
                수명: 1,
                감쇠: 0.02 + Math.random() * 0.03,
                색: 색상들[Math.floor(Math.random() * 색상들.length)],
                꼬리: 강화
            });
        }
    },

    // ========== 파티클 시스템 ==========
    파티클시작() {
        const canvas = document.getElementById('전투파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;

        const 내속성 = 게임데이터.속성가져오기(this.내펫.속성 || '불');
        const 상대속성 = 게임데이터.속성가져오기(this.상대펫.속성 || '불');
        const 내색 = 내속성.주색;
        const 상대색 = 상대속성.주색;

        this.파티클상태 = { 에너지: [], 바닥: [], 스파크: [], 시간: 0 };
        const 상태 = this.파티클상태;

        for (let i = 0; i < 35; i++) {
            const 왼쪽 = i < 18;
            상태.에너지.push({
                x: 왼쪽 ? Math.random() * 500 : 780 + Math.random() * 500,
                y: Math.random() * 720,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.3 - Math.random() * 0.8,
                크기: Math.random() * 3 + 1,
                투명: Math.random() * 0.3 + 0.05,
                색: 왼쪽 ? 내색 : 상대색,
                빛남: Math.random() * Math.PI * 2,
                빛남속도: 0.02 + Math.random() * 0.03
            });
        }

        for (let i = 0; i < 12; i++) {
            상태.바닥.push({
                x: 100 + Math.random() * 1080,
                y: 650 + Math.random() * 60,
                vy: -0.2 - Math.random() * 0.4,
                크기: Math.random() * 1.5 + 0.5,
                투명: Math.random() * 0.08 + 0.02,
                수명: Math.random()
            });
        }

        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            상태.시간++;

            ctx.strokeStyle = 'rgba(255,200,100,.03)';
            ctx.lineWidth = 1;
            const 바닥Y = 560;
            for (let i = 0; i < 5; i++) {
                const y = 바닥Y + i * 30 + Math.sin(상태.시간 * 0.01 + i) * 2;
                ctx.globalAlpha = 0.04 - i * 0.007;
                ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(1180, y); ctx.stroke();
            }
            for (let i = 0; i < 12; i++) {
                const x = 160 + i * 88;
                const 상단X = 640 + (x - 640) * 0.7;
                ctx.globalAlpha = 0.025;
                ctx.beginPath(); ctx.moveTo(상단X, 바닥Y); ctx.lineTo(x, 720); ctx.stroke();
            }

            상태.에너지.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.빛남 += p.빛남속도;
                if (p.y < -20) { p.y = 730; p.x = p.x < 640 ? Math.random() * 500 : 780 + Math.random() * 500; }
                if (p.x < -20) p.x = 1300; if (p.x > 1300) p.x = -20;
                const 밝기 = 0.5 + Math.sin(p.빛남) * 0.5;
                ctx.globalAlpha = p.투명 * 밝기;
                ctx.fillStyle = p.색; ctx.shadowBlur = 8; ctx.shadowColor = p.색;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            상태.바닥.forEach(p => {
                p.y += p.vy; p.수명 -= 0.003;
                if (p.수명 <= 0 || p.y < 500) { p.x = 100 + Math.random() * 1080; p.y = 650 + Math.random() * 60; p.수명 = 1; }
                ctx.globalAlpha = p.투명 * p.수명; ctx.fillStyle = '#a090c0';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2); ctx.fill();
            });

            for (let i = 상태.스파크.length - 1; i >= 0; i--) {
                const s = 상태.스파크[i];
                s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.vx *= 0.98; s.수명 -= s.감쇠;
                if (s.수명 <= 0) { 상태.스파크.splice(i, 1); continue; }
                ctx.globalAlpha = s.수명; ctx.fillStyle = s.색;
                ctx.shadowBlur = s.꼬리 ? 6 : 3; ctx.shadowColor = s.색;
                if (s.꼬리) {
                    ctx.strokeStyle = s.색; ctx.lineWidth = s.크기 * 0.6;
                    ctx.globalAlpha = s.수명 * 0.3;
                    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3); ctx.stroke();
                    ctx.globalAlpha = s.수명;
                }
                ctx.beginPath(); ctx.arc(s.x, s.y, s.크기, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }

            const 파동투명 = 0.015 + Math.sin(상태.시간 * 0.03) * 0.01;
            const 파동크기 = 100 + Math.sin(상태.시간 * 0.02) * 30;
            ctx.globalAlpha = 파동투명; ctx.strokeStyle = '#ffe080'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(640, 350, 파동크기, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;

            if (document.getElementById('전투화면')?.classList.contains('active') && this.파티클상태 === 상태) {
                requestAnimationFrame(그리기);
            }
        };
        그리기();
    }
};

// 히트 애니메이션 CSS 동적 추가
(function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            50% { transform: translateX(8px); }
            75% { transform: translateX(-4px); }
        }
        @keyframes hitShake {
            0%, 100% { transform: translateX(0) translateY(0); }
            20% { transform: translateX(-12px) translateY(-8px); }
            40% { transform: translateX(12px) translateY(6px); }
            60% { transform: translateX(-8px) translateY(-4px); }
            80% { transform: translateX(6px) translateY(3px); }
        }
    `;
    document.head.appendChild(style);
})();
