/*
 * =====================================================================
 * JOL KONA — FIREBASE WEB APP CONFIGURATION (EXAMPLE / TEMPLATE)
 * =====================================================================
 *
 * Copy this file to `firebase-config.js` for local development, or to
 * `firebase-config.local.js` (gitignored) if you want to keep the
 * placeholder version in git.
 *
 *   cp firebase-config.example.js firebase-config.js
 *
 * Then replace the placeholder strings below with your real Firebase
 * web app config:
 *
 *   Firebase Console → Project Settings (gear) → Your apps → Web app
 *   → copy firebaseConfig object
 *
 * SECURITY:
 * - Firebase apiKey is public by design; security comes from Firestore
 *   / Storage Security Rules, not from hiding the key.
 * - Still, restrict the key in Google Cloud Console → APIs & Services →
 *   Credentials → HTTP referrers: jolkona.dpdns.org, localhost, etc.
 * - Never commit real keys if you want to keep GitHub Secret Scanning
 *   clean. Prefer runtime injection via window.__FIREBASE_CONFIG__ for
 *   production, or generate this file in CI from secrets.
 *
 * Template below uses placeholders only — safe for version control.
 */

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

/*
 * Optional runtime injection alternative (production):
 * Instead of hardcoding here, you can inject config in HTML:
 *
 * <script>
 *   window.__FIREBASE_CONFIG__ = {
 *     apiKey: "AIza....",
 *     authDomain: "...",
 *     projectId: "...",
 *     storageBucket: "...",
 *     messagingSenderId: "...",
 *     appId: "...",
 *     measurementId: "..."
 *   };
 * </script>
 *
 * And firebase-config.js can read window.__FIREBASE_CONFIG__.
 * See firebase-config.js for implementation.
 */

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
    typeof firebaseConfig === "object" &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    !String(firebaseConfig.apiKey).startsWith("YOUR_") &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    !String(firebaseConfig.projectId).startsWith("YOUR_")
);

export default firebaseConfig;
