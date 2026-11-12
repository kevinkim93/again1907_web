"""Generate lossless PNG and vector SVG codes for the public registration form."""
import re
from pathlib import Path
import qrcode
import qrcode.image.svg

root = Path(__file__).resolve().parents[1]
url = re.search(r"registrationUrl: '([^']+)'", (root / 'lib/gathering.js').read_text()).group(1)
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=16, border=4)
qr.add_data(url)
qr.make(fit=True)
out = root / 'public/images/again1907-registration-qr'
qr.make_image(fill_color='black', back_color='white').save(out.with_suffix('.png'))
qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(out.with_suffix('.svg'))
print(url)
