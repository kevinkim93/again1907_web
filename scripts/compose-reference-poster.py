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
clean = Image.open(source / 'blank-speaker-panel.png').convert('RGB').resize((w,h), Image.Resampling.LANCZOS)
canvas.paste(clean.crop((0,1580,w,2320)),(0,1580))
names=['고성준','장승민','이호','Yohannes Nahuway','김권능','김정민','이에녹','최광','조지훈','임성일','성현경','최상훈']
roles=['목사','목사','목사','목사','목사','목사','형제','목사','목사','선교사','목사','목사']
from PIL import ImageFont
bold=ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc',42,index=6)
regular=ImageFont.truetype('/System/Library/Fonts/AppleSDGothicNeo.ttc',31,index=0)
draw=ImageDraw.Draw(canvas)
for index,path in enumerate(photos):
    row,col=divmod(index,6)
    cx,top=304+300*col,1605+360*row
    im=Image.open(root/'public'/path.lstrip('/')).convert('RGBA')
    canvas.paste(im,(cx-130,top),im)
    name=names[index]
    lines=name.split(' ') if name=='Yohannes Nahuway' else [name]
    for li,line in enumerate(lines):
        draw.text((cx,top+264+43*li),line,font=bold,fill='#fff6df',anchor='ms')
    draw.text((cx,top+344),roles[index],font=regular,fill='#fff6df',anchor='ms')

# Replace the illustrative QR in the reference with the tested registration QR.
qr=Image.open(root/'public/images/again1907-registration-qr.png').convert('RGB')
qr=qr.resize((190,190),Image.Resampling.NEAREST)
canvas.paste(qr,(1761,2692))
stem=root/'public/images/again1907-6th-poster-reference-v4'
canvas.save(stem.with_suffix('.png'),optimize=True)
canvas.save(stem.with_suffix('.webp'),quality=96,method=6)
print(json.dumps({'size':canvas.size,'portraits':len(photos),'poster':str(stem)},ensure_ascii=False))
