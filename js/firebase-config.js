/*
 * Firebase web app configuration.
 *
 * Replace these values with the client configuration from Firebase Console →
 * Project settings → Your apps → Web app. Firebase web configuration is safe
 * to expose in a browser; protect data with Firebase Security Rules.
 */
export const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some(
  (value) => !value || value.startsWith('YOUR_')
);
