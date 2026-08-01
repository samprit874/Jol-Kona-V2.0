# Security Policy

## Secret Scanning — Google API Key Alert (firebase-config.js)

GitHub Secret Scanning flags any `AIza...` string as a "Google API Key" public leak.
For Firebase Web SDK, this key is **public by design** and safe to expose in client-side
browser code — Firebase security is enforced via **Firestore & Storage Security Rules**
and **API key application restrictions**, not by hiding the `apiKey`.

See: https://firebase.google.com/docs/projects/api-keys

### What we did to resolve the alert

1. **Removed hard-coded production key** from `firebase-config.js` (line 17 was previously
   `apiKey: "AIza...."` with a real project key). The file now contains only placeholders (`YOUR_FIREBASE_API_KEY`)
   that are safe to commit.

2. **Added `firebase-config.example.js`** as a documented template for contributors.

3. **Added runtime injection support**: you can provide real config at deploy time via

   ```html
   <script>
     window.__FIREBASE_CONFIG__ = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       ...
     };
   </script>
   ```

   before loading modules. `firebase-config.js` will prefer `window.__FIREBASE_CONFIG__`
   if present.

4. **Updated `.gitignore`** to ignore `firebase-config.local.js` and other local override
   files, so developers can keep real config locally without risking a push.

5. **Recommendations for key restriction (post-incident)**:
   - Go to Google Cloud Console → APIs & Services → Credentials → open the Browser key
     used by `jol-kona`.
   - Set **Application restrictions → HTTP referrers** to:
     `jolkona.dpdns.org/*`, `jol-kona.firebaseapp.com/*`,
     `localhost/*`, `127.0.0.1/*`, `*.vercel.app/*`
   - Under **API restrictions**, restrict to only needed APIs:
     `Identity Toolkit API`, `Token Service API`, `Firebase Management API`,
     `Firestore API`, `Firebase Storage API` if used.
   - If you suspect abuse, **rotate the key**: Firebase Console → Project Settings →
     General → Your apps → Web app → rotate / generate new config, then update deployment
     injection.

6. **Historical secret in git**: The original commit `a1b5c3a` contained the real key in
   history. After merging the placeholder fix, you should either:
   - Mark the Secret Scanning alert as **"Revoked / False positive with restriction"** in
     GitHub UI after restricting/rotating the key, OR
   - Purge history with `git filter-repo` / BFG and force-push (only if you control all forks).

   For this public static site, rotating/restricting is the recommended low-disruption fix.

### For contributors

- Copy `firebase-config.example.js` → `firebase-config.js` (or `.local.js`) and paste your own
  Firebase project config.
- Never commit real `AIza...` values. Keep placeholder version in git.
- Test `isFirebaseConfigured` guard: if false, auth UI shows a friendly console warning.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

Please open a private security advisory via GitHub → Security → Advisories, or email
`jolkona2007@gmail.com` with details. We aim to acknowledge within 48 hours and provide
a fix/mitigation timeline.

Do NOT open a public issue for sensitive credentials.
