/**
 * lib/firebase-admin.js
 * ---------------------------------------------------------------------------
 * Initialises the Firebase Admin SDK using service-account credentials sourced
 * from environment variables. Safe to import multiple times in a serverless
 * environment — we re-use an existing app if one is already initialised.
 *
 * Required environment variables (set these in your Vercel project settings):
 *   - FIREBASE_PROJECT_ID
 *   - FIREBASE_CLIENT_EMAIL
 *   - FIREBASE_PRIVATE_KEY   (paste the full key, including BEGIN/END markers;
 *                             newlines can be either literal "\n" or real
 *                             newlines — both are handled below)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';

function readPrivateKey() {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is not set. Add it in your Vercel project environment variables.'
    );
  }
  // Vercel often stores multi-line secrets with escaped "\n" — normalise them.
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}

function buildServiceAccount() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: readPrivateKey(),
  };
}

/**
 * Returns a singleton Firebase Admin app, initialising it on first use.
 * @returns {import('firebase-admin/app').App}
 */
export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({
    credential: cert(buildServiceAccount()),
  });
}
