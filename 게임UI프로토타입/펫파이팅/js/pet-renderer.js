// pet-renderer.js - SVG 펫 캐릭터 렌더러
const 펫렌더러 = {

    그리기(펫, 크기 = 160, 반전 = false) {
        const 종류 = 펫.종류;
        const 색 = 펫.색상;
        const 보조 = 펫.보조색상;
        const svg = this.종류별그리기[종류] ? this.종류별그리기[종류](색, 보조, 크기) : this.기본(색, 보조, 크기);
        const 감싸기 = document.createElement('div');
        감싸기.style.cssText = `width:${크기}px;height:${크기}px;display:flex;align-items:center;justify-content:center;${반전 ? 'transform:scaleX(-1);' : ''}`;
        감싸기.innerHTML = svg;
        return 감싸기;
    },

    종류별그리기: {
        '곰'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="곰몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="곰그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 귀 -->
                <circle cx="60" cy="42" r="22" fill="${색}" stroke="${보조}" stroke-width="2"/>
                <circle cx="140" cy="42" r="22" fill="${색}" stroke="${보조}" stroke-width="2"/>
                <circle cx="60" cy="42" r="12" fill="${보조}" opacity=".5"/>
                <circle cx="140" cy="42" r="12" fill="${보조}" opacity=".5"/>
                <!-- 머리 -->
                <ellipse cx="100" cy="85" rx="56" ry="52" fill="url(#곰몸${s})" filter="url(#곰그림자${s})"/>
                <!-- 얼굴 (밝은 부분) -->
                <ellipse cx="100" cy="100" rx="30" ry="24" fill="${보조}" opacity=".3"/>
                <!-- 눈 -->
                <ellipse cx="78" cy="78" rx="8" ry="9" fill="#1a1020"/>
                <ellipse cx="122" cy="78" rx="8" ry="9" fill="#1a1020"/>
                <circle cx="81" cy="75" r="3" fill="#fff" opacity=".8"/>
                <circle cx="125" cy="75" r="3" fill="#fff" opacity=".8"/>
                <!-- 코 -->
                <ellipse cx="100" cy="96" rx="8" ry="6" fill="#1a1020"/>
                <ellipse cx="100" cy="94" rx="3" ry="2" fill="#fff" opacity=".3"/>
                <!-- 입 -->
                <path d="M92 102 Q100 112 108 102" fill="none" stroke="#1a1020" stroke-width="2" stroke-linecap="round"/>
                <!-- 몸통 -->
                <ellipse cx="100" cy="158" rx="48" ry="38" fill="url(#곰몸${s})" filter="url(#곰그림자${s})"/>
                <ellipse cx="100" cy="158" rx="30" ry="26" fill="${보조}" opacity=".2"/>
                <!-- 팔 -->
                <ellipse cx="52" cy="148" rx="18" ry="28" fill="${색}" transform="rotate(-15,52,148)"/>
                <ellipse cx="148" cy="148" rx="18" ry="28" fill="${색}" transform="rotate(15,148,148)"/>
                <!-- 발 -->
                <ellipse cx="76" cy="190" rx="18" ry="10" fill="${색}"/>
                <ellipse cx="124" cy="190" rx="18" ry="10" fill="${색}"/>
            </svg>`;
        },

        '늑대'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="늑대몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="늑대그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 귀 (뾰족) -->
                <polygon points="58,18 45,65 75,60" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
                <polygon points="142,18 155,65 125,60" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
                <polygon points="58,28 50,58 70,54" fill="${보조}" opacity=".4"/>
                <polygon points="142,28 150,58 130,54" fill="${보조}" opacity=".4"/>
                <!-- 머리 -->
                <ellipse cx="100" cy="80" rx="50" ry="44" fill="url(#늑대몸${s})" filter="url(#늑대그림자${s})"/>
                <!-- 주둥이 -->
                <ellipse cx="100" cy="100" rx="22" ry="18" fill="${보조}" opacity=".35"/>
                <!-- 눈 (날카로운) -->
                <path d="M70 72 L88 76 L70 80 Z" fill="#1a1020"/>
                <path d="M130 72 L112 76 L130 80 Z" fill="#1a1020"/>
                <circle cx="78" cy="75" r="2.5" fill="${보조}"/>
                <circle cx="122" cy="75" r="2.5" fill="${보조}"/>
                <circle cx="79" cy="74" r="1" fill="#fff" opacity=".9"/>
                <circle cx="123" cy="74" r="1" fill="#fff" opacity=".9"/>
                <!-- 코 -->
                <ellipse cx="100" cy="93" rx="6" ry="5" fill="#1a1020"/>
                <!-- 입 -->
                <path d="M90 100 Q95 106 100 100 Q105 106 110 100" fill="none" stroke="#1a1020" stroke-width="1.5"/>
                <!-- 번개 무늬 -->
                <path d="M82 60 L88 68 L84 68 L90 78" fill="none" stroke="${보조}" stroke-width="2" opacity=".6"/>
                <path d="M118 60 L112 68 L116 68 L110 78" fill="none" stroke="${보조}" stroke-width="2" opacity=".6"/>
                <!-- 몸통 -->
                <ellipse cx="100" cy="155" rx="42" ry="36" fill="url(#늑대몸${s})" filter="url(#늑대그림자${s})"/>
                <ellipse cx="100" cy="155" rx="26" ry="28" fill="${보조}" opacity=".15"/>
                <!-- 팔 -->
                <ellipse cx="58" cy="148" rx="14" ry="26" fill="${색}" transform="rotate(-10,58,148)"/>
                <ellipse cx="142" cy="148" rx="14" ry="26" fill="${색}" transform="rotate(10,142,148)"/>
                <!-- 발 -->
                <ellipse cx="78" cy="188" rx="16" ry="9" fill="${색}"/>
                <ellipse cx="122" cy="188" rx="16" ry="9" fill="${색}"/>
                <!-- 꼬리 -->
                <path d="M148 160 Q170 140 175 155 Q178 165 165 170" fill="${색}" stroke="${보조}" stroke-width="1"/>
            </svg>`;
        },

        '여우'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="여우몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="여우그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 큰 귀 -->
                <polygon points="55,10 38,62 72,58" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
                <polygon points="145,10 162,62 128,58" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
                <polygon points="55,22 44,55 66,52" fill="${보조}" opacity=".5"/>
                <polygon points="145,22 156,55 134,52" fill="${보조}" opacity=".5"/>
                <!-- 머리 -->
                <ellipse cx="100" cy="78" rx="48" ry="42" fill="url(#여우몸${s})" filter="url(#여우그림자${s})"/>
                <!-- 뺨 (볼) -->
                <ellipse cx="66" cy="88" rx="16" ry="14" fill="${보조}" opacity=".3"/>
                <ellipse cx="134" cy="88" rx="16" ry="14" fill="${보조}" opacity=".3"/>
                <!-- 주둥이 -->
                <ellipse cx="100" cy="96" rx="16" ry="12" fill="${보조}" opacity=".4"/>
                <!-- 눈 (교활한 느낌) -->
                <ellipse cx="78" cy="74" rx="9" ry="7" fill="#1a1020"/>
                <ellipse cx="122" cy="74" rx="9" ry="7" fill="#1a1020"/>
                <circle cx="80" cy="72" r="3" fill="#fff" opacity=".8"/>
                <circle cx="124" cy="72" r="3" fill="#fff" opacity=".8"/>
                <circle cx="76" cy="76" r="1.5" fill="${보조}" opacity=".5"/>
                <circle cx="120" cy="76" r="1.5" fill="${보조}" opacity=".5"/>
                <!-- 코 -->
                <ellipse cx="100" cy="90" rx="5" ry="4" fill="#1a1020"/>
                <!-- 입 (웃는) -->
                <path d="M92 96 Q100 104 108 96" fill="none" stroke="#1a1020" stroke-width="1.5" stroke-linecap="round"/>
                <!-- 몸통 -->
                <ellipse cx="100" cy="152" rx="38" ry="34" fill="url(#여우몸${s})" filter="url(#여우그림자${s})"/>
                <ellipse cx="100" cy="155" rx="22" ry="22" fill="${보조}" opacity=".2"/>
                <!-- 팔 -->
                <ellipse cx="62" cy="146" rx="12" ry="24" fill="${색}" transform="rotate(-10,62,146)"/>
                <ellipse cx="138" cy="146" rx="12" ry="24" fill="${색}" transform="rotate(10,138,146)"/>
                <!-- 발 -->
                <ellipse cx="80" cy="184" rx="14" ry="8" fill="${색}"/>
                <ellipse cx="120" cy="184" rx="14" ry="8" fill="${색}"/>
                <!-- 꼬리 (크고 풍성) -->
                <path d="M140 158 Q165 130 180 145 Q190 158 175 168 Q160 178 145 168" fill="${색}"/>
                <path d="M160 148 Q170 142 175 150 Q178 156 170 160" fill="${보조}" opacity=".4"/>
            </svg>`;
        },

        '독수리'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="독수리몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="독수리그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 머리 깃털 -->
                <polygon points="85,22 100,8 115,22 100,32" fill="${보조}" opacity=".7"/>
                <polygon points="90,28 100,14 110,28" fill="${색}"/>
                <!-- 머리 -->
                <ellipse cx="100" cy="65" rx="40" ry="36" fill="url(#독수리몸${s})" filter="url(#독수리그림자${s})"/>
                <!-- 눈 (날카로운) -->
                <ellipse cx="80" cy="58" rx="10" ry="8" fill="#fffae0"/>
                <ellipse cx="120" cy="58" rx="10" ry="8" fill="#fffae0"/>
                <ellipse cx="82" cy="58" rx="5" ry="6" fill="#1a1020"/>
                <ellipse cx="122" cy="58" rx="5" ry="6" fill="#1a1020"/>
                <circle cx="83" cy="56" r="2" fill="#fff" opacity=".8"/>
                <circle cx="123" cy="56" r="2" fill="#fff" opacity=".8"/>
                <!-- 눈썹 (성난) -->
                <path d="M68 50 L86 54" stroke="#1a1020" stroke-width="3" stroke-linecap="round"/>
                <path d="M132 50 L114 54" stroke="#1a1020" stroke-width="3" stroke-linecap="round"/>
                <!-- 부리 -->
                <polygon points="90,72 100,92 110,72" fill="${보조}" stroke="${색}" stroke-width="1"/>
                <polygon points="94,72 100,85 106,72" fill="#e8d060"/>
                <line x1="94" y1="78" x2="106" y2="78" stroke="${색}" stroke-width="1" opacity=".4"/>
                <!-- 몸통 -->
                <ellipse cx="100" cy="145" rx="36" ry="40" fill="url(#독수리몸${s})" filter="url(#독수리그림자${s})"/>
                <ellipse cx="100" cy="145" rx="22" ry="30" fill="${보조}" opacity=".15"/>
                <!-- 날개 (접은 상태) -->
                <path d="M64 120 Q40 140 35 165 Q38 170 55 155 L64 160" fill="${색}" stroke="${보조}" stroke-width="1"/>
                <path d="M136 120 Q160 140 165 165 Q162 170 145 155 L136 160" fill="${색}" stroke="${보조}" stroke-width="1"/>
                <!-- 날개 깃털 디테일 -->
                <path d="M40 155 L50 148" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <path d="M45 160 L55 152" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <path d="M160 155 L150 148" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <path d="M155 160 L145 152" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <!-- 발 (발톱) -->
                <path d="M82 182 L78 196 M82 182 L82 198 M82 182 L86 196" stroke="${보조}" stroke-width="2" stroke-linecap="round"/>
                <path d="M118 182 L114 196 M118 182 L118 198 M118 182 L122 196" stroke="${보조}" stroke-width="2" stroke-linecap="round"/>
            </svg>`;
        },

        '고양이'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="고양이몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="고양이그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 귀 (삼각형, 날카로운) -->
                <polygon points="60,18 42,62 78,58" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
                <polygon points="140,18 158,62 122,58" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
                <polygon points="60,28 48,55 72,52" fill="${보조}" opacity=".4"/>
                <polygon points="140,28 152,55 128,52" fill="${보조}" opacity=".4"/>
                <!-- 머리 (둥근) -->
                <circle cx="100" cy="78" r="44" fill="url(#고양이몸${s})" filter="url(#고양이그림자${s})"/>
                <!-- 눈 (세로 동공) -->
                <ellipse cx="80" cy="74" rx="10" ry="12" fill="#e8e0f8"/>
                <ellipse cx="120" cy="74" rx="10" ry="12" fill="#e8e0f8"/>
                <ellipse cx="80" cy="74" rx="3" ry="10" fill="#1a1020"/>
                <ellipse cx="120" cy="74" rx="3" ry="10" fill="#1a1020"/>
                <circle cx="82" cy="70" r="2.5" fill="#fff" opacity=".8"/>
                <circle cx="122" cy="70" r="2.5" fill="#fff" opacity=".8"/>
                <!-- 코 -->
                <polygon points="97,90 100,94 103,90" fill="#ff90a0"/>
                <!-- 입 -->
                <path d="M94 96 L100 94 L106 96" fill="none" stroke="#1a1020" stroke-width="1.2"/>
                <!-- 수염 -->
                <line x1="56" y1="86" x2="82" y2="90" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <line x1="54" y1="92" x2="80" y2="92" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <line x1="118" y1="90" x2="144" y2="86" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <line x1="120" y1="92" x2="146" y2="92" stroke="${보조}" stroke-width="1" opacity=".4"/>
                <!-- 그림자 무늬 -->
                <path d="M80 55 Q100 50 120 55" fill="none" stroke="${보조}" stroke-width="3" opacity=".2"/>
                <!-- 몸통 -->
                <ellipse cx="100" cy="152" rx="34" ry="36" fill="url(#고양이몸${s})" filter="url(#고양이그림자${s})"/>
                <ellipse cx="100" cy="155" rx="20" ry="24" fill="${보조}" opacity=".15"/>
                <!-- 팔 -->
                <ellipse cx="66" cy="148" rx="12" ry="22" fill="${색}" transform="rotate(-8,66,148)"/>
                <ellipse cx="134" cy="148" rx="12" ry="22" fill="${색}" transform="rotate(8,134,148)"/>
                <!-- 발 -->
                <ellipse cx="80" cy="186" rx="14" ry="8" fill="${색}"/>
                <ellipse cx="120" cy="186" rx="14" ry="8" fill="${색}"/>
                <!-- 꼬리 -->
                <path d="M136 162 Q165 145 168 160 Q170 175 155 178" fill="${색}" stroke="${보조}" stroke-width="1.5"/>
            </svg>`;
        },

        '거북'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="거북몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="거북그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 머리 -->
                <ellipse cx="100" cy="62" rx="30" ry="28" fill="url(#거북몸${s})" filter="url(#거북그림자${s})"/>
                <!-- 눈 -->
                <ellipse cx="86" cy="56" rx="7" ry="8" fill="#e0f8e8"/>
                <ellipse cx="114" cy="56" rx="7" ry="8" fill="#e0f8e8"/>
                <circle cx="88" cy="56" r="4" fill="#1a1020"/>
                <circle cx="116" cy="56" r="4" fill="#1a1020"/>
                <circle cx="89" cy="54" r="1.5" fill="#fff" opacity=".8"/>
                <circle cx="117" cy="54" r="1.5" fill="#fff" opacity=".8"/>
                <!-- 입 -->
                <path d="M92 72 Q100 78 108 72" fill="none" stroke="#1a1020" stroke-width="1.5" stroke-linecap="round"/>
                <!-- 등딱지 (큰 돔) -->
                <ellipse cx="100" cy="140" rx="56" ry="48" fill="${색}" filter="url(#거북그림자${s})"/>
                <!-- 등딱지 무늬 -->
                <ellipse cx="100" cy="130" rx="42" ry="36" fill="none" stroke="${보조}" stroke-width="2" opacity=".3"/>
                <ellipse cx="100" cy="125" rx="26" ry="22" fill="none" stroke="${보조}" stroke-width="1.5" opacity=".25"/>
                <ellipse cx="100" cy="122" rx="12" ry="10" fill="${보조}" opacity=".15"/>
                <!-- 등딱지 하이라이트 -->
                <ellipse cx="85" cy="118" rx="20" ry="14" fill="${보조}" opacity=".1" transform="rotate(-15,85,118)"/>
                <!-- 배 (앞면) -->
                <ellipse cx="100" cy="155" rx="34" ry="26" fill="${보조}" opacity=".2"/>
                <!-- 팔 (짧고 튼튼) -->
                <ellipse cx="48" cy="135" rx="16" ry="12" fill="${색}" transform="rotate(-20,48,135)"/>
                <ellipse cx="152" cy="135" rx="16" ry="12" fill="${색}" transform="rotate(20,152,135)"/>
                <!-- 발 -->
                <ellipse cx="68" cy="185" rx="18" ry="10" fill="${색}"/>
                <ellipse cx="132" cy="185" rx="18" ry="10" fill="${색}"/>
                <!-- 꼬리 (작은) -->
                <polygon points="100,188 95,198 105,198" fill="${색}"/>
            </svg>`;
        },

        '뱀'(색, 보조, 크기) {
            const s = 크기;
            return `<svg viewBox="0 0 200 200" width="${s}" height="${s}">
                <defs>
                    <radialGradient id="뱀몸${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="${보조}"/><stop offset="100%" stop-color="${색}"/></radialGradient>
                    <filter id="뱀그림자${s}"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
                </defs>
                <!-- 몸통 코일 (아래부터 위로) -->
                <ellipse cx="110" cy="175" rx="40" ry="14" fill="${색}" opacity=".6"/>
                <ellipse cx="90" cy="158" rx="42" ry="14" fill="${색}" opacity=".7"/>
                <ellipse cx="105" cy="140" rx="38" ry="13" fill="${색}" opacity=".8"/>
                <ellipse cx="95" cy="122" rx="36" ry="12" fill="${색}" opacity=".9"/>
                <!-- 비늘 무늬 -->
                <ellipse cx="100" cy="170" rx="24" ry="8" fill="${보조}" opacity=".15"/>
                <ellipse cx="95" cy="152" rx="22" ry="7" fill="${보조}" opacity=".15"/>
                <ellipse cx="100" cy="135" rx="20" ry="6" fill="${보조}" opacity=".15"/>
                <!-- 목 -->
                <path d="M80 116 Q75 90 85 70" fill="none" stroke="${색}" stroke-width="22" stroke-linecap="round"/>
                <path d="M80 116 Q75 90 85 70" fill="none" stroke="${보조}" stroke-width="12" stroke-linecap="round" opacity=".15"/>
                <!-- 머리 (삼각형+타원) -->
                <ellipse cx="92" cy="58" rx="30" ry="24" fill="url(#뱀몸${s})" filter="url(#뱀그림자${s})"/>
                <!-- 후드 (코브라 느낌) -->
                <path d="M62 60 Q55 40 70 35 Q85 32 92 45" fill="${색}" opacity=".6"/>
                <path d="M122 60 Q129 40 114 35 Q99 32 92 45" fill="${색}" opacity=".6"/>
                <!-- 눈 (사악한) -->
                <ellipse cx="78" cy="52" rx="8" ry="9" fill="#e8e060"/>
                <ellipse cx="106" cy="52" rx="8" ry="9" fill="#e8e060"/>
                <ellipse cx="78" cy="52" rx="3" ry="8" fill="#1a1020"/>
                <ellipse cx="106" cy="52" rx="3" ry="8" fill="#1a1020"/>
                <circle cx="79" cy="49" r="2" fill="#fff" opacity=".7"/>
                <circle cx="107" cy="49" r="2" fill="#fff" opacity=".7"/>
                <!-- 혀 -->
                <path d="M92 72 L92 84 L86 90 M92 84 L98 90" stroke="#ff4060" stroke-width="2" stroke-linecap="round" fill="none"/>
                <!-- 이빨 -->
                <polygon points="80,66 82,74 84,66" fill="#ffe8e0"/>
                <polygon points="100,66 102,74 104,66" fill="#ffe8e0"/>
                <!-- 꼬리 끝 -->
                <path d="M120 180 Q140 176 150 185 Q155 190 148 192" fill="${색}" stroke="${보조}" stroke-width="1"/>
            </svg>`;
        }
    },

    기본(색, 보조, 크기) {
        return `<svg viewBox="0 0 200 200" width="${크기}" height="${크기}">
            <circle cx="100" cy="80" r="40" fill="${색}"/>
            <circle cx="86" cy="72" r="6" fill="#1a1020"/>
            <circle cx="114" cy="72" r="6" fill="#1a1020"/>
            <ellipse cx="100" cy="150" rx="35" ry="40" fill="${색}"/>
        </svg>`;
    },

    // 작은 썸네일용 (선택 화면)
    썸네일(펫, 크기 = 50) {
        return this.그리기(펫, 크기, false);
    },

    // 전투용 (큰 사이즈)
    전투캐릭터(펫, 반전 = false) {
        return this.그리기(펫, 180, 반전);
    }
};
