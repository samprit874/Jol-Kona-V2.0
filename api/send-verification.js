/**
 * Sends a Firebase email-verification link through Resend.
 *
 * The caller must supply the Firebase ID token for the account it wants to
 * verify. This prevents this endpoint from being used to send mail to arbitrary
 * addresses.
 */
import { getAuth } from 'firebase-admin/auth';
import { Resend } from 'resend';
import { getFirebaseAdminApp } from '../lib/firebase-admin.js';

const DEFAULT_REDIRECT_URL = 'https://jolkona.dpdns.org/account.html';

function json(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  return response.json(payload);
}

function firstName(name, email) {
  return (name || email.split('@')[0] || 'there').trim().split(/\s+/)[0];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { error: 'method-not-allowed' });
  }

  try {
    const idToken = request.body?.idToken;
    if (!idToken || typeof idToken !== 'string') {
      return json(response, 401, { error: 'unauthenticated' });
    }
    if (!process.env.RESEND_API_KEY) {
      console.error('Verification email is not configured: RESEND_API_KEY is missing.');
      return json(response, 503, { error: 'email-not-configured' });
    }

    const adminAuth = getAuth(getFirebaseAdminApp());
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const user = await adminAuth.getUser(decodedToken.uid);
    if (!user.email) return json(response, 400, { error: 'missing-email' });
    if (user.emailVerified) return json(response, 200, { alreadyVerified: true });

    const continueUrl = process.env.VERIFICATION_REDIRECT_URL || DEFAULT_REDIRECT_URL;
    const verificationUrl = await adminAuth.generateEmailVerificationLink(user.email, {
      url: continueUrl,
      handleCodeInApp: false,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || 'Jol Kona <noreply@jolkona.dpdns.org>';
    const name = escapeHtml(firstName(user.displayName, user.email));
    const result = await resend.emails.send({
      from,
      to: [user.email],
      subject: 'Verify your Jol Kona email address',
      html: `<p>Hi ${name},</p><p>Please confirm your email address to finish setting up your Jol Kona account.</p><p><a href="${verificationUrl}">Verify email address</a></p>`,
    });

    if (result.error) {
      console.error('Resend rejected verification email:', result.error);
      return json(response, 502, { error: 'email-delivery-failed' });
    }
    return json(response, 200, { sent: true });
  } catch (error) {
    console.error('Unable to send verification email:', error);
    return json(response, 500, { error: 'verification-failed' });
  }
}
