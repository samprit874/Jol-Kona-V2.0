# Jol Kona - Bengali Fonts (Lipighor Curated)

This folder hosts self-hosted Lipighor fonts for offline/premium loading.
All fonts are from https://lipighor.com/freefont.html and are free for commercial use (per Lipighor EULA - must give credit).

## Curated Selection for Jol Kona Brand

| Font | Meaning / Why Chosen | Download | Popularity |
|------|---------------------|----------|------------|
| **Li Ador Noirrit** | Modern, elegant, 10 styles, most popular (315k+) - Primary display | https://lipighor.com/download/AdorNoirrit.zip | ⭐⭐⭐⭐⭐ |
| **Alinur Shishir** | Means "dew" - matches Jol Kona = water droplet brand identity | https://lipighor.com/download/AlinurShishir.zip | ⭐⭐⭐⭐⭐ 200k |
| **Alinur Mayabati** | Means "enchantress" - premium gift feeling | https://lipighor.com/download/AlinurMayaboti.zip | ⭐⭐⭐⭐ 79k |
| **Alinur Ekushe** | Heritage of Ekushey (21st Feb) - literary | https://lipighor.com/download/AlinurEkush.zip | ⭐⭐⭐⭐ 103k |
| **Choyna Tista** | Flowy handwritten, Tista river - 320k downloads | https://lipighor.com/download/ChaynaTista.zip | ⭐⭐⭐⭐⭐ |
| **Alinur BanglaBorno** | Authentic Bengali letter heritage | https://lipighor.com/download/AlinurBanglaBorno.zip | ⭐⭐⭐⭐ 197k |
| **Alinur BornoBikash** | Creative evolution | https://lipighor.com/download/AlinurBornoBikash.zip | 63k |
| **Alinur Ananda** | Joy/happiness - festive gifting | https://lipighor.com/download/AlinurAnanda.zip | - |

## Installation

1. Download each zip from above links
2. Extract `.ttf` files
3. Convert TTF → WOFF2 using https://cloudconvert.com/ttf-to-woff2 or `ttf2woff2`
4. Rename to match expected names in `css/bengali-fonts.css`:
   - `AlinurShishir-Regular.woff2`
   - `AlinurMayabati-Regular.woff2`
   - `ChaynaTista-Regular.woff2`
   - `AlinurEkushe-Regular.woff2`
   - `AlinurBanglaBorno-Regular.woff2`
   - `AlinurBornoBikash-Regular.woff2`
   - `AlinurAnanda-Regular.woff2`
5. Place files in this folder (`/fonts/`)

While local files are missing, CDN fallbacks will load:
- Google Fonts: Hind Siliguri + Anek Bangla (primary)
- CDNFonts: Li Ador Noirrit
- Maateen.me CDN: Baloo Da 2, Kalpurush, SolaimanLipi, etc.

## Current CDN Integration (works without local files)

```css
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Anek+Bangla:wght@100..800');
@import url('https://fonts.cdnfonts.com/css/li-ador-noirrit');
@import url('https://fonts.maateen.me/baloo-da-2/font.css');
...
```

## Usage

```html
<link rel="stylesheet" href="css/bengali-fonts.css">
```

```css
.bengali-text { font-family: var(--font-bengali-body); }
.bengali-heading { font-family: var(--font-bengali-heading); }
.bengali-display { font-family: var(--font-bengali-display); }
.bengali-heritage { font-family: var(--font-bengali-heritage); }
```

Classes provided:
- `.font-hind`, `.font-anek`, `.font-ador`, `.font-shishir`, `.font-mayabati`, `.font-tista`, `.font-ekushe`, `.font-borno`

## License

All Lipighor fonts are copyright Lipighor Font Foundry. Free for personal & commercial use, but redistribution of font files is prohibited per https://lipighor.com/EULA.html
You must credit Lipighor in your project.

Jol Kona credits Lipighor Foundry for beautiful Bengali typography.

## Recommended Pairings for Jol Kona

- **Body Bengali**: Hind Siliguri 400 (readability, modern)
- **Headings Bengali**: Anek Bangla 600 (contemporary, bold)
- **Display/Brand**: Li Ador Noirrit 500 + Alinur Shishir (matches water droplet)
- **Quotes/Poetry**: Alinur Mayabati, Choyna Tista (handwritten, emotional)
- **Festive/Heritage**: Alinur Ekushe, BanglaBorno (traditional)
