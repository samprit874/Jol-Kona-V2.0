/* ═══════════════════════════════════════════════════════════════
   জলকণা — Admin Access Control (shared config)
   ═══════════════════════════════════════════════════════════════

   WHO IS ADMIN?
   The admin(s) are Google accounts. To give someone admin access,
   add their Gmail address to ADMIN_EMAILS below.

   ⚠️ IMPORTANT — TWO PLACES MUST ALWAYS MATCH:

   1. THIS FILE (js/admin-config.js)
      → Controls what the /browser/ shows: the Admin Panel page itself
        and the "Admin Panel" link in the account menu.

   2. firestore.rules (in the Firebase Console → Firestore → Rules)
      → Controls what the /database/ allows. This is the REAL lock —
        even if someone edits this JS file locally, Firebase will still
        reject their writes unless their email is also in the rules.

   Add more admins by adding lines to the array (both places), e.g.:

     export const ADMIN_EMAILS = [
       'jolkona2007@gmail.com',
       'second-person@gmail.com',
     ];

   ═══════════════════════════════════════════════════════════════ */

export const ADMIN_EMAILS = [
  'jolkona2007@gmail.com',
];

// The admin panel lives at one place only: /admin.html on the main site
// (https://jolkona.dpdns.org/admin.html). Relative so it works on the live
// site, on preview deploys, and when opened locally.
export const ADMIN_PAGE = 'admin.html';

/**
 * Case-insensitive check — is this email an admin?
 * Used for UI only; the database itself is protected by Security Rules.
 */
export function isAdminEmail(email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin.trim().toLowerCase() === normalized);
}
