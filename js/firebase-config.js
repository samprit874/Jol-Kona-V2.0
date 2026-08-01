/*
 * Firebase configuration is managed in the dedicated `firebase-config.js`
 * file at the root of the project (/firebase-config.js).
 *
 * This file re-exports that configuration so all existing imports in `js/`
 * continue to work seamlessly.
 *
 * The root file now contains only placeholders for version control
 * (to avoid GitHub secret scanning false positives). Real values can
 * be provided via:
 *  - window.__FIREBASE_CONFIG__ runtime injection (production)
 *  - firebase-config.local.js (gitignored, local dev)
 *  - direct edit of /firebase-config.js locally (do not commit)
 *
 * See /firebase-config.example.js for the template.
 */
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';

export { firebaseConfig, isFirebaseConfigured };
export default firebaseConfig;
