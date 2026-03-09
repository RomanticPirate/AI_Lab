// app.js - 메인 게임 컨트롤러
const 게임 = {
    현재화면: null,
    내펫: null,
    상대펫: null,
    인트로정리: null,

    async 시작() {
        // 데이터 로드
        await 게임데이터.로드();

        // 화면 생성
        const 게임영역 = document.getElementById('game');
        게임영역.innerHTML = '';

        게임영역.appendChild(화면.타이틀생성());
        게임영역.appendChild(화면.인트로생성());
        게임영역.appendChild(화면.캐릭터선택생성());
        게임영역.appendChild(화면.VS화면생성());
        게임영역.appendChild(화면.전투화면생성());
        게임영역.appendChild(화면.결과화면생성());

        // 타이틀 화면 표시
        this.화면전환('타이틀화면');
        화면.타이틀펫배치();
        화면.타이틀파티클시작();

        // 타이틀 클릭 이벤트
        document.getElementById('타이틀시작').onclick = () => {
            this.인트로시작();
        };
    },

    화면전환(화면id) {
        // 이전 화면 비활성화
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        // 새 화면 활성화
        const 새화면 = document.getElementById(화면id);
        if (새화면) {
            새화면.classList.add('active');
            this.현재화면 = 화면id;
        }
    },

    인트로시작() {
        this.화면전환('인트로화면');
        this.인트로정리 = 화면.인트로표시(게임데이터.펫목록, () => {
            this.캐릭터선택시작();
        });
    },

    캐릭터선택시작() {
        if (this.인트로정리) {
            this.인트로정리();
            this.인트로정리 = null;
        }
        this.화면전환('선택화면');
        화면.캐릭터선택초기화((선택된펫) => {
            this.내펫 = 선택된펫;
            this.상대선택시작();
        });
    },

    상대선택시작() {
        // 랜덤 상대 선택
        this.상대펫 = 게임데이터.랜덤상대(this.내펫.id);
        this.화면전환('VS화면');
        화면.VS표시(this.내펫, this.상대펫, () => {
            this.전투시작();
        });
    },

    전투시작() {
        this.화면전환('전투화면');
        전투시스템.초기화(this.내펫, this.상대펫, (승리) => {
            this.전투종료(승리);
        });
    },

    전투종료(승리) {
        전투시스템.정리();
        setTimeout(() => {
            this.화면전환('결과화면');
            화면.결과표시(
                승리,
                this.내펫,
                this.상대펫,
                () => {
                    // 다시 하기 - 같은 캐릭터로 새 상대
                    this.상대선택시작();
                },
                () => {
                    // 타이틀로
                    this.화면전환('타이틀화면');
                    화면.타이틀펫배치();
                    화면.타이틀파티클시작();
                }
            );
        }, 1000);
    }
};

// 게임 시작
window.addEventListener('DOMContentLoaded', () => {
    게임.시작();
});
