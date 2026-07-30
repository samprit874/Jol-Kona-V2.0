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
