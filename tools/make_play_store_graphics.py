from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "play-store" / "graphics"
SCREENSHOTS = OUT / "phone-screenshots"
STORE_SCREENSHOTS = OUT / "store-screenshots"
TABLET_7_SCREENSHOTS = OUT / "tablet-screenshots" / "7-inch"
TABLET_10_SCREENSHOTS = OUT / "tablet-screenshots" / "10-inch"
ASSETS = ROOT / "app" / "wwwroot" / "game" / "assets" / "generated"
SNAPS = ROOT / "tools" / "snapshots"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def cover_resize(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    img = img.convert("RGBA")
    sw, sh = img.size
    tw, th = size
    scale = max(tw / sw, th / sh)
    resized = img.resize((round(sw * scale), round(sh * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - tw) // 2
    top = (resized.height - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def contain_resize(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    img = img.convert("RGBA")
    img.thumbnail(size, Image.Resampling.LANCZOS)
    return img


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def paste_rounded(base: Image.Image, img: Image.Image, xy: tuple[int, int], radius: int) -> None:
    mask = rounded_mask(img.size, radius)
    base.alpha_composite(img, xy, mask)


def gradient(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = (x / w * 0.62) + (y / h * 0.38)
            r = int(7 + 13 * t)
            g = int(15 + 32 * t)
            b = int(31 + 63 * t)
            px[x, y] = (r, g, b, 255)
    return img


def brand_gradient(size: tuple[int, int], accent: tuple[int, int, int] = (56, 189, 248)) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size)
    px = img.load()
    for y in range(h):
        for x in range(w):
            tx = x / max(1, w - 1)
            ty = y / max(1, h - 1)
            r = int(6 + 12 * tx + accent[0] * 0.045 * (1 - ty))
            g = int(11 + 23 * ty + accent[1] * 0.05 * tx)
            b = int(25 + 45 * tx + accent[2] * 0.06 * (1 - tx))
            px[x, y] = (min(r, 40), min(g, 68), min(b, 105), 255)
    return img


def draw_wrapped_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font_obj: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    max_width: int,
    line_gap: int = 10,
) -> int:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font_obj)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=font_obj, fill=fill)
        box = draw.textbbox((x, y), line, font=font_obj)
        y += (box[3] - box[1]) + line_gap
    return y


def draw_pill(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fill: tuple[int, int, int, int],
    accent: tuple[int, int, int],
    font_size: int = 27,
) -> None:
    x, y = xy
    f = font(font_size, True)
    bbox = draw.textbbox((0, 0), text, font=f)
    pad_x = round(font_size * 1.55)
    pad_y = round(font_size * 0.55)
    w = bbox[2] - bbox[0] + pad_x * 2
    h = bbox[3] - bbox[1] + pad_y * 2
    draw.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=fill, outline=(*accent, 145), width=2)
    draw.text((x + pad_x, y + pad_y - bbox[1]), text, font=f, fill=(245, 250, 255, 245))


def phone_frame(source: Image.Image, frame_size: tuple[int, int]) -> Image.Image:
    frame_w, frame_h = frame_size
    frame = Image.new("RGBA", frame_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    draw.rounded_rectangle((0, 0, frame_w - 1, frame_h - 1), radius=72, fill=(8, 13, 25, 255), outline=(228, 241, 255, 92), width=3)
    draw.rounded_rectangle((12, 12, frame_w - 13, frame_h - 13), radius=62, fill=(13, 21, 36, 255), outline=(255, 255, 255, 38), width=1)

    inset = 26
    screen_size = (frame_w - inset * 2, frame_h - inset * 2)
    shot = cover_resize(source, screen_size)
    mask = rounded_mask(screen_size, 48)
    frame.paste(shot, (inset, inset), mask)

    gloss = Image.new("RGBA", screen_size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    gd.polygon([(0, 0), (screen_size[0] * 0.38, 0), (screen_size[0] * 0.08, screen_size[1]), (0, screen_size[1])], fill=(255, 255, 255, 18))
    frame.alpha_composite(gloss, (inset, inset))
    return frame


def tablet_frame(source: Image.Image, frame_size: tuple[int, int]) -> Image.Image:
    frame_w, frame_h = frame_size
    frame = Image.new("RGBA", frame_size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    radius = max(44, round(frame_h * 0.055))
    bezel = max(22, round(frame_h * 0.035))
    draw.rounded_rectangle((0, 0, frame_w - 1, frame_h - 1), radius=radius, fill=(7, 12, 23, 255), outline=(226, 241, 255, 92), width=4)
    draw.rounded_rectangle((bezel // 2, bezel // 2, frame_w - bezel // 2 - 1, frame_h - bezel // 2 - 1), radius=radius - 10, fill=(12, 20, 35, 255), outline=(255, 255, 255, 36), width=2)

    inset = bezel
    screen_size = (frame_w - inset * 2, frame_h - inset * 2)
    shot = cover_resize(source, screen_size)
    mask = rounded_mask(screen_size, radius - 18)
    frame.paste(shot, (inset, inset), mask)

    gloss = Image.new("RGBA", screen_size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(gloss)
    gd.polygon([(0, 0), (screen_size[0] * 0.42, 0), (screen_size[0] * 0.18, screen_size[1]), (0, screen_size[1])], fill=(255, 255, 255, 14))
    frame.alpha_composite(gloss, (inset, inset))
    return frame


def paste_with_shadow(base: Image.Image, img: Image.Image, xy: tuple[int, int], blur: int = 30, offset: tuple[int, int] = (0, 26), alpha: int = 130) -> None:
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow.alpha_composite(img)
    shadow_alpha = shadow.getchannel("A").point(lambda p: min(p, alpha))
    shadow.putalpha(shadow_alpha)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow, (xy[0] + offset[0], xy[1] + offset[1]))
    base.alpha_composite(img, xy)


def add_glow(base: Image.Image, center: tuple[int, int], color: tuple[int, int, int], radius: int, alpha: int) -> None:
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    x, y = center
    d.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius // 2))
    base.alpha_composite(glow)


def feature_graphic() -> None:
    bg = brand_gradient((1024, 500), (56, 189, 248))
    add_glow(bg, (160, 80), (56, 189, 248), 210, 118)
    add_glow(bg, (880, 360), (245, 158, 11), 250, 92)

    cave = cover_resize(Image.open(ASSETS / "parallax_cave_1600.webp"), (1024, 500))
    cave.putalpha(120)
    bg.alpha_composite(cave)

    d = ImageDraw.Draw(bg)
    d.rounded_rectangle((34, 34, 990, 466), radius=36, outline=(255, 255, 255, 56), width=2)
    d.rounded_rectangle((58, 62, 570, 438), radius=28, fill=(4, 12, 25, 72), outline=(255, 255, 255, 28), width=1)

    ship = Image.open(ASSETS / "ship_boost.png").convert("RGBA")
    ship = ship.resize((410, 157), Image.Resampling.LANCZOS)
    paste_with_shadow(bg, ship, (594, 170), blur=22, offset=(0, 20), alpha=150)

    for asset, pos, size in [
        ("fuel.png", (835, 76), (50, 97)),
        ("crystal.png", (908, 126), (52, 86)),
        ("shield_ring.png", (736, 318), (86, 90)),
    ]:
        im = Image.open(ASSETS / asset).convert("RGBA").resize(size, Image.Resampling.LANCZOS)
        bg.alpha_composite(im, pos)

    title_font = font(70, True)
    sub_font = font(27, False)
    d.text((82, 104), "SONSUZ UÇUŞ", font=title_font, fill=(255, 255, 255, 255))
    draw_wrapped_text(d, (86, 190), "Yakıtını yönet, kapılardan geç, rekorunu uçur.", sub_font, (222, 236, 255, 246), 430, 8)
    draw_pill(d, (86, 292), "ARCADE", (7, 16, 32, 190), (56, 189, 248))
    draw_pill(d, (230, 292), "REFLEKS", (7, 16, 32, 150), (251, 191, 36))
    d.text((86, 386), "Cesa Studio", font=font(24, True), fill=(251, 191, 36, 245))

    bg.convert("RGB").save(OUT / "feature-graphic-1024x500.png", quality=95)


def store_icon() -> None:
    size = 512
    base = gradient((size, size))
    d = ImageDraw.Draw(base)
    d.rounded_rectangle((24, 24, size - 25, size - 25), radius=92, outline=(255, 255, 255, 34), width=2)
    add_glow(base, (180, 145), (14, 165, 233), 190, 110)
    add_glow(base, (350, 345), (245, 158, 11), 190, 90)

    for x, y, r, color, alpha in [
        (135, 120, 4, (143, 216, 255), 230),
        (394, 168, 3, (255, 255, 255), 190),
        (337, 100, 3, (255, 210, 60), 210),
        (108, 360, 3, (255, 255, 255), 150),
        (404, 370, 4, (143, 216, 255), 170),
        (202, 426, 3, (255, 255, 255), 130),
    ]:
        d.ellipse((x - r, y - r, x + r, y + r), fill=(*color, alpha))

    ship = Image.open(ASSETS / "ship_boost.png").convert("RGBA")
    ship = ship.resize((328, 125), Image.Resampling.LANCZOS)
    ship = ship.rotate(18, expand=True, resample=Image.Resampling.BICUBIC)
    shadow = Image.new("RGBA", ship.size, (0, 0, 0, 0))
    shadow.alpha_composite(ship)
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    base.alpha_composite(shadow, (82, 185))
    base.alpha_composite(ship, (78, 174))

    ring = Image.open(ASSETS / "shield_ring.png").convert("RGBA").resize((108, 113), Image.Resampling.LANCZOS)
    base.alpha_composite(ring, (310, 292))

    base.convert("RGBA").save(OUT / "icon-512.png")


def copy_screenshots() -> None:
    mapping = [
        ("01-buz-kapisi.png", SNAPS / "d_buz.png"),
        ("02-lav-rotasi.png", SNAPS / "d_lav.png"),
        ("03-uzay-rotasi.png", SNAPS / "d_uzay.png"),
        ("04-zumrut-rotasi.png", SNAPS / "d_zumrut.png"),
        ("05-kizil-rotasi.png", SNAPS / "e_kizil.png"),
        ("06-zumrut-hazine.png", SNAPS / "e_zumrut.png"),
    ]
    for name, src in mapping:
        img = Image.open(src).convert("RGB")
        img.save(SCREENSHOTS / name, quality=95)


def store_screenshot_cards() -> None:
    cards = [
        ("01-refleks-ucusu.png", SNAPS / "d_buz.png", "Reflekslerini Uçur", "Kapılardan temiz geç, tek dokunuşla ritmini koru.", (56, 189, 248), "TEK DOKUNUŞ"),
        ("02-yakit-yonetimi.png", SNAPS / "d_lav.png", "Yakıtı Akıllı Kullan", "Risk al, yakıt topla ve çizgiden çıkmadan devam et.", (245, 158, 11), "YAKIT TAKİBİ"),
        ("03-zorlu-rotalar.png", SNAPS / "d_uzay.png", "Her Rota Farklı", "Buz, lav, uzay ve zümrüt sahnelerinde skor kovala.", (168, 85, 247), "4 ATMOSFER"),
        ("04-odul-serisi.png", SNAPS / "e_zumrut.png", "Ödül Serisini Yakala", "Kristalleri topla, kombo hissini kaybetmeden ilerle.", (52, 211, 153), "KOMBO AKIŞI"),
        ("05-sade-ve-akici.png", SNAPS / "d_zumrut.png", "Sade ve Akıcı", "Kalabalık yok. Net hedef, pürüzsüz uçuş, hızlı tekrar.", (34, 197, 94), "AKICI OYUN"),
        ("06-rekor-pesinde.png", SNAPS / "e_kizil.png", "Rekor Peşinde", "Kısa denemeler, yüksek tempo, arkadaşlarla skor yarışı.", (248, 113, 113), "SKOR YARIŞI"),
    ]

    for name, src, title, subtitle, accent, pill in cards:
        canvas = brand_gradient((1080, 1920), accent)
        add_glow(canvas, (240, 220), accent, 310, 112)
        add_glow(canvas, (870, 1570), (245, 158, 11), 330, 72)

        cave = cover_resize(Image.open(ASSETS / "parallax_cave_1600.webp"), (1080, 1920))
        cave.putalpha(58)
        canvas.alpha_composite(cave)

        d = ImageDraw.Draw(canvas)
        d.text((80, 96), "SONSUZ UÇUŞ", font=font(38, True), fill=(251, 191, 36, 245))
        d.text((78, 166), title, font=font(74, True), fill=(255, 255, 255, 255))
        draw_wrapped_text(d, (82, 262), subtitle, font(34, False), (220, 234, 255, 244), 830, 12)
        draw_pill(d, (82, 382), pill, (5, 12, 26, 182), accent)

        source = Image.open(src).convert("RGBA")
        frame = phone_frame(source, (678, 1294))
        paste_with_shadow(canvas, frame, (201, 560), blur=36, offset=(0, 32), alpha=150)

        ship = Image.open(ASSETS / "ship_boost.png").convert("RGBA").resize((250, 96), Image.Resampling.LANCZOS)
        ship = ship.rotate(-8, expand=True, resample=Image.Resampling.BICUBIC)
        paste_with_shadow(canvas, ship, (724, 432), blur=18, offset=(0, 18), alpha=135)

        d.rounded_rectangle((80, 1772, 1000, 1848), radius=38, fill=(4, 10, 22, 142), outline=(255, 255, 255, 46), width=1)
        d.text((126, 1793), "Yakıtını yönet  •  Kapılardan geç  •  Rekorunu uçur", font=font(26, True), fill=(235, 246, 255, 235))

        canvas.convert("RGB").save(STORE_SCREENSHOTS / name, quality=95)


def tablet_screenshot_cards(out_dir: Path, canvas_size: tuple[int, int]) -> None:
    cw, ch = canvas_size
    scale = cw / 2560
    cards = [
        ("01-tablet-refleks-ucusu.png", SNAPS / "d_buz.png", "Tablet Ekranda Akıcı Uçuş", "Geniş ekranda net rota, sade hedef ve hızlı refleks.", (56, 189, 248), "REFLEKS"),
        ("02-tablet-yakit-ve-kapi.png", SNAPS / "d_lav.png", "Yakıtı Yönet, Kapıyı Yakala", "Tempo arttıkça kararların daha değerli hale gelir.", (245, 158, 11), "YAKIT"),
        ("03-tablet-rotalar.png", SNAPS / "d_uzay.png", "Renkli Rotalarda Skor Peşinde", "Buz, lav, uzay ve zümrüt atmosferlerinde uç.", (168, 85, 247), "ROTA"),
        ("04-tablet-oduller.png", SNAPS / "e_zumrut.png", "Ödülleri Topla, Seriyi Bozma", "Kristalleri yakala ve uçuş ritmini kaybetme.", (52, 211, 153), "ÖDÜL"),
    ]

    for name, src, title, subtitle, accent, pill in cards:
        canvas = brand_gradient(canvas_size, accent)
        add_glow(canvas, (round(cw * 0.15), round(ch * 0.18)), accent, round(360 * scale), 112)
        add_glow(canvas, (round(cw * 0.86), round(ch * 0.83)), (245, 158, 11), round(430 * scale), 80)

        cave = cover_resize(Image.open(ASSETS / "parallax_cave_1600.webp"), canvas_size)
        cave.putalpha(66)
        canvas.alpha_composite(cave)

        d = ImageDraw.Draw(canvas)
        left = round(96 * scale)
        title_y = round(112 * scale)
        d.text((left, title_y), "SONSUZ UÇUŞ", font=font(round(48 * scale), True), fill=(251, 191, 36, 245))
        d.text((left, round(198 * scale)), title, font=font(round(80 * scale), True), fill=(255, 255, 255, 255))
        draw_wrapped_text(d, (left, round(310 * scale)), subtitle, font(round(38 * scale), False), (224, 237, 255, 244), round(940 * scale), round(12 * scale))
        draw_pill(d, (left, round(430 * scale)), pill, (5, 12, 26, 188), accent, round(36 * scale))

        source = Image.open(src).convert("RGBA")
        frame_w = round(cw * 0.64)
        frame_h = round(ch * 0.60)
        frame = tablet_frame(source, (frame_w, frame_h))
        frame_x = round(cw * 0.31)
        frame_y = round(ch * 0.30)
        paste_with_shadow(canvas, frame, (frame_x, frame_y), blur=round(40 * scale), offset=(0, round(32 * scale)), alpha=150)

        ship = Image.open(ASSETS / "ship_boost.png").convert("RGBA").resize((round(360 * scale), round(138 * scale)), Image.Resampling.LANCZOS)
        ship = ship.rotate(-8, expand=True, resample=Image.Resampling.BICUBIC)
        paste_with_shadow(canvas, ship, (round(cw * 0.13), round(ch * 0.60)), blur=round(18 * scale), offset=(0, round(18 * scale)), alpha=135)

        band_x1 = round(cw * 0.06)
        band_y1 = round(ch * 0.83)
        band_x2 = round(cw * 0.55)
        band_y2 = round(ch * 0.91)
        d.rounded_rectangle((band_x1, band_y1, band_x2, band_y2), radius=round(42 * scale), fill=(4, 10, 22, 148), outline=(255, 255, 255, 52), width=2)
        d.text((band_x1 + round(48 * scale), band_y1 + round(28 * scale)), "Geniş ekran  •  Net kontrol  •  Hızlı tekrar", font=font(round(28 * scale), True), fill=(235, 246, 255, 238))

        canvas.convert("RGB").save(out_dir / name, quality=95)


def promo_collage() -> None:
    canvas = gradient((1440, 1080))
    add_glow(canvas, (270, 130), (14, 165, 233), 300, 96)
    add_glow(canvas, (1170, 880), (245, 158, 11), 340, 90)
    d = ImageDraw.Draw(canvas)
    d.text((86, 88), "Sonsuz Uçuş", font=font(82, True), fill=(255, 255, 255, 255))
    d.text((90, 190), "Sade, hızlı ve bağımlılık yapan refleks oyunu", font=font(34), fill=(218, 231, 255, 242))

    positions = [(86, 300), (430, 240), (774, 300), (1118, 240)]
    files = ["01-buz-kapisi.png", "02-lav-rotasi.png", "03-uzay-rotasi.png", "04-zumrut-rotasi.png"]
    for pos, file in zip(positions, files):
        src = Image.open(SCREENSHOTS / file).convert("RGBA")
        shot = contain_resize(src, (278, 602))
        frame = Image.new("RGBA", (shot.width + 24, shot.height + 24), (0, 0, 0, 0))
        fd = ImageDraw.Draw(frame)
        fd.rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), radius=34, fill=(9, 16, 31, 255), outline=(255, 255, 255, 80), width=2)
        frame.alpha_composite(shot, (12, 12))
        shadow = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        shadow.alpha_composite(frame)
        shadow = shadow.filter(ImageFilter.GaussianBlur(20))
        canvas.alpha_composite(shadow, (pos[0] + 8, pos[1] + 20))
        canvas.alpha_composite(frame, pos)

    canvas.convert("RGB").save(OUT / "promo-collage-1440x1080.png", quality=95)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    STORE_SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    TABLET_7_SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    TABLET_10_SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    store_icon()
    feature_graphic()
    copy_screenshots()
    store_screenshot_cards()
    tablet_screenshot_cards(TABLET_7_SCREENSHOTS, (1920, 1200))
    tablet_screenshot_cards(TABLET_10_SCREENSHOTS, (2560, 1600))
    promo_collage()


if __name__ == "__main__":
    main()
