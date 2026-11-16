#!/usr/bin/env python3
"""Generate the Open Graph / Twitter social card (1200x630).

One-off asset generator for Clear212. Run from anywhere:
    python scripts/make_og.py
Output: assets/og.png
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "og.png"
W, H = 1200, 630

BG = (11, 10, 20)
PINK = (255, 46, 126)
PINK2 = (255, 92, 157)
VIOLET = (124, 58, 237)
CYAN = (34, 211, 238)


def font(size, bold=True):
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def glow(base, cx, cy, radius, color, peak=110):
    """Soft radial glow drawn as concentric translucent ellipses."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 90
    for i in range(steps, 0, -1):
        t = i / steps
        r = radius * t
        alpha = int(peak * (1 - t) ** 2)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    return Image.alpha_composite(base, layer)


def main():
    img = Image.new("RGBA", (W, H), BG + (255,))

    # neon washes: pink upper-left, violet lower-right, cyan hint
    img = glow(img, int(W * 0.12), int(H * -0.05), 620, PINK, peak=95)
    img = glow(img, int(W * 0.95), int(H * 1.05), 700, VIOLET, peak=100)
    img = glow(img, int(W * 0.78), int(H * 0.12), 320, CYAN, peak=38)

    d = ImageDraw.Draw(img)

    # faint grid, masked toward the top
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(124, 58, 237, 16), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(124, 58, 237, 16), width=1)

    # brand mark
    d.rounded_rectangle([70, 78, 98, 106], radius=7, fill=PINK)
    d.rounded_rectangle([70, 78, 98, 106], radius=7, outline=PINK2, width=2)

    f_brand = font(40)
    f_big = font(116)
    f_sub = font(38)
    f_small = font(28)

    d.text((116, 70), "CLEAR212", font=f_brand, fill=(237, 237, 247))

    # headline with a pink-to-violet gradient via per-pixel fill
    headline = "GTA VI"
    d.text((68, 168), headline, font=f_big, fill=(255, 255, 255))
    bbox = d.textbbox((68, 168), headline, font=f_big)
    grad = Image.new("RGBA", (bbox[2] - bbox[0], bbox[3] - bbox[1]), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for x in range(grad.width):
        t = x / max(grad.width - 1, 1)
        r = int(PINK2[0] + (VIOLET[0] - PINK2[0]) * t)
        g = int(PINK2[1] + (VIOLET[1] - PINK2[1]) * t)
        b = int(PINK2[2] + (VIOLET[2] - PINK2[2]) * t)
        gd.line([(x, 0), (x, grad.height)], fill=(r, g, b, 255))
    mask = Image.new("L", grad.size, 0)
    md = ImageDraw.Draw(mask)
    md.text((0, 0), headline, font=f_big, fill=255)
    # the mask offset must match the draw position
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    md.text((68, 168), headline, font=f_big, fill=255)
    img.paste(grad, (68, 168), mask.crop((68, 168, 68 + grad.width, 168 + grad.height)))

    d.text((72, 336), "Day-one answers, countdown and progress", font=f_sub, fill=(205, 201, 232))

    # bottom strip
    d.line([(72, 470), (520, 470)], fill=(44, 40, 84, 255), width=2)
    d.text((72, 496), "19 NOV 2026", font=f_small, fill=CYAN)
    d.text((72, 540), "PS5 / XBOX SERIES X|S  ·  212 GB", font=f_small, fill=(162, 156, 203))

    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print("wrote", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
