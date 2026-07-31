/**
 * api/send-verification.js
 * ---------------------------------------------------------------------------
 * Vercel serverless function (Node 18+ runtime) that:
 *   1. Generates a Firebase email-verification link for the supplied user.
 *   2. Sends the link through Resend using a pre-built Resend template.
 *
 * Request body (JSON):
 *   { "email": "user@example.com", "displayName": "Optional Name" }
 *
 * Required env vars (configured in the Vercel dashboard):
 *   - FIREBASE_PROJECT_ID
 *   - FIREBASE_CLIENT_EMAIL
 *   - FIREBASE_PRIVATE_KEY
 *   - RESEND_API_KEY
 *
 * Optional env vars:
 *   - VERIFICATION_REDIRECT_URL  (defaults to https://jol-kona.vercel.app)
 *   - RESEND_FROM                (defaults to "Jol Kona <noreply@jolkona.dpdns.org>")
 *   - RESEND_TEMPLATE_ID         (defaults to "a319bebb-0cc9-41d5-9826-aff1d48d00d5")
 */

import { Resend } from 'resend';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ----- Bootstrap singletons (re-used across warm invocations) -------------
if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      '[send-verification] Missing Firebase Admin env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in Vercel.'
    );
  } else {
    // Vercel commonly stores multi-line secrets with escaped "\n" — normalise.
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

const TEMPLATE_ID =
  process.env.RESEND_TEMPLATE_ID || 'a319bebb-0cc9-41d5-9826-aff1d48d00d5';
const FROM_ADDRESS =
  process.env.RESEND_FROM || 'Jol Kona <noreply@jolkona.dpdns.org>';
const REDIRECT_URL =
  process.env.VERIFICATION_REDIRECT_URL || 'https://jol-kona.vercel.app';

export default async function handler(req, res) {
  // Only POST is allowed.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // --- Parse + validate body ------------------------------------------------
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { /* fall through to validation */ }
  }
  const email = (body?.email || '').toString().trim();
  const displayName = (body?.displayName || '').toString().trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid `email` is required.' });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('[send-verification] RESEND_API_KEY is not set.');
    return res.status(500).json({ error: 'Resend is not configured on the server.' });
  }
  if (getApps().length === 0) {
    return res.status(500).json({ error: 'Firebase Admin is not configured on the server.' });
  }

  try {
    // --- 1. Generate the verification link ---------------------------------
    const actionCodeSettings = {
      url: REDIRECT_URL,
      handleCodeInApp: false,
    };
    const link = await getAuth().generateEmailVerificationLink(email, actionCodeSettings);

    // --- 2. Build custom HTML from the fixed template file ---------------
    const templatePath = resolve(process.cwd(), 'email-template-fixed.html');
    let htmlContent = readFileSync(templatePath, 'utf8');
    htmlContent = htmlContent.replace(/\{\{\{user_first_name\}\}\}/g, displayName || 'User');
    htmlContent = htmlContent.replace(/\{\{\{verification_url\}\}\}/g, link);

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: 'Verify your email for Jol Kona',
      html: htmlContent,
    });

    if (error) {
      console.error('[send-verification] Resend error:', error);
      return res.status(502).json({ error: 'Failed to send verification email.', detail: error });
    }

    return res.status(200).json({
      ok: true,
      message: 'Verification email sent.',
      resendId: data?.id,
    });
  } catch (err) {
    console.error('[send-verification] Unexpected error:', err);
    return res.status(500).json({
      error: 'Failed to send verification email.',
      detail: err?.message || String(err),
    });
  }
}
