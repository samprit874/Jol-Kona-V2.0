/*
 * =====================================================================
 * JOL KONA — FIREBASE WEB APP CONFIGURATION
 * =====================================================================
 *
 * SECURITY NOTE — WHY THIS FILE CONTAINS ONLY PLACEHOLDERS:
 *
 * Firebase web config (apiKey, authDomain, projectId, etc.) is PUBLIC
 * by design — it is meant to be exposed in browser code. Firebase
 * security is enforced via Security Rules, not by hiding the apiKey.
 *
 * However, GitHub Secret Scanning flags any string matching
 * `AIza...` as a "Google API Key" leak. To keep the repo clean and
 * avoid false-positive alerts, we do NOT commit real project values
 * here. Only placeholders like "YOUR_FIREBASE_API_KEY" are tracked.
 *
 * HOW TO CONFIGURE (pick ONE):
 *
 * 1) Local development (recommended):
 *    - Copy `firebase-config.example.js` to `firebase-config.local.js`
 *      (the *.local.js file is gitignored).
 *    - Fill real values in `firebase-config.local.js`.
 *    - Import it in this file OR just copy values here locally and
 *      never commit them (the file will be detected as modified —
 *      keep it untracked or reset before pushing).
 *
 *    OR simpler: directly edit THIS file locally with your real
 *    config and do NOT commit it. The placeholder check
 *    `isFirebaseConfigured` will warn you if you forget.
 *
 * 2) Production — runtime injection (secure, no secret in repo):
 *    Add a small script BEFORE your module scripts in HTML:
 *
 *      <script>
 *        window.__FIREBASE_CONFIG__ = {
 *          apiKey: "AIza...",
 *          authDomain: "your-project.firebaseapp.com",
 *          projectId: "your-project",
 *          storageBucket: "your-project.firebasestorage.app",
 *          messagingSenderId: "...",
 *          appId: "...",
 *          measurementId: "G-..."
 *        };
 *      </script>
 *
 *    This file will automatically use `window.__FIREBASE_CONFIG__`
 *    if it exists and looks valid.
 *
 * 3) Vercel / CI env injection:
 *    Generate this file at deploy time from environment secrets.
 *    Example bash:
 *      printf "export const firebaseConfig = { apiKey: \"%s\", ... }" ...
 *
 * IMPORTANT — RESTRICT YOUR API KEY:
 * Even though the key is public, restrict it in:
 * Google Cloud Console → APIs & Services → Credentials → API key
 * → Application restrictions → HTTP referrers:
 *   jolkona.dpdns.org/*, localhost:*, *.vercel.app/*, etc.
 * This prevents usage from unknown domains.
 *
 * Reference: https://firebase.google.com/docs/projects/api-keys
 *
 */

// --------------------------------------------------------------------
// Placeholder config — safe to commit. Replace via runtime injection
// or local file for real usage.
// --------------------------------------------------------------------
const PLACEHOLDER_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

function getInjectedConfig() {
  // Allow hosts to inject real config without committing it:
  // <script>window.__FIREBASE_CONFIG__ = { ... }</script>
  try {
    const globalScope =
      typeof globalThis !== "undefined"
        ? globalThis
        : typeof window !== "undefined"
          ? window
          : null;

    const injected = globalScope && globalScope.__FIREBASE_CONFIG__;
    if (
      injected &&
      typeof injected === "object" &&
      injected.apiKey &&
      !String(injected.apiKey).startsWith("YOUR_") &&
      injected.projectId &&
      !String(injected.projectId).startsWith("YOUR_")
    ) {
      return injected;
    }
  } catch {
    // ignore — fallback to placeholder
  }
  return null;
}

// Prefer runtime-injected config if present, otherwise use placeholder.
// This keeps HEAD clean for secret scanning while still allowing
// deployments that inject config at runtime.
export const firebaseConfig = getInjectedConfig() || PLACEHOLDER_CONFIG;

/*
 * Helper to check whether Firebase has been configured with real credentials.
 * Works for both placeholder and injected configs.
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
