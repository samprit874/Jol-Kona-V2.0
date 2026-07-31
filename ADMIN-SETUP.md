# 🔐 Jol Kona Admin Panel — One-Time Setup Guide

You now have a **private admin page** where you can add/edit/delete **products** and **customer reviews** yourself — no coding, no GitHub uploads ever again.

**Your admin URL:** `https://jolkona.dpdns.org/admin.html`
It is **not linked anywhere** on the site, is marked `noindex` for search engines, is blocked in `robots.txt`, requires **Google sign-in**, and — most importantly — the **database itself refuses** any change from accounts that aren't yours.

The code is ready. You only need to switch on the database **once** (about 5 minutes, free):

---

## Step 1 — Turn on the database (Firestore)

1. Open <https://console.firebase.google.com> and sign in with your Google account.
2. Click the project **jol-kona**.
3. In the left menu: **Build → Firestore Database**.
4. Click **Create database** → choose **Production mode** → Next.
5. For the location, pick **`asia-south1` (Mumbai)** → **Enable**. Wait ~1 minute.

## Step 2 — Lock the database to *your* account only

1. In Firestore Database, open the **Rules** tab.
2. Delete whatever is there, and **paste the entire contents of `firestore.rules`** (in this repo).
3. Click **Publish**.

✅ Done. Now only the Google account(s) listed in those rules can add or change products/reviews. Every visitor can still *see* them.

## Step 3 — (Optional, recommended) Direct photo upload

With this step, the admin page lets you upload product photos straight from your phone/computer — no ImgBB, no GitHub.

1. Left menu: **Build → Storage** → **Get started** → **Production mode** → same location → Done.
2. Open Storage’s **Rules** tab, paste the entire contents of **`storage.rules`** → **Publish**.

*(If you skip this step, everything still works — just paste an ImgBB image link in the product form instead of uploading.)*

## Step 4 — First login & one-click import

1. Push these changes live (just merge this branch — the site deploys automatically).
2. Visit **`https://jolkona.dpdns.org/admin.html`** → **Continue with Google** → sign in with **`jolkona2007@gmail.com`** (that email is pre-set as the admin — see below to change it).
3. On the **Products** tab, click **🌱 Import existing products** → your 12 current products are copied into the database in one shot.
4. On the **Reviews** tab, click **🌱 Import existing reviews** → the 5 current homepage reviews are copied too.
5. From now on, the shop shows whatever is in the admin panel. Refresh the homepage to see it.

---

## Daily use (after setup)

| Want to… | Do this |
| --- | --- |
| Add a product | `jolkona.dpdns.org/admin.html` → Products → fill the form (name, category, upload photo) → **Publish product** |
| Edit / delete a product | Products tab → ✏️ Edit or 🗑 on any card |
| Add/edit/delete reviews (comments) | Reviews tab *(“What Our Customers Say” section)* |
| Change the order things appear in | Use the **Order** number (0 = first) |
| Reach the panel quickly | Sign in on the site → click your avatar (desktop) or open the ☰ menu (mobile) → **Admin Panel** *(this item only appears for your admin account)* |

## Changing / adding admin accounts

⚠️ Admin emails live in **two places that must match**:

1. **`js/admin-config.js`** → `ADMIN_EMAILS = [ ... ]` (controls what the browser shows)
2. **`firestore.rules`** (and `storage.rules`) in the Firebase Console → the `email in [ ... ]` list (controls what the database allows — the real lock)

The business email from the site’s schema — `jolkona2007@gmail.com` — is pre-filled in all three. If that’s not the Gmail you’ll use, change it in all places and publish the rules again.

## How the privacy works (mind it 🔒)

- **Visitors** never see a link to the admin page; search engines are told not to index it.
- Even if someone **finds** `admin.html`, they hit a Google sign-in wall.
- Even if someone **signs in** with a random Google account, the page shows *Access denied* **and** Firestore Security Rules reject any write on the server side — spoofing is impossible because the email comes from Google’s own signed token, not from browser code.
- The live shop’s read path (`js/catalog.js`) is **read-only** by design.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Admin page shows “Could not reach Firestore” | Step 1 wasn’t done — create the database. |
| Saving says “Firebase rejected the write” | Your signed-in email doesn’t match the rules’ email list — check spelling in `firestore.rules` **and** `js/admin-config.js`, then click Publish. |
| Photo upload refused | Step 3 not done yet — enable Storage + publish `storage.rules`, or paste an ImgBB link. |
| Homepage still shows old content | Hard-refresh once (Ctrl+Shift+R). The site falls back to the old built-in content if the database is empty or unreachable. |
| I want public visitors to *submit* reviews | That’s a bigger feature (needs moderation). Ask and it can be added the same secure way. |
