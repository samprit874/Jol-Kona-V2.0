# Jol Kona V2.0

## Firebase authentication setup

The account experience is deployed as static files and works on GitHub Pages without a build step. Before enabling it in production:

1. Create/select a Firebase project and register a **Web app**.
2. Copy its web configuration into `firebase-config.js` in the project root (or `js/firebase-config.js`). This is Firebase's public client configuration, not a server secret.
3. In **Firebase Authentication → Sign-in method**, enable **Email/Password** and **Google**.
4. In **Authentication → Settings → Authorized domains**, add the production GitHub Pages host (for example, `samprit874.github.io`) and any custom domain used by the site. `localhost` is already available for local testing.
5. Configure the email template/action URL in Firebase Authentication if you use a custom domain. Ensure the GitHub Pages URL is an authorized continue URL.
6. Apply Firebase Security Rules to every Firebase product used by the site. Authentication alone does not secure Firestore, Storage, or other data.

`js/auth.js` uses Firebase JavaScript SDK 10.14.1 modular imports and browser-local persistence, so a signed-in visitor remains signed in between browser sessions. It provides email/password sign-up and sign-in, Google sign-in, reset-password email, verification email, logout, profile rendering, and a protected `account.html` route. To protect another static page, add `data-auth-required="true"` to its `<body>` element.

3. The function then hands the link to **Resend**, which sends the email using the pre-built Resend template `a319bebb-0cc9-41d5-9826-aff1d48d00d5` and the variables `{ user_first_name, verification_url }`.
4. The client shows a success toast: **"Verification email sent! Please check your inbox."**

### Local setup

```bash
npm install
cp .env.example .env
# Fill in the values in .env
vercel dev
```

### Required environment variables (set in Vercel → Settings → Environment Variables)

| Variable | Description |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project ID (e.g. `jol-kona`). |
| `FIREBASE_CLIENT_EMAIL` | Service-account client email. |
| `FIREBASE_PRIVATE_KEY` | Service-account private key (PEM, with `\n` allowed). |
| `RESEND_API_KEY` | API key from resend.com. |
| `RESEND_FROM` *(optional)* | Defaults to `Jol Kona <noreply@jolkona.dpdns.org>`. Use `onboarding@resend.dev` for testing. |
| `RESEND_TEMPLATE_ID` *(optional)* | Defaults to `a319bebb-0cc9-41d5-9826-aff1d48d00d5`. |
| `VERIFICATION_REDIRECT_URL` *(optional)* | Defaults to `https://jol-kona.vercel.app`. Must be an authorised domain in Firebase Authentication. |

### Files added / changed

- `package.json`, `vercel.json`, `.env.example`, `.gitignore` — new project metadata.
- `lib/firebase-admin.js` — singleton Firebase Admin SDK initialisation.
- `api/send-verification.js` — Vercel serverless endpoint that mints the link and calls Resend.
- `js/auth.js` — drops the client-side `sendEmailVerification` call on sign-up and POSTs to the new endpoint instead; the "Send verification email" button on `account.html` is also routed through the server endpoint.

