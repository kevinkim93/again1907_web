# Again 1907 · 제6차 집회

6차 집회 안내, 포스터, 참가 신청을 한 페이지로 제공합니다.

- 일정: **2027년 1월 25일(월)–30일(토), 5박 6일**
- 장소: **오산리기도원**, 경기도 파주시 조리읍 등원로391번길 42
- 정보 출처: [공식 신청 화면](https://yjchae.github.io/room-assignment/?g=b5bf14ba-0263-43b7-b331-02dc393c07ec), 2026-10-18 확인
- 확정되지 않은 강사와 접수 마감일은 표시하지 않습니다.

## 실행

프로젝트 위치: `lionandthelab/again1907/again1907_web`

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3007
```

미리보기: http://127.0.0.1:3007

```sh
npm run build
npm start -- --hostname 127.0.0.1 --port 3007
```

프로젝트의 지정 Node 버전은 `.nvmrc`를 참고하세요.

## 수정 위치

- `app/page.js`: 집회 안내와 포스터 레이아웃
- `app/globals.css`: 반응형 스타일
- `lib/gathering.js`: 장소, 신청 URL, 포스터 및 문의 링크
- `components/CinematicHero.js`: Gemini 영상 배경과 재생·일시정지
- `components/ScrollReveal.js`: 스크롤 진입 효과
- `components/GatheringEmbed.js`: 신청 화면 임베드와 새 창 열기
- `public/images/again1907-6th-poster.png`: 새 포스터 원본 (1086×1448)
- `docs/poster-prompt.txt`: ImageGen 생성 프롬프트
- `public/videos/again1907-6th-motion.mp4`: Gemini 채팅으로 생성한 8초 영상 (무음, 약 782KB)
- `public/images/again1907-6th-motion.jpg`: 영상 로딩 전 정지 이미지
- `docs/gemini-motion.txt`: 영상 생성 프롬프트와 출처

신청 화면은 외부 앱을 iframe으로 표시합니다. 외부 앱이 차단되거나 입력이 불편한 환경에서는 항상 표시되는 **새 창에서 신청하기** 링크를 사용할 수 있습니다. 외부 서비스의 회비·신청 상태·조회 기능은 해당 서비스에서 관리합니다.

기존 등록·관리자 경로와 데이터 파일은 보존했습니다. 메인 페이지에서는 새 신청 화면을 안내하며, 기존 경로는 `components/LegacySiteShell.js`로 기존 화면 틀을 유지합니다. 이 페이지 작업에는 Firebase 자격 증명이 필요하지 않습니다. 기존 관리자 기능 실행에는 해당 프로젝트의 Firebase 설정이 필요합니다.

## 운영 배포

운영 주소는 https://again1907.kr 입니다. Firebase App Hosting의 `again1907-web` 프로젝트, `us-east4` 리전, `again1907-web` backend에서 서비스합니다. 연결된 Git 저장소 `kevinkim93/again1907_web`의 `v2` 브랜치를 배포 대상으로 사용합니다.

배포 전 `npm run build`와 변경된 프런트엔드 파일의 ESLint를 실행하고, 운영 브랜치의 기존 관리자·API 변경을 포함했는지 확인합니다. `v2`에 푸시한 후 App Hosting rollout 성공과 실제 운영 페이지를 확인합니다. 기존 `firebase.json`의 Hosting 설정은 별도 구형 Hosting용이므로 이 도메인의 배포에 사용하지 않습니다.

영상은 무음으로 반복 재생되며 화면 밖에서는 정지합니다. 사용자가 모션 감소를 설정한 환경에서는 정지 이미지로 시작하며, 버튼으로 직접 재생할 수 있습니다. 스크롤 효과나 JavaScript 없이도 안내 내용은 표시됩니다.
