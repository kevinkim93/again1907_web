"""Rebuild poster/share assets: python scripts/generate-event-artwork.py.
Authoring dependencies: fonttools, Pillow, qrcode. No network/build dependency.
Photo provenance and design references: docs/artwork.md.
"""
import argparse
import base64
import io
import math
import os
import random
import re
from datetime import date
from functools import lru_cache
from html import escape
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageOps
import qrcode

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

INK, BLUE, VERMILION = '#15293f', '#07549b', '#d32636'
SPEAKER_DIR = OUTPUT / 'speakers'
SPEAKER_SLUGS = {
    '고성준': 'go-seong-jun', '장승민': 'jang-seung-min', '이호': 'lee-ho',
    'Yohannes Nahuway': 'yohannes-nahuway', '김권능': 'kim-gwon-neung',
    '김정민': 'kim-jeong-min', '이에녹': 'lee-enoch', '최광': 'choi-gwang',
    '조지훈': 'cho-ji-hun', '임성일': 'lim-seong-il',
    '성현경': 'seong-hyeon-gyeong', '최상훈': 'choi-sang-hun',
}
PHOTO_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')


def event_content():
    """Read the site's existing JS literals; fail visibly if their schema changes."""
    gathering = (ROOT / 'lib/gathering.js').read_text(encoding='utf-8')
    schedule = (ROOT / 'lib/gathering-schedule.js').read_text(encoding='utf-8')
    metadata = (ROOT / 'lib/site-metadata.js').read_text(encoding='utf-8')
    venue = re.search(r"venue:\s*'([^']+)'", gathering).group(1)
    title = re.search(r"name:\s*'([^']+)'", gathering).group(1)
    edition = re.match(r'제\d+차', title).group()
    site_url = re.search(r"export const siteUrl = '([^']+)'", metadata).group(1)
    days = schedule.split('export const scheduleDays = [', 1)[1].split('];', 1)[0]
    dates = [date.fromisoformat(value) for value in re.findall(r"dateTime: '([^']+)'", days)]
    start, end = dates[0], dates[-1]
    if start.year != end.year or start.month != end.month or start > end:
        raise ValueError('Review the date layout for the new event range.')
    weekdays = '월화수목금토일'
    date_label = (f'{start.year}년 {start.month}월 {start.day}일({weekdays[start.weekday()]})'
                  f' - {end.day}일({weekdays[end.weekday()]})')
    roster = schedule.split('export const gatheringSpeakers = [', 1)[1].split('];', 1)[0]
    speakers = [name.rsplit(' ', 1) for name in re.findall(r"name: '([^']+)'", roster)]
    if len(speakers) != 12 or any(name not in SPEAKER_SLUGS for name, _ in speakers):
        raise ValueError('Speaker roster changed; update photo slugs and review the 2 × 6 layout.')
    return dict(title=title, edition=edition, venue=venue, dates=date_label,
                speakers=speakers, site_url=site_url.rstrip('/') + '/')


@lru_cache
def bright_font(family, size):
    if family in FONTS:
        return raster_font(family, size)
    directory = Path(os.environ.get('MALGUN_FONT_DIR', 'C:/Windows/Fonts'))
    path = directory / ('malgunbd.ttf' if family == 'sans-bold' else 'malgun.ttf')
    if not path.is_file():
        raise FileNotFoundError(f'{path}: set MALGUN_FONT_DIR to a folder containing Malgun Gothic.')
    return ImageFont.truetype(str(path), size)


@lru_cache
def bright_glyphs(family):
    if family in FONTS:
        path = ROOT / 'public/fonts' / FONTS[family][0]
    else:
        directory = Path(os.environ.get('MALGUN_FONT_DIR', 'C:/Windows/Fonts'))
        path = directory / ('malgunbd.ttf' if family == 'sans-bold' else 'malgun.ttf')
    with TTFont(path) as face:
        return set(face.getBestCmap())


def brush(canvas, points, width, color, seed):
    """A repeatable dry-brush swipe: individual bristles, no glow or blur."""
    rng = random.Random(seed)
    scale = 2
    mask = Image.new('L', (canvas.width * scale, canvas.height * scale))
    pen = ImageDraw.Draw(mask)
    p0, p1, p2 = points
    for strand in range(round(width * 4)):
        offset = rng.uniform(-.5, .5)
        start, end = rng.uniform(0, .12), rng.uniform(.78, 1)
        coords = []
        for i in range(70):
            t = start + (end - start) * i / 69
            x = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0]
            y = (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]
            dx = 2*(1-t)*(p1[0]-p0[0]) + 2*t*(p2[0]-p1[0])
            dy = 2*(1-t)*(p1[1]-p0[1]) + 2*t*(p2[1]-p1[1])
            norm = math.hypot(dx, dy)
            spread = width * math.sin(math.pi*t)**.35
            jitter = rng.uniform(-.7, .7)
            coords.append(((x-dy/norm*(offset*spread+jitter))*scale,
                           (y+dx/norm*(offset*spread+jitter))*scale))
        pen.line(coords, fill=rng.randint(110, 245), width=rng.randint(1, 4))
    mask = mask.resize(canvas.size, Image.Resampling.LANCZOS)
    canvas.paste(Image.new('RGB', canvas.size, color), (0, 0), mask)


def bright_background(width, height):
    canvas = Image.new('RGB', (width, height), '#fcfcfd')
    photo_height = 790 if height > 1000 else height
    with Image.open(PHOTO) as source:
        photo = ImageOps.fit(source.convert('RGB'), (width, photo_height),
                             method=Image.Resampling.LANCZOS)
    photo = ImageOps.colorize(ImageOps.grayscale(photo), '#c9d1d9', '#ffffff')
    mask = Image.new('L', (1, photo_height))
    mask.putdata([round(255 * interpolate([(0,.30),(.40,.48),(.65,.76),(.84,.40),(1,0)],
                                         y / (photo_height-1))) for y in range(photo_height)])
    canvas.paste(photo, (0, 0), mask.resize(photo.size))
    if height > 1000:
        brush(canvas, [(-180,110), (80,-60), (620,-175)], 110, VERMILION, 1907)
        brush(canvas, [(960,665), (1115,440), (1195,155)], 100, BLUE, 1908)
    else:
        brush(canvas, [(-180,90), (80,-70), (570,-160)], 100, VERMILION, 1907)
        brush(canvas, [(855,730), (1090,505), (1300,135)], 155, BLUE, 1908)
    return canvas


class BrightArtwork:
    """Render at 2× for crisp small text; check text bounds and mutual overlaps."""
    scale = 2

    def __init__(self, width, height, content):
        self.width, self.height, self.content = width, height, content
        self.canvas = bright_background(width, height).resize((width*2, height*2), Image.Resampling.LANCZOS)
        self.draw = ImageDraw.Draw(self.canvas)
        self.text_boxes = []

    def text(self, value, x, y, size, family='sans-bold', fill=INK, anchor='ls',
             max_width=None, halo=0):
        missing = set(map(ord, value)) - bright_glyphs(family)
        if missing:
            raise ValueError(f'Missing glyphs: {value!r} {missing}')
        font = bright_font(family, round(size * self.scale))
        bounds = self.draw.textbbox((x*2,y*2), value, font=font, anchor=anchor,
                                   stroke_width=halo*2)
        box = tuple(v/2 for v in bounds)
        if box[0] < 0 or box[1] < 0 or box[2] > self.width or box[3] > self.height:
            raise ValueError(f'Text outside artwork: {value!r}: {box}')
        if max_width is not None and box[2]-box[0] > max_width:
            raise ValueError(f'Text exceeds its column: {value!r}: {box[2]-box[0]} > {max_width}')
        for previous, other in self.text_boxes:
            if max(box[0], other[0]) < min(box[2], other[2]) and max(box[1], other[1]) < min(box[3], other[3]):
                raise ValueError(f'Text overlap: {value!r} and {previous!r}')
        self.text_boxes.append((value, box))
        self.draw.text((x*2,y*2), value, font=font, fill=fill, anchor=anchor,
                       stroke_width=halo*2, stroke_fill='#ffffff')

    def rule(self, x, y, width, color='#b6c4d1', thickness=1):
        self.draw.line((x*2,y*2,(x+width)*2,y*2), fill=color, width=thickness*2)

    def paste(self, picture, x, y, width, height):
        picture = picture.convert('RGBA').resize((width*2,height*2), Image.Resampling.LANCZOS)
        self.canvas.paste(picture, (x*2,y*2), picture)

    def logo(self, x, y, width):
        with Image.open(OUTPUT / 'again_logo.png') as logo:
            self.paste(logo, x, y, width, round(width*logo.height/logo.width))

    def korean_title(self, x, baseline, size):
        # Same traditional display face as the site's existing artwork.
        left = bright_font('bold', size*2).getlength('평양') / 2
        self.text('평양', x, baseline, size, 'bold', BLUE, halo=3)
        self.text('대부흥회', x+left+9, baseline, size, 'bold', VERMILION, halo=3)

    def qr(self, x, y, module=3):
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=4)
        qr.add_data(self.content['site_url'])
        qr.make(fit=True)
        matrix = qr.get_matrix()
        size = len(matrix)*module
        self.draw.rectangle((x*2,y*2,(x+size)*2,(y+size)*2), fill='white')
        for row, values in enumerate(matrix):
            for col, dark in enumerate(values):
                if dark:
                    self.draw.rectangle(((x+col*module)*2,(y+row*module)*2,
                                         (x+(col+1)*module)*2-1,(y+(row+1)*module)*2-1), fill=INK)

    def write(self, stem):
        canvas = self.canvas.resize((self.width,self.height), Image.Resampling.LANCZOS)
        canvas.save(OUTPUT / f'{stem}.webp', quality=94, method=6)
        png = canvas.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        png_path = OUTPUT / f'{stem}.png'
        png.save(png_path, optimize=True)
        # Embed rendered pixels so the SVG cannot redistribute system font files
        # or display differently when Malgun Gothic is unavailable to a viewer.
        encoded = base64.b64encode(png_path.read_bytes()).decode('ascii')
        description = (f"{self.content['dates']}, {self.content['venue']}. "
                       '배경: 1908–1922년으로 기록된 평양 기도회 사진. ')
        if stem.endswith('poster'):
            description += '강사: ' + ', '.join(' '.join(person) for person in self.content['speakers'])
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" height="{self.height}" '
               f'viewBox="0 0 {self.width} {self.height}" role="img" aria-labelledby="title description">\n'
               f'<title id="title">{escape(self.content["title"])}</title>\n'
               f'<desc id="description">{escape(description)}</desc>\n'
               f'<image width="{self.width}" height="{self.height}" href="data:image/png;base64,{encoded}"/>\n</svg>\n')
        (OUTPUT / f'{stem}.svg').write_text(svg, encoding='utf-8')
        for extension in ('png', 'webp', 'svg'):
            path = OUTPUT / f'{stem}.{extension}'
            print(f'{path.name}: {self.width} × {self.height}, {path.stat().st_size:,} bytes')


def speaker_photo(name):
    slug = SPEAKER_SLUGS[name]
    files = {path.name.lower(): path for path in sorted(SPEAKER_DIR.iterdir()) if path.is_file()} if SPEAKER_DIR.exists() else {}
    for extension in PHOTO_EXTENSIONS:
        path = files.get(slug + extension)
        if path:
            with Image.open(path) as source:
                source = ImageOps.exif_transpose(source).convert('RGBA')
                background = Image.new('RGBA', source.size, '#edf0f3')
                background.alpha_composite(source)
                return ImageOps.fit(background.convert('RGB'), (528,528),
                                    method=Image.Resampling.LANCZOS, centering=(.5,.5))
    return None


def speaker_card(art, name, title, x, y):
    side, center = 132, x+66
    photo = speaker_photo(name)
    if photo is not None:
        art.paste(photo, x, y, side, side)
    else:
        art.draw.rectangle((x*2,y*2,(x+side)*2-1,(y+side)*2-1), fill='#edf0f3', outline='#dce2e8', width=2)
        # Deliberately empty photo space; no synthetic likeness or affiliation.
        art.text('사진', center, y+74, 17, 'sans', '#8e9aa7', anchor='ms', max_width=side)
    if ' ' in name:
        first, last = name.split(' ', 1)
        art.text(first, center, y+163, 21, anchor='ms', max_width=side+16)
        art.text(last, center, y+188, 21, anchor='ms', max_width=side+16)
    else:
        art.text(name, center, y+176, 27, anchor='ms', max_width=side)
    art.text(title, center, y+209, 19, 'sans', '#536276', anchor='ms', max_width=side)


def poster(content):
    art = BrightArtwork(1080,1350,content)
    art.text(f"{content['edition']}  주님의 이름만 높여지는", 64,88,30, max_width=790)
    art.logo(916,24,106)
    art.text('Again 1907', 529,284,139,'display',anchor='ms',halo=4,max_width=962)
    art.korean_title(204,413,104)
    art.text(content['venue'], 540,509,43,anchor='ms',halo=1)
    art.text(content['dates'], 540,568,36,anchor='ms',max_width=952)
    art.text('주님이 역사하시는 초자연적 부흥집회', 540,636,31,fill=VERMILION,anchor='ms',max_width=952)
    art.text('강사', 64,699,28,fill=BLUE)
    art.rule(144,690,872,BLUE,2)
    for index, (name, title) in enumerate(content['speakers']):
        speaker_card(art,name,title,64+(index%6)*164,729+(index//6)*243)
    art.rule(64,1212,952,BLUE,2)
    art.text('참가 신청 · 일정 안내', 64,1260,24)
    art.text(content['site_url'].split('://',1)[1].rstrip('/'),64,1310,35,fill=BLUE)
    art.qr(905,1228)
    art.write('again1907-6th-poster')


def share(content):
    art = BrightArtwork(1200,630,content)
    art.text(f"{content['edition']}  주님의 이름만 높여지는", 58,62,25,max_width=900)
    art.logo(1048,22,90)
    art.text('Again 1907', 53,219,109,'display',halo=3,max_width=900)
    art.korean_title(65,321,85)
    art.text(content['venue'],65,399,35,halo=1)
    art.text(content['dates'],65,450,31,max_width=880)
    art.text('주님이 역사하시는 초자연적 부흥집회',65,507,25,fill=VERMILION,max_width=900)
    art.rule(65,543,780,BLUE,2)
    art.text('참가 신청 · 일정 안내',65,588,22)
    art.text(content['site_url'].split('://',1)[1].rstrip('/'),845,588,28,fill=BLUE,anchor='rs')
    art.write('again1907-6th-share')

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
    parser.add_argument('--include-theme', action='store_true', help='Also rebuild the unchanged legacy theme assets')
    parser.add_argument('--preview', type=Path, help='Copy the final poster PNG to this path')
    args = parser.parse_args()
    content = event_content()
    poster(content)
    share(content)
    if args.include_theme:
        theme()
    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        args.preview.write_bytes((OUTPUT / 'again1907-6th-poster.png').read_bytes())
        print(f'Preview: {args.preview}')
