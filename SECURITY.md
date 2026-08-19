# Security Policy & Hardening Guide

This page explains how জলকণা (Jol Kona) is protected and the exact steps to
finish locking it down. The site is a **fully static storefront** (HTML/CSS/JS)
with **Firebase** for auth + Firestore for the product/review catalog.

## Threat model (short version)

| Attack | Protection | Where |
| --- | --- | --- |
| Stored XSS via product/review data | Every rendered field goes through `escapeHtml()` | `js/shop.js`, `js/catalog.js`, `js/admin.js`, `js/auth.js` |
| Injected / unknown third-party scripts, plugins, data exfil | Content-Security-Policy | every page (`<meta>`), `vercel.json` header |
| Clickjacking / MIME sniffing / permission abuse | Security headers | `vercel.json` |
| Uploaded-file XSS (self-XSS) | Filename is HTML-escaped | `custom-order.html` |
| Unauthorised DB writes / uploads | Firestore & Storage Security Rules (admin allowlist + default deny) | `firestore.rules`, `storage.rules` |
| API key abuse from other domains | HTTP-referrer restriction on the browser key | Google Cloud Console ⚠️ manual |

---

## 1. Code-level hardening already in place

- **Content-Security-Policy** on every page. It allows only:
  - scripts: this site + `www.gstatic.com` (Firebase SDK) + `apis.google.com`
  - styles/fonts: this site + Google Fonts + the Bengali font CDNs
  - images: this site + `data:`/`blob:` + any `https:` image (product photos are
    pasted URLs from ImgBB / Firebase Storage)
  - connections: Firebase/Google APIs only (blocks data exfiltration to random domains)
  - `object-src 'none'` (blocks Flash/plugin/`<embed>` attacks),
    `base-uri 'self'`, `form-action 'self'`.
  - Note: `script-src` includes `'unsafe-inline'` because the pages use inline
    `<script>` blocks and `onclick` handlers. If you refactor those away, tighten
    it to remove `'unsafe-inline'`.
- **Security headers on Vercel** (`vercel.json`): `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and the CSP.
  (GitHub Pages does **not** let you set headers — the `<meta>` CSP covers pages there,
  but clickjacking headers are only enforceable on Vercel.)
- **Self-XSS fixed** in `custom-order.html`: the uploaded filename is escaped before
  being written into the DOM.
- **Firestore rule fix**: the product category allowlist now includes `'crochet'`
  (previously admins could not save crochet items — the write would be rejected).

---

## 2. About the Firebase API key in the repo

`firebase-config.js` contains a Firebase **web** config, including an `AIza…` API key.
This is **public by design** — Firebase documents that web API keys are not secrets;
they are shipped in every browser client. Authorization comes from **Security Rules**
and **API-key restrictions**, *not* from hiding the key.

So the key being visible is **not** a vulnerability by itself. What matters is:

1. The **Firestore / Storage rules must be deployed** (see §3 below).
2. The **API key must be HTTP-referrer restricted** (see §4 below).
3. Because the key has been in the public git history, **rotate it** if GitHub Secret
   Scanning flags it, or if you simply want a clean slate (see §4). After rotating,
   update the deployed config (Vercel env vars via `scripts/generate-firebase-config.mjs`,
   or the runtime `window.__FIREBASE_CONFIG__` injection).

---

## 3. ⚠️ MOST IMPORTANT — deploy the Security Rules (do this first)

The rules files in this repo are *templates*. They only protect you once **published**
in the Firebase console. If Firestore was created in **test mode** (or rules were never
published), **anyone can read and write your entire product/review database** and
deface the store.

1. Go to <https://console.firebase.google.com> → project **jol-kona**.
2. **Build → Firestore Database**. If it is not created yet, create it in
   **Production mode**.
3. Open the **Rules** tab, **delete everything**, paste the full contents of
   `firestore.rules`, and click **Publish**.
4. **Build → Storage** → **Rules**, paste `storage.rules`, click **Publish**.
5. **Authentication → Sign-in method**: make sure only **Google** is enabled
   (turn off Email/Password, Anonymous, etc. unless you need them).
6. **Authentication → Settings → Authorized domains**: keep only your real domains
   (`jolkona.dpdns.org`, `jol-kona.firebaseapp.com`, `*.vercel.app`) and remove any
   domains you don't recognise.

### Verify it's locked (safe, from your browser, logged out)

Open the browser console (DevTools → Console) on your site and run:

```js
const key = 'AIzaSyCbXEl2wCoLHiKdjuDaiKv1LC54VPxq5bQ'; // your browser key
const base = 'https://firestore.googleapis.com/v1/projects/jol-kona/databases/(default)/documents';
fetch(`${base}/products`, { headers: { 'x-goog-api-key': key } }).then(r => console.log('READ status:', r.status));
fetch(`${base}/products`, { method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json' }, body: '{"fields":{"name":{"stringValue":"hack-test"}}}' }).then(r => console.log('WRITE status:', r.status));
```

- `READ → 200` is expected (products are public).
- `WRITE → 403` (or 401) is what you want. If you see `2xx`, **your database is open
  — publish the rules immediately.**

---

## 4. Restrict & rotate the API key

1. Open <https://console.cloud.google.com> → **APIs & Services → Credentials**.
2. Find the **Browser key** (the `AIzaSy…` value above), click it.
3. **Application restrictions → HTTP referrers**, add:
   - `jolkona.dpdns.org/*`
   - `*.vercel.app/*`
   - `jol-kona.firebaseapp.com/*`
   - `localhost/*` and `127.0.0.1/*` (for development)
4. **API restrictions → Restrict key** to only the APIs the site uses:
   Identity Toolkit API, Token Service API, Firestore API, Firebase Storage API.
5. **Save.** To **rotate**: Firebase Console → Project settings → Your apps → Web app
   → regenerate the config (this creates a new key), then update your deployment
   (Vercel env vars `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, … via
   `scripts/generate-firebase-config.mjs`, or the runtime injection).

---

## 5. Protect the admin account

The whole store is gated on the admin allowlist in `js/admin-config.js` **and** in the
rules. A single Gmail account is a single point of failure:

- Turn on **2-Step Verification** on `jolkona2007@gmail.com`
  (<https://myaccount.google.com/security>).
- Consider a **second admin**: add the email to `js/admin-config.js` **and** to the
  `isAdmin()` list in `firestore.rules` / `storage.rules` (the two must match).
- Optional, stronger: enable **Firebase App Check** for the web app so only your
  verified domains can call the backend.

---

## 6. How to change / remove the CSP

If a feature breaks after adding the CSP, first check the browser console for a
"CSP violation" message and add the missing domain to the matching `*-src` directive.

- The CSP lives in **two places** — keep them identical:
  1. the `<meta http-equiv="Content-Security-Policy" …>` tag in each `.html` file
  2. the `Content-Security-Policy` header in `vercel.json`
- To disable it entirely, remove those tags/lines.
- If you later **enable** a commented-out third-party script, add its domains first:
  - Elfsight Instagram feed (`index.html`): add `https://static.elfsight.com`,
    `https://apps.elfsight.com`, `https://core.service.elfsight.com` to `script-src`,
    `connect-src`, `frame-src` and `img-src`.
  - Vercel Speed Insights: the script is same-origin (`/_vercel/speed-insights/…`),
    so `script-src 'self'` already allows it.

---

## Reporting a vulnerability

Open a private security advisory (GitHub → Security → Advisories) or email
`jolkona2007@gmail.com`. Do **not** open a public issue for credentials.
