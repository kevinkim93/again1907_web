"""Compose the official poster from supplied speaker cutouts and existing fonts.

Run after preparing transparent WebP files in public/images/speakers.
The text/layout is authored here; speaker faces are never synthesized here.
"""
import json
import re
from pathlib import Path
from PIL import Image
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parents[1]
spec = spec_from_file_location('event_artwork', ROOT / 'scripts/generate-event-artwork.py')
base = module_from_spec(spec)
spec.loader.exec_module(base)

source = (ROOT / 'lib/gathering-schedule.js').read_text()
roster = source.split('export const gatheringSpeakers = [', 1)[1].split('];', 1)[0]
speakers = []
for entry in re.findall(r'\{([^{}]+)\}', roster):
    fields = dict(re.findall(r"(name|affiliation|photo): '([^']+)'", entry))
    speakers.append(fields)

W, H = 1080, 1800
paper, ink, red = '#f7f2e7', '#142b45', '#96483e'
canvas = Image.new('RGB', (W, H), paper)
canvas.paste(base.photograph(W, 690, 'poster'), (0, 0))
art = base.Artwork(W, H, '제6차 Again 1907 평양대부흥회',
    '2027년 1월 25일부터 30일까지 오산리기도원. 강사 12명과 찬양팀 안내.', canvas)
art.rect(60, 46, 86, 40, red)
art.text('제6차', 103, 74, 24, 'bold', anchor='middle')
art.text('주제말씀 · 호세아 6:1', 1020, 74, 23, anchor='end')
art.text('Again 1907', 532, 231, 137, 'display', anchor='middle')
art.text('평양대부흥회', 540, 345, 96, 'bold', anchor='middle')
art.text('주님이 역사하시는 초자연적 부흥집회', 540, 414, 31, 'bold', anchor='middle')
art.rule(507, 454, 66, red, 4)
art.text('2027.01.25 — 01.30', 540, 522, 56, 'bold', anchor='middle')
art.text('월요일 — 토요일', 540, 562, 25, anchor='middle')
art.text('오산리기도원', 540, 625, 43, 'bold', anchor='middle')
art.text('월요일 오후 3시 등록 시작', 540, 662, 23, anchor='middle')

art.text('강사', 60, 746, 29, 'bold', fill=ink)
art.rule(142, 736, 878, '#bfb6a5')
with_photos = [s for s in speakers if s.get('photo')]
for index, speaker in enumerate(with_photos):
    row, col = divmod(index, 3)
    cx, top = 222 + col * 318, 770 + row * 252
    cutout = Image.open(ROOT / 'public' / speaker['photo'].lstrip('/')).convert('RGBA')
    cutout.thumbnail((228, 172), Image.Resampling.LANCZOS)
    x, y = round(cx - cutout.width / 2), top + 172 - cutout.height
    art.canvas.paste(cutout, (x, y), cutout)
    # Each name is typeset from the same roster used by the website.
    if speaker['name'] == 'Yohannes Nahuway 목사':
        art.text('Yohannes Nahuway', cx, top + 201, 24, 'bold', fill=ink, anchor='middle')
        art.text('목사 · Mawar saron교회', cx, top + 232, 18, fill=ink, anchor='middle')
    else:
        art.text(speaker['name'], cx, top + 204, 26, 'bold', fill=ink, anchor='middle')
        art.text(speaker['affiliation'], cx, top + 235, 18, fill=ink, anchor='middle')

art.rule(60, 1546, 960, '#bfb6a5')
without_photos = [s for s in speakers if not s.get('photo')]
for index, speaker in enumerate(without_photos):
    cx = 222 + index * 318
    art.text(speaker['name'], cx, 1589, 25, 'bold', fill=ink, anchor='middle')
    art.text(speaker['affiliation'], cx, 1621, 18, fill=ink, anchor='middle')

art.rule(60, 1654, 960, '#bfb6a5')
art.text('찬양팀', 60, 1698, 25, 'bold', fill=red)
art.text('수원하나교회 · 금란교회 · 기쁨이 있는 교회 · 화양교회', 60, 1741, 26, 'bold', fill=ink)
art.text('again1907.kr', 1020, 1780, 22, fill=ink, anchor='end')

stem = ROOT / 'public/images/again1907-6th-poster-speakers-v1'
art.canvas.save(stem.with_suffix('.webp'), quality=94, method=6)
art.canvas.save(stem.with_suffix('.png'), optimize=True)
print(json.dumps({'poster': str(stem.with_suffix('.webp')), 'size': [W, H],
    'photoCount': len(with_photos), 'speakerCount': len(speakers)}, ensure_ascii=False))
