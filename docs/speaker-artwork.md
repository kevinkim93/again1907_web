# Speaker photos and poster — 2026-11-10

User supplied `강사 사진 모음-20261110T132041Z-1-001.zip` in Downloads.
Nine filenames identify the speakers. The original archive is unchanged.
Kim Jeongmin, Lee Enoch, and Choi Sanghoon have no supplied photograph;
their names and affiliations remain visible on the poster and website.

Background extraction used the built-in image_gen tool, one edit per photo.
The transparent results were encoded as WebP for delivery. Source filename and output mappings are recorded in `speaker-cutout-sources.json`.

## Prompt set

The same prompt was used once for each named input, ending with its output ID:

> Use case: background-extraction. Edit target: the supplied named speaker photograph. Remove only the background and any text/graphic design, creating a clean photographic upper-body cutout on a genuinely transparent alpha background. Preserve the exact original person's facial features, expression, glasses, hair, clothing, pose, proportions and photographic texture. Do not beautify or redraw the face. Keep the complete visible head and shoulders, chest-up portrait centered, no clipping of hair. For the CV graphic, isolate only the real man at upper right; remove all typography and globe. Output only this one person, no text, no shadows, no new objects. Intended asset: [output ID]

| Supplied photograph | Output ID |
| --- | --- |
| 고성준프로필 - 고성준.jpg | go-seongjun |
| 장승민 목사님.png | jang-seungmin |
| 이호목사님.jpg | lee-ho |
| 요하네스 목사님.jpg | yohannes-nahuway |
| 김권능 목사님.jpeg | kim-gwonneung |
| 최광목사님.JPG | choi-gwang |
| 조지훈 목사님.jpg | cho-jihoon |
| 임성일 선교사님.jpg | lim-seongil |
| 성현경 목사님.jpg | sung-hyunkyung |

## Poster composition

`scripts/generate-speaker-poster.py` uses the existing archival background,
self-hosted OFL fonts, and the same speaker roster as the timetable. It places
the transparent photographs alongside typeset names and affiliations. Worship
teams are text only, taken from the current timetable: 수원하나교회, 금란교회,
기쁨이 있는 교회, 화양교회.

Outputs: `public/images/again1907-6th-poster-speakers-v1.webp` and `.png`,
1080 × 1800. Rebuild with Pillow and fonttools installed:

```sh
python3 scripts/generate-speaker-poster.py
```

Portrait delivery assets: `public/images/speakers/*.webp`.

## Completed roster — 2026-11-12

The new Downloads archive supplies 김정민 목사님.jpg, 이에녹님.png and 최상훈 목사님.jpg. All twelve speakers now have photographs. The same built-in background-extraction workflow and prompt above were applied to these three files.

The v2 poster is 1080 × 2200, with all twelve photographs and a registration QR. PNG and WebP versions plus the standalone PNG/SVG QR are in public/images. QR payload is the exact registrationUrl from lib/gathering.js; decoded standalone and embedded QR outputs were verified.
