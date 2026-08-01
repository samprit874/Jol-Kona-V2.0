# 🚀 Fix "Authentication is not configured yet" — Vercel Setup (one time, ~10 min)

Your real Firebase key lives **only in Vercel's dashboard** — never in GitHub, never shared anywhere.
During every deploy, `scripts/generate-firebase-config.mjs` (runs automatically via `vercel.json`'s `buildCommand`) writes a real `firebase-config.js` on the server from those variables.

---

## Step 1 — Merge these changes & let Vercel redeploy

Merge this branch into `main`. Vercel will redeploy automatically.
*(Login will still show the error at this point — that's fixed in the next steps.)*

## Step 2 — Copy your Firebase values

1. Open <https://console.firebase.google.com> → project **jol-kona**
2. ⚙️ gear → **Project settings** → scroll to **Your apps** → your **Web app**
3. You'll see the `firebaseConfig` object. Keep this tab open.

## Step 3 — Paste them into Vercel (the only place you paste anything)

1. Open <https://vercel.com/dashboard> → click your **jol-kona** project
2. **Settings** → **Environment Variables**
3. Add these **6 variables** — copy each value from the Firebase `firebaseConfig` object.
   For each one: type the **Name**, paste the **Value**, tick **Production** (and **Preview** if you use preview links), click **Save**.

| Vercel variable name (exact) | Value = Firebase field |
| --- | --- |
| `FIREBASE_API_KEY` | `apiKey` (starts with `AIza…`) |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` (e.g. `jol-kona.firebaseapp.com`) |
| `FIREBASE_PROJECT_ID` | `projectId` (e.g. `jol-kona`) |
| `FIREBASE_STORAGE_BUCKET` | `storageBucket` (e.g. `jol-kona.firebasestorage.app`) |
| `FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` (a number) |
| `FIREBASE_APP_ID` | `appId` (starts with `1:…`) |
| `FIREBASE_MEASUREMENT_ID` *(optional)* | `measurementId` (`G-…`) — only if you use Analytics |

## Step 4 — Redeploy

**Deployments** tab → ⋯ menu on the latest deployment → **Redeploy**.
In the build log you should see:
`[firebase-config] firebase-config.js generated from Vercel environment variables.`
If a name was typed wrong, the log tells you exactly which variable is missing.

## Step 5 — Firebase Console checks (login still fails without these)

1. **Authentication → Sign-in method → Google** → **Enabled** ✅
2. **Authentication → Settings → Authorized domains** → make sure these are listed:
   - `jolkona.dpdns.org`
   - your Vercel domain (e.g. `your-project.vercel.app`)
   - (`localhost` is there by default for local testing)

## Step 6 — Test

Open the site → log in with Google. Hard-refresh once (**Ctrl + Shift + R**) if needed.
Done — the "not configured" message is gone. 🎉

---

### Optional but recommended — restrict your API key

Google Cloud Console → **APIs & Services → Credentials** → your browser API key →
**Application restrictions → HTTP referrers** → add `jolkona.dpdns.org/*` and `*.vercel.app/*`.
This stops anyone else from reusing your key on their own site.
