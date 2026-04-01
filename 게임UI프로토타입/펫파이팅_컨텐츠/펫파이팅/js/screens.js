// screens.js - 화면 렌더링
const 화면 = {

    // ===== 타이틀 화면 =====
    타이틀생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '타이틀화면';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div class="title-bg"></div>
            <div class="title-nebula"></div>
            <div class="title-burst"></div>
            <div class="title-glow-l"></div>
            <div class="title-glow-r"></div>
            <div class="title-clash"></div>
            <div class="title-floor"></div>
            <div class="title-speedlines" id="타이틀스피드라인"></div>
            <div class="title-pets left" id="타이틀왼쪽펫"></div>
            <div class="title-pets right" id="타이틀오른쪽펫"></div>
            <div class="title-vs-spark" id="타이틀VS">VS</div>
            <div class="title-text-area" id="타이틀텍스트">
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
            <div class="title-impact-flash" id="타이틀임팩트"></div>
            <div class="title-impact-ring" id="타이틀링"></div>
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

        // V자 대형: 리더가 앞쪽 중앙, 나머지가 뒤쪽에 펼쳐짐
        // 리더는 기울임(transform)으로 돌진 자세
        const 왼쪽팀 = [
            { id: 1, 크기: 340, x: 140, y: 10, z: 3, 리더: true, 딜레이: 0.6 },   // 불곰 - 앞쪽
            { id: 7, 크기: 230, x: -20, y: 50, z: 2, 리더: false, 딜레이: 0.9 },  // 독사킹 - 뒤 왼쪽
            { id: 8, 크기: 200, x: 320, y: 60, z: 1, 리더: false, 딜레이: 1.1 },  // 폭탄쥐 - 뒤 오른쪽
        ];
        const 오른쪽팀 = [
            { id: 4, 크기: 340, x: 140, y: 10, z: 3, 리더: true, 딜레이: 0.7 },   // 독수리왕 - 앞쪽
            { id: 5, 크기: 230, x: -20, y: 40, z: 2, 리더: false, 딜레이: 1.0 },  // 그림자고양이 - 뒤 왼쪽
            { id: 6, 크기: 200, x: 320, y: 60, z: 1, 리더: false, 딜레이: 1.2 },  // 철갑거북 - 뒤 오른쪽
        ];

        왼쪽.innerHTML = '';
        오른쪽.innerHTML = '';

        왼쪽팀.forEach(cfg => {
            const 펫 = 게임데이터.펫찾기(cfg.id);
            if (!펫) return;
            const wrap = document.createElement('div');
            wrap.className = 'title-pet-wrap';
            wrap.style.position = 'absolute';
            wrap.style.bottom = cfg.y + 'px';
            wrap.style.left = cfg.x + 'px';
            wrap.style.zIndex = cfg.z;
            wrap.style.setProperty('--delay', cfg.딜레이 + 's');
            wrap.style.setProperty('--dur', cfg.리더 ? '.7s' : '.5s');
            // 리더는 앞으로 살짝 기울임 (돌진 느낌)
            if (cfg.리더) wrap.style.transform = 'rotate(3deg)';

            const el = 펫렌더러.그리기(펫, cfg.크기, false);
            el.classList.add('title-pet-svg');
            wrap.appendChild(el);
            // 바닥 그림자
            const shadow = document.createElement('div');
            shadow.className = 'title-pet-shadow';
            wrap.appendChild(shadow);
            왼쪽.appendChild(wrap);
        });

        오른쪽팀.forEach(cfg => {
            const 펫 = 게임데이터.펫찾기(cfg.id);
            if (!펫) return;
            const wrap = document.createElement('div');
            wrap.className = 'title-pet-wrap';
            wrap.style.position = 'absolute';
            wrap.style.bottom = cfg.y + 'px';
            wrap.style.right = cfg.x + 'px';
            wrap.style.zIndex = cfg.z;
            wrap.style.setProperty('--delay', cfg.딜레이 + 's');
            wrap.style.setProperty('--dur', cfg.리더 ? '.7s' : '.5s');
            if (cfg.리더) wrap.style.transform = 'rotate(-3deg)';

            const el = 펫렌더러.그리기(펫, cfg.크기, true);
            el.classList.add('title-pet-svg');
            wrap.appendChild(el);
            const shadow = document.createElement('div');
            shadow.className = 'title-pet-shadow';
            wrap.appendChild(shadow);
            오른쪽.appendChild(wrap);
        });
    },

    // 타이틀 입장 연출 시퀀스
    async 타이틀연출시작() {
        const 텍스트 = document.getElementById('타이틀텍스트');
        const 임팩트 = document.getElementById('타이틀임팩트');
        const 링 = document.getElementById('타이틀링');
        const 프레스 = document.getElementById('타이틀시작');
        const vs = document.getElementById('타이틀VS');
        const 왼쪽펫들 = document.querySelectorAll('#타이틀왼쪽펫 .title-pet-wrap');
        const 오른쪽펫들 = document.querySelectorAll('#타이틀오른쪽펫 .title-pet-wrap');

        // 초기화
        텍스트.classList.remove('show', 'entrance');
        프레스.classList.remove('show');
        vs.classList.remove('show');
        임팩트.classList.remove('show');
        링.classList.remove('show');
        왼쪽펫들.forEach(el => { el.classList.remove('slide-in-l', 'idle', 'idle-leader'); el.style.opacity = '0'; });
        오른쪽펫들.forEach(el => { el.classList.remove('slide-in-r', 'idle', 'idle-leader'); el.style.opacity = '0'; });

        // 0.3초 대기 (배경만 보임)
        await new Promise(r => setTimeout(r, 300));

        // 1) 타이틀 슬램 등장 + 임팩트 플래시
        텍스트.classList.add('show', 'entrance');
        setTimeout(() => {
            임팩트.classList.add('show');
            링.classList.add('show');
            // 스피드라인 생성
            this._타이틀스피드라인();
        }, 350);

        // 2) 펫들 시차 슬라이드 (타이틀 0.6초 후부터)
        왼쪽펫들.forEach((el, i) => {
            el.classList.add('slide-in-l');
        });
        오른쪽펫들.forEach((el, i) => {
            el.classList.add('slide-in-r');
        });

        // 3) VS 등장 (1.2초 후)
        setTimeout(() => vs.classList.add('show'), 1200);

        // 4) 모든 펫 등장 완료 후 idle 시작 + PRESS START (1.8초 후)
        setTimeout(() => {
            왼쪽펫들.forEach((el, i) => {
                el.style.opacity = '1';
                el.classList.remove('slide-in-l');
                el.classList.add(i === 0 ? 'idle-leader' : 'idle');
                el.style.animationDelay = (i * 0.3) + 's';
            });
            오른쪽펫들.forEach((el, i) => {
                el.style.opacity = '1';
                el.classList.remove('slide-in-r');
                el.classList.add(i === 0 ? 'idle-leader' : 'idle');
                el.style.animationDelay = (i * 0.3 + 0.15) + 's';
            });
            프레스.classList.add('show');
        }, 1800);
    },

    _타이틀스피드라인() {
        const container = document.getElementById('타이틀스피드라인');
        if (!container) return;
        container.innerHTML = '';
        container.classList.remove('show');
        void container.offsetWidth;
        container.classList.add('show');
        for (let i = 0; i < 20; i++) {
            const line = document.createElement('div');
            line.className = 'title-speedline';
            line.style.top = (Math.random() * 720) + 'px';
            line.style.left = (Math.random() * 400 + 440) + 'px';
            line.style.width = (Math.random() * 200 + 100) + 'px';
            line.style.animationDelay = (Math.random() * 0.2) + 's';
            container.appendChild(line);
        }
    },

    타이틀파티클시작() {
        const canvas = document.getElementById('타이틀파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;

        const 입자들 = [];
        // 불꽃 파티클 (위로 올라감)
        for (let i = 0; i < 40; i++) {
            입자들.push({
                x: Math.random() * 1280, y: Math.random() * 720,
                vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 1.2 - 0.3,
                크기: Math.random() * 2.5 + 0.5, 투명: Math.random() * 0.4 + 0.1,
                색: ['#ff6030', '#ffc040', '#ff4020'][Math.floor(Math.random() * 3)],
                타입: 'fire'
            });
        }
        // 먼지 파티클 (바닥에서 천천히)
        for (let i = 0; i < 20; i++) {
            입자들.push({
                x: Math.random() * 1280, y: 600 + Math.random() * 120,
                vx: (Math.random() - 0.5) * 0.8, vy: -Math.random() * 0.5 - 0.1,
                크기: Math.random() * 2 + 1, 투명: Math.random() * 0.15 + 0.05,
                색: '#c0a060', 타입: 'dust'
            });
        }
        // 에너지 스파크 (빠르게 흩날림)
        for (let i = 0; i < 15; i++) {
            const 쪽 = Math.random() < 0.5 ? -1 : 1;
            입자들.push({
                x: 640 + 쪽 * (Math.random() * 100), y: 300 + Math.random() * 200,
                vx: 쪽 * (Math.random() * 2 + 1), vy: (Math.random() - 0.5) * 2,
                크기: Math.random() * 1.5 + 0.5, 투명: Math.random() * 0.6 + 0.2,
                색: ['#ffc040', '#fff', '#80c0ff'][Math.floor(Math.random() * 3)],
                타입: 'spark', 수명: Math.random()
            });
        }

        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            입자들.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.타입 === 'fire') {
                    if (p.y < -10) { p.y = 730; p.x = Math.random() * 1280; }
                } else if (p.타입 === 'dust') {
                    if (p.y < 550) { p.y = 650 + Math.random() * 70; p.x = Math.random() * 1280; }
                } else if (p.타입 === 'spark') {
                    p.수명 -= 0.008;
                    if (p.수명 <= 0) {
                        const 쪽 = Math.random() < 0.5 ? -1 : 1;
                        p.x = 640 + 쪽 * (Math.random() * 100);
                        p.y = 300 + Math.random() * 200;
                        p.vx = 쪽 * (Math.random() * 2 + 1);
                        p.vy = (Math.random() - 0.5) * 2;
                        p.수명 = Math.random();
                    }
                    p.투명 = p.수명 * 0.6;
                }
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

    // ===== 인트로 씬 =====
    인트로생성() {
        const div = document.createElement('div');
        div.className = 'screen';
        div.id = '인트로화면';
        div.innerHTML = `
            <div class="intro-scene">
                <div class="intro-letterbox-top"></div>
                <div class="intro-letterbox-bot"></div>
                <canvas class="intro-canvas" id="인트로캔버스" width="1280" height="720"></canvas>
                <div class="intro-cut" id="인트로컷1"></div>
                <div class="intro-cut" id="인트로컷2"></div>
                <div class="intro-cut" id="인트로컷3"></div>
                <div class="intro-cut" id="인트로컷4"></div>
                <div class="intro-narr" id="인트로내레이션"></div>
                <div class="intro-flash" id="인트로플래시"></div>
                <div class="intro-skip" id="인트로스킵">건너뛰기 ▶</div>
            </div>
        `;
        return div;
    },

    인트로표시(펫목록, 콜백) {
        let 중단됨 = false;
        let 애니프레임 = null;
        let 현재컷 = 0;
        let 컷스킵 = null; // 현재 컷의 resolve 함수

        const 플래시 = () => { const el = document.getElementById('인트로플래시'); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); };
        const 내레이션 = (텍스트) => {
            const el = document.getElementById('인트로내레이션');
            el.classList.remove('show');
            el.textContent = 텍스트;
            setTimeout(() => el.classList.add('show'), 50);
        };
        const 내레이션숨김 = () => { document.getElementById('인트로내레이션').classList.remove('show'); };
        const 컷전환 = (번호) => {
            현재컷 = 번호;
            for (let i = 1; i <= 4; i++) {
                const el = document.getElementById('인트로컷' + i);
                if (el) { el.classList.toggle('active', i === 번호); if (i !== 번호) el.innerHTML = ''; }
            }
            내레이션숨김();
        };
        // 컷이 끝날 때까지 대기 (클릭하면 즉시 resolve)
        const 컷대기 = () => new Promise(r => { 컷스킵 = r; });

        // 캔버스 배경
        const canvas = document.getElementById('인트로캔버스');
        const ctx = canvas.getContext('2d');
        const 별들 = [];
        for (let i = 0; i < 120; i++) {
            별들.push({ x: Math.random() * 1280, y: Math.random() * 720, 크기: Math.random() * 2 + 0.5,
                밝기: Math.random(), 속도: Math.random() * 0.01 + 0.003, 위상: Math.random() * Math.PI * 2 });
        }
        let 배경밝기 = 0;
        let 프레임 = 0;
        const 캔버스그리기 = () => {
            프레임++;
            ctx.fillStyle = 'rgba(4,2,8,1)';
            ctx.fillRect(0, 0, 1280, 720);
            별들.forEach(s => {
                ctx.globalAlpha = Math.min(1, s.밝기 * (Math.sin(프레임 * s.속도 + s.위상) * 0.4 + 0.6) * 배경밝기);
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(s.x, s.y, s.크기, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 배경밝기 * 0.15;
            const grd = ctx.createRadialGradient(640, 360, 0, 640, 360, 500);
            grd.addColorStop(0, '#2a1860'); grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd; ctx.fillRect(0, 0, 1280, 720);
            ctx.globalAlpha = 1;
            if (!중단됨) 애니프레임 = requestAnimationFrame(캔버스그리기);
        };
        캔버스그리기();

        // 화면 클릭 → 다음 컷
        const 화면 = document.getElementById('인트로화면');
        const 클릭핸들러 = (e) => {
            if (e.target.closest('.intro-skip')) return; // 건너뛰기 버튼 제외
            if (컷스킵) { const fn = 컷스킵; 컷스킵 = null; fn(); }
        };
        화면.addEventListener('click', 클릭핸들러);

        // 건너뛰기 (전체 스킵)
        document.getElementById('인트로스킵').onclick = () => { 중단됨 = true; 콜백(); };

        // === 각 컷을 함수로 분리 ===
        const 컷1 = async () => {
            컷전환(1);
            배경밝기 = 0;
            const 밝기업 = setInterval(() => { 배경밝기 = Math.min(1, 배경밝기 + 0.02); }, 50);
            setTimeout(() => 내레이션('오래전부터... 이 세계의 동물들에게는 특별한 힘이 깃들어 있었다'), 500);
            await 컷대기(); // 자동 or 클릭
            clearInterval(밝기업); 배경밝기 = 1;
        };
        // CUT1 자동 진행 (3.5초)
        const 컷1자동 = () => setTimeout(() => { if (현재컷 === 1 && 컷스킵) 컷스킵(); }, 3500);

        const 컷2 = async () => {
            컷전환(2);
            const 컷el = document.getElementById('인트로컷2');
            내레이션('불, 전기, 금속, 독... 서로 다른 힘은 충돌을 부른다');
            // 속성 아이콘 한꺼번에 빠르게
            const 속성들 = [
                { 글자: '🔥', 색: '#ff4020', x: 320, y: 280 },
                { 글자: '⚡', 색: '#40a0ff', x: 540, y: 240 },
                { 글자: '⚙️', 색: '#c0a030', x: 740, y: 280 },
                { 글자: '☠️', 색: '#50b060', x: 960, y: 240 },
            ];
            속성들.forEach((a, i) => {
                setTimeout(() => {
                    if (현재컷 !== 2) return;
                    const el = document.createElement('div');
                    el.className = 'intro-elem';
                    el.textContent = a.글자; el.style.left = a.x + 'px'; el.style.top = a.y + 'px'; el.style.color = a.색;
                    컷el.appendChild(el);
                    const ring = document.createElement('div');
                    ring.className = 'intro-elem-ring';
                    ring.style.left = (a.x - 20) + 'px'; ring.style.top = (a.y - 20) + 'px'; ring.style.borderColor = a.색;
                    컷el.appendChild(ring);
                    requestAnimationFrame(() => { el.classList.add('pop'); ring.classList.add('expand'); });
                    플래시();
                }, i * 400);
            });
            // 실루엣 돌진 (1.8초 후)
            setTimeout(() => {
                if (현재컷 !== 2) return;
                const 왼 = document.createElement('div'); 왼.className = 'intro-sil left';
                왼.appendChild(펫렌더러.그리기(펫목록[0], 250, false)); 컷el.appendChild(왼);
                const 오 = document.createElement('div'); 오.className = 'intro-sil right';
                오.appendChild(펫렌더러.그리기(펫목록[1], 250, false)); 컷el.appendChild(오);
                requestAnimationFrame(() => { 왼.classList.add('rush-l'); 오.classList.add('rush-r'); });
                setTimeout(() => { if (현재컷 === 2) 플래시(); }, 400);
            }, 1800);
            await 컷대기();
        };
        const 컷2자동 = () => setTimeout(() => { if (현재컷 === 2 && 컷스킵) 컷스킵(); }, 3500);

        const 컷3 = async () => {
            컷전환(3); 배경밝기 = 0.3;
            const 컷el = document.getElementById('인트로컷3');
            const arena = document.createElement('div'); arena.className = 'intro-arena';
            arena.innerHTML = `<svg width="500" height="200" viewBox="0 0 500 200">
                <ellipse cx="250" cy="160" rx="240" ry="40" fill="none" stroke="rgba(255,200,100,.4)" stroke-width="2"/>
                <ellipse cx="250" cy="160" rx="200" ry="30" fill="none" stroke="rgba(255,200,100,.2)" stroke-width="1"/>
                <rect x="50" y="80" width="400" height="80" rx="8" fill="rgba(40,20,10,.6)" stroke="rgba(255,160,40,.3)" stroke-width="1"/>
                <line x1="50" y1="80" x2="10" y2="40" stroke="rgba(255,160,40,.2)" stroke-width="1"/>
                <line x1="450" y1="80" x2="490" y2="40" stroke="rgba(255,160,40,.2)" stroke-width="1"/>
                <rect x="10" y="40" width="480" height="40" rx="4" fill="rgba(30,15,8,.5)" stroke="rgba(255,160,40,.25)" stroke-width="1"/>
                <text x="250" y="130" text-anchor="middle" fill="rgba(255,200,100,.5)" font-size="16" font-weight="bold" letter-spacing="8">ARENA</text>
            </svg>`; 컷el.appendChild(arena);
            const spotL = document.createElement('div'); spotL.className = 'intro-spotlight';
            spotL.style.left = '100px'; spotL.style.background = 'linear-gradient(180deg, rgba(255,200,60,.3), transparent 60%)'; 컷el.appendChild(spotL);
            const spotR = document.createElement('div'); spotR.className = 'intro-spotlight';
            spotR.style.right = '100px'; spotR.style.background = 'linear-gradient(180deg, rgba(255,200,60,.3), transparent 60%)'; 컷el.appendChild(spotR);
            setTimeout(() => { if (현재컷 === 3) { arena.classList.add('rise'); 내레이션('그래서 탄생한 전설의 대회—'); } }, 200);
            setTimeout(() => { if (현재컷 === 3) { spotL.classList.add('on'); spotR.classList.add('on'); 배경밝기 = 0.7; } }, 1000);
            await 컷대기();
            플래시();
        };
        const 컷3자동 = () => setTimeout(() => { if (현재컷 === 3 && 컷스킵) 컷스킵(); }, 3000);

        const 컷4 = async () => {
            컷전환(4); 배경밝기 = 0.5;
            const 컷el = document.getElementById('인트로컷4');
            const lineup = document.createElement('div'); lineup.className = 'intro-lineup'; 컷el.appendChild(lineup);
            const petEls = [];
            펫목록.forEach(펫 => {
                const wrap = document.createElement('div'); wrap.className = 'intro-pet-reveal';
                const svg = 펫렌더러.그리기(펫, 200, false); svg.classList.add('intro-pet-sil'); wrap.appendChild(svg);
                const name = document.createElement('div'); name.className = 'pet-name';
                name.textContent = 펫.이름; name.style.color = 펫.색상; wrap.appendChild(name);
                lineup.appendChild(wrap); petEls.push(wrap);
            });
            내레이션('최후의 챔피언은... 누구인가?');
            // 순차 등장
            petEls.forEach((el, i) => {
                setTimeout(() => {
                    if (현재컷 !== 4) return;
                    el.classList.add('show');
                    setTimeout(() => { if (현재컷 === 4) { el.classList.add('color'); 플래시(); } }, 250);
                }, i * 500);
            });
            await 컷대기();
        };
        const 컷4자동 = () => setTimeout(() => { if (현재컷 === 4 && 컷스킵) 컷스킵(); }, 4500);

        // === 시퀀스 실행 ===
        const 실행 = async () => {
            컷1자동(); await 컷1(); if (중단됨) return;
            컷2자동(); await 컷2(); if (중단됨) return;
            컷3자동(); await 컷3(); if (중단됨) return;
            컷4자동(); await 컷4(); if (중단됨) return;
            내레이션숨김();
            화면.removeEventListener('click', 클릭핸들러);
            콜백();
        };
        실행();

        return () => {
            중단됨 = true;
            화면.removeEventListener('click', 클릭핸들러);
            if (애니프레임) cancelAnimationFrame(애니프레임);
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
            <div class="select-detail" id="선택상세">
                <div class="select-portrait-big" id="선택큰초상화">
                    <div class="select-portrait-aura" id="선택오라"></div>
                    <div class="select-portrait-ring" id="선택링"></div>
                    <div class="select-portrait-lines" id="선택라인"></div>
                    <div class="select-portrait-flash" id="선택플래시"></div>
                    <div class="select-empty-prompt">캐릭터를 선택하세요</div>
                </div>
                <div class="select-info" id="선택정보" style="opacity:0">
                    <div class="select-pet-name" id="선택펫이름"></div>
                    <div class="select-pet-story" id="선택펫스토리"></div>
                    <div class="select-divider"></div>
                    <div class="select-stats" id="선택스탯"></div>
                    <div class="select-skills-area" id="선택스킬영역"></div>
                </div>
            </div>
            <div class="select-footer">
                <div class="select-thumbs" id="선택썸네일목록"></div>
                <button class="select-confirm disabled" id="선택확인버튼">선택</button>
            </div>
            <div class="vignette"></div>
        `;
        return div;
    },

    캐릭터선택초기화(선택콜백) {
        const 목록 = document.getElementById('선택썸네일목록');
        const 큰초상화 = document.getElementById('선택큰초상화');
        const 정보 = document.getElementById('선택정보');
        const 이름 = document.getElementById('선택펫이름');
        const 스토리 = document.getElementById('선택펫스토리');
        const 스탯 = document.getElementById('선택스탯');
        const 스킬영역 = document.getElementById('선택스킬영역');
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
                목록.querySelectorAll('.select-thumb').forEach(t => t.classList.remove('selected'));
                썸.classList.add('selected');
                선택된펫 = 펫;

                // 안내 텍스트 숨기고 정보 표시
                const 안내 = 큰초상화.querySelector('.select-empty-prompt');
                if (안내) 안내.style.display = 'none';
                정보.style.opacity = '1';

                // 정보 업데이트 + 등장 연출
                큰초상화.style.background = `radial-gradient(ellipse, ${펫.배경색}, #0a0818)`;
                // 기존 펫 제거
                const 기존펫 = 큰초상화.querySelector('.pet-wrap');
                if (기존펫) 기존펫.remove();
                const 새SVG = 펫렌더러.그리기(펫, 340);
                큰초상화.appendChild(새SVG);

                // 펫별 고유 등장 애니메이션
                const 등장클래스 = 'portrait-pet-' + 펫.id;
                const 등장시간 = { 1: 550, 4: 600, 5: 700, 6: 600, 7: 700, 8: 650 };
                requestAnimationFrame(() => 새SVG.classList.add(등장클래스));
                // 등장 끝나면 idle 숨쉬기로 전환
                setTimeout(() => {
                    새SVG.classList.remove(등장클래스);
                    새SVG.classList.add('portrait-idle');
                }, 등장시간[펫.id] || 600);

                // 플래시
                const 플래시 = document.getElementById('선택플래시');
                플래시.classList.remove('show'); void 플래시.offsetWidth; 플래시.classList.add('show');
                // 임팩트 링
                const 링 = document.getElementById('선택링');
                링.classList.remove('show'); void 링.offsetWidth; 링.classList.add('show');
                // 불곰/철갑거북: 착지 흔들림, 폭탄쥐: 이중 플래시
                if (펫.id === 1 || 펫.id === 6) {
                    setTimeout(() => { 큰초상화.style.animation = 'none'; void 큰초상화.offsetWidth;
                        큰초상화.style.animation = 'portraitShake .3s ease-out'; }, 펫.id === 1 ? 250 : 300);
                }
                if (펫.id === 8) {
                    setTimeout(() => { 플래시.classList.remove('show'); void 플래시.offsetWidth; 플래시.classList.add('show'); }, 200);
                }
                // 스피드라인
                const 라인컨테이너 = document.getElementById('선택라인');
                라인컨테이너.innerHTML = '';
                for (let i = 0; i < 8; i++) {
                    const line = document.createElement('div');
                    line.className = 'portrait-line';
                    line.style.top = (80 + Math.random() * 340) + 'px';
                    line.style.left = '0';
                    line.style.width = (100 + Math.random() * 200) + 'px';
                    line.style.transform = `rotate(${(Math.random()-0.5)*10}deg)`;
                    라인컨테이너.appendChild(line);
                }
                라인컨테이너.classList.remove('show'); void 라인컨테이너.offsetWidth; 라인컨테이너.classList.add('show');
                // 오라 (펫 색상)
                const 오라 = document.getElementById('선택오라');
                오라.style.background = `radial-gradient(ellipse, ${펫.색상}50, transparent 65%)`;
                오라.classList.remove('show'); void 오라.offsetWidth; 오라.classList.add('show');

                이름.textContent = 펫.이름;
                이름.style.color = 펫.색상;
                스토리.textContent = 펫.배경스토리;

                const 대미지값 = (v) => {
                    let stars = '';
                    for (let i = 0; i < Math.min(v, 5); i++) stars += '★';
                    for (let i = v; i < 5; i++) stars += '☆';
                    return stars;
                };
                스탯.innerHTML = `
                    <div class="select-stat">
                        <div class="select-stat-icon">✊</div>
                        <div class="select-stat-name">바위</div>
                        <div class="select-stat-stars">${대미지값(펫.바위대미지)}</div>
                    </div>
                    <div class="select-stat">
                        <div class="select-stat-icon">✌️</div>
                        <div class="select-stat-name">가위</div>
                        <div class="select-stat-stars">${대미지값(펫.가위대미지)}</div>
                    </div>
                    <div class="select-stat">
                        <div class="select-stat-icon">🖐️</div>
                        <div class="select-stat-name">보</div>
                        <div class="select-stat-stars">${대미지값(펫.보대미지)}</div>
                    </div>
                    <div class="select-stat">
                        <div class="select-stat-icon">❤️</div>
                        <div class="select-stat-name">체력</div>
                        <div class="select-stat-stars">${대미지값(펫.HP / 2)}</div>
                    </div>
                `;

                const 스킬들 = 게임데이터.펫스킬(펫);
                스킬영역.innerHTML = 스킬들.map(s => `
                    <div class="select-skill">
                        <div class="select-skill-badge ${s.종류 === '패시브' ? 'passive' : 'active'}">${s.종류}</div>
                        <div class="select-skill-name">${s.이름}</div>
                        <div class="select-skill-desc">${s.설명}</div>
                    </div>
                `).join('');

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
            <!-- 대각선 분할 배경 -->
            <div class="vs-diagonal-split">
                <div class="vs-split-left" id="VS분할왼쪽"></div>
                <div class="vs-split-right" id="VS분할오른쪽"></div>
                <div class="vs-split-line"></div>
            </div>
            <!-- 번개/스파크 이펙트 -->
            <div class="vs-lightning" id="VS번개"></div>
            <div class="vs-screen-body">
                <div class="vs-screen-side left">
                    <div class="vs-screen-label">플레이어</div>
                    <div class="vs-screen-portrait" id="VS왼쪽초상화"></div>
                    <div class="vs-screen-name" id="VS왼쪽이름"></div>
                </div>
                <div class="vs-center">
                    <div class="vs-center-text" id="VS텍스트">VS</div>
                    <button class="vs-fight-btn" id="VS대전버튼">FIGHT!</button>
                </div>
                <div class="vs-screen-side right">
                    <div class="vs-screen-label">상대</div>
                    <div class="vs-screen-portrait" id="VS오른쪽초상화"></div>
                    <div class="vs-screen-name" id="VS오른쪽이름"></div>
                </div>
            </div>
            <!-- 플래시 -->
            <div class="vs-flash" id="VS플래시"></div>
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
        const 분할왼 = document.getElementById('VS분할왼쪽');
        const 분할오 = document.getElementById('VS분할오른쪽');

        // 초상화 세팅
        왼쪽초상화.innerHTML = '';
        왼쪽초상화.style.background = `radial-gradient(ellipse, ${내펫.배경색}, #0a0818)`;
        왼쪽초상화.appendChild(펫렌더러.그리기(내펫, 200));
        왼쪽이름.textContent = 내펫.이름;
        왼쪽이름.style.color = 내펫.색상;
        왼쪽이름.style.textShadow = `0 0 20px ${내펫.색상}, 0 2px 8px rgba(0,0,0,.8)`;

        오른쪽초상화.innerHTML = '';
        오른쪽초상화.style.background = `radial-gradient(ellipse, ${상대펫.배경색}, #0a0818)`;
        오른쪽초상화.appendChild(펫렌더러.그리기(상대펫, 200, true));
        오른쪽이름.textContent = 상대펫.이름;
        오른쪽이름.style.color = 상대펫.색상;
        오른쪽이름.style.textShadow = `0 0 20px ${상대펫.색상}, 0 2px 8px rgba(0,0,0,.8)`;

        // 대각선 분할 배경 색상
        분할왼.style.background = `linear-gradient(135deg, ${내펫.색상}15, ${내펫.색상}08 60%, transparent)`;
        분할오.style.background = `linear-gradient(315deg, ${상대펫.색상}15, ${상대펫.색상}08 60%, transparent)`;

        // 연출 시퀀스
        this.VS연출시작(내펫, 상대펫);

        // VS 파티클
        this.VS파티클시작(내펫.색상, 상대펫.색상);

        버튼.onclick = () => 대전콜백();
    },

    VS연출시작(내펫, 상대펫) {
        const VS화면 = document.getElementById('VS화면');
        const 플래시 = document.getElementById('VS플래시');
        const 번개 = document.getElementById('VS번개');

        // Phase 1: 초기 임팩트 플래시 (0ms)
        플래시.classList.add('flash');
        setTimeout(() => 플래시.classList.remove('flash'), 200);

        // Phase 2: 화면 흔들림 + 두 번째 플래시 (300ms)
        setTimeout(() => {
            VS화면.classList.add('vs-shake');
            setTimeout(() => VS화면.classList.remove('vs-shake'), 300);
            플래시.classList.add('flash');
            setTimeout(() => 플래시.classList.remove('flash'), 150);
        }, 300);

        // Phase 3: 번개 이펙트 깜빡임 (500ms~)
        const 번개타이머 = setInterval(() => {
            번개.classList.add('strike');
            setTimeout(() => 번개.classList.remove('strike'), 100);
        }, 800 + Math.random() * 400);

        // 화면 벗어나면 정리
        setTimeout(() => {
            if (!document.getElementById('VS화면')?.classList.contains('active')) {
                clearInterval(번개타이머);
            }
        }, 10000);

        // Phase 4: 주기적 미세 흔들림 (긴장감)
        const 흔들림 = setInterval(() => {
            if (!document.getElementById('VS화면')?.classList.contains('active')) {
                clearInterval(흔들림);
                clearInterval(번개타이머);
                return;
            }
            VS화면.classList.add('vs-micro-shake');
            setTimeout(() => VS화면.classList.remove('vs-micro-shake'), 150);
        }, 2000);
    },

    VS파티클시작(왼색, 오색) {
        const canvas = document.getElementById('VS파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;
        const 입자들 = [];
        // 중앙 충돌 스파크
        for (let i = 0; i < 60; i++) {
            const 각 = Math.random() * Math.PI * 2;
            const 속도 = 1 + Math.random() * 5;
            입자들.push({
                ox: 640, oy: 360,
                x: 640, y: 360,
                vx: Math.cos(각) * 속도,
                vy: Math.sin(각) * 속도,
                크기: Math.random() * 2.5 + 0.5,
                수명: 1,
                감쇠: 0.008 + Math.random() * 0.012,
                색: [왼색 || '#ff4020', 오색 || '#4080ff', '#fff', '#ffe080'][Math.floor(Math.random() * 4)],
                종류: 'spark'
            });
        }
        // 양쪽 대립 에너지 입자
        for (let i = 0; i < 30; i++) {
            입자들.push({
                ox: 0, oy: 0,
                x: Math.random() * 300, y: Math.random() * 720,
                vx: 2 + Math.random() * 3, vy: (Math.random() - 0.5) * 2,
                크기: Math.random() * 3 + 1,
                수명: 1, 감쇠: 0.003,
                색: 왼색 || '#ff4020', 종류: 'energy'
            });
            입자들.push({
                ox: 0, oy: 0,
                x: 980 + Math.random() * 300, y: Math.random() * 720,
                vx: -(2 + Math.random() * 3), vy: (Math.random() - 0.5) * 2,
                크기: Math.random() * 3 + 1,
                수명: 1, 감쇠: 0.003,
                색: 오색 || '#4080ff', 종류: 'energy'
            });
        }

        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            입자들.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.수명 -= p.감쇠;

                if (p.종류 === 'spark') {
                    if (p.수명 <= 0) {
                        p.x = 640 + (Math.random() - 0.5) * 80;
                        p.y = 360 + (Math.random() - 0.5) * 80;
                        const 각 = Math.random() * Math.PI * 2;
                        const 속도 = 1 + Math.random() * 5;
                        p.vx = Math.cos(각) * 속도;
                        p.vy = Math.sin(각) * 속도;
                        p.수명 = 1;
                    }
                    ctx.globalAlpha = p.수명 * 0.8;
                    ctx.fillStyle = p.색;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = p.색;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    if (p.x < -20 || p.x > 1300 || p.수명 <= 0) {
                        p.x = p.vx > 0 ? Math.random() * 200 : 1080 + Math.random() * 200;
                        p.y = Math.random() * 720;
                        p.수명 = 1;
                    }
                    ctx.globalAlpha = p.수명 * 0.5;
                    ctx.fillStyle = p.색;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.색;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                    ctx.fill();
                    // 꼬리
                    ctx.globalAlpha = p.수명 * 0.2;
                    ctx.strokeStyle = p.색;
                    ctx.lineWidth = p.크기 * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
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
            <canvas class="battle-stage-canvas" id="스테이지캔버스" width="1280" height="720"></canvas>
            <div class="battle-arena"></div>
            <div class="battle-energy-left"></div>
            <div class="battle-energy-right"></div>
            <!-- 상단 HUD: HP 게이지 + 이름 + VS -->
            <div class="battle-hud">
                <div class="battle-hud-side left">
                    <div class="battle-pet-name" id="전투왼쪽이름"></div>
                    <div class="battle-hp-bar">
                        <div class="battle-hp-trail red-trail" id="전투왼쪽HP잔상" style="width:100%"></div>
                        <div class="battle-hp-fill red" id="전투왼쪽HP" style="width:100%"></div>
                        <span class="battle-hp-text" id="전투왼쪽HP텍스트"></span>
                    </div>
                </div>
                <div class="battle-vs">VS</div>
                <div class="battle-hud-side right">
                    <div class="battle-pet-name" id="전투오른쪽이름" style="text-align:right"></div>
                    <div class="battle-hp-bar">
                        <div class="battle-hp-trail blue-trail" id="전투오른쪽HP잔상" style="width:100%"></div>
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
                <div class="battle-action-btn" data-action="바위">
                    <div class="icon">✊</div>
                    <div class="name">바위</div>
                    <div class="dmg" id="바위대미지표시"></div>
                </div>
                <div class="battle-action-btn" data-action="가위">
                    <div class="icon">✌️</div>
                    <div class="name">가위</div>
                    <div class="dmg" id="가위대미지표시"></div>
                </div>
                <div class="battle-action-btn" data-action="보">
                    <div class="icon">🖐️</div>
                    <div class="name">보</div>
                    <div class="dmg" id="보대미지표시"></div>
                </div>
            </div>
            <!-- 오른쪽 하단: 시스템(상대) 버튼 표시 -->
            <div class="battle-actions right" id="시스템선택표시">
                <div class="battle-sys-btn" data-sys="바위">
                    <div class="icon">✊</div>
                    <div class="name">바위</div>
                    <div class="dmg" id="적바위대미지표시"></div>
                </div>
                <div class="battle-sys-btn" data-sys="가위">
                    <div class="icon">✌️</div>
                    <div class="name">가위</div>
                    <div class="dmg" id="적가위대미지표시"></div>
                </div>
                <div class="battle-sys-btn" data-sys="보">
                    <div class="icon">🖐️</div>
                    <div class="name">보</div>
                    <div class="dmg" id="적보대미지표시"></div>
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
            <!-- 스킬 미니 연출은 JS에서 동적 생성 (skill-mini-pop) -->
            <!-- 스킬 컷씬 (하이퍼 콤보 스타일) -->
            <div class="skill-cutscene" id="스킬컷씬">
                <div class="skill-cutscene-bg">
                    <div class="skill-bg-tint" id="스킬배경틴트"></div>
                    <div class="skill-speedlines"></div>
                    <div class="skill-speedlines delayed"></div>
                    <div class="skill-slash-lines">
                        <div class="skill-slash s1"></div>
                        <div class="skill-slash s2"></div>
                        <div class="skill-slash s3"></div>
                    </div>
                    <div class="skill-burst" id="스킬버스트"></div>
                </div>
                <div class="skill-portrait-area">
                    <div class="skill-face" id="스킬얼굴"></div>
                    <div class="skill-face-flash" id="스킬얼굴플래시"></div>
                </div>
                <div class="skill-text-area">
                    <div class="skill-badge-display" id="스킬뱃지">ACTIVE SKILL</div>
                    <div class="skill-name-display" id="스킬이름표시"></div>
                    <div class="skill-desc-display" id="스킬효과표시"></div>
                    <div class="skill-name-shadow" id="스킬이름그림자"></div>
                </div>
                <div class="skill-ink-splash" id="스킬잉크"></div>
                <div class="skill-flash-overlay" id="스킬플래시"></div>
                <canvas class="skill-spark-canvas" id="스킬스파크캔버스"></canvas>
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
        document.getElementById('바위대미지표시').textContent = `대미지: ${내펫.바위대미지}`;
        document.getElementById('가위대미지표시').textContent = `대미지: ${내펫.가위대미지}`;
        document.getElementById('보대미지표시').textContent = `대미지: ${내펫.보대미지}`;

        // 적 대미지 표시
        document.getElementById('적바위대미지표시').textContent = `대미지: ${상대펫.바위대미지}`;
        document.getElementById('적가위대미지표시').textContent = `대미지: ${상대펫.가위대미지}`;
        document.getElementById('적보대미지표시').textContent = `대미지: ${상대펫.보대미지}`;

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

        // 스테이지 배경 시작 (상대 펫 기준)
        스테이지.시작(상대펫);

        // 연출 요소 리셋
        document.getElementById('KO연출')?.classList.remove('show');
        document.getElementById('라운드연출')?.classList.remove('show');
        // 오라 리셋
        document.getElementById('왼쪽오라')?.classList.remove('active');
        document.getElementById('오른쪽오라')?.classList.remove('active');
    },

    HP업데이트(쪽, 현재HP, 최대HP) {
        const 바 = document.getElementById(`전투${쪽}HP`);
        const 잔상 = document.getElementById(`전투${쪽}HP잔상`);
        const 텍스트 = document.getElementById(`전투${쪽}HP텍스트`);
        const 비율 = Math.max(0, 현재HP / 최대HP * 100);
        // 메인 게이지 즉시 감소
        바.style.width = 비율 + '%';
        텍스트.textContent = `${Math.max(0, 현재HP)} / ${최대HP}`;
        // 잔상 게이지 - 0.4초 딜레이 후 0.8초에 걸쳐 천천히 감소
        if (잔상) {
            setTimeout(() => {
                잔상.style.width = 비율 + '%';
            }, 400);
        }
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
                btn.style.borderColor = 'rgba(255,200,100,.4)';
                btn.classList.add('flash');
                setTimeout(() => btn.classList.remove('flash'), 1000);
            } else {
                btn.style.opacity = '0.3';
                btn.style.borderColor = 'rgba(255,255,255,.03)';
            }
        });
    },

    // 스킬 미니 연출 (패시브/소규모 스킬용 — 어두운 배경 + 큰 텍스트 + 흔들림)
    스킬미니연출(이름, 설명, 색) {
        // CSS 클래스 의존 없이 완전 인라인 방식으로 구현
        const 전투화면 = document.getElementById('전투화면');
        if (!전투화면) return;

        // 이전 오버레이 제거
        const 이전 = 전투화면.querySelector('.skill-mini-pop');
        if (이전) 이전.remove();

        // 새 오버레이 생성 (인라인 스타일만 사용)
        const 오버레이 = document.createElement('div');
        오버레이.className = 'skill-mini-pop';
        Object.assign(오버레이.style, {
            position: 'absolute', inset: '0', zIndex: '200',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'rgba(0,0,0,.65)', pointerEvents: 'none',
            opacity: '0', transition: 'opacity .1s'
        });

        // 스킬 이름
        const 이름el = document.createElement('div');
        Object.assign(이름el.style, {
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: '64px', letterSpacing: '6px', whiteSpace: 'nowrap',
            color: '#fff',
            textShadow: `0 0 30px ${색}, 0 0 60px ${색}80, 0 4px 12px rgba(0,0,0,.9)`,
            WebkitTextStroke: '1px rgba(255,255,255,.2)',
            transform: 'scale(2.5) rotate(-3deg)', opacity: '0',
            transition: 'transform .2s cubic-bezier(.2,1,.3,1), opacity .15s'
        });
        이름el.textContent = 이름;

        // 스킬 설명
        const 설명el = document.createElement('div');
        Object.assign(설명el.style, {
            fontFamily: "'Black Han Sans', sans-serif",
            fontSize: '24px', letterSpacing: '3px', whiteSpace: 'nowrap',
            color: 색,
            textShadow: `0 0 15px ${색}80, 0 2px 6px rgba(0,0,0,.9)`,
            transform: 'translateY(10px)', opacity: '0',
            transition: 'transform .25s ease-out .1s, opacity .25s ease-out .1s'
        });
        설명el.textContent = 설명;

        오버레이.appendChild(이름el);
        오버레이.appendChild(설명el);
        전투화면.appendChild(오버레이);

        // 다음 프레임에서 트랜지션 트리거
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                오버레이.style.opacity = '1';
                이름el.style.transform = 'scale(1) rotate(0)';
                이름el.style.opacity = '1';
                설명el.style.transform = 'translateY(0)';
                설명el.style.opacity = '0.9';
            });
        });

        // 플래시 + 흔들림
        this.전투플래시();
        this.화면흔들림();

        // 1.1초 후 제거
        setTimeout(() => {
            오버레이.style.opacity = '0';
            setTimeout(() => 오버레이.remove(), 200);
        }, 1100);
    },

    // 포커싱 전부 제거 (선택 완료 후 뭘 골랐는지 숨김)
    시스템포커싱초기화() {
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            btn.style.opacity = '0.4';
            btn.style.borderColor = 'rgba(255,255,255,.05)';
            btn.style.boxShadow = 'none';
            btn.style.transform = 'scale(1)';
        });
    },

    // 판정 시 적군 선택 공개 — 크고 명확하게
    시스템선택공개(선택) {
        document.querySelectorAll('.battle-sys-btn').forEach(btn => {
            if (btn.dataset.sys === 선택) {
                btn.style.opacity = '1';
                btn.style.borderColor = 'rgba(255,80,80,.9)';
                btn.style.boxShadow = '0 0 24px rgba(255,80,80,.6), inset 0 0 12px rgba(255,80,80,.2)';
                btn.style.transform = 'scale(1.15)';
                btn.style.transition = 'all .15s ease-out';
                btn.classList.add('flash');
                setTimeout(() => btn.classList.remove('flash'), 400);
            } else {
                btn.style.opacity = '0.1';
                btn.style.borderColor = 'rgba(255,255,255,.02)';
                btn.style.boxShadow = 'none';
                btn.style.transform = 'scale(0.9)';
                btn.style.transition = 'all .15s ease-out';
            }
        });
    },

    스킬컷씬표시(펫, 스킬이름, 콜백) {
        const 컷씬 = document.getElementById('스킬컷씬');
        const 얼굴 = document.getElementById('스킬얼굴');
        const 얼굴플래시 = document.getElementById('스킬얼굴플래시');
        const 이름 = document.getElementById('스킬이름표시');
        const 효과 = document.getElementById('스킬효과표시');
        const 그림자 = document.getElementById('스킬이름그림자');
        const 뱃지 = document.getElementById('스킬뱃지');
        const 틴트 = document.getElementById('스킬배경틴트');
        const 버스트 = document.getElementById('스킬버스트');
        const 플래시 = document.getElementById('스킬플래시');
        const 캔버스 = document.getElementById('스킬스파크캔버스');
        const 잉크 = document.getElementById('스킬잉크');

        // 스킬 데이터에서 효과 설명 가져오기
        const 스킬데이터 = 게임데이터.스킬목록().find(s => s.이름 === 스킬이름);
        const 스킬설명 = 스킬데이터 ? 스킬데이터.설명 : '';

        // 펫 색상 기반 세팅
        const 색 = 펫.색상;
        얼굴.innerHTML = '';
        얼굴.style.background = `radial-gradient(ellipse, ${펫.배경색}, #0a0818)`;
        얼굴.style.borderColor = 색;
        얼굴.appendChild(펫렌더러.그리기(펫, 220));
        얼굴플래시.style.borderColor = 색;
        얼굴플래시.style.boxShadow = `0 0 60px ${색}, 0 0 120px ${색}80`;

        이름.textContent = 스킬이름;
        이름.style.color = '#fff';
        이름.style.textShadow = `0 0 20px ${색}, 0 0 40px ${색}80, 0 4px 8px rgba(0,0,0,.8)`;
        그림자.textContent = 스킬이름;
        그림자.style.color = 색;

        // 스킬 효과 설명 세팅
        효과.textContent = 스킬설명;
        효과.style.color = '#fff';
        효과.style.textShadow = `0 0 10px ${색}, 0 2px 4px rgba(0,0,0,.9)`;

        뱃지.style.background = `linear-gradient(90deg, ${색}cc, ${색}60)`;
        뱃지.style.boxShadow = `0 0 20px ${색}40`;

        틴트.style.background = `radial-gradient(ellipse at 30% 50%, ${색}25, transparent 70%)`;
        버스트.style.background = `radial-gradient(circle, ${색}30, ${색}10 30%, transparent 60%)`;

        // 잉크 스플래시 색상 세팅
        잉크.style.background = `radial-gradient(ellipse at 40% 50%, ${색}50, ${색}20 40%, transparent 70%)`;

        // 스파크 파티클 캔버스
        캔버스.width = 1280;
        캔버스.height = 720;
        const ctx = 캔버스.getContext('2d');
        const 속성 = 게임데이터.속성가져오기(펫.속성 || '불');
        const 파티클색 = [...속성.파티클, '#fff', '#ffe080'];
        const 스파크들 = [];

        // 스파크 생성
        for (let i = 0; i < 50; i++) {
            const 각 = Math.random() * Math.PI * 2;
            const 속도 = 3 + Math.random() * 12;
            스파크들.push({
                x: 350, y: 360,
                vx: Math.cos(각) * 속도,
                vy: Math.sin(각) * 속도,
                크기: Math.random() * 3 + 1,
                수명: 0.6 + Math.random() * 0.4,
                감쇠: 0.008 + Math.random() * 0.012,
                색: 파티클색[Math.floor(Math.random() * 파티클색.length)],
                지연: Math.random() * 300
            });
        }

        let 시작시간 = 0;
        const 스파크그리기 = (timestamp) => {
            if (!시작시간) 시작시간 = timestamp;
            const 경과 = timestamp - 시작시간;
            ctx.clearRect(0, 0, 1280, 720);

            스파크들.forEach(s => {
                if (경과 < s.지연) return;
                s.x += s.vx; s.y += s.vy;
                s.vy += 0.1; s.vx *= 0.99;
                s.수명 -= s.감쇠;
                if (s.수명 <= 0) return;

                ctx.globalAlpha = s.수명;
                ctx.fillStyle = s.색;
                ctx.shadowBlur = 6;
                ctx.shadowColor = s.색;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.크기, 0, Math.PI * 2);
                ctx.fill();

                // 꼬리
                ctx.globalAlpha = s.수명 * 0.3;
                ctx.strokeStyle = s.색;
                ctx.lineWidth = s.크기 * 0.5;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
                ctx.stroke();
            });

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            if (컷씬.classList.contains('show')) {
                requestAnimationFrame(스파크그리기);
            }
        };

        // 시퀀스 시작
        컷씬.classList.remove('show', 'phase2', 'phase-shake', 'phase-fadeout');
        잉크.classList.remove('splash');
        효과.classList.remove('shake');
        이름.classList.remove('shake');
        void 컷씬.offsetWidth;

        // Phase 1: 히트스톱 + 등장 (0ms) — 길티기어 스타일 임팩트 프리즈
        컷씬.classList.add('show');
        requestAnimationFrame(스파크그리기);

        // 강렬한 초기 플래시 (이중)
        플래시.classList.add('flash');
        setTimeout(() => 플래시.classList.remove('flash'), 150);
        setTimeout(() => { 플래시.classList.add('flash'); setTimeout(() => 플래시.classList.remove('flash'), 100); }, 200);

        // 잉크 스플래시 등장
        setTimeout(() => 잉크.classList.add('splash'), 50);

        // Phase 2: 줌인 + 텍스트 흔들림 (350ms)
        setTimeout(() => {
            컷씬.classList.add('phase2');
            // 이름 + 효과 텍스트 0.2초 흔들림
            이름.classList.add('shake');
            효과.classList.add('shake');
            setTimeout(() => { 이름.classList.remove('shake'); 효과.classList.remove('shake'); }, 200);
            // 세 번째 임팩트 플래시
            플래시.classList.add('flash');
            setTimeout(() => 플래시.classList.remove('flash'), 120);
            // 강한 화면 흔들림
            this.화면흔들림();
            // 추가 흔들림 (연쇄 임팩트)
            setTimeout(() => this.화면흔들림(), 200);
        }, 350);

        // Phase 3: 페이드아웃 시작 (1500ms)
        setTimeout(() => {
            컷씬.classList.add('phase-fadeout');
        }, 1500);

        // Phase 4: 종료 (1900ms)
        setTimeout(() => {
            컷씬.classList.remove('show', 'phase2', 'phase-shake', 'phase-fadeout');
            잉크.classList.remove('splash');
            ctx.clearRect(0, 0, 1280, 720);
            if (콜백) 콜백();
        }, 1900);
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

    // 히트스톱: 슬로우모션 + 줌인 (액티브 스킬 발동 시)
    히트스톱줌인(방향) {
        const 전투화면 = document.getElementById('전투화면');
        // 줌인 방향: left → 피격자(왼쪽)쪽, right → 피격자(오른쪽)쪽
        const originX = 방향 === 'left' ? '25%' : '75%';
        전투화면.style.transformOrigin = `${originX} 50%`;
        전투화면.classList.add('hitstop-zoom');
        // 모든 애니메이션 슬로우
        전투화면.classList.add('hitstop-slow');
    },

    히트스톱해제() {
        const 전투화면 = document.getElementById('전투화면');
        전투화면.classList.remove('hitstop-zoom');
        전투화면.classList.remove('hitstop-slow');
        // transform 잔여 해제
        전투화면.style.removeProperty('transform');
        전투화면.style.removeProperty('transform-origin');
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
            <!-- KOF 스타일 대각선 컬러 배경 -->
            <div class="result-color-slash" id="결과컬러슬래시"></div>
            <!-- 집중선 -->
            <div class="result-speedlines" id="결과집중선"></div>
            <!-- 패배자 (쓰러진 상태, 바닥) -->
            <div class="result-loser-area" id="결과패자영역">
                <div class="result-loser-pet" id="결과패자펫"></div>
            </div>
            <!-- 승리자 대형 일러스트 (왼쪽) -->
            <div class="result-winner-area" id="결과승자영역">
                <div class="result-winner-pet" id="결과승자펫"></div>
                <div class="result-winner-glow" id="결과승자글로우"></div>
            </div>
            <!-- 오른쪽 텍스트 영역 -->
            <div class="result-text-area">
                <div class="result-badge" id="결과뱃지">WINNER</div>
                <div class="result-winner-name" id="결과승자이름"></div>
                <div class="result-title-kof" id="결과타이틀"></div>
                <div class="result-desc" id="결과설명"></div>
                <div class="result-buttons">
                    <button class="result-btn retry" id="결과다시">다시 하기</button>
                    <button class="result-btn next" id="결과타이틀로">타이틀로</button>
                </div>
            </div>
            <!-- 플래시 -->
            <div class="result-flash" id="결과플래시"></div>
            <div class="vignette"></div>
            <canvas class="particle-canvas" id="결과파티클"></canvas>
        `;
        return div;
    },

    결과표시(승리, 내펫, 상대펫, 다시콜백, 타이틀콜백) {
        // 승리자 = 이긴 펫, 패배자 = 진 펫
        const 승자 = 승리 ? 내펫 : 상대펫;
        const 패자 = 승리 ? 상대펫 : 내펫;
        const 색 = 승자.색상 || '#ffc040';

        // 배경
        const 배경 = document.getElementById('결과배경');
        배경.className = 'result-bg';
        배경.style.background = `radial-gradient(ellipse at 35% 45%, ${색}20, #0a0818 60%, #050410)`;

        // 대각선 컬러 슬래시
        const 슬래시 = document.getElementById('결과컬러슬래시');
        슬래시.style.background = `linear-gradient(135deg, transparent 30%, ${색}15 45%, ${색}08 55%, transparent 70%)`;

        // 집중선
        const 집중선 = document.getElementById('결과집중선');
        집중선.style.background = `conic-gradient(from 0deg at 30% 50%, transparent 0deg, ${색}08 1.5deg, transparent 3deg, transparent 8deg)`;

        // 승리자 글로우
        const 글로우 = document.getElementById('결과승자글로우');
        글로우.style.background = `radial-gradient(circle, ${색}40, ${색}15 40%, transparent 70%)`;
        글로우.style.boxShadow = `0 0 120px ${색}30`;

        // 패배자 쓰러진 상태로 렌더링
        const 패자영역 = document.getElementById('결과패자펫');
        패자영역.innerHTML = '';
        패자영역.appendChild(펫렌더러.그리기(패자, 200));
        패자영역.style.transform = 'rotate(90deg) scaleY(0.8)';
        패자영역.style.opacity = '0.5';
        패자영역.style.filter = 'grayscale(0.6) brightness(0.5)';

        // 승리자 대형 펫 렌더링
        const 펫영역 = document.getElementById('결과승자펫');
        펫영역.innerHTML = '';
        펫영역.appendChild(펫렌더러.그리기(승자, 320));

        // 승리자 이름
        const 이름 = document.getElementById('결과승자이름');
        이름.textContent = 승자.이름;
        이름.style.color = 색;
        이름.style.textShadow = `0 0 30px ${색}, 0 0 60px ${색}60, 0 4px 12px rgba(0,0,0,.8)`;

        // 뱃지
        const 뱃지 = document.getElementById('결과뱃지');
        뱃지.style.background = `linear-gradient(90deg, ${색}cc, ${색}60)`;
        뱃지.style.boxShadow = `0 0 20px ${색}40`;

        // 타이틀
        const 타이틀 = document.getElementById('결과타이틀');
        if (승리) {
            타이틀.textContent = 'YOU WIN';
            타이틀.style.background = `linear-gradient(180deg, #fff, ${색}, ${색}80)`;
        } else {
            타이틀.textContent = 'YOU LOSE';
            타이틀.style.background = `linear-gradient(180deg, #fff, ${색}, ${색}80)`;
        }
        타이틀.style.webkitBackgroundClip = 'text';
        타이틀.style.webkitTextFillColor = 'transparent';

        // 설명
        const 설명 = document.getElementById('결과설명');
        if (승리) {
            설명.textContent = `${승자.이름}이(가) ${패자.이름}을(를) 쓰러뜨렸다!`;
        } else {
            설명.textContent = `${승자.이름}이(가) ${패자.이름}을(를) 쓰러뜨렸다!`;
        }

        // 버튼: 승리 시 자동 다음 상대 / 패배 시 버튼 표시
        const 다시버튼 = document.getElementById('결과다시');
        const 타이틀버튼 = document.getElementById('결과타이틀로');
        if (승리) {
            다시버튼.style.display = 'none';
            타이틀버튼.style.display = 'none';
            // 3초 후 자동으로 다음 상대
            setTimeout(() => { 다시콜백(); }, 3000);
        } else {
            다시버튼.style.display = '';
            타이틀버튼.style.display = '';
            다시버튼.onclick = 다시콜백;
            타이틀버튼.onclick = 타이틀콜백;
        }

        // 등장 시퀀스
        this.결과연출시작(색);
    },

    결과연출시작(색) {
        // 초기 플래시
        const 플래시 = document.getElementById('결과플래시');
        플래시.classList.add('flash');
        setTimeout(() => 플래시.classList.remove('flash'), 300);

        // 두 번째 플래시 (임팩트)
        setTimeout(() => {
            플래시.classList.add('flash');
            setTimeout(() => 플래시.classList.remove('flash'), 200);
        }, 400);

        // 승자 클로즈업 연출 (바스트 샷)
        const 승자영역 = document.getElementById('결과승자영역');
        승자영역.style.transition = 'none';
        승자영역.style.transform = 'scale(0.6) translateX(-100px)';
        승자영역.style.opacity = '0';
        // 빠르게 확대되면서 등장
        requestAnimationFrame(() => {
            승자영역.style.transition = 'transform .5s cubic-bezier(.2,0,.3,1.4), opacity .3s ease-out';
            승자영역.style.transform = 'scale(1.15) translateX(0)';
            승자영역.style.opacity = '1';
        });
        // 약간 줄어들면서 안정
        setTimeout(() => {
            승자영역.style.transition = 'transform .3s ease-out';
            승자영역.style.transform = 'scale(1)';
        }, 500);

        // 파티클 시작
        this.결과파티클시작(색);
    },

    결과파티클시작(색) {
        const canvas = document.getElementById('결과파티클');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 1280;
        canvas.height = 720;

        // 색상 기반 파티클 팔레트
        const 팔레트 = [색, '#fff', '#ffe080', 색 + '80', '#ffd060'];

        const 입자들 = [];
        // 컨페티 + 스파크 파티클
        for (let i = 0; i < 100; i++) {
            입자들.push({
                x: Math.random() * 1280,
                y: -20 - Math.random() * 300,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 4 + 1.5,
                크기: Math.random() * 5 + 2,
                색: 팔레트[Math.floor(Math.random() * 팔레트.length)],
                회전: Math.random() * 360,
                회전속도: (Math.random() - 0.5) * 8,
                종류: Math.random() > 0.3 ? 'rect' : 'spark'
            });
        }
        // 승리자 주변 방사형 스파크
        for (let i = 0; i < 30; i++) {
            const 각 = Math.random() * Math.PI * 2;
            const 속도 = 2 + Math.random() * 6;
            입자들.push({
                x: 380, y: 360,
                vx: Math.cos(각) * 속도,
                vy: Math.sin(각) * 속도,
                크기: Math.random() * 3 + 1,
                색: 팔레트[Math.floor(Math.random() * 팔레트.length)],
                회전: 0,
                회전속도: 0,
                종류: 'glow',
                수명: 1.0,
                감쇠: 0.005 + Math.random() * 0.01
            });
        }

        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            입자들.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.회전 += p.회전속도;

                if (p.종류 === 'glow') {
                    p.수명 -= p.감쇠;
                    if (p.수명 <= 0) return;
                    ctx.globalAlpha = p.수명;
                    ctx.fillStyle = p.색;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.색;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else if (p.종류 === 'spark') {
                    if (p.y > 740) { p.y = -20; p.x = Math.random() * 1280; }
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.회전 * Math.PI / 180);
                    ctx.globalAlpha = 0.8;
                    ctx.fillStyle = p.색;
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = p.색;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.크기 * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.restore();
                } else {
                    if (p.y > 740) { p.y = -20; p.x = Math.random() * 1280; }
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.회전 * Math.PI / 180);
                    ctx.globalAlpha = 0.7;
                    ctx.fillStyle = p.색;
                    ctx.fillRect(-p.크기 / 2, -p.크기 / 2, p.크기, p.크기 * 0.6);
                    ctx.restore();
                }
            });
            ctx.globalAlpha = 1;
            if (document.getElementById('결과화면')?.classList.contains('active')) {
                requestAnimationFrame(그리기);
            }
        };
        그리기();
    }
};

// ===== 스테이지 배경 시스템 =====
const 스테이지 = {
    _raf: null,
    _파티클들: [],

    // 펫 ID별 스테이지 설정
    _설정: {
        1: { // 불곰 - 화산/용암
            bg: 'radial-gradient(ellipse at 50% 80%,#2a0800,#180400 40%,#0a0205)',
            arena: 'linear-gradient(180deg,rgba(40,10,5,.0) 0%,rgba(60,15,5,.6) 30%,rgba(50,10,0,.9))',
            파티클색: ['#ff4020','#ff6030','#ff8040','#e03010','#cc4010'],
            효과: '용암',
        },
        4: { // 독수리왕 - 번개 하늘
            bg: 'radial-gradient(ellipse at 50% 20%,#0a1530,#060c20 50%,#030610)',
            arena: 'linear-gradient(180deg,rgba(10,20,40,.0) 0%,rgba(15,25,50,.6) 30%,rgba(10,15,35,.9))',
            파티클색: ['#3080e0','#50a0ff','#80c0ff','#a0d0ff','#ffffff'],
            효과: '번개',
        },
        5: { // 그림자고양이 - 보라빛 어둠 숲
            bg: 'radial-gradient(ellipse at 50% 40%,#180828,#0c0418 50%,#06020c)',
            arena: 'linear-gradient(180deg,rgba(20,8,30,.0) 0%,rgba(30,12,40,.6) 30%,rgba(20,8,25,.9))',
            파티클색: ['#8040c0','#a060e0','#6030a0','#c080ff','#502080'],
            효과: '안개',
        },
        6: { // 철갑거북 - 금속 공장
            bg: 'radial-gradient(ellipse at 50% 50%,#101418,#0a0c10 50%,#060708)',
            arena: 'linear-gradient(180deg,rgba(15,18,22,.0) 0%,rgba(25,28,35,.6) 30%,rgba(18,20,28,.9))',
            파티클색: ['#808890','#a0a8b0','#606870','#c0c8d0','#4a5060'],
            효과: '스파크',
        },
        7: { // 독사킹 - 독 늪지
            bg: 'radial-gradient(ellipse at 50% 70%,#081808,#040c04 50%,#020602)',
            arena: 'linear-gradient(180deg,rgba(10,25,10,.0) 0%,rgba(15,35,15,.6) 30%,rgba(10,25,10,.9))',
            파티클색: ['#30a050','#50c070','#208040','#60e080','#40b060'],
            효과: '버블',
        },
        8: { // 폭탄쥐 - 폭발/불꽃
            bg: 'radial-gradient(ellipse at 50% 60%,#201008,#140a04 50%,#0a0502)',
            arena: 'linear-gradient(180deg,rgba(35,20,8,.0) 0%,rgba(50,28,10,.6) 30%,rgba(40,22,8,.9))',
            파티클색: ['#e0a020','#ff8030','#ffc040','#e06010','#ffdd60'],
            효과: '폭발',
        }
    },

    시작(상대펫) {
        this.중지();
        const 설정 = this._설정[상대펫.id];
        if (!설정) return;

        // 배경색 변경
        const bg = document.querySelector('.battle-bg');
        if (bg) bg.style.background = 설정.bg;
        const arena = document.querySelector('.battle-arena');
        if (arena) arena.style.background = 설정.arena;

        // 파티클 초기화
        this._파티클들 = [];
        const canvas = document.getElementById('스테이지캔버스');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // 효과별 파티클 생성
        const 효과 = 설정.효과;
        const 색들 = 설정.파티클색;

        if (효과 === '용암') {
            // 아래에서 위로 올라가는 불씨 + 바닥에 흐르는 용암 빛
            for (let i = 0; i < 40; i++) {
                this._파티클들.push({
                    x: Math.random() * 1280,
                    y: 500 + Math.random() * 220,
                    vy: -(0.3 + Math.random() * 1.2),
                    vx: (Math.random() - 0.5) * 0.5,
                    크기: 2 + Math.random() * 5,
                    색: 색들[Math.floor(Math.random() * 색들.length)],
                    알파: 0.3 + Math.random() * 0.5,
                    흔들림: Math.random() * Math.PI * 2,
                });
            }
        } else if (효과 === '번개') {
            // 느리게 떨어지는 빗방울 + 간헐적 번개
            for (let i = 0; i < 60; i++) {
                this._파티클들.push({
                    x: Math.random() * 1280,
                    y: Math.random() * 500,
                    vy: 2 + Math.random() * 3,
                    vx: -0.5,
                    크기: 1 + Math.random() * 2,
                    길이: 8 + Math.random() * 15,
                    색: 색들[Math.floor(Math.random() * 색들.length)],
                    알파: 0.15 + Math.random() * 0.2,
                });
            }
            this._번개타이머 = 0;
            this._번개알파 = 0;
            this._번개X = 640;
        } else if (효과 === '안개') {
            // 느리게 흐르는 안개 덩어리
            for (let i = 0; i < 20; i++) {
                this._파티클들.push({
                    x: Math.random() * 1280,
                    y: 200 + Math.random() * 400,
                    vx: 0.2 + Math.random() * 0.4,
                    크기: 60 + Math.random() * 120,
                    색: 색들[Math.floor(Math.random() * 색들.length)],
                    알파: 0.04 + Math.random() * 0.06,
                    흔들림: Math.random() * Math.PI * 2,
                });
            }
        } else if (효과 === '스파크') {
            // 금속 스파크가 튀는 효과
            for (let i = 0; i < 30; i++) {
                this._파티클들.push({
                    x: Math.random() * 1280,
                    y: 400 + Math.random() * 200,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -(1 + Math.random() * 2),
                    크기: 1 + Math.random() * 3,
                    수명: Math.random(),
                    최대수명: 0.5 + Math.random() * 1.5,
                    색: 색들[Math.floor(Math.random() * 색들.length)],
                });
            }
        } else if (효과 === '버블') {
            // 아래에서 올라오는 독 버블
            for (let i = 0; i < 25; i++) {
                this._파티클들.push({
                    x: Math.random() * 1280,
                    y: 500 + Math.random() * 220,
                    vy: -(0.2 + Math.random() * 0.6),
                    크기: 4 + Math.random() * 12,
                    색: 색들[Math.floor(Math.random() * 색들.length)],
                    알파: 0.15 + Math.random() * 0.2,
                    흔들림: Math.random() * Math.PI * 2,
                });
            }
        } else if (효과 === '폭발') {
            // 불꽃 파편이 사방으로
            for (let i = 0; i < 35; i++) {
                this._파티클들.push({
                    x: Math.random() * 1280,
                    y: 300 + Math.random() * 300,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: -(0.5 + Math.random() * 1.5),
                    크기: 2 + Math.random() * 6,
                    색: 색들[Math.floor(Math.random() * 색들.length)],
                    알파: 0.3 + Math.random() * 0.4,
                    흔들림: Math.random() * Math.PI * 2,
                });
            }
        }

        let t = 0;
        const 그리기 = () => {
            ctx.clearRect(0, 0, 1280, 720);
            t += 0.016;

            if (효과 === '용암') {
                // 바닥 용암 글로우
                const grd = ctx.createRadialGradient(640, 720, 0, 640, 720, 500);
                grd.addColorStop(0, 'rgba(180,40,10,.12)');
                grd.addColorStop(0.5, 'rgba(120,20,5,.06)');
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 200, 1280, 520);

                for (const p of this._파티클들) {
                    p.x += p.vx + Math.sin(p.흔들림 + t * 2) * 0.3;
                    p.y += p.vy;
                    ctx.globalAlpha = p.알파 * (1 - Math.max(0, (400 - p.y) / 400));
                    ctx.fillStyle = p.색;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                    ctx.fill();
                    // 글로우
                    ctx.globalAlpha = p.알파 * 0.3;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기 * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    if (p.y < 200) { p.y = 700 + Math.random() * 50; p.x = Math.random() * 1280; }
                }
            } else if (효과 === '번개') {
                // 빗방울
                for (const p of this._파티클들) {
                    p.x += p.vx;
                    p.y += p.vy;
                    ctx.globalAlpha = p.알파;
                    ctx.strokeStyle = p.색;
                    ctx.lineWidth = p.크기;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + p.vx * 3, p.y + p.길이);
                    ctx.stroke();
                    if (p.y > 550) { p.y = -20; p.x = Math.random() * 1280; }
                }
                // 번개
                this._번개타이머 += 0.016;
                if (this._번개알파 > 0) {
                    this._번개알파 -= 0.04;
                    ctx.globalAlpha = Math.max(0, this._번개알파) * 0.3;
                    ctx.fillStyle = '#a0c0ff';
                    ctx.fillRect(0, 0, 1280, 720);
                    // 번개 줄기
                    ctx.globalAlpha = Math.max(0, this._번개알파) * 0.6;
                    ctx.strokeStyle = '#c0e0ff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    let bx = this._번개X, by = 0;
                    ctx.moveTo(bx, by);
                    for (let s = 0; s < 8; s++) {
                        bx += (Math.random() - 0.5) * 60;
                        by += 50 + Math.random() * 40;
                        ctx.lineTo(bx, by);
                    }
                    ctx.stroke();
                }
                if (this._번개타이머 > 2 + Math.random() * 3) {
                    this._번개타이머 = 0;
                    this._번개알파 = 1;
                    this._번개X = 200 + Math.random() * 880;
                }
            } else if (효과 === '안개') {
                for (const p of this._파티클들) {
                    p.x += p.vx;
                    p.y += Math.sin(p.흔들림 + t * 0.5) * 0.3;
                    ctx.globalAlpha = p.알파;
                    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.크기);
                    grd.addColorStop(0, p.색);
                    grd.addColorStop(1, 'transparent');
                    ctx.fillStyle = grd;
                    ctx.fillRect(p.x - p.크기, p.y - p.크기, p.크기 * 2, p.크기 * 2);
                    if (p.x > 1280 + p.크기) { p.x = -p.크기; p.y = 200 + Math.random() * 400; }
                }
            } else if (효과 === '스파크') {
                for (const p of this._파티클들) {
                    p.수명 += 0.016;
                    if (p.수명 > p.최대수명) {
                        p.수명 = 0;
                        p.x = Math.random() * 1280;
                        p.y = 400 + Math.random() * 200;
                        p.vx = (Math.random() - 0.5) * 2;
                        p.vy = -(1 + Math.random() * 2);
                    }
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.05; // 중력
                    const life = 1 - (p.수명 / p.최대수명);
                    ctx.globalAlpha = life * 0.6;
                    ctx.fillStyle = p.색;
                    // 스파크 선
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기 * life, 0, Math.PI * 2);
                    ctx.fill();
                    // 꼬리
                    ctx.globalAlpha = life * 0.2;
                    ctx.strokeStyle = p.색;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
                    ctx.stroke();
                }
            } else if (효과 === '버블') {
                for (const p of this._파티클들) {
                    p.x += Math.sin(p.흔들림 + t * 1.5) * 0.5;
                    p.y += p.vy;
                    ctx.globalAlpha = p.알파;
                    ctx.strokeStyle = p.색;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                    ctx.stroke();
                    // 하이라이트
                    ctx.globalAlpha = p.알파 * 0.5;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(p.x - p.크기 * 0.3, p.y - p.크기 * 0.3, p.크기 * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                    if (p.y < 100) { p.y = 700 + Math.random() * 50; p.x = Math.random() * 1280; }
                }
            } else if (효과 === '폭발') {
                // 바닥 불꽃 글로우
                const grd = ctx.createRadialGradient(640, 600, 0, 640, 600, 400);
                grd.addColorStop(0, `rgba(200,120,20,${0.06 + Math.sin(t * 3) * 0.03})`);
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 200, 1280, 520);

                for (const p of this._파티클들) {
                    p.x += p.vx + Math.sin(p.흔들림 + t * 3) * 0.4;
                    p.y += p.vy;
                    p.vy += 0.02;
                    ctx.globalAlpha = p.알파 * Math.max(0, 1 - Math.max(0, (300 - p.y) / 300));
                    ctx.fillStyle = p.색;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = p.알파 * 0.2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.크기 * 3, 0, Math.PI * 2);
                    ctx.fill();
                    if (p.y < 100 || p.y > 720) {
                        p.y = 500 + Math.random() * 200;
                        p.x = Math.random() * 1280;
                        p.vy = -(0.5 + Math.random() * 1.5);
                    }
                }
            }

            ctx.globalAlpha = 1;
            if (document.getElementById('전투화면')?.classList.contains('active')) {
                this._raf = requestAnimationFrame(그리기);
            }
        };
        this._raf = requestAnimationFrame(그리기);
    },

    중지() {
        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }
        const canvas = document.getElementById('스테이지캔버스');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 1280, 720);
        }
        // 배경 원래대로
        const bg = document.querySelector('.battle-bg');
        if (bg) bg.style.background = '';
        const arena = document.querySelector('.battle-arena');
        if (arena) arena.style.background = '';
    }
};
