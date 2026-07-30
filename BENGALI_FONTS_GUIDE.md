# Jol Kona — Bengali Fonts Migration Guide

## Summary of Changes

Replaced old **Noto Serif Bengali** with a premium, multi-layered Bengali typography system:

### ✅ Google Fonts (Primary)
- **Hind Siliguri** (300,400,500,600,700) — https://fonts.google.com/specimen/Hind+Siliguri
  - Modern, highly readable Bengali sans-serif
  - Perfect for body text, UI, product descriptions
  - Weights: Light for subtle, Medium for emphasis, Bold for headings
  
- **Anek Bangla** (100-800 variable) — https://fonts.google.com/specimen/Anek+Bangla
  - Contemporary condensed Bengali
  - Perfect for headings, titles, brand marks
  - Variable weight allows expressive typography

### ✅ Lipighor Curated (from https://lipighor.com/freefont.html)

Top downloaded & aesthetic fonts selected for Jol Kona brand identity:

| Font | Meaning | Use Case | Downloads |
|------|---------|----------|-----------|
| **Li Ador Noirrit** | Modern geometric sans, 10 styles | Primary display, headings, CTA | 315,143 |
| **Alinur Shishir** | "Shishir" = Dew/Mist — matches Jol Kona (water droplet) | Hero quotes, brand story, emotional text | 200,282 |
| **Alinur Mayabati** | "Mayabati" = Enchantress | Decorative, gift tags, premium labels | 79,480 |
| **Choyna Tista** | Tista River — flowy handwritten | Handwritten notes, personal messages | 320,729 (top) |
| **Alinur Ekushe** | Ekushey heritage (Language Movement) | Heritage sections, Bengali quotes | 103,885 |
| **Alinur BanglaBorno** | Authentic Bengali letter heritage | Literary, traditional sections | 197,743 |
| **Alinur BornoBikash** | Letter evolution | Creative accents | 67,910 |
| **Alinur Ananda** | "Ananda" = Joy | Festive, celebration | - |

### ✅ Additional Bengali CDN (maateen.me - Cloudflare Global)
- **Baloo Da 2** — Rounded friendly display (similar to Lipighor rounded)
- **Kalpurush** — Classic literary
- **SolaimanLipi** — Standard readable (backup)
- **Siyam Rupali** — Clean modern
- **Charukola UltraLight** — Ultra-light decorative
- **Charu Chandan** — Handwritten artistic
- **Adorsho Lipi / Apona Lohit** — Fallback

---

## Files Changed

### New File
- `css/bengali-fonts.css` — Complete typography system with:
  - @import for Google Fonts + CDNFonts + maateen.me
  - @font-face for 7 self-hosted Lipighor fonts
  - CSS variables: `--font-bengali-body`, `--font-bengali-heading`, `--font-bengali-display`, `--font-bengali-heritage`, `--font-bengali-decorative`
  - Utility classes: `.bengali-text`, `.bengali-heading`, `.font-hind`, `.font-anek`, `.font-ador`, etc.

### Modified
- `css/style.css`
  - Replaced `--font-bengali: 'Noto Serif Bengali'` → `--font-bengali-body: 'Hind Siliguri', 'Anek Bangla', ...`
  - Added new variables: `--font-bengali-display`, `--font-bengali-heritage`, `--font-bengali-decorative`, `--font-lipi-ador`, `--font-lipi-shishir`
  - Updated `@import` to include Hind Siliguri + Anek Bangla + Li Ador Noirrit via cdnfonts + maateen

- `css/style-v2.css`
  - Same variable replacement, lighter palette version

- All HTML files (`index.html`, `index-v2.html`, `about.html`, `custom-order.html`, `product.html`, `wishlist-cart.html`)
  - Removed `Noto+Serif+Bengali` from Google Fonts URL
  - Added `Hind+Siliguri` + `Anek+Bangla`
  - Added preconnect for cdnfonts + maateen.me
  - Added `<link href="https://fonts.cdnfonts.com/css/li-ador-noirrit">`
  - Added `<link rel="stylesheet" href="css/bengali-fonts.css">`

### New Folder
- `/fonts/README.md` — Instructions + direct download links for Lipighor fonts

---

## CSS Variables — New System

```css
--font-bengali-body: 'Hind Siliguri', 'Anek Bangla', 'SolaimanLipi', ...;
--font-bengali-heading: 'Anek Bangla', 'Hind Siliguri', 'Baloo Da 2', ...;
--font-bengali-display: 'Li Ador Noirrit', 'Anek Bangla', 'Hind Siliguri', ...;
--font-bengali-heritage: 'Alinur Shishir', 'Alinur Ekushe', 'Alinur Banglaborn', ...;
--font-bengali-decorative: 'Alinur Mayabati', 'Choyna Tista', 'Charu Chandan', ...;
--font-bengali: var(--font-bengali-body); /* backward compat */
```

## Usage Examples

```html
<!-- Body Bengali -->
<p class="bengali-text">হাতে তৈরি প্রতিটি উপহারে থাকুক অনুভূতির ছোঁয়া</p>

<!-- Heading Bengali with Anek Bangla -->
<h2 class="bengali-heading">জলকণা — ভালোবাসার গল্প</h2>

<!-- Display with Ador Noirrit (most popular Lipighor) -->
<h1 class="bengali-display font-ador">আমার সোনার বাংলা</h1>

<!-- Heritage with Shishir (matches water droplet brand) -->
<blockquote class="bengali-heritage font-shishir">
  "প্রতিটি সুতায় ভালোবাসা, প্রতিটি রঙে অনুভূতি"
</blockquote>

<!-- Decorative with Mayabati -->
<span class="bengali-decorative font-mayabati">✨ হাতে তৈরি ✨</span>
```

## Performance

- Google Fonts: `display=swap` for no FOIT
- Preconnect for google, cdnfonts, maateen for faster loading
- `font-display: swap` for self-hosted @font-face
- Unicode-range limited to Bengali block (U+0980-09FF) for self-hosted to save bytes

## Credits

- Hind Siliguri designed by Jyotish Sonowal (Google Fonts, OFL)
- Anek Bangla designed by Ek Type (Google Fonts, OFL)
- Li Ador Noirrit, Alinur Shishir, etc designed by Nurul Alam Ador, Md Alinur Islam etc — Copyright Lipighor Font Foundry
  - Free for commercial use, credit required, redistribution prohibited per https://lipighor.com/EULA.html
- Baloo Da 2, Kalpurush, etc via maateen.me CDN (individual licenses)

## How to Self-Host Lipighor Fonts (Optional)

If you want 100% offline without CDN:
1. Download zips from links in `/fonts/README.md`
2. Convert TTF → WOFF2
3. Place in `/fonts/` folder
4. Already defined @font-face in `bengali-fonts.css` will auto-load

---

## Before / After

**Before:**
```css
--font-heading: 'Playfair Display', 'Noto Serif Bengali', serif;
--font-bengali: 'Noto Serif Bengali', serif;
```
HTML: `...&family=Noto+Serif+Bengali:wght@300;400;500;600;700`

**After:**
```css
--font-bengali-body: 'Hind Siliguri', 'Anek Bangla', 'SolaimanLipi', sans-serif;
--font-bengali-heading: 'Anek Bangla', 'Hind Siliguri', 'Baloo Da 2', sans-serif;
--font-bengali-display: 'Li Ador Noirrit', 'Anek Bangla', sans-serif;
--font-bengali-heritage: 'Alinur Shishir', 'Alinur Ekushe', serif;
```
HTML: `...&family=Hind+Siliguri:wght@300;400;500;600;700&family=Anek+Bangla:wght@100..800` + cdnfonts + bengali-fonts.css

Result: More readable, more brand-aligned (Shishir = dew matches water droplet), more variety for handmade emotional storytelling.

