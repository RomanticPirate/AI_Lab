// battle.js - 전투 시스템 (화려한 이펙트 통합)
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

    // 가위바위보 매핑: 주먹=가위, 발차기=바위, 날라차기=보
    상성표: {
        '주먹': '날라차기',
        '발차기': '주먹',
        '날라차기': '발차기'
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

                // 선택 표시
                버튼들.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                this.내선택 = btn.dataset.action;
                this.내턴완료 = true;

                // 모든 버튼 비활성화
                버튼들.forEach(b => b.classList.add('disabled'));

                // '공격 선택 완료!' 메시지
                this.선택완료메시지('left');

                // 양쪽 다 선택했으면 판정
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

        // 선택 중 애니메이션
        let 깜빡임;
        const 액션들 = ['주먹', '발차기', '날라차기'];
        let 인덱스 = 0;
        깜빡임 = setInterval(() => {
            화면.시스템선택표시(액션들[인덱스 % 3]);
            인덱스++;
        }, 200);

        this.상대타이머 = setTimeout(() => {
            clearInterval(깜빡임);
            this.상대선택 = 액션들[Math.floor(Math.random() * 3)];
            this.상대턴완료 = true;
            화면.시스템전체번쩍임();
            this.선택완료메시지('right');
            this.판정체크();
        }, 시간);
    },

    판정체크() {
        if (!this.내턴완료 || !this.상대턴완료) return;
        setTimeout(() => this.판정실행(), 500);
    },

    async 판정실행() {
        const 내 = this.내선택;
        const 상대 = this.상대선택;

        let 결과;
        if (내 === 상대) {
            결과 = 'draw';
        } else if (this.상성표[내] === 상대) {
            결과 = 'win';
        } else {
            결과 = 'lose';
        }

        const 결과텍스트 = { win: '승리!', lose: '패배!', draw: '무승부!' };
        const 결과색 = { win: '#40ff60', lose: '#ff4040', draw: '#ffe080' };

        // idle 애니메이션 멈추기
        this.idle토글(false);

        // 공격 애니메이션
        await this.공격애니메이션(결과, 내, 상대);

        // 대미지 계산 및 적용
        if (결과 === 'win') {
            const 대미지 = this.대미지계산(내, this.내펫);
            await this.대미지적용('상대', 대미지, 내);
        } else if (결과 === 'lose') {
            const 대미지 = this.대미지계산(상대, this.상대펫);
            await this.대미지적용('나', 대미지, 상대);
        }

        화면.전투메시지표시(결과텍스트[결과], 결과색[결과]);

        // idle 복귀
        this.idle토글(true);

        // 게임 종료 체크
        await this.지연(1200);

        if (this.내HP <= 0) {
            this.진행중 = false;
            this.idle토글(false);
            // KO 연출 → 2.5초 후 콜백
            await new Promise(resolve => {
                화면.KO연출(resolve);
            });
            this.종료콜백(false);
            return;
        }
        if (this.상대HP <= 0) {
            this.진행중 = false;
            this.idle토글(false);
            await new Promise(resolve => {
                화면.KO연출(resolve);
            });
            this.종료콜백(true);
            return;
        }

        // 다음 라운드
        this.다음라운드();
    },

    대미지계산(액션, 펫) {
        let 기본대미지;
        switch (액션) {
            case '주먹': 기본대미지 = 펫.주먹대미지; break;
            case '발차기': 기본대미지 = 펫.발차기대미지; break;
            case '날라차기': 기본대미지 = 펫.날라차기대미지; break;
            default: 기본대미지 = 1;
        }

        const 스킬발동 = Math.random() * 100 < 펫.스킬확률;
        if (스킬발동) {
            return { 값: 기본대미지 * 펫.스킬배율, 스킬: true, 펫: 펫 };
        }
        return { 값: 기본대미지, 스킬: false, 펫: 펫 };
    },

    async 대미지적용(대상, 대미지정보, 액션) {
        const { 값, 스킬, 펫: 공격펫 } = 대미지정보;

        // 스킬 발동 시 오라 활성화 + 컷씬
        if (스킬) {
            this.오라활성화(대상 === '나' ? 'right' : 'left');
            await new Promise(resolve => {
                화면.스킬컷씬표시(공격펫, resolve);
            });
        }

        // 화면 흔들림
        화면.화면흔들림();

        // 플래시
        화면.전투플래시();

        // 히트 이펙트 (충돌 지점)
        const 충돌X = 대상 === '나' ? 280 : 900;
        const 충돌Y = 200;
        화면.히트이펙트(충돌X, 충돌Y);

        // 히트 스파크 파티클
        this.히트스파크(충돌X, 충돌Y, 스킬);

        // 대미지 팝업
        if (대상 === '나') {
            this.내HP = Math.max(0, this.내HP - 값);
            화면.HP업데이트('왼쪽', this.내HP, this.내최대HP);
            화면.대미지팝업('왼쪽', 값, 스킬);
            this.히트애니메이션('왼쪽');
        } else {
            this.상대HP = Math.max(0, this.상대HP - 값);
            화면.HP업데이트('오른쪽', this.상대HP, this.상대최대HP);
            화면.대미지팝업('오른쪽', 값, 스킬);
            this.히트애니메이션('오른쪽');
        }

        // 스킬 대미지면 추가 메시지
        if (스킬) {
            화면.전투메시지표시(`${공격펫.스킬이름}!`, '#a060e0');
            // 오라 해제
            setTimeout(() => this.오라비활성화(), 800);
        }

        await this.지연(300);
    },

    async 공격애니메이션(결과, 내액션, 상대액션) {
        const 왼쪽펫 = document.getElementById('전투왼쪽펫');
        const 오른쪽펫 = document.getElementById('전투오른쪽펫');

        if (결과 === 'win') {
            왼쪽펫.classList.add('move-center-l');
            await this.지연(350);
            화면.전투플래시();
            화면.화면흔들림();
            화면.히트이펙트(560, 200);
            this.히트스파크(560, 200, false);
            await this.지연(300);
            왼쪽펫.classList.remove('move-center-l');
        } else if (결과 === 'lose') {
            오른쪽펫.classList.add('move-center-r');
            await this.지연(350);
            화면.전투플래시();
            화면.화면흔들림();
            화면.히트이펙트(640, 200);
            this.히트스파크(640, 200, false);
            await this.지연(300);
            오른쪽펫.classList.remove('move-center-r');
        } else {
            // 무승부 - 둘 다 충돌
            왼쪽펫.classList.add('move-center-l');
            오른쪽펫.classList.add('move-center-r');
            await this.지연(350);
            화면.전투플래시();
            화면.화면흔들림();
            화면.히트이펙트(600, 200);
            this.히트스파크(600, 200, false);
            await this.지연(300);
            왼쪽펫.classList.remove('move-center-l');
            오른쪽펫.classList.remove('move-center-r');
        }
    },

    히트애니메이션(쪽) {
        const id = 쪽 === '왼쪽' ? '전투왼쪽펫' : '전투오른쪽펫';
        const el = document.getElementById(id);
        // 밝은 플래시
        el.style.filter = 'brightness(3) saturate(2)';
        setTimeout(() => { el.style.filter = ''; }, 200);
        // 강한 흔들림
        el.style.animation = 'hitShake 0.3s ease-in-out';
        setTimeout(() => { el.style.animation = ''; }, 400);
    },

    idle토글(활성) {
        const 왼쪽 = document.getElementById('전투왼쪽펫');
        const 오른쪽 = document.getElementById('전투오른쪽펫');
        if (활성) {
            왼쪽.classList.add('idle');
            오른쪽.classList.add('idle');
        } else {
            왼쪽.classList.remove('idle');
            오른쪽.classList.remove('idle');
        }
    },

    오라활성화(쪽) {
        const id = 쪽 === 'left' ? '왼쪽오라' : '오른쪽오라';
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    },

    오라비활성화() {
        document.getElementById('왼쪽오라')?.classList.remove('active');
        document.getElementById('오른쪽오라')?.classList.remove('active');
    },

    async 다음라운드() {
        this.내턴완료 = false;
        this.상대턴완료 = false;
        this.내선택 = null;
        this.상대선택 = null;
        this.라운드수++;

        // 플레이어 버튼 재활성화
        document.querySelectorAll('.battle-action-btn').forEach(btn => {
            btn.classList.remove('selected', 'disabled');
        });

        // 시스템 버튼 초기화
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.borderColor = 'rgba(255,255,255,.06)';
            btn.classList.remove('flash');
        });

        // 라운드 연출
        await new Promise(resolve => {
            화면.라운드연출(`ROUND ${this.라운드수}`, resolve);
        });

        // 상대 AI 다시 시작
        this.상대AI시작();
    },

    정리() {
        this.진행중 = false;
        if (this.상대타이머) clearTimeout(this.상대타이머);
        this.파티클상태 = null;
    },

    지연(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ========== 히트 스파크 (캔버스에 즉시 추가) ==========
    히트스파크(x, y, 스킬) {
        if (!this.파티클상태) return;
        const 개수 = 스킬 ? 30 : 15;
        const 색상들 = 스킬
            ? ['#c080ff', '#a060e0', '#e0a0ff', '#fff']
            : ['#ffe040', '#ff8020', '#ffaa40', '#fff'];
        for (let i = 0; i < 개수; i++) {
            const 각도 = Math.random() * Math.PI * 2;
            const 속도 = 2 + Math.random() * (스킬 ? 8 : 5);
            this.파티클상태.스파크.push({
                x, y,
                vx: Math.cos(각도) * 속도,
                vy: Math.sin(각도) * 속도 - 2,
                크기: Math.random() * 3 + 1,
                수명: 1,
                감쇠: 0.02 + Math.random() * 0.03,
                색: 색상들[Math.floor(Math.random() * 색상들.length)],
                꼬리: 스킬
            });
        }
    },

    // ========== 파티클 시스템 (대폭 업그레이드) ==========
    파티클시작() {
        const canvas = document.getElementById('전투파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;

        const 내색 = this.내펫.색상;
        const 상대색 = this.상대펫.색상;

        // 파티클 상태 객체
        this.파티클상태 = {
            에너지: [],     // 떠다니는 에너지 구슬
            바닥: [],       // 바닥 파티클
            스파크: [],     // 히트 스파크 (동적 추가)
            시간: 0
        };
        const 상태 = this.파티클상태;

        // 에너지 구슬 (양쪽 색상)
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

        // 바닥 파티클 (위로 올라오는 먼지)
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

            // 바닥 그리드 라인 (투시)
            ctx.strokeStyle = 'rgba(255,200,100,.03)';
            ctx.lineWidth = 1;
            const 바닥Y = 560;
            // 수평 라인
            for (let i = 0; i < 5; i++) {
                const y = 바닥Y + i * 30 + Math.sin(상태.시간 * 0.01 + i) * 2;
                ctx.globalAlpha = 0.04 - i * 0.007;
                ctx.beginPath();
                ctx.moveTo(100, y);
                ctx.lineTo(1180, y);
                ctx.stroke();
            }
            // 수직 라인 (투시 효과)
            for (let i = 0; i < 12; i++) {
                const x = 160 + i * 88;
                const 상단X = 640 + (x - 640) * 0.7;
                ctx.globalAlpha = 0.025;
                ctx.beginPath();
                ctx.moveTo(상단X, 바닥Y);
                ctx.lineTo(x, 720);
                ctx.stroke();
            }

            // 에너지 구슬
            상태.에너지.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.빛남 += p.빛남속도;
                if (p.y < -20) { p.y = 730; p.x = p.x < 640 ? Math.random() * 500 : 780 + Math.random() * 500; }
                if (p.x < -20) p.x = 1300;
                if (p.x > 1300) p.x = -20;

                const 밝기 = 0.5 + Math.sin(p.빛남) * 0.5;
                ctx.globalAlpha = p.투명 * 밝기;
                ctx.fillStyle = p.색;
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.색;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // 바닥 파티클
            상태.바닥.forEach(p => {
                p.y += p.vy;
                p.수명 -= 0.003;
                if (p.수명 <= 0 || p.y < 500) {
                    p.x = 100 + Math.random() * 1080;
                    p.y = 650 + Math.random() * 60;
                    p.수명 = 1;
                }
                ctx.globalAlpha = p.투명 * p.수명;
                ctx.fillStyle = '#a090c0';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                ctx.fill();
            });

            // 히트 스파크 (동적)
            for (let i = 상태.스파크.length - 1; i >= 0; i--) {
                const s = 상태.스파크[i];
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.15; // 중력
                s.vx *= 0.98;
                s.수명 -= s.감쇠;

                if (s.수명 <= 0) {
                    상태.스파크.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = s.수명;
                ctx.fillStyle = s.색;
                ctx.shadowBlur = s.꼬리 ? 6 : 3;
                ctx.shadowColor = s.색;

                // 꼬리 효과 (스킬)
                if (s.꼬리) {
                    ctx.strokeStyle = s.색;
                    ctx.lineWidth = s.크기 * 0.6;
                    ctx.globalAlpha = s.수명 * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
                    ctx.stroke();
                    ctx.globalAlpha = s.수명;
                }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.크기, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // 중앙 에너지 맥동 (미묘한 원형 파동)
            const 파동투명 = 0.015 + Math.sin(상태.시간 * 0.03) * 0.01;
            const 파동크기 = 100 + Math.sin(상태.시간 * 0.02) * 30;
            ctx.globalAlpha = 파동투명;
            ctx.strokeStyle = '#ffe080';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(640, 350, 파동크기, 0, Math.PI * 2);
            ctx.stroke();

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
