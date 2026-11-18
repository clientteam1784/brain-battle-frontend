# 수학퀴즈배틀 프론트 (HTML · CSS · JavaScript)

Figma "수학 퀴즈 배틀 UI" 페이지를 화면별 HTML/CSS로 만들고, 짧은 JavaScript로 백엔드(`backend_with_py`)에 연결한 프론트입니다.
빌드 도구와 모듈 시스템이 없습니다.

## 실행

백엔드 CORS 기본 허용 주소가 `http://localhost:3000` 이므로 3000 포트로 `pages` 폴더를 서비스합니다.

```bash
cd client_front
npx serve -l 3000 pages          # 또는: python -m http.server 3000 --directory pages
```

브라우저에서 http://localhost:3000/role.html 을 엽니다. 백엔드(`http://localhost:8000`)가 켜져 있어야 합니다.
백엔드 주소가 다르면 `pages/js/common.js` 첫 줄의 `API_BASE_URL` 을 고치세요.
선생님 인증 코드는 백엔드 `.env` 의 `TEACHER_ACCESS_CODE` 입니다. 선생님과 학생은 창을 나눠서(일반 + 시크릿) 엽니다.

## 구조

```text
pages/
├── role.html             01 역할 선택
├── teacher-login.html    선생님 인증 (Figma에 없음, 백엔드 로그인용)
├── host-create.html      02 방 만들기 + 03 문제 추가 창
├── host-ready.html       04 준비화면 (모둠 만들기, PIN)
├── host-live.html        05 현황 (3초마다 순위 갱신)
├── result.html           06 결과 (선생님/학생 공통)
├── player-pin.html       07·08 PIN 입력 / 오류
├── player-student.html   09 이름 입력
├── player-ready.html     10 준비화면
├── player-quiz.html      11 문제풀이
├── css/common.css        색·버튼·입력창·배경 장식 (화면별 css 는 같은 이름)
├── js/common.js          api(), save/load, el(), 수식 버튼, 뒤로가기·로고 (화면별 js 는 같은 이름)
└── assets/deco/          배경 장식 SVG
backend_with_py/          백엔드 (FastAPI)
```

## 화면 이동

- HOST: role → teacher-login → host-create → host-ready → host-live → result
- PLAYER: role → player-pin → player-student → player-ready → player-quiz → result
- 틀린 PIN은 로그인 단계에서 `player-pin.html?error=1` 로 돌아와 오류를 보여 줍니다.

## 규칙

- 사용자가 입력한 글자는 `el()` / `textContent` 로만 넣습니다. `innerHTML` 은 쓰지 않습니다.
- 로그인 정보는 `sessionStorage` (탭마다 따로) 에 저장합니다. 키: `token`, `role`, `room`, `pins`, `pin`, `teamId`, `studentNumber`.

## 백엔드에 없어서 다르게 만든 부분

- 방 이름·최대 인원: 서버에 저장되지 않고, 선생님 탭에서 제목 표시와 모둠 수 제한에만 씁니다.
- 이름 입력: 서버의 `studentNumber` 칸에 이름을 넣어 로그인합니다. 이름은 한글·숫자만, 최대 8글자입니다.
- 수정 횟수: 선생님 화면(현황·결과)에서 `/teams/{id}/progress` 의 `submitCount` 로 계산합니다. (`common.js` 의 `loadModifyCounts`)
- 문제풀이에서 Enter 를 치면 다음 문제로 넘어갑니다.
- 모둠 강퇴, 게임 종료(마감), 방 시작 여부 조회, 학생이 보는 전체 순위: API가 없어서 뺐거나 대체했습니다.
- 문제의 최대 제출 횟수: Figma에 입력칸이 없어 3으로 고정해 보냅니다.
