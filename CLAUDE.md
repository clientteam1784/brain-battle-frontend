# client_front 작업 이어가기 (인수인계 노트)

> 이 폴더에서 새로 시작하면 이 파일을 먼저 읽고 이어서 작업한다.

## 프로젝트

수학퀴즈배틀 프론트. Figma(파일 키 `4zcEbitGBe1gmqycwFg7we`, 페이지 "수학 퀴즈 배틀 UI", 프레임 11개)를 화면별 HTML/CSS + 짧은 JS로 만든 것이 `pages/` 이고, 이것이 **유일한 프론트**다.

- 옛 단일 페이지 앱(`index.html`, `js/`, `css/`, `vendor/`)은 삭제했다. 원본 React 프로젝트는 `C:\Users\User\Desktop\AIProgram_frontend` (읽기 전용 참고).
- 백엔드: `backend_with_py/brain-battle-backend` (FastAPI, `app/api.py`, API 명세는 `docs/API_SPEC.md`).
- 구조·실행·화면 이동은 `README.md` 를 본다.

## 코드 규칙

- JavaScript는 높은 수준으로 만들지 않는다 (사용자 요청). 모듈·번들러 없이 `<script src>` 와 전역 함수, `fetch`, `sessionStorage`만 쓴다.
- 화면 하나 = `pages/<이름>.html` + `css/<이름>.css` + `js/<이름>.js`. 공통은 `common.css`, `common.js`.
- 사용자 입력은 `el()` / `textContent` 로만 넣는다 (innerHTML 금지).
- 디자인 값(색, 크기)은 Figma 값을 따른다. 색은 `common.css` 의 `:root` 변수에 있다
