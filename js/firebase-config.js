/*
 * Firebase configuration is managed in the dedicated `firebase-config.js` file
 * at the root of the project (/firebase-config.js).
 *
 * This file re-exports that configuration so all existing imports in `js/`
 * continue to work seamlessly.
 */
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';

export { firebaseConfig, isFirebaseConfigured };
export default firebaseConfig;
