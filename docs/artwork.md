# 제6차 Again 1907 아트워크

사용자가 제공한 제5차 집회 포스터를 구성과 스타일의 기준으로 삼았다.
흰색·실버 바탕에 선명한 적색·청색 붓 터치, 짙은 남색 글자를 사용한다.
실제 평양 기도회 기록사진은 밝고 채도를 낮춘 배경으로 남겼다.
붓 터치는 고정된 난수 시드로 그리므로 같은 입력으로 다시 생성할 수 있다.
네온 발광이나 생성형 인물 사진은 사용하지 않는다.

상단 안내 문구와 기존 `again_logo.png` 로고 → 큰 행사명 → 장소·날짜 →
강사 6명씩 두 줄 → 사이트 안내 순서다. 제5차 포스터의 강사 사진, 전화번호,
찬양팀 명단, 등록 기간과 안내 문구는 재사용하지 않는다.
이번 수정 범위는 포스터·공유 아트워크와 생성 스크립트·제작 문서이며,
홈페이지 색상·하늘 히어로 영상·레이아웃과 기존 주제 아트워크는 유지한다.

## 행사 정보의 기준

- 장소: `lib/gathering.js`의 **오산리기도원**.
- 날짜: `lib/gathering-schedule.js`의 `scheduleDays`,
  **2027년 1월 25일(월) - 30일(토)**.
- 강사 이름·직함·순서: 같은 파일의 `gatheringSpeakers` 12명.
  각 카드에는 이름과 직함만 표시하며 교회명·소속·태그는 추가하지 않는다.
- 하단: 기존 사이트의 참가 신청·일정 안내와 `again1907.kr`.
  QR 대상은 `lib/site-metadata.js`의 정식 사이트 주소에 맞춘
  **https://again1907.kr/** 이다.

`lib/gathering.js`에는 날짜와 강사 배열이 없고, 강사 정보 관리 파일을
`gathering-schedule.js`로 안내한다. 일정 파일은 현재 명단을 작업 중인
프로그램으로 명시한다. 포스터 제작 자체가 출연 확정을 뜻하지 않는다.
강사 인원·이름·직함이 바뀌면 사진 파일명 매핑과 배치를 함께 검토한다.

## 강사 사진 추가

사진은 `public/images/speakers/`에 저장한다. 파일명 전체 목록은
[speakers/README.md](../public/images/speakers/README.md)에 있다.
예: `go-seong-jun.jpg`, `yohannes-nahuway.png`.

생성기는 `.jpg`, `.jpeg`, `.png`, `.webp` 순서로 파일을 찾으며 대소문자를
구분하지 않는다. 같은 강사의 파일은 하나만 두는 것을 권장한다.
EXIF 방향을 적용한 뒤 중앙을 기준으로 정사각형 크롭하고 카드 크기로 줄인다.
파일이 없으면 연회색 사진 자리만 표시한다. 실제 사진을 제공받기 전에는
다른 사람의 사진이나 생성한 얼굴로 대체하지 않는다.

## 사진 출처와 이용 조건

- 작품: **Prayer meeting, Pyeng Yang, [s.d.]** — 평양의 정기 기도회 기록사진.
- [Wikimedia Commons 원문·라이선스](https://commons.wikimedia.org/wiki/File:Prayer_meeting,_Pyeng_Yang,_(s.d.)_(Taylor_box21num64).jpg)
- [원본 JPEG 다운로드](https://upload.wikimedia.org/wikipedia/commons/f/fc/Prayer_meeting%2C_Pyeng_Yang%2C_%28s.d.%29_%28Taylor_box21num64%29.jpg)
- [USC Digital Library 원소장 기록](https://digitallibrary.usc.edu/cdm/ref/collection/p15799coll48/id/761)
- 촬영자 표기: Methodist Episcopal Church.
- 소장: The Reverend Corwin & Nellie Taylor Collection / USC Korean Digital Archive.
- 기록상 연대: **1908–1922**. 정확히 1907년의 집회나 장대현교회 사진이라고 표기하지 않는다.
- 이용 조건: Commons에서 **Public domain**으로 표시한 사진. 근거 태그는
  `PD-Japan-oldphoto`, `PD-1996 (with a reason)`이다. Commons의 설명문 라이선스와 사진의 이용 조건을 구분한다.
- 저장 파일: `public/images/pyeng-yang-prayer-meeting.jpg` — 원본 전체 구도를 유지해
  2000 × 1472로 축소·최적화한 JPEG, 426,671 bytes.

기록사진은 크롭·명암·채도 조정으로 밝은 배경에 합성한다.
원본의 인물·건축·질감은 유지하며 새 인물이나 장면을 생성하지 않는다.
기존 주제 이미지의 남색·미색 사진 처리는 별도로 유지한다.

## 생성 파일

아래 경로는 `public/images/` 기준이다.

| 파일 | 크기 | 용도 |
| --- | --- | --- |
| `again1907-6th-poster.webp` / `.png` / `.svg` | 1080 × 1350 | 포스터·다운로드 |
| `again1907-6th-share.webp` / `.png` / `.svg` | 1200 × 630 | 소셜 공유 |

PNG는 256색 팔레트, WebP는 품질 94로 저장한다. 포스터·공유 SVG는 PNG를
내장한 래스터 래퍼이므로 별도 파일이나 글꼴 요청 없이 같은 구도를 표시한다.
Windows 글꼴 파일을 SVG에 배포하지 않는다. 소셜 미리보기는 PNG를 사용한다.

기본 실행은 위 여섯 파일만 갱신한다. `again1907-theme.webp` / `.svg`
(1200 × 630)와 `again1907-photo.webp` (1600 × 900)는 이번 수정 대상이 아니다.
기존 주제 아트워크의 별도 재생성이 필요할 때만 `--include-theme`를 사용한다.

## 다시 생성하기

```sh
python -m pip install fonttools pillow qrcode
python scripts/generate-event-artwork.py
```

문구와 배치는 `scripts/generate-event-artwork.py`에서 관리한다.
기존 `--png` 옵션은 호환용으로 유지하며, PNG는 옵션 없이도 생성한다.
미리보기 PNG를 별도 경로에 복사하려면 다음과 같이 실행한다.

```powershell
python scripts/generate-event-artwork.py --preview "C:\Users\ikess\dev\shots\poster_v5.png"
```

미리보기 경로에는 쓰기 권한이 필요하다. 저장된 사진과 로컬 글꼴을 사용하므로
의존성을 설치한 뒤에는 브라우저나 네트워크 없이 생성할 수 있다.
Python·fontTools·Pillow·qrcode는 제작 도구이며 Next.js의 빌드·실행 의존성이 아니다.

## 글꼴과 확인 사항

한글 안내·날짜·강사명에는 Windows의 맑은 고딕을 사용한다.
기본 글꼴 위치는 `C:\Windows\Fonts`이며, 다른 설치 위치에서는
`MALGUN_FONT_DIR` 환경 변수로 `malgun.ttf`와 `malgunbd.ttf`가 있는 폴더를
지정한다. 글꼴은 로컬 렌더링에만 사용하고 저장소에 복사하지 않는다.
영문 디스플레이와 한글 제목에는 저장소의 Playfair Display·Nanum Myeongjo
기반 글꼴을 사용한다. 출처와 SIL Open Font License 1.1은
`public/fonts/SOURCES.txt`, `NanumMyeongjo-OFL.txt`, `PlayfairDisplay-OFL.txt`에 있다.

재생성 후 포스터·공유 이미지의 크기, 전체 한글 표시, 긴 영문 강사명,
사진 12칸과 QR의 가독성을 확인한다. 사진을 추가한 경우 얼굴이 중앙 크롭
안에 들어오는지 직접 확인한다. 사용자 요청에 따라 이번 작업에서는
`npm run build`, git commit, git push를 실행하지 않는다.

2026-11-10 검증: 포스터·공유 PNG를 직접 확인하고, 한글 글리프·문자 경계·겹침
검사를 통과했다. 두 번 생성한 여섯 파일의 SHA-256이 같았으며 PNG/WebP 크기,
SVG에 내장된 PNG 일치, QR 모듈과 대상 URL 일치를 확인했다. 임시 사진으로
파일명 대소문자·확장자 우선순위·중앙 크롭·EXIF 회전 처리를 검증했다.
홈페이지·영상·주제 이미지에 변경이 없는 것도 Git 변경 목록으로 확인했다.

요청한 `C:\Users\ikess\dev\shots\poster_v5.png` 복사는 저장소 밖 쓰기를 막는
샌드박스에서 `PermissionError`로 차단되었다. 이번 실행의 미리보기는 저장소 안
`.artifacts/poster_v5.png`에 저장했으며, 최종 포스터 PNG와 바이트 단위로 같다.
