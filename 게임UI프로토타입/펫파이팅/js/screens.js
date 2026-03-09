// screens.js - 화면 렌더링
const 화면 = {

    // ===== 타이틀 화면 =====
    타이틀생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '타이틀화면';
        div.innerHTML = `
            <div class="title-bg"></div>
            <div class="title-burst"></div>
            <div class="title-glow-l"></div>
            <div class="title-glow-r"></div>
            <div class="title-floor"></div>
            <div class="title-pets left" id="타이틀왼쪽펫"></div>
            <div class="title-pets right" id="타이틀오른쪽펫"></div>
            <div class="title-text-area">
                <div class="title-glow-bg"></div>
                <div class="title-badge">대전 격투 액션</div>
                <div class="title-name">
                    <span class="shadow">펫 파이팅</span>
                    <span class="stroke">펫 파이팅</span>
                    <span class="fill">펫 파이팅</span>
                    <span class="shine">펫 파이팅</span>
                </div>
                <div class="title-sub">PET FIGHTING</div>
            </div>
            <div class="title-press" id="타이틀시작">
                <div class="title-press-text">PRESS START</div>
            </div>
            <div class="vignette"></div>
            <div class="noise"></div>
            <canvas class="particle-canvas" id="타이틀파티클"></canvas>
        `;
        return div;
    },

    타이틀펫배치() {
        const 왼쪽 = document.getElementById('타이틀왼쪽펫');
        const 오른쪽 = document.getElementById('타이틀오른쪽펫');
        if (!왼쪽 || !오른쪽) return;

        // 왼쪽팀: 불곰, 바람여우, 독수리왕
        const 왼쪽팀 = [1, 3, 4];
        // 오른쪽팀: 번개늑대, 그림자고양이, 독사킹
        const 오른쪽팀 = [2, 5, 7];

        왼쪽.innerHTML = '';
        오른쪽.innerHTML = '';

        왼쪽팀.forEach((id, i) => {
            const 펫 = 게임데이터.펫찾기(id);
            if (!펫) return;
            const el = 펫렌더러.그리기(펫, 100 + (2 - i) * 20, false);
            el.classList.add('title-pet-svg');
            el.style.position = 'absolute';
            el.style.bottom = (i * 30) + 'px';
            el.style.left = (i * 35) + 'px';
            el.style.zIndex = 3 - i;
            왼쪽.appendChild(el);
        });

        오른쪽팀.forEach((id, i) => {
            const 펫 = 게임데이터.펫찾기(id);
            if (!펫) return;
            const el = 펫렌더러.그리기(펫, 100 + (2 - i) * 20, true);
            el.classList.add('title-pet-svg');
            el.style.position = 'absolute';
            el.style.bottom = (i * 30) + 'px';
            el.style.right = (i * 35) + 'px';
            el.style.zIndex = 3 - i;
            오른쪽.appendChild(el);
        });
    },

    타이틀파티클시작() {
        const canvas = document.getElementById('타이틀파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;

        const 입자들 = [];
        for (let i = 0; i < 60; i++) {
            입자들.push({
                x: Math.random() * 1280,
                y: Math.random() * 720,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 1.5 - 0.3,
                크기: Math.random() * 3 + 1,
                투명: Math.random() * 0.5 + 0.1,
                색: ['#ff6030', '#ffc040', '#ff4020', '#3080ff', '#a060e0'][Math.floor(Math.random() * 5)]
            });
        }

        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            입자들.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) { p.y = 730; p.x = Math.random() * 1280; }
                if (p.x < -10) p.x = 1290;
                if (p.x > 1290) p.x = -10;
                ctx.globalAlpha = p.투명;
                ctx.fillStyle = p.색;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            if (document.getElementById('타이틀화면')?.classList.contains('active')) {
                requestAnimationFrame(그리기);
            }
        };
        그리기();
    },

    // ===== 인트로 화면 =====
    인트로생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '인트로화면';
        div.innerHTML = `
            <div class="intro-bg"></div>
            <div class="intro-counter" id="인트로카운터"></div>
            <div class="intro-skip" id="인트로스킵">건너뛰기 ▶</div>
            <div class="intro-panel" id="인트로패널">
                <div class="intro-title" id="인트로제목"></div>
                <div class="intro-img" id="인트로이미지"></div>
                <div class="intro-desc" id="인트로설명"></div>
            </div>
            <div class="vignette"></div>
        `;
        return div;
    },

    인트로표시(펫목록, 콜백) {
        const 패널 = document.getElementById('인트로패널');
        const 제목 = document.getElementById('인트로제목');
        const 이미지 = document.getElementById('인트로이미지');
        const 설명 = document.getElementById('인트로설명');
        const 카운터 = document.getElementById('인트로카운터');
        const 스킵 = document.getElementById('인트로스킵');
        let 현재 = 0;

        const 보여주기 = () => {
            if (현재 >= 펫목록.length) {
                콜백();
                return;
            }
            const 펫 = 펫목록[현재];
            패널.classList.remove('show');

            setTimeout(() => {
                제목.textContent = 펫.이름;
                제목.style.color = 펫.색상;
                이미지.innerHTML = '';
                이미지.style.background = `radial-gradient(ellipse, ${펫.배경색}, #0a0818)`;
                이미지.appendChild(펫렌더러.그리기(펫, 200));
                설명.textContent = 펫.배경스토리;
                카운터.textContent = `${현재 + 1} / ${펫목록.length}`;
                패널.classList.add('show');
                현재++;
            }, 300);
        };

        // 클릭으로 다음
        const 클릭핸들러 = () => {
            보여주기();
        };
        패널.addEventListener('click', 클릭핸들러);

        // 자동 진행
        let 자동;
        const 자동시작 = () => {
            자동 = setInterval(() => {
                보여주기();
            }, 3000);
        };

        스킵.onclick = () => {
            clearInterval(자동);
            패널.removeEventListener('click', 클릭핸들러);
            콜백();
        };

        보여주기();
        자동시작();

        return () => {
            clearInterval(자동);
            패널.removeEventListener('click', 클릭핸들러);
        };
    },

    // ===== 캐릭터 선택 화면 =====
    캐릭터선택생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '선택화면';
        div.innerHTML = `
            <div class="select-bg"></div>
            <div class="select-header">캐릭터 선택</div>
            <div class="select-body">
                <div class="select-portrait-big" id="선택큰초상화"></div>
                <div class="select-info">
                    <div class="select-pet-name" id="선택펫이름">캐릭터를 선택하세요</div>
                    <div class="select-pet-story" id="선택펫스토리"></div>
                    <div class="select-divider"></div>
                    <div class="select-stats" id="선택스탯"></div>
                    <div class="select-skill" id="선택스킬" style="display:none">
                        <div class="select-skill-icon" id="선택스킬아이콘">⚡</div>
                        <div>
                            <div class="select-skill-name" id="선택스킬이름"></div>
                            <div class="select-skill-desc" id="선택스킬설명"></div>
                        </div>
                    </div>
                    <div class="select-divider"></div>
                    <div class="select-thumbs" id="선택썸네일목록"></div>
                    <button class="select-confirm disabled" id="선택확인버튼">선택</button>
                </div>
            </div>
            <div class="vignette"></div>
        `;
        return div;
    },

    캐릭터선택초기화(선택콜백) {
        const 목록 = document.getElementById('선택썸네일목록');
        const 큰초상화 = document.getElementById('선택큰초상화');
        const 이름 = document.getElementById('선택펫이름');
        const 스토리 = document.getElementById('선택펫스토리');
        const 스탯 = document.getElementById('선택스탯');
        const 스킬 = document.getElementById('선택스킬');
        const 스킬이름 = document.getElementById('선택스킬이름');
        const 스킬설명 = document.getElementById('선택스킬설명');
        const 확인 = document.getElementById('선택확인버튼');
        let 선택된펫 = null;

        목록.innerHTML = '';
        게임데이터.펫목록.forEach(펫 => {
            const 썸 = document.createElement('div');
            썸.className = 'select-thumb';
            썸.style.background = 펫.배경색;
            썸.appendChild(펫렌더러.썸네일(펫, 48));
            const 이름라벨 = document.createElement('div');
            이름라벨.className = 'select-thumb-name';
            이름라벨.textContent = 펫.이름;
            썸.appendChild(이름라벨);

            썸.onclick = () => {
                // 선택 표시
                목록.querySelectorAll('.select-thumb').forEach(t => t.classList.remove('selected'));
                썸.classList.add('selected');
                선택된펫 = 펫;

                // 정보 업데이트
                큰초상화.innerHTML = '';
                큰초상화.style.background = `radial-gradient(ellipse, ${펫.배경색}, #0a0818)`;
                큰초상화.appendChild(펫렌더러.그리기(펫, 220));

                이름.textContent = 펫.이름;
                이름.style.color = 펫.색상;
                스토리.textContent = 펫.배경스토리;

                // 스탯
                const 대미지값 = (v) => {
                    let stars = '';
                    for (let i = 0; i < Math.min(v, 5); i++) stars += '★';
                    for (let i = v; i < 5; i++) stars += '☆';
                    return stars;
                };
                스탯.innerHTML = `
                    <div class="select-stat">
                        <div class="select-stat-icon">👊</div>
                        <div class="select-stat-name">주먹</div>
                        <div class="select-stat-stars">${대미지값(펫.주먹대미지)}</div>
                    </div>
                    <div class="select-stat">
                        <div class="select-stat-icon">🦶</div>
                        <div class="select-stat-name">발차기</div>
                        <div class="select-stat-stars">${대미지값(펫.발차기대미지)}</div>
                    </div>
                    <div class="select-stat">
                        <div class="select-stat-icon">💨</div>
                        <div class="select-stat-name">날라차기</div>
                        <div class="select-stat-stars">${대미지값(펫.날라차기대미지)}</div>
                    </div>
                    <div class="select-stat">
                        <div class="select-stat-icon">❤️</div>
                        <div class="select-stat-name">체력</div>
                        <div class="select-stat-stars">${대미지값(펫.HP / 2)}</div>
                    </div>
                `;

                // 스킬
                스킬.style.display = 'flex';
                스킬이름.textContent = 펫.스킬이름;
                스킬설명.textContent = 펫.스킬설명;

                확인.className = 'select-confirm enabled';
            };

            목록.appendChild(썸);
        });

        확인.onclick = () => {
            if (선택된펫) 선택콜백(선택된펫);
        };
    },

    // ===== 대전 상대 VS 화면 =====
    VS화면생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = 'VS화면';
        div.innerHTML = `
            <div class="vs-screen-bg"></div>
            <div class="vs-screen-body">
                <div class="vs-screen-side left">
                    <div class="vs-screen-label">플레이어</div>
                    <div class="vs-screen-portrait" id="VS왼쪽초상화"></div>
                    <div class="vs-screen-name" id="VS왼쪽이름"></div>
                </div>
                <div class="vs-center">
                    <div class="vs-center-text">VS</div>
                    <button class="vs-fight-btn" id="VS대전버튼">대전 시작!</button>
                </div>
                <div class="vs-screen-side right">
                    <div class="vs-screen-label">상대</div>
                    <div class="vs-screen-portrait" id="VS오른쪽초상화"></div>
                    <div class="vs-screen-name" id="VS오른쪽이름"></div>
                </div>
            </div>
            <div class="vignette"></div>
            <canvas class="particle-canvas" id="VS파티클"></canvas>
        `;
        return div;
    },

    VS표시(내펫, 상대펫, 대전콜백) {
        const 왼쪽초상화 = document.getElementById('VS왼쪽초상화');
        const 왼쪽이름 = document.getElementById('VS왼쪽이름');
        const 오른쪽초상화 = document.getElementById('VS오른쪽초상화');
        const 오른쪽이름 = document.getElementById('VS오른쪽이름');
        const 버튼 = document.getElementById('VS대전버튼');

        왼쪽초상화.innerHTML = '';
        왼쪽초상화.style.background = `radial-gradient(ellipse, ${내펫.배경색}, #0a0818)`;
        왼쪽초상화.appendChild(펫렌더러.그리기(내펫, 200));
        왼쪽이름.textContent = 내펫.이름;
        왼쪽이름.style.color = 내펫.색상;

        오른쪽초상화.innerHTML = '';
        오른쪽초상화.style.background = `radial-gradient(ellipse, ${상대펫.배경색}, #0a0818)`;
        오른쪽초상화.appendChild(펫렌더러.그리기(상대펫, 200, true));
        오른쪽이름.textContent = 상대펫.이름;
        오른쪽이름.style.color = 상대펫.색상;

        // VS 파티클
        this.VS파티클시작();

        버튼.onclick = () => 대전콜백();
    },

    VS파티클시작() {
        const canvas = document.getElementById('VS파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;
        const 입자들 = [];
        for (let i = 0; i < 40; i++) {
            입자들.push({
                x: 640 + (Math.random() - 0.5) * 100,
                y: 360 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                크기: Math.random() * 2 + 0.5,
                수명: Math.random(),
                색: ['#ff4020', '#ffc040', '#ff8020'][Math.floor(Math.random() * 3)]
            });
        }
        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            입자들.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.수명 -= 0.005;
                if (p.수명 <= 0) {
                    p.x = 640 + (Math.random() - 0.5) * 100;
                    p.y = 360 + (Math.random() - 0.5) * 100;
                    p.vx = (Math.random() - 0.5) * 4;
                    p.vy = (Math.random() - 0.5) * 4;
                    p.수명 = 1;
                }
                ctx.globalAlpha = p.수명 * 0.6;
                ctx.fillStyle = p.색;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            if (document.getElementById('VS화면')?.classList.contains('active')) {
                requestAnimationFrame(그리기);
            }
        };
        그리기();
    },

    // ===== 게임(전투) 화면 =====
    전투화면생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '전투화면';
        div.innerHTML = `
            <div class="battle-bg"></div>
            <div class="battle-arena"></div>
            <div class="battle-energy-left"></div>
            <div class="battle-energy-right"></div>
            <!-- 상단 HUD: HP 게이지 + 이름 -->
            <div class="battle-hud">
                <div class="battle-hud-side left">
                    <div class="battle-pet-name" id="전투왼쪽이름"></div>
                    <div class="battle-hp-bar">
                        <div class="battle-hp-fill red" id="전투왼쪽HP" style="width:100%"></div>
                        <span class="battle-hp-text" id="전투왼쪽HP텍스트"></span>
                    </div>
                </div>
                <div class="battle-vs">VS</div>
                <div class="battle-hud-side right">
                    <div class="battle-pet-name" id="전투오른쪽이름" style="text-align:right"></div>
                    <div class="battle-hp-bar">
                        <div class="battle-hp-fill blue" id="전투오른쪽HP" style="width:100%"></div>
                        <span class="battle-hp-text" id="전투오른쪽HP텍스트"></span>
                    </div>
                </div>
            </div>
            <!-- 중앙 필드: 펫 캐릭터 (크게) -->
            <div class="battle-field">
                <div class="battle-pet left idle" id="전투왼쪽펫">
                    <div class="battle-pet-aura" id="왼쪽오라"></div>
                    <div class="battle-pet-shadow"></div>
                </div>
                <div class="battle-pet right idle" id="전투오른쪽펫">
                    <div class="battle-pet-aura" id="오른쪽오라"></div>
                    <div class="battle-pet-shadow"></div>
                </div>
            </div>
            <!-- 왼쪽 하단: 플레이어 액션 버튼 -->
            <div class="battle-actions left" id="전투액션버튼">
                <div class="battle-action-btn" data-action="주먹">
                    <div class="icon">👊</div>
                    <div class="name">주먹</div>
                    <div class="dmg" id="주먹대미지표시"></div>
                </div>
                <div class="battle-action-btn" data-action="발차기">
                    <div class="icon">🦶</div>
                    <div class="name">발차기</div>
                    <div class="dmg" id="발차기대미지표시"></div>
                </div>
                <div class="battle-action-btn" data-action="날라차기">
                    <div class="icon">💨</div>
                    <div class="name">날라차기</div>
                    <div class="dmg" id="날라차기대미지표시"></div>
                </div>
            </div>
            <!-- 오른쪽 하단: 시스템(상대) 버튼 표시 -->
            <div class="battle-actions right" id="시스템선택표시">
                <div class="battle-sys-btn" data-sys="주먹">
                    <div class="icon">👊</div>
                    <div class="name">주먹</div>
                    <div class="dmg" id="적주먹대미지표시"></div>
                </div>
                <div class="battle-sys-btn" data-sys="발차기">
                    <div class="icon">🦶</div>
                    <div class="name">발차기</div>
                    <div class="dmg" id="적발차기대미지표시"></div>
                </div>
                <div class="battle-sys-btn" data-sys="날라차기">
                    <div class="icon">💨</div>
                    <div class="name">날라차기</div>
                    <div class="dmg" id="적날라차기대미지표시"></div>
                </div>
            </div>
            <!-- 공격 선택 완료 메시지 (왼쪽/오른쪽) -->
            <div class="battle-select-msg left" id="왼쪽선택완료"></div>
            <div class="battle-select-msg right" id="오른쪽선택완료"></div>
            <!-- 메시지 팝업 -->
            <div class="battle-msg" id="전투메시지" style="left:50%;top:40%;transform:translateX(-50%)">
                <div class="battle-msg-text" id="전투메시지텍스트"></div>
            </div>
            <!-- 라운드 시작 연출 -->
            <div class="battle-round" id="라운드연출">
                <div class="battle-round-text" id="라운드텍스트"></div>
            </div>
            <!-- KO 연출 -->
            <div class="battle-ko" id="KO연출">
                <div class="battle-ko-text">경기 종료</div>
            </div>
            <!-- 스킬 컷씬 -->
            <div class="skill-cutscene" id="스킬컷씬">
                <div class="skill-cutscene-bg">
                    <div class="skill-speedlines"></div>
                </div>
                <div class="skill-face" id="스킬얼굴"></div>
                <div class="skill-name-display" id="스킬이름표시"></div>
            </div>
            <!-- 플래시 오버레이 -->
            <div class="flash-overlay" id="전투플래시"></div>
            <div class="battle-scanlines"></div>
            <div class="vignette"></div>
            <canvas class="particle-canvas" id="전투파티클"></canvas>
        `;
        return div;
    },

    전투초기화(내펫, 상대펫) {
        // 이름
        document.getElementById('전투왼쪽이름').textContent = 내펫.이름;
        document.getElementById('전투왼쪽이름').style.color = 내펫.색상;
        document.getElementById('전투오른쪽이름').textContent = 상대펫.이름;
        document.getElementById('전투오른쪽이름').style.color = 상대펫.색상;

        // 캐릭터 배치 (크게!)
        const 왼쪽 = document.getElementById('전투왼쪽펫');
        const 오른쪽 = document.getElementById('전투오른쪽펫');
        // 오라/그림자는 유지하면서 펫 SVG만 교체
        const 왼쪽오라 = 왼쪽.querySelector('.battle-pet-aura');
        const 왼쪽그림자 = 왼쪽.querySelector('.battle-pet-shadow');
        const 오른쪽오라 = 오른쪽.querySelector('.battle-pet-aura');
        const 오른쪽그림자 = 오른쪽.querySelector('.battle-pet-shadow');
        왼쪽.innerHTML = '';
        오른쪽.innerHTML = '';
        왼쪽.appendChild(펫렌더러.그리기(내펫, 320, false));
        if (왼쪽오라) { 왼쪽오라.style.background = 내펫.색상; 왼쪽.appendChild(왼쪽오라); }
        if (왼쪽그림자) 왼쪽.appendChild(왼쪽그림자);
        오른쪽.appendChild(펫렌더러.그리기(상대펫, 320, true));
        if (오른쪽오라) { 오른쪽오라.style.background = 상대펫.색상; 오른쪽.appendChild(오른쪽오라); }
        if (오른쪽그림자) 오른쪽.appendChild(오른쪽그림자);
        // 상태 클래스 리셋 + 아이들 애니메이션 활성화
        ['idle','victory','defeat','hit-react','atk-punch','atk-kick','atk-fly'].forEach(c => {
            왼쪽.classList.remove(c);
            오른쪽.classList.remove(c);
        });
        왼쪽.classList.add('idle');
        오른쪽.classList.add('idle');

        // 플레이어 대미지 표시
        document.getElementById('주먹대미지표시').textContent = `대미지: ${내펫.주먹대미지}`;
        document.getElementById('발차기대미지표시').textContent = `대미지: ${내펫.발차기대미지}`;
        document.getElementById('날라차기대미지표시').textContent = `대미지: ${내펫.날라차기대미지}`;

        // 적 대미지 표시
        document.getElementById('적주먹대미지표시').textContent = `대미지: ${상대펫.주먹대미지}`;
        document.getElementById('적발차기대미지표시').textContent = `대미지: ${상대펫.발차기대미지}`;
        document.getElementById('적날라차기대미지표시').textContent = `대미지: ${상대펫.날라차기대미지}`;

        // HP 초기화
        this.HP업데이트('왼쪽', 내펫.HP, 내펫.HP);
        this.HP업데이트('오른쪽', 상대펫.HP, 상대펫.HP);

        // 버튼 활성화
        document.querySelectorAll('.battle-action-btn').forEach(btn => {
            btn.classList.remove('selected', 'disabled');
        });

        // 시스템 버튼 초기화
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.borderColor = 'rgba(255,255,255,.06)';
        });

        // 연출 요소 리셋
        document.getElementById('KO연출')?.classList.remove('show');
        document.getElementById('라운드연출')?.classList.remove('show');
        // 오라 리셋
        document.getElementById('왼쪽오라')?.classList.remove('active');
        document.getElementById('오른쪽오라')?.classList.remove('active');
    },

    HP업데이트(쪽, 현재HP, 최대HP) {
        const 바 = document.getElementById(`전투${쪽}HP`);
        const 텍스트 = document.getElementById(`전투${쪽}HP텍스트`);
        const 비율 = Math.max(0, 현재HP / 최대HP * 100);
        바.style.width = 비율 + '%';
        텍스트.textContent = `${Math.max(0, 현재HP)} / ${최대HP}`;
        // low HP 깜빡임
        if (비율 <= 30 && 비율 > 0) {
            바.classList.add('low');
        } else {
            바.classList.remove('low');
        }
    },

    전투메시지표시(텍스트, 색 = '#ffe080') {
        const msg = document.getElementById('전투메시지');
        const txt = document.getElementById('전투메시지텍스트');
        txt.textContent = 텍스트;
        txt.style.color = 색;
        msg.classList.remove('show');
        void msg.offsetWidth; // 리플로우
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 1500);
    },

    대미지팝업(쪽, 대미지, 스킬여부 = false) {
        const 필드 = document.querySelector('.battle-field');
        const popup = document.createElement('div');
        popup.className = `battle-damage ${스킬여부 ? 'skill' : ''} show`;
        popup.textContent = `-${대미지}`;
        popup.style.left = 쪽 === '왼쪽' ? '240px' : '940px';
        popup.style.top = '200px';
        필드.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    },

    전투플래시() {
        const 플래시 = document.getElementById('전투플래시');
        플래시.classList.remove('flash');
        void 플래시.offsetWidth;
        플래시.classList.add('flash');
    },

    시스템선택표시(선택) {
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            if (btn.dataset.sys === 선택) {
                btn.style.opacity = '1';
                btn.style.borderColor = 'rgba(255,255,255,.4)';
                btn.classList.add('flash');
                setTimeout(() => btn.classList.remove('flash'), 1000);
            } else {
                btn.style.opacity = '0.3';
                btn.style.borderColor = 'rgba(255,255,255,.03)';
            }
        });
    },

    // 시스템 3개 버튼 동시 번쩍임 (무엇을 선택했는지 안 보여줌)
    시스템전체번쩍임() {
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.classList.add('flash');
            setTimeout(() => {
                btn.classList.remove('flash');
                btn.style.opacity = '0.4';
            }, 1000);
        });
    },

    스킬컷씬표시(펫, 콜백) {
        const 컷씬 = document.getElementById('스킬컷씬');
        const 얼굴 = document.getElementById('스킬얼굴');
        const 이름 = document.getElementById('스킬이름표시');

        얼굴.innerHTML = '';
        얼굴.style.background = `radial-gradient(ellipse, ${펫.배경색}, #0a0818)`;
        얼굴.style.borderColor = 펫.색상;
        얼굴.appendChild(펫렌더러.그리기(펫, 200));
        이름.textContent = 펫.스킬이름;
        이름.style.color = 펫.색상;
        이름.style.textShadow = `0 2px 12px ${펫.색상}80, 0 0 30px ${펫.색상}40`;

        컷씬.classList.add('show');
        setTimeout(() => {
            컷씬.classList.remove('show');
            if (콜백) 콜백();
        }, 1500);
    },

    // 라운드 시작 연출
    라운드연출(텍스트, 콜백) {
        const el = document.getElementById('라운드연출');
        const txt = document.getElementById('라운드텍스트');
        txt.textContent = 텍스트;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => {
            el.classList.remove('show');
            if (콜백) 콜백();
        }, 1200);
    },

    // KO 연출
    KO연출(콜백) {
        const el = document.getElementById('KO연출');
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => {
            if (콜백) 콜백();
        }, 2500);
        // 유지 (화면전환 시 알아서 사라짐)
    },

    // 화면 흔들림
    화면흔들림() {
        const game = document.getElementById('game');
        game.classList.remove('screen-shake');
        void game.offsetWidth;
        game.classList.add('screen-shake');
        setTimeout(() => game.classList.remove('screen-shake'), 400);
    },

    // 히트 이펙트 (충돌 지점에 SVG 폭발)
    히트이펙트(x, y) {
        const 필드 = document.querySelector('.battle-field');
        const el = document.createElement('div');
        el.className = 'hit-effect show';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.innerHTML = `<svg width="100" height="100" viewBox="0 0 100 100">
            <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" fill="#ffe040" opacity=".8"/>
            <polygon points="50,20 57,40 80,40 62,52 69,75 50,60 31,75 38,52 20,40 43,40" fill="#fff" opacity=".6"/>
        </svg>`;
        필드.appendChild(el);
        setTimeout(() => el.remove(), 500);
    },

    // ===== 결과 화면 =====
    결과화면생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '결과화면';
        div.innerHTML = `
            <div class="result-bg" id="결과배경"></div>
            <div class="result-body">
                <div class="result-title" id="결과타이틀"></div>
                <div class="result-pet" id="결과펫"></div>
                <div id="결과설명" style="font-size:16px;color:#c0b8d8;text-align:center"></div>
                <div style="display:flex;gap:12px">
                    <button class="result-btn retry" id="결과다시">다시 하기</button>
                    <button class="result-btn next" id="결과타이틀로">타이틀로</button>
                </div>
            </div>
            <div class="vignette"></div>
            <canvas class="particle-canvas" id="결과파티클"></canvas>
        `;
        return div;
    },

    결과표시(승리, 내펫, 상대펫, 다시콜백, 타이틀콜백) {
        const 배경 = document.getElementById('결과배경');
        const 타이틀 = document.getElementById('결과타이틀');
        const 펫영역 = document.getElementById('결과펫');
        const 설명 = document.getElementById('결과설명');

        배경.className = `result-bg ${승리 ? 'win' : 'lose'}`;
        타이틀.className = `result-title ${승리 ? 'win' : 'lose'}`;
        타이틀.textContent = 승리 ? '승리!' : '패배...';

        펫영역.innerHTML = '';
        펫영역.appendChild(펫렌더러.그리기(내펫, 180));

        if (승리) {
            설명.textContent = `${내펫.이름}이(가) ${상대펫.이름}을(를) 쓰러뜨렸습니다!`;
        } else {
            설명.textContent = `${상대펫.이름}에게 패배했습니다...`;
        }

        document.getElementById('결과다시').onclick = 다시콜백;
        document.getElementById('결과타이틀로').onclick = 타이틀콜백;

        // 승리 파티클
        if (승리) this.결과파티클시작();
    },

    결과파티클시작() {
        const canvas = document.getElementById('결과파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;
        const 입자들 = [];
        for (let i = 0; i < 80; i++) {
            입자들.push({
                x: Math.random() * 1280,
                y: -20 - Math.random() * 200,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 1,
                크기: Math.random() * 4 + 2,
                색: ['#ffc040', '#ff6020', '#ff4020', '#ffe080', '#ffa040'][Math.floor(Math.random() * 5)],
                회전: Math.random() * 360,
                회전속도: (Math.random() - 0.5) * 5
            });
        }
        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            입자들.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.회전 += p.회전속도;
                if (p.y > 740) { p.y = -20; p.x = Math.random() * 1280; }
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.회전 * Math.PI / 180);
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = p.색;
                ctx.fillRect(-p.크기 / 2, -p.크기 / 2, p.크기, p.크기);
                ctx.restore();
            });
            ctx.globalAlpha = 1;
            if (document.getElementById('결과화면')?.classList.contains('active')) {
                requestAnimationFrame(그리기);
            }
        };
        그리기();
    }
};
