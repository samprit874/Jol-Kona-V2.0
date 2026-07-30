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
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCbXEl2wCoLHiKdjuDaiKv1LC54VPxq5bQ",
  authDomain: "jol-kona.firebaseapp.com",
  projectId: "jol-kona",
  storageBucket: "jol-kona.firebasestorage.app",
  messagingSenderId: "8094183004",
  appId: "1:8094183004:web:ceebbcb2bba0a353de0099",
  measurementId: "G-56H00J5PG1"
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
