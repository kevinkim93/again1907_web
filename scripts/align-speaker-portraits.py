"""Align supplied cutouts to a common face height and center for presentation."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
root=Path(__file__).resolve().parents[1]
for row in json.loads((root/'docs/artwork/reference-poster/face-layout.json').read_text()):
 im=Image.open(root/'public/images/speakers'/f"{row['id']}.webp").convert('RGBA')
 x,y,w,h=row['face']; iw,ih=im.size
 visible=im.getchannel('A').point(lambda value: 255 if value > 128 else 0).getbbox()
 scale=110/(h*ih)
 im=im.resize((round(iw*scale),round(ih*scale)),Image.Resampling.LANCZOS)
 target=Image.new('RGBA',(260,235))
 target.alpha_composite(im,(round(130-(x+w/2)*iw*scale),round(8-visible[1]*scale)))
 fade=Image.new('L',target.size,255);d=ImageDraw.Draw(fade)
 for line in range(213,235):d.line((0,line,259,line),fill=round(255*(234-line)/21))
 target.putalpha(ImageChops.multiply(target.getchannel('A'),fade))
 target.save(root/'public/images/speakers'/f"{row['id']}-aligned.webp",quality=95,method=6)
