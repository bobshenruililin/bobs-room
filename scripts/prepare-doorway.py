"""Cut the view out of Bob's doorway photograph.

Input:  archive/source/doorway-1920.webp  (1920 x 2560, from Bob's published Suomenlinna walk)
Output: lab/doorway/media/view-sea.webp    the view through the gate as photographed (the landing's own view)
        lab/doorway/media/doorway-fg.webp  the same photograph with the view beyond the gate
                                           made transparent: Bob, both chains, the railing,
                                           the stone and the deck stay as photographed
        lab/doorway/media/door.json        where the opening sits, as fractions of the frame

Run:    python3 scripts/prepare-doorway.py [--check preview.png]
Needs:  Pillow, NumPy, SciPy
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'archive/source/doorway-1920.webp'
OUT = ROOT / 'lab/doorway/media'

# The opening, measured on the 1920 x 2560 frame: inner stone faces, the lintel's
# underside and the edge of the deck.
X0, X1, Y0, Y1 = 650, 1290, 1043, 1652
SHORE = 1232            # below the far shore everything dark is Bob, a chain or the boat
CHAINS = [(670, 752), (1150, 1226)]
RAILING_X, RAILING_Y = 1230, 1500

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b
yy, xx = np.mgrid[0:H, 0:W]
inside = (xx >= X0) & (xx < X1) & (yy >= Y0) & (yy < Y1)
blue = b - np.maximum(r, g)
dark = lum < 80
chain_cols = np.zeros_like(inside)
for c0, c1 in CHAINS:
    chain_cols |= (xx >= c0) & (xx <= c1)

fg = (dark & (yy >= SHORE)) | (dark & (yy < SHORE) & chain_cols)
fg |= (blue < 22) & (lum < 170) & (yy > 1440) & (xx > 860) & (xx < 1010)   # trousers
fg |= (xx >= RAILING_X) & (yy >= RAILING_Y)                                 # railing
fg &= inside

# Keep only the large shapes (Bob, the chains, the railing); small dark flecks are
# the far boat and waves, which belong to the view.
lab, n = ndimage.label(fg)
sizes = ndimage.sum(fg, lab, range(1, n + 1))
keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 2500])
beyond = inside & ~keep
beyond = ndimage.binary_opening(beyond, iterations=1)

# Grow the hole by a pixel so no sea-blue fringe is left round Bob and the chains, then
# feather it. Edge pixels take the darkest colour nearby, so the outline stays a
# silhouette against any work, dark or light.
m = Image.fromarray((beyond * 255).astype(np.uint8))
m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
alpha = 255 - np.asarray(m)
dark_nearby = np.asarray(im.filter(ImageFilter.MinFilter(5))).astype(np.uint8)
rgb = a.astype(np.uint8).copy()
edge = (alpha < 250) & inside
rgb[edge] = dark_nearby[edge]
rgba = Image.fromarray(np.dstack([rgb, alpha.astype(np.uint8)]), 'RGBA')

OUT.mkdir(parents=True, exist_ok=True)
im.crop((630, 1020, 1310, 1680)).save(OUT / 'view-sea.webp', quality=86, method=6)
rgba.save(OUT / 'doorway-fg.webp', quality=82, method=6)
(OUT / 'door.json').write_text(json.dumps({
    'source': 'archive/source/doorway-1920.webp',
    'size': [W, H],
    'opening': [X0 / W, Y0 / H, X1 / W, Y1 / H],
    'sea': [630 / W, 1020 / H, 1310 / W, 1680 / H],
    'figure': [860 / W, 1230 / H, 1130 / W, 1700 / H],
    # open water just above Bob's head and inside his raised right arm: the code-built
    # entering move flies at this point so the camera passes over his shoulder
    'anchor': [1000 / W, 1220 / H],
}, indent=1) + '\n')

if '--check' in sys.argv:
    out = sys.argv[sys.argv.index('--check') + 1]
    sheet = Image.new('RGB', (1600, 800))
    for k, bg in enumerate([(255, 0, 200), (12, 14, 18)]):
        prev = Image.new('RGB', im.size, bg)
        prev.paste(rgba, (0, 0), rgba)
        sheet.paste(prev.crop((560, 960, 1360, 1760)), (k * 800, 0))
    sheet.save(out)
print('doorway ready', W, H, 'opening', (X0, Y0, X1, Y1), 'kept shapes', int(keep.sum()))
