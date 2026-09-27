"""
Builds the web image set in public/images from the clinic's original photos.

    npm run images        (needs: pip install pillow)

Originals live in photos/originals and are listed, numbered, in INDEX.txt.
Each output below names the source photo number, an optional crop box
(left, top, right, bottom as fractions of the image) and a max long edge.

EXIF is stripped on export — phone photos carry GPS coordinates and device
details that have no business being published.
"""

from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "photos" / "originals"
OUT = ROOT / "public" / "images"

index = [line.split()[1] for line in (SRC / "INDEX.txt").read_text().splitlines() if line.strip()]

FULL = (0, 0, 1, 1)

# (output path, photo number, crop box, max long edge)
PLAN = [
    # Doctor
    ("doctor/portrait-desk.jpg", 33, (0, 0.04, 1, 1), 1600),
    ("doctor/portrait-desk-wide.jpg", 3, FULL, 1600),
    ("doctor/scrubs-standing.jpg", 30, FULL, 1600),
    ("doctor/scrubs-desk.jpg", 67, FULL, 1600),
    ("doctor/reception.jpg", 44, FULL, 1600),
    ("doctor/lounge.jpg", 55, FULL, 1600),
    ("doctor/at-work-camera.jpg", 20, FULL, 1600),
    ("doctor/at-work-green.jpg", 79, FULL, 1600),
    ("doctor/credentials-wall.jpg", 83, FULL, 1600),
    # Clinic
    ("clinic/signboard.jpg", 37, (0, 0.03, 1, 0.36), 1600),
    ("clinic/tooth-sign-night.jpg", 40, FULL, 1400),
    ("clinic/exterior.jpg", 28, FULL, 1600),
    ("clinic/entrance.jpg", 8, FULL, 1600),
    ("clinic/reception-tooth.jpg", 61, FULL, 1600),
    ("clinic/operatory.jpg", 64, FULL, 1600),
    ("clinic/treatment-bay-wide.jpg", 9, FULL, 1600),
    ("clinic/treatment-bay-camera.jpg", 99, FULL, 1600),
    ("clinic/treatment-bay-green.jpg", 76, FULL, 1600),
    ("clinic/treatment-glass.jpg", 21, FULL, 1600),
    ("clinic/consultation.jpg", 10, FULL, 1600),
    ("clinic/consultation-desk.jpg", 73, FULL, 1600),
    ("clinic/lounge.jpg", 41, FULL, 1600),
    ("clinic/lounge-busy.jpg", 43, FULL, 1600),
    ("clinic/counter.jpg", 19, FULL, 1600),
    ("clinic/logo-wall.jpg", 91, FULL, 1400),
    # Technology (cropped to the device)
    ("technology/intraoral-camera.jpg", 60, FULL, 1600),
    ("technology/handheld-xray.jpg", 98, (0.35, 0.25, 0.85, 0.75), 1200),
    ("technology/diode-laser.jpg", 35, (0.12, 0.3, 0.92, 0.82), 1200),
    ("technology/endo-motor-apex.jpg", 56, (0.18, 0.33, 0.92, 0.86), 1200),
    ("technology/curing-light.jpg", 87, (0.18, 0.38, 0.96, 0.86), 1200),
    ("technology/amalgamator.jpg", 63, (0.04, 0.28, 1, 0.96), 1200),
    ("technology/extraction-forceps.jpg", 92, FULL, 1400),
    ("technology/instrument-trays.jpg", 42, FULL, 1400),
    # Credentials
    ("credentials/mds.jpg", 78, (0.05, 0.05, 0.97, 0.95), 1400),
    ("credentials/bds.jpg", 32, (0.02, 0.06, 0.98, 0.96), 1400),
    ("credentials/ios-best-paper.jpg", 88, (0.05, 0.1, 0.95, 0.9), 1200),
    ("credentials/isoi-2024.jpg", 22, (0.05, 0.2, 0.95, 0.8), 1200),
    ("credentials/laser-2025.jpg", 2, (0.02, 0.15, 0.98, 0.78), 1200),
    ("credentials/coltene-2026.jpg", 90, (0.05, 0.1, 0.95, 0.9), 1200),
]


def main() -> None:
    for rel, number, box, edge in PLAN:
        src = SRC / index[number - 1]
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        w, h = im.size
        l, t, r, b = box
        im = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
        im.thumbnail((edge, edge), Image.Resampling.LANCZOS)
        dest = OUT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"{rel:44s} ← #{number:<3d} {im.size[0]}×{im.size[1]}")


if __name__ == "__main__":
    main()
