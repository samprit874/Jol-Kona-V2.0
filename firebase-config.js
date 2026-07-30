/*
 * =====================================================================
 * JOL KONA — FIREBASE WEB APP CONFIGURATION
 * =====================================================================
 *
 * Paste your Firebase web app configuration object below.
 *
 * You can find this in the Firebase Console:
 * 1. Go to Project Settings (gear icon) -> Your apps -> Web app.
 * 2. Copy the `firebaseConfig` object and replace the placeholder values below.
 *
 * Note: Firebase web configuration is public and safe to expose in client-side
 * browser code. Secure your database and storage with Firebase Security Rules.
 */

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-YOUR_MEASUREMENT_ID"
};

/*
 * Helper to check whether Firebase has been configured with real credentials.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  typeof firebaseConfig === 'object' &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  !String(firebaseConfig.apiKey).startsWith('YOUR_') &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID' &&
  !String(firebaseConfig.projectId).startsWith('YOUR_')
);

export default firebaseConfig;
