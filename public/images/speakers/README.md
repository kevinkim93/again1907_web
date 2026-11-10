# 강사 사진

아래 파일명으로 사진을 이 폴더에 넣고 저장소 루트에서 생성 스크립트를 실행한다.
사진이 없는 강사는 연회색 정사각형 자리로 남는다.

```sh
python scripts/generate-event-artwork.py
```

| 이름 | 직함 | 권장 파일명 |
| --- | --- | --- |
| 고성준 | 목사 | `go-seong-jun.jpg` |
| 장승민 | 목사 | `jang-seung-min.jpg` |
| 이호 | 목사 | `lee-ho.jpg` |
| Yohannes Nahuway | 목사 | `yohannes-nahuway.jpg` |
| 김권능 | 목사 | `kim-gwon-neung.jpg` |
| 김정민 | 목사 | `kim-jeong-min.jpg` |
| 이에녹 | 형제 | `lee-enoch.jpg` |
| 최광 | 목사 | `choi-gwang.jpg` |
| 조지훈 | 목사 | `cho-ji-hun.jpg` |
| 임성일 | 선교사 | `lim-seong-il.jpg` |
| 성현경 | 목사 | `seong-hyeon-gyeong.jpg` |
| 최상훈 | 목사 | `choi-sang-hun.jpg` |

- `.jpg`, `.jpeg`, `.png`, `.webp`를 지원한다. 파일명 대소문자는 구분하지 않는다.
- 같은 이름의 파일이 여러 개 있으면 위 확장자 순서로 선택한다. 강사마다 파일 하나만 두는 것을 권장한다.
- EXIF 회전을 적용한 뒤 사진 중앙을 기준으로 정사각형 크롭한다. 얼굴과 어깨가 중앙에 있는 사진을 사용하고 재생성 후 크롭을 확인한다.
- 파일을 추가·교체하면 생성 스크립트를 다시 실행해야 포스터에 반영된다.
- 이름·직함·순서는 `lib/gathering-schedule.js`의 `gatheringSpeakers`를 따른다. 명단이 바뀌면 생성 스크립트의 파일명 매핑도 수정한다.
- 사진 카드에는 이름과 직함만 표시한다. 별도 교회명·소속·태그는 추가하지 않는다.

이미지 규격과 배경·글꼴 출처는 [아트워크 문서](../../../docs/artwork.md)를 참고한다.
