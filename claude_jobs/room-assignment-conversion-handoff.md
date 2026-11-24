# room-assignment: Again 1907 신청 완료 → Google Ads 전환 알림

받는 사람: `yjchae/room-assignment` 관리자 (yjchae / 1907)
패치: [`room-assignment-conversion.patch`](./room-assignment-conversion.patch). `main` `f2163c5`(PR #13 머지) 기준 `git diff` 이고, 맨 위에 커밋 메시지 초안이 있습니다.

## 한국어

**왜 필요한가.** again1907.kr 의 Google Ads 광고(계정 461-329-7845)가 실제 참가 신청으로 이어졌는지 세려고 합니다. 공식 신청은 again1907.kr 이 아니라 이 앱(`https://yjchae.github.io/room-assignment/?g=b5bf14ba-…`)에서 이루어지고, again1907.kr 은 이 앱을 iframe 으로 넣거나 [새 창에서 열기]로 띄웁니다. 그래서 신청이 끝났다는 신호는 이 앱만 보낼 수 있습니다. again1907.kr 쪽 수신 코드는 이미 들어가 있습니다.

**광고비와는 상관없습니다.** 이 패치는 캠페인·예산·입찰을 건드리지 않습니다. "신청 1건 접수"라는 사실만 Google Ads 에 알리며, 이름·전화번호 같은 개인정보는 보내지 않습니다.

**바뀌는 것**
- `web/index.html`: gtag 기본 스니펫(`AW-17966875294`, linker 도메인 `again1907.kr`·`yjchae.github.io`)을 넣고, `window.again1907RegistrationComplete()` 함수를 만듭니다. 이 함수는 두 가지를 합니다.
  1. `gtag('event', 'conversion', { send_to: 'AW-17966875294/4VmgCOmfxr4dEJ6Fo_dC' })`: [새 창에서 열기]로 직접 연 사람용.
  2. iframe 안이면 `window.parent.postMessage({ type: 'again1907-registration-complete' }, 'https://again1907.kr')`: again1907.kr 이 받아서 전환을 기록합니다. 받는 주소를 `'*'` 가 아니라 정확히 지정합니다.
  - 스탭 링크(`?staff=1`)와 운영자 웹(`/admin/`, 같은 `web/index.html` 로 빌드됨)에서는 스크립트 전체를 건너뜁니다. 그래서 그 화면에는 분석 태그가 없습니다.
- `lib/ads_conversion.dart` (+ `_web` / `_stub`): 조건부 export 입니다. 웹에서만 `dart:js_interop` 으로 위 함수를 부릅니다. macOS·Windows 운영자 앱과 `flutter test`(VM)에서는 아무것도 하지 않습니다. pubspec 변경은 없습니다.
- `lib/main_public.dart`: `DonePage` 를 `StatefulWidget` 으로 바꾸고 `initState` 에서 `if (kIsWeb) reportRegistrationComplete();` 를 한 번 부릅니다. `DonePage` 는 새 신청의 `remote.submit` 이 성공한 뒤에만 뜹니다(`ApplyPage._submit`, `!widget.admin && !editing`). 입력 오류, 확인 창 취소, 서버 오류, 조회, 수정(`updateMine`), 취소(`cancelMine`), 운영자 추가(`adminSubmit`)에서는 부르지 않습니다. 화면 문구·동작은 그대로입니다.
- `CLAUDE.md`: 웹 빌드 파일 목록에 `ads_conversion.dart` 를 추가했습니다.

**적용**
```sh
git checkout main && git pull
git apply /path/to/room-assignment-conversion.patch    # 또는: patch -p1 < room-assignment-conversion.patch
flutter analyze && flutter test
git add -A lib web CLAUDE.md && git commit -m "신청 완료 시 Google Ads 전환 알림 (again1907.kr)"
git push origin main                                   # deploy-web.yml 이 Pages 에 배포
```

**배포 뒤 확인** (실제 신청을 넣지 않아도 됩니다)
- `https://yjchae.github.io/room-assignment/?g=b5bf14ba-0263-43b7-b331-02dc393c07ec` 에서 개발자 도구 콘솔에 `typeof again1907RegistrationComplete` 를 치면 `"function"` 이 나와야 합니다.
- 같은 주소에 `&staff=1` 을 붙인 페이지와 `/room-assignment/admin/` 에서는 `"undefined"` 가 나와야 합니다.

## English (short)

- **Why:** again1907.kr runs Google Ads. The official signup happens in this Flutter web app, either iframed on again1907.kr or opened in a new window, so only this app knows when a registration succeeded. The again1907.kr listener is already deployed.
- **No ad spend:** the patch only reports a "registration completed" event to Google Ads. It does not touch campaigns, budgets or bids, and sends no personal data.
- **What:** `web/index.html` loads gtag `AW-17966875294` (with linker domains `again1907.kr` and `yjchae.github.io`) and defines `again1907RegistrationComplete()`. That function fires the Ads conversion `AW-17966875294/4VmgCOmfxr4dEJ6Fo_dC` and, when framed, calls `postMessage({type:'again1907-registration-complete'}, 'https://again1907.kr')`. The whole script is skipped on `?staff=1` and on the `/admin/` build. `DonePage` (now a `StatefulWidget`) calls it once from `initState`, behind `kIsWeb` and a conditional `dart:js_interop` import, so the desktop admin app and VM tests are unaffected. It runs only after a successful new public `remote.submit`. It does not run for edit, lookup, cancel, admin submit, validation errors or failed requests.
- **Duplicates:** when the app is iframed, both the iframe gtag and the again1907.kr parent fire for the same signup. The conversion action counts **one per click**, so Google Ads records it at most once per ad click.
- **Apply:** `git apply room-assignment-conversion.patch` on `main` `f2163c5`, then `flutter analyze && flutter test`, commit, and push `main`.
- **Verified locally with Flutter 3.47.2 (the CI version):** `flutter analyze` reports no issues, `flutter test` passes (504 tests), and both CI web builds (`main.dart` → `/admin/`, `main_public.dart`) succeed. A headless-Chrome run with network interception also checked the following: the iframed `DonePage` → parent again1907.kr records one conversion; the new-window `DonePage` records one conversion; the public page view records none; `?staff=1` and `/admin/` load no tag.
