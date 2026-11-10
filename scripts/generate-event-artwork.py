"""Rebuild photographic event assets: python scripts/generate-event-artwork.py.
Authoring dependencies: fonttools, Pillow. No network or build-time dependency.
Photo provenance and design references: docs/artwork.md.
"""
import argparse
import base64
import io
import re
from functools import lru_cache
from html import escape
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public' / 'images'
PHOTO = OUTPUT / 'pyeng-yang-prayer-meeting.jpg'
NAVY, PAPER, RED = '#142b45', '#f7f2e7', '#96483e'
FONTS = {
    'display': ('Gathering-Display-BlackItalic.woff', 900, 'italic'),
    'regular': ('Gathering-Myeongjo-Regular.woff', 400, 'normal'),
    'bold': ('Gathering-Myeongjo-ExtraBold.woff', 800, 'normal'),
}

@lru_cache
def raster_font(family, size):
    font = TTFont(ROOT / 'public' / 'fonts' / FONTS[family][0])
    font.flavor = None
    stream = io.BytesIO()
    font.save(stream)
    stream.seek(0)
    return ImageFont.truetype(stream, size)

def interpolate(stops, position):
    for (a, x), (b, y) in zip(stops, stops[1:]):
        if position <= b:
            return x + (y - x) * max(0, (position - a) / (b - a))
    return stops[-1][1]

def photograph(width, height, treatment):
    # Crop and grade only: retain actual people, architecture, and original grain.
    with Image.open(PHOTO) as source:
        photo = ImageOps.fit(source.convert('RGB'), (width, height),
                             method=Image.Resampling.LANCZOS, centering=(.5, .5))
    photo = ImageOps.colorize(ImageOps.grayscale(photo), black='#102033', white='#dfd5c1')
    mw, mh = 240, round(240 * height / width)
    mask = Image.new('L', (mw, mh))
    pixels = []
    for y in range(mh):
        v = y / (mh - 1)
        for x in range(mw):
            u = x / (mw - 1)
            if treatment == 'poster':
                shade = interpolate([(0,.35),(.30,.43),(.48,.06),(.66,.02),(.76,.48),(.86,.94),(1,.98)], v)
            elif treatment == 'share':
                shade = interpolate([(0,.83),(.36,.78),(.65,.13),(1,.06)], u)
                shade = max(shade, interpolate([(0,.12),(.68,.04),(1,.82)], v))
            else:
                shade = interpolate([(0,.76),(.45,.62),(1,.53)], u)
            pixels.append(round(255 * min(.99, shade + .10 * (abs(u - .5) * 2) ** 2)))
    mask.putdata(pixels)
    mask = mask.resize((width, height), Image.Resampling.BICUBIC)
    return Image.composite(Image.new('RGB', (width, height), NAVY), photo, mask)

class Artwork:
    def __init__(self, width, height, title, description, background):
        self.width, self.height = width, height
        self.title, self.description = title, description
        self.canvas = background.copy()
        self.draw = ImageDraw.Draw(self.canvas)
        stream = io.BytesIO()
        background.save(stream, format='JPEG', quality=87, optimize=True)
        encoded = base64.b64encode(stream.getvalue()).decode('ascii')
        self.elements = [f'<image width="{width}" height="{height}" href="data:image/jpeg;base64,{encoded}"/>']
        self.glyphs = {family: set() for family in FONTS}

    def text(self, value, x, y, size, font='regular', fill=PAPER, anchor='start'):
        self.glyphs[font].update(value)
        self.elements.append(
            f'<text x="{x}" y="{y}" font-family="Event-{font}" font-size="{size}" '
            f'font-weight="{FONTS[font][1]}" font-style="{FONTS[font][2]}" '
            f'fill="{fill}" text-anchor="{anchor}">{escape(value)}</text>')
        ra = {'start':'ls', 'end':'rs', 'middle':'ms'}[anchor]
        face = raster_font(font, size)
        bounds = self.draw.textbbox((x,y), value, font=face, anchor=ra)
        if bounds[0] < 0 or bounds[1] < 0 or bounds[2] > self.width or bounds[3] > self.height:
            raise ValueError(f'Text outside artwork: {value!r}, {bounds}')
        self.draw.text((x,y), value, font=face, fill=fill, anchor=ra)

    def rule(self, x, y, width, color=PAPER, thickness=1):
        self.elements.append(f'<path d="M{x} {y}h{width}" fill="none" stroke="{color}" stroke-width="{thickness}"/>')
        self.draw.line((x,y,x+width,y), fill=color, width=thickness)

    def rect(self, x, y, width, height, color):
        self.elements.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="{color}"/>')
        self.draw.rectangle((x,y,x+width,y+height), fill=color)

    def write(self, stem, png=False):
        styles = []
        for family, chars in self.glyphs.items():
            if not chars:
                continue
            filename, weight, style = FONTS[family]
            font = TTFont(ROOT / 'public' / 'fonts' / filename, recalcTimestamp=False)
            missing = set(map(ord, chars)) - font.getBestCmap().keys()
            if missing:
                raise ValueError(f'Missing glyphs in {filename}: {missing}')
            options = subset.Options()
            options.name_IDs = [0,1,2,3,4,5,6,13,14]
            options.name_legacy = True
            options.name_languages = ['*']
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(text=''.join(sorted(chars)))
            subsetter.subset(font)
            stream = io.BytesIO()
            font.save(stream)
            encoded = base64.b64encode(stream.getvalue()).decode('ascii')
            styles.append(f"@font-face{{font-family:Event-{family};font-weight:{weight};font-style:{style};src:url(data:font/woff;base64,{encoded}) format('woff')}}")
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!-- Real archival photograph: see docs/artwork.md. Fonts: SIL OFL 1.1. -->\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" height="{self.height}" '
            f'viewBox="0 0 {self.width} {self.height}" role="img" aria-labelledby="title description">\n'
            f'<title id="title">{escape(self.title)}</title>\n'
            f'<desc id="description">{escape(self.description)}</desc>\n'
            f'<defs><style>{"".join(styles)}</style></defs>\n'
            + '\n'.join(self.elements) + '\n</svg>\n')
        (OUTPUT / f'{stem}.svg').write_text(svg, encoding='utf-8')
        self.canvas.save(OUTPUT / f'{stem}.webp', quality=90, method=6)
        if png:
            self.canvas.quantize(colors=80 if self.height > 1000 else 192, method=Image.Quantize.MEDIANCUT,
                                 dither=Image.Dither.NONE).save(OUTPUT / f'{stem}.png', optimize=True)
        for suffix in (['svg','webp','png'] if png else ['svg','webp']):
            path = OUTPUT / f'{stem}.{suffix}'
            size = path.stat().st_size
            if size >= 600_000:
                raise ValueError(f'Image exceeds 600 KB budget: {path.name} ({size})')
            print(f'{path.name}: {self.width} x {self.height}, {size:,} bytes')

def poster():
    art = Artwork(1080,1350,'제6차 Again 1907 평양대부흥회',
        '2027.01.25(월)–01.30(토), 오산리기도원. 주님이 역사하시는 초자연적 부흥집회. 호세아 6:1. '
        '배경은 1908–1922년으로 기록된 평양 기도회 사진이며 1907년 집회 현장 사진은 아닙니다.',
        photograph(1080,1350,'poster'))
    art.rect(64,56,88,44,RED)
    art.text('제6차',108,86,25,'bold',anchor='middle')
    art.text('호세아 6:1',1016,85,23,anchor='end')
    art.text('Again 1907',532,260,137,'display',anchor='middle')
    art.text('평양대부흥회',540,386,100,'bold',anchor='middle')
    art.rule(510,433,60,RED,5)
    art.text('주님이 역사하시는 초자연적 부흥집회',540,492,32,'bold',anchor='middle')
    art.text('2027.01.25–01.30',540,1070,68,'bold',anchor='middle')
    art.text('월요일 — 토요일',540,1111,24,anchor='middle')
    art.text('오산리기도원',540,1177,47,'bold',anchor='middle')
    art.rule(64,1210,952,'#77828b')
    # Preserve names, titles, and order from the site's actual working programme.
    schedule = (ROOT / 'lib' / 'gathering-schedule.js').read_text(encoding='utf-8')
    roster = schedule.split('export const gatheringSpeakers = [',1)[1].split('];',1)[0]
    names = re.findall(r"name: '([^']+)'",roster)
    if len(names) != 12:
        raise ValueError('Speaker roster changed; review the three speaker lines.')
    for row in range(3):
        art.text(' · '.join(names[row*4:(row+1)*4]),540,1244+row*30,21,fill='#ddd7cb',anchor='middle')
    art.write('again1907-6th-poster',png=True)

def share():
    art = Artwork(1200,630,'제6차 Again 1907 평양대부흥회',
        '2027.01.25(월)–01.30(토), 오산리기도원. 주님이 역사하시는 초자연적 부흥집회. 호세아 6:1.',
        photograph(1200,630,'share'))
    art.rect(56,48,82,39,RED)
    art.text('제6차',97,75,23,'bold',anchor='middle')
    art.text('Again 1907',48,235,107,'display')
    art.text('평양대부흥회',56,332,70,'bold')
    art.text('주님이 역사하시는',59,398,25)
    art.text('초자연적 부흥집회',59,435,25)
    art.rule(58,474,52,RED,4)
    art.text('2027.01.25–01.30',56,532,37,'bold')
    art.text('오산리기도원',58,581,30,'bold')
    art.text('호세아 6:1',1144,581,19,anchor='end')
    art.write('again1907-6th-share',png=True)

def theme():
    art = Artwork(1200,630,'주님이 역사하시는 초자연적 부흥집회',
        '제6차 Again 1907 평양대부흥회. 주제말씀 호세아 6:1. 오라 우리가 여호와께로 돌아가자.',
        photograph(1200,630,'theme'))
    art.text('Again 1907',60,78,32,'display')
    art.text('제6차 평양대부흥회',1140,76,23,anchor='end')
    art.rule(60,166,60,RED,5)
    art.text('주님이 역사하시는',60,274,65,'bold')
    art.text('초자연적 부흥집회',60,368,65,'bold')
    art.text('오라 우리가 여호와께로 돌아가자.',64,484,30)
    art.text('호세아 6:1',64,535,23)
    art.write('again1907-theme')
    # Text-free image for accessible HTML theme copy, independently responsive.
    with Image.open(PHOTO) as source:
        wide = ImageOps.fit(source.convert('RGB'),(1600,900),method=Image.Resampling.LANCZOS)
    wide = ImageOps.colorize(ImageOps.grayscale(wide),black='#102033',white='#dfd5c1')
    wide.save(OUTPUT / 'again1907-photo.webp',quality=84,method=6)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--png',action='store_true',help='Compatibility flag; PNGs are always generated')
    parser.parse_args()
    poster()
    share()
    theme()
