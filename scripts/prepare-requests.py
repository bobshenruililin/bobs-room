"""Start and landing frames for the Higgsfield requests in direction/higgsfield-requests.md.

Every generated shot begins and ends on a real frame: Bob's photograph, a capture of his
work, or the photograph with that capture placed in the gate exactly where the page puts it.

Run:   python3 scripts/prepare-requests.py
Needs: Pillow, NumPy; run scripts/prepare-doorway.py first.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'lab/doorway/media'
OUT = ROOT / 'direction/higgsfield/frames'
OUT.mkdir(parents=True, exist_ok=True)
door = json.loads((MEDIA / 'door.json').read_text())
W, H = door['size']
X0, Y0, X1, Y1 = [round(v * s) for v, s in zip(door['opening'], [W, H, W, H])]
photo = Image.open(ROOT / 'archive/source/doorway-1920.webp').convert('RGB')
fg = Image.open(MEDIA / 'doorway-fg.webp').convert('RGBA')

# id, frame shown in the gate, object-position (same as WORKS in lab/doorway/doorway.mjs)
WORKS = [('G1', 'carryistic', 'carry-1', (0.66, 0.42)), ('G2', 'asterwind', 'asterwind-2', (0.74, 0.5)),
         ('G3', 'crossing', 'crossing-photo', (0.5, 0.5)), ('G4', 'heat', '@heat', (0.5, 0.5)),
         ('G5', 'careers', 'careers-1', (0.28, 0.3)), ('G6', 'room', 'room-art', (0.5, 0.58))]
BINS = [(16, '#1f3550'), (20, '#3d5f7c'), (24, '#8399a5'), (27, '#d3c9b1'), (30, '#e6ad66'), (33, '#d4673a'), (99, '#a8151b')]

def heat_strip():
    data = json.loads((MEDIA / 'hko-maxtemp-2013-2023.json').read_text())['years']
    im = Image.new('RGB', (366, len(data)), '#000')
    for row, (y, temps) in enumerate(data.items()):
        for d, t in enumerate(temps):
            if t is not None:
                im.putpixel((d, row), Image.new('RGB', (1, 1), next(c for m, c in BINS if t < m)).getpixel((0, 0)))
    return im

def cover(im, w, h, pos):
    if im.size == (366, 11):
        return im.resize((w, h), Image.NEAREST)
    k = max(w / im.width, h / im.height)
    r = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x = round((r.width - w) * pos[0]); y = round((r.height - h) * pos[1])
    return r.crop((x, y, x + w, y + h))

def load(name):
    return heat_strip() if name == '@heat' else Image.open(MEDIA / f'{name}.webp').convert('RGB')

def gate_with(view):
    base = photo.copy()
    base.paste(view, (X0, Y0))
    base.paste(fg, (0, 0), fg)
    return base

CX, CY = (X0 + X1) / 2, (Y0 + Y1) / 2
def framing(im, aspect, opening_share):
    w = (X1 - X0) / opening_share; h = w / aspect
    x = round(CX - w / 2); y = round(CY - h / 2)
    return im.crop((x, y, x + round(w), y + round(h)))

photo.save(OUT / 'L1-gate.jpg', quality=85)
framing(photo, 21 / 9, 0.34).save(OUT / 'gate-21x9.jpg', quality=85)
framing(photo, 3 / 4, 0.8).save(OUT / 'gate-3x4.jpg', quality=85)
sheet = []
for gid, wid, frame, pos in WORKS:
    src = load(frame)
    view = cover(src, X1 - X0, Y1 - Y0, pos)
    g = gate_with(view)
    g.save(OUT / f'{gid}-{wid}-end.jpg', quality=85)                  # G: landing frame (start is L1-gate.jpg)
    eid = 'E' + gid[1:]
    framing(g, 21 / 9, 0.34).save(OUT / f'{eid}-{wid}-start-21x9.jpg', quality=85)
    framing(g, 3 / 4, 0.8).save(OUT / f'{eid}-{wid}-start-3x4.jpg', quality=85)
    big = src if frame != '@heat' else src.resize((366 * 6, 11 * 60), Image.NEAREST)
    cover(big, 2520, 1080, pos).save(OUT / f'{eid}-{wid}-end-21x9.jpg', quality=85)
    cover(big, 1440, 1920, pos).save(OUT / f'{eid}-{wid}-end-3x4.jpg', quality=85)
    sheet.append(g.crop((X0 - 260, Y0 - 200, X1 + 260, Y1 + 120)))

# contact sheet for the request notes
tw = 360
th = round(sheet[0].height * tw / sheet[0].width)
cs = Image.new('RGB', (tw * 7 + 8 * 8, th + 16), '#0b0d10')
first = photo.crop((X0 - 260, Y0 - 200, X1 + 260, Y1 + 120))
for k, im in enumerate([first] + sheet):
    cs.paste(im.resize((tw, th), Image.LANCZOS), (8 + k * (tw + 8), 8))
cs.save(ROOT / 'direction/paths/gate-views.jpg', quality=88)
print('frames in', OUT.relative_to(ROOT), len(list(OUT.glob('*.jpg'))))
