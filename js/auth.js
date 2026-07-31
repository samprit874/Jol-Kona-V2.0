import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, signOut
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
import { isAdminEmail, ADMIN_PAGE } from './admin-config.js';

const accountPage = 'account.html';
const redirectStateKey = 'jolKonaGoogleRedirect';
let auth;
let currentUser = null;

const errorMessages = {
  'auth/popup-closed-by-user': 'Google sign-in was cancelled. Please try again when you are ready.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. We will try a full-page Google redirect instead.',
  'auth/cancelled-popup-request': 'Another sign-in window was already opening. Please try again in a moment.',
  'auth/network-request-failed': 'We could not connect. Please check your internet connection and try again.',
  'auth/internal-error': 'The sign-in service hit an unexpected problem. Please try again shortly.',
  'auth/user-disabled': 'This account has been disabled. Please contact Jol Kona.',
  'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
  'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  'auth/web-storage-unsupported': 'Your browser is blocking the storage sign-in needs. Please enable cookies and try again.',
  'auth/account-exists-with-different-credential': 'This Google account is already linked to a different sign-in method on Jol Kona.',
  'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase Authentication for this project yet.',
  'auth/invalid-api-key': 'The Firebase configuration is invalid. Please update the site\'s API key.',
  'auth/unauthorized-domain': 'This website domain is not authorised in Firebase Authentication yet. Add it in Firebase → Authentication → Settings → Authorised domains.',
  'auth/operation-not-supported-in-this-environment': 'This browser cannot open the Google sign-in popup here, so we will try a full-page redirect instead.'
};

function friendlyError(error) {
  return errorMessages[error?.code] || 'Something went wrong. Please try again in a moment.';
}
function initials(user) {
  return (user.displayName || user.email || 'U').trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
function escapeHtml(value = '') {
  const element = document.createElement('div'); element.textContent = value; return element.innerHTML;
}
function setMessage(text = '', type = '') {
  // The account page has no sign-in modal open, so show feedback there too.
  document.querySelectorAll('#authMessage, #accountMessage').forEach(message => {
    message.textContent = text;
    message.className = `auth-message ${type}`;
  });
}
function setBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  button.dataset.label ||= button.textContent;
  button.textContent = busy ? 'Please wait…' : (label || button.dataset.label);
}
function openModal() {
  const modal = document.querySelector('#authModal');
  if (!modal) return;
  modal.classList.add('is-open');
  document.body.classList.add('auth-modal-open');
  setMessage();
  modal.querySelector('#googleSignIn')?.focus();
}
function closeModal() {
  document.querySelector('#authModal')?.classList.remove('is-open');
  document.body.classList.remove('auth-modal-open');
}

function renderAccount(user) {
  document.querySelectorAll('[data-auth-guest]').forEach(el => el.hidden = !!user);
  document.querySelectorAll('[data-auth-user]').forEach(el => el.hidden = !user);
  document.querySelectorAll('[data-auth-name]').forEach(el => el.textContent = user?.displayName || user?.email?.split('@')[0] || '');
  document.querySelectorAll('[data-auth-email]').forEach(el => el.textContent = user?.email || '');
  document.querySelectorAll('[data-auth-avatar]').forEach(el => {
    if (user?.photoURL) { el.innerHTML = `<img src="${escapeHtml(user.photoURL)}" alt="${escapeHtml(user.displayName || 'Profile photo')}">`; }
    else el.textContent = user ? initials(user) : '';
  });
  // Keep the dropdown's identity card in sync (in case it stays open during a switch).
  document.querySelectorAll('[data-auth-menu-name]').forEach(el => el.textContent = user?.displayName || user?.email?.split('@')[0] || '');
  document.querySelectorAll('[data-auth-menu-email]').forEach(el => el.textContent = user?.email || '');
  // Clear any leftover "busy" state on action buttons after a re-render (e.g. when a user
  // returns to a page after a "Switch account" that briefly disabled the trigger).
  document.querySelectorAll('.account-menu-action').forEach(btn => {
    if (btn.dataset.label) { btn.textContent = btn.dataset.label; btn.disabled = false; }
  });
  // If the user just signed out, close any open dropdown so the login icon shows again.
  if (!user) closeAccountMenu();
}

function mountUi() {
  if (document.querySelector('#authModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-modal" id="authModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div class="auth-panel">
        <button class="auth-close" type="button" aria-label="Close account dialog">×</button>
        <p class="auth-kicker">Jol Kona</p>
        <h2 id="authTitle">Welcome back</h2>
        <p class="auth-subtitle" id="authSubtitle">Sign in to keep your favourites close.</p>
        <div class="auth-message" id="authMessage" aria-live="polite"></div>
        <button class="auth-google" id="googleSignIn" type="button"><span>G</span> Continue with Google</button>
      </div>
    </div>`);
  document.querySelectorAll('[data-auth-open]').forEach(button => button.addEventListener('click', () => openModal()));
  document.querySelector('.auth-close').addEventListener('click', closeModal);
  document.querySelector('#authModal').addEventListener('click', e => { if (e.target.id === 'authModal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeAccountMenu(); } });
  document.querySelector('#googleSignIn').addEventListener('click', googleSignIn);
}

// Configure a provider that always shows the Google account chooser.
// This powers both "Add another account" and "Switch account".
function buildChooserProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

async function googleSignIn() {
  const button = document.querySelector('#googleSignIn');
  if (!auth) {
    setMessage('Authentication is not configured yet. Please contact Jol Kona.', 'error');
    return;
  }

  setBusy(button, true, 'Continue with Google');
  setMessage();

  try {
    await signInWithPopup(auth, buildChooserProvider());
    sessionStorage.removeItem(redirectStateKey);
    closeModal();
  } catch (error) {
    const shouldFallbackToRedirect = [
      'auth/popup-blocked',
      'auth/operation-not-supported-in-this-environment'
    ].includes(error?.code);

    if (shouldFallbackToRedirect) {
      try {
        sessionStorage.setItem(redirectStateKey, '1');
        setMessage('Redirecting to Google…', 'success');
        await signInWithRedirect(auth, buildChooserProvider());
        return;
      } catch (redirectError) {
        sessionStorage.removeItem(redirectStateKey);
        setMessage(friendlyError(redirectError), 'error');
        return;
      }
    }

    setMessage(friendlyError(error), 'error');
  } finally {
    setBusy(button, false, 'Continue with Google');
  }
}

function accountMenuMarkup() {
  return `
    <div class="account-menu" id="accountMenu" role="menu" aria-label="Account menu" hidden>
      <div class="account-menu-header" role="presentation">
        <div class="account-menu-avatar" data-auth-avatar aria-hidden="true"></div>
        <div class="account-menu-identity">
          <div class="account-menu-name" data-auth-menu-name>Your account</div>
          <div class="account-menu-email" data-auth-menu-email></div>
        </div>
      </div>
      <ul class="account-menu-list" role="none">
        <li role="none"><a class="account-menu-item" role="menuitem" href="${accountPage}">
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <span class="account-menu-label">My Account</span>
        </a></li>
        <li role="none"><a class="account-menu-item" role="menuitem" href="wishlist-cart.html#wishlist">
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span class="account-menu-label">My Wishlist</span>
        </a></li>
        <li role="none"><a class="account-menu-item" role="menuitem" href="${accountPage}#orders">
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </span>
          <span class="account-menu-label">My Orders</span>
        </a></li>
        <li class="account-menu-divider" role="separator" aria-hidden="true"></li>
        <li role="none"><button class="account-menu-item account-menu-action" type="button" role="menuitem" data-auth-action="add-account">
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </span>
          <span class="account-menu-label">Add another account</span>
        </button></li>
        <li role="none"><button class="account-menu-item account-menu-action" type="button" role="menuitem" data-auth-action="switch-account">
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          </span>
          <span class="account-menu-label">Switch account</span>
        </button></li>
        <li class="account-menu-divider" role="separator" aria-hidden="true"></li>
        <li role="none"><button class="account-menu-item account-menu-action account-menu-item--danger" type="button" role="menuitem" data-auth-action="logout">
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          <span class="account-menu-label">Log out</span>
        </button></li>
      </ul>
    </div>`;
}

// Show an "Admin Panel" shortcut in the account dropdown — ONLY for
// accounts on the admin allowlist (js/admin-config.js). Even if someone
// hand-edits this, Firebase Security Rules still reject non-admin writes.
function syncAdminMenuItem(user) {
  // Mobile drawer (js/mobile-nav.js) ships the row already rendered but hidden,
  // so it only needs unhiding. Do this first and independently of the desktop
  // dropdown, which may not exist yet on some pages.
  const isAdmin = !!(user && isAdminEmail(user.email));
  document.querySelectorAll('[data-auth-admin-row]').forEach(el => {
    el.hidden = !isAdmin;
    el.classList.toggle('is-admin-visible', isAdmin);
  });

  const menu = document.querySelector('#accountMenu');
  if (!menu) return;
  const existing = menu.querySelector('[data-auth-admin-link]');
  if (user && isAdminEmail(user.email)) {
    if (!existing) {
      const firstItem = menu.querySelector('.account-menu-list li');
      firstItem?.insertAdjacentHTML('afterend', `<li role="none"><a class="account-menu-item" role="menuitem" href="${ADMIN_PAGE}" data-auth-admin-link>
          <span class="account-menu-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/><polyline points="9 12 11 14 15 10"/></svg>
          </span>
          <span class="account-menu-label">Admin Panel</span>
        </a></li>`);
    }
  } else if (existing) {
    existing.closest('li')?.remove();
  }
}

function ensureAccountMenu() {
  if (document.querySelector('#accountMenu')) return;
  document.body.insertAdjacentHTML('beforeend', accountMenuMarkup());
  const menu = document.querySelector('#accountMenu');
  // Single delegated click handler for everything inside the dropdown.
  menu.addEventListener('click', e => {
    const actionTrigger = e.target.closest('[data-auth-action]');
    if (actionTrigger) {
      runAccountAction(actionTrigger.dataset.authAction, actionTrigger);
      return;
    }
    // Clicking a regular link closes the dropdown (navigation still proceeds).
    if (e.target.closest('a')) closeAccountMenu();
  });
}

function openAccountMenu(trigger) {
  const menu = document.querySelector('#accountMenu');
  if (!menu) return;
  // Position the menu under the avatar trigger so it works on both V1 and V2 navs.
  // The menu is `position: fixed`, so coordinates are viewport-relative.
  if (trigger) {
    positionAccountMenu(trigger);
    window.addEventListener('resize', positionOnScrollOrResize);
    window.addEventListener('scroll', positionOnScrollOrResize, true);
  }
  menu.hidden = false;
  menu.classList.add('is-open');
  trigger?.setAttribute('aria-expanded', 'true');
  document.addEventListener('click', outsideAccountMenuHandler, true);
  document.addEventListener('keydown', escAccountMenuHandler);
}

function positionAccountMenu(trigger) {
  const menu = document.querySelector('#accountMenu');
  if (!menu || !trigger) return;
  const rect = trigger.getBoundingClientRect();
  const menuWidth = menu.offsetWidth || 280;
  const viewportWidth = document.documentElement.clientWidth;
  let left = rect.right - menuWidth;
  if (left < 12) left = 12;
  if (left + menuWidth > viewportWidth - 12) left = viewportWidth - menuWidth - 12;
  const top = rect.bottom + 8;
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
  menu.style.right = 'auto';
}

function positionOnScrollOrResize() {
  const trigger = document.querySelector('[data-auth-menu-toggle]');
  if (trigger) positionAccountMenu(trigger);
}

function closeAccountMenu() {
  const menu = document.querySelector('#accountMenu');
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  menu.classList.remove('is-open');
  document.querySelectorAll('[data-auth-menu-toggle][aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded', 'false'));
  document.removeEventListener('click', outsideAccountMenuHandler, true);
  document.removeEventListener('keydown', escAccountMenuHandler);
  window.removeEventListener('resize', positionOnScrollOrResize);
  window.removeEventListener('scroll', positionOnScrollOrResize, true);
}

function outsideAccountMenuHandler(event) {
  const menu = document.querySelector('#accountMenu');
  if (!menu || menu.hidden) return;
  if (event.target.closest('#accountMenu') || event.target.closest('[data-auth-menu-toggle]')) return;
  closeAccountMenu();
}
function escAccountMenuHandler(event) {
  if (event.key === 'Escape') closeAccountMenu();
}

async function runAccountAction(action, triggerButton) {
  if (!auth) {
    setMessage('Authentication is not configured yet. Please contact Jol Kona.', 'error');
    return;
  }
  closeAccountMenu();
  if (action === 'logout') {
    setBusy(triggerButton, true, 'Log out');
    try { await signOut(auth); }
    catch (error) { setMessage(friendlyError(error), 'error'); }
    finally { setBusy(triggerButton, false, 'Log out'); }
    return;
  }
  if (action === 'add-account' || action === 'switch-account') {
    const label = action === 'add-account' ? 'Add another account' : 'Switch account';
    setBusy(triggerButton, true, label);
    try {
      // For "Switch account", sign out first so the new account fully replaces the session.
      if (action === 'switch-account' && auth.currentUser) {
        await signOut(auth);
      }
      await signInWithPopup(auth, buildChooserProvider());
    }
    catch (error) {
      if (error?.code === 'auth/popup-closed-by-user') {
        // If the user cancelled a "Switch account" after we already signed them out,
        // reopen the login modal so they aren't stuck signed out.
        if (action === 'switch-account' && !auth.currentUser) openModal();
      } else {
        setMessage(friendlyError(error), 'error');
      }
    }
    finally { setBusy(triggerButton, false, label); }
  }
}

function addNavControl() {
  const actions = document.querySelector('.nav-actions');
  if (!actions || actions.querySelector('.auth-nav-control')) return;
  actions.insertAdjacentHTML('afterbegin', `
    <div class="auth-nav-control">
      <button class="nav-action-btn auth-trigger" type="button" data-auth-open data-auth-guest aria-label="Log in">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
      <button class="nav-action-btn auth-user-btn" type="button" data-auth-user hidden data-auth-menu-toggle aria-label="Open account menu" aria-haspopup="menu" aria-expanded="false">
        <div class="auth-avatar" data-auth-avatar></div>
      </button>
    </div>`);
  ensureAccountMenu();
  const toggle = actions.querySelector('[data-auth-menu-toggle]');
  toggle?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const menu = document.querySelector('#accountMenu');
    if (menu && !menu.hidden) closeAccountMenu();
    else openAccountMenu(toggle);
  });
  actions.querySelector('[data-auth-open]').addEventListener('click', () => openModal());
}

function guardAccountPage(user) {
  if (document.body.dataset.authRequired === 'true' && !user) {
    sessionStorage.setItem('jolKonaAfterLogin', window.location.href);
    window.location.replace('index.html?login=1');
  }
}

mountUi();
addNavControl();
// Expose a tiny surface so other scripts (e.g. the mobile drawer) can trigger auth UI.
window.JolKonaAuth = { openModal, closeModal };
if (new URLSearchParams(location.search).get('login') === '1') window.addEventListener('load', () => openModal());
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(() => {});

  if (sessionStorage.getItem(redirectStateKey)) {
    setMessage('Finishing Google sign-in…', 'success');
  }

  getRedirectResult(auth)
    .then(result => {
      sessionStorage.removeItem(redirectStateKey);
      if (result?.user) {
        closeModal();
        setMessage();
      }
    })
    .catch(error => {
      sessionStorage.removeItem(redirectStateKey);
      setMessage(friendlyError(error), 'error');
      openModal();
    });

  onAuthStateChanged(auth, user => {
    currentUser = user;
    renderAccount(user);
    syncAdminMenuItem(user);
    guardAccountPage(user);
    if (user) {
      sessionStorage.removeItem(redirectStateKey);
      closeModal();
      setMessage();
    }
    if (user && sessionStorage.getItem('jolKonaAfterLogin')) {
      const destination = sessionStorage.getItem('jolKonaAfterLogin'); sessionStorage.removeItem('jolKonaAfterLogin'); window.location.assign(destination);
    }
  });
} else {
  renderAccount(null);
  guardAccountPage(null);
  console.warn('Jol Kona authentication: add your Firebase web configuration to firebase-config.js (or js/firebase-config.js).');
}
document.addEventListener('click', event => {
  if (event.target.closest('[data-auth-logout]')) { event.preventDefault(); if (auth) signOut(auth); }
});

export { openModal, currentUser };
