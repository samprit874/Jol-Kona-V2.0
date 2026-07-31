# Jol Kona V2.0

## Overview

Jol Kona V2.0 is a **fully static storefront** hosted on GitHub Pages at [jolkona.dpdns.org](https://jolkona.dpdns.org). There is no server-side code, no serverless functions, and no build step — just HTML, CSS, and JavaScript served directly from the repository.

User accounts are powered entirely by **Firebase Authentication** (project `jol-kona`). Email verification uses Firebase's built-in default email sent from the client SDK via `sendEmailVerification`.

## Local development

```bash
npm install
npm run dev
```

This starts a local static file server (`npx serve .`). Open `http://localhost:3000` in your browser.

## Firebase setup

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and create or select a project.
2. Register a **Web app** and copy its public configuration object.
3. Paste the configuration into `firebase-config.js` (replace the placeholder values).

### 2. Enable sign-in providers

In **Firebase Console → Authentication → Sign-in method**:

- Enable **Email/Password** (the first toggle; do *not* enable "Email link").
- Enable **Google** if you want Google sign-in on the storefront.

### 3. Authorise domains

In **Firebase Console → Authentication → Settings → Authorised domains**, add:

- `jolkona.dpdns.org` (GitHub Pages)
- `jol-kona.vercel.app` (Vercel)
- `localhost` (for local development)
- Any GitHub Pages domain used during development (e.g. `<user>.github.io`)

### 4. Customise the verification email

The verification email is sent by Firebase's default template. To match Jol Kona's branding:

1. Go to **Firebase Console → Authentication → Templates**.
2. Select **Email address verification**.
3. Edit the sender name, subject line, and body to your liking. You can use the `%DISPLAY_NAME%`, `%EMAIL%`, and `%LINK%` placeholders.
4. Save. The next `sendEmailVerification` call from the site will use the updated template.

To customise the sender address further, go to **Authentication → Templates → SMTP Settings** and provide your own mail server credentials.

## Deployment

The site is deployed on two platforms:

- **GitHub Pages** at [jolkona.dpdns.org](https://jolkona.dpdns.org) — push to `main` and GitHub Pages picks up changes automatically
- **Vercel** at [jol-kona.vercel.app](https://jol-kona.vercel.app) — auto-deploys from Git using the minimal `vercel.json` config

No build step, no environment variables, no server configuration required on either platform.

## Included account behaviour

- Email/password account creation and sign-in
- Google sign-in and password reset
- Firebase-built-in verification email (sent from the client SDK)
- Visible verification success/failure feedback on `account.html`
- Friendly error messages for common authentication failures
- Automatic `user.reload()` on the account page so the "email not verified" notice clears as soon as the verification link is followed
- Separate, dynamically-set **Sign in** and **Create account** labels (they cannot render together)
