"""Fill the user's supplied poster template with the approved portraits and QR.

Only the image_gen-edited worship heading region replaces original pixels.
All other template typography and artwork are preserved.
"""
from pathlib import Path
import json, re
from PIL import Image, ImageDraw, ImageOps, ImageChops

root = Path(__file__).resolve().parents[1]
source = root / 'docs/artwork/reference-poster'
canvas = Image.open(source / 'source.jpeg').convert('RGB')
w, h = canvas.size

# The edit was made at half resolution; preserve the supplied original elsewhere.
box = (round(w*.399), round(h*.782), round(w*.602), round(h*.811))
heading = Image.open(source / 'chanyang-heading.png').convert('RGB')
canvas.paste(heading.resize((box[2]-box[0], box[3]-box[1]), Image.Resampling.LANCZOS),box[:2])

roster = (root/'lib/gathering-schedule.js').read_text().split('export const gatheringSpeakers = [',1)[1].split('];',1)[0]
photos = re.findall(r"photo: '([^']+)'", roster)
assert len(photos) == 12
clean = Image.open(source / 'clean-template.png').convert('RGB').resize((w,h), Image.Resampling.LANCZOS)
canvas.paste(clean.crop((0,1580,w,2320)),(0,1580))
for index, path in enumerate(photos):
    row, col = divmod(index, 6)
    x, y = 194 + 300*col, (1620 if row == 0 else 1980)
    size = (220,220)
    im = Image.open(root/'public'/path.lstrip('/')).convert('RGBA')
    im = ImageOps.fit(im,size,method=Image.Resampling.LANCZOS,centering=(.5,0))
    mask = Image.new('L',size,255)
    draw = ImageDraw.Draw(mask)
    for line in range(196,220):
        draw.line((0,line,219,line),fill=round(255*(219-line)/23))
    alpha=ImageChops.multiply(im.getchannel('A'),mask)
    canvas.paste(im,(x,y),alpha)

# Replace the illustrative QR in the reference with the tested registration QR.
qr=Image.open(root/'public/images/again1907-registration-qr.png').convert('RGB')
qr=qr.resize((190,190),Image.Resampling.NEAREST)
canvas.paste(qr,(1761,2692))
stem=root/'public/images/again1907-6th-poster-reference-v3'
canvas.save(stem.with_suffix('.png'),optimize=True)
canvas.save(stem.with_suffix('.webp'),quality=96,method=6)
print(json.dumps({'size':canvas.size,'portraits':len(photos),'poster':str(stem)},ensure_ascii=False))
