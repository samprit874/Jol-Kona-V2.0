# Jol Kona V2.0

## Authentication and verification email setup

The storefront is static, but the branded verification-email endpoint is a Vercel serverless function. Email/password sign-up and sign-in use Firebase Authentication; verification links are minted securely on the server and delivered via Resend.

### Configure Firebase

1. Create/select a Firebase project and register a **Web app**.
2. Copy its public web configuration to `firebase-config.js`.
3. In **Firebase Authentication → Sign-in method**, enable **Email/Password** and **Google** (if Google sign-in is used).
4. In **Firebase Authentication → Settings → Authorized domains**, add `jolkona.dpdns.org`, the Vercel deployment domain, and `localhost` for development.
5. Add the exact `VERIFICATION_REDIRECT_URL` value (normally `https://jolkona.dpdns.org/account.html`) to Firebase's authorised continue URLs.

### Configure Vercel and Resend

Deploy the repository to Vercel so `/api/send-verification` is available. Set every variable from `.env.example` in **Vercel → Settings → Environment Variables**:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project ID. |
| `FIREBASE_CLIENT_EMAIL` | Firebase service-account client email. |
| `FIREBASE_PRIVATE_KEY` | Firebase service-account private key. |
| `RESEND_API_KEY` | Resend API key. |
| `RESEND_FROM` | A sender address on a domain verified in Resend. |
| `VERIFICATION_REDIRECT_URL` | Authorised Firebase continue URL after verification. |

The endpoint validates the signed-in user's Firebase ID token before it generates a link, so it cannot be used to send mail to arbitrary addresses. If the site is served purely from GitHub Pages, the client automatically falls back to Firebase's built-in verification email; configure Firebase's email template for that fallback.

### Local setup

```bash
npm install
cp .env.example .env
# Fill in the values in .env
vercel dev
```

### Included account behaviour

- Email/password account creation and sign-in
- Google sign-in and password reset
- Branded Resend verification mail on Vercel, with safe Firebase fallback on a static host
- Visible verification success/failure feedback on `account.html`
- Separate, dynamically-set **Sign in** and **Create account** labels (they cannot render together)
