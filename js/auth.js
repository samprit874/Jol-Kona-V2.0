import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged,
  signInWithPopup, GoogleAuthProvider, signOut
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const accountPage = 'account.html';
let auth;
let currentUser = null;

const errorMessages = {
  'auth/popup-closed-by-user': 'Google sign-in was cancelled. Please try again when you are ready.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow pop-ups and try again.',
  'auth/network-request-failed': 'We could not connect. Please check your internet connection and try again.',
  'auth/internal-error': 'The sign-in service hit an unexpected problem. Please try again shortly.',
  'auth/user-disabled': 'This account has been disabled. Please contact Jol Kona.',
  'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
  'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  'auth/web-storage-unsupported': 'Your browser is blocking the storage sign-in needs. Please enable cookies and try again.'
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelector('#googleSignIn').addEventListener('click', googleSignIn);
}

async function googleSignIn(event) {
  if (!auth) return setMessage('Authentication is not configured yet. Please contact Jol Kona.', 'error');
  setBusy(event.currentTarget, true);
  try { await signInWithPopup(auth, new GoogleAuthProvider()); closeModal(); }
  catch (error) { setMessage(friendlyError(error), 'error'); }
  finally { setBusy(event.currentTarget, false, 'G  Continue with Google'); }
}

function addNavControl() {
  const actions = document.querySelector('.nav-actions');
  if (!actions || actions.querySelector('.auth-nav-control')) return;
  actions.insertAdjacentHTML('afterbegin', `
    <div class="auth-nav-control">
      <button class="nav-action-btn auth-trigger" type="button" data-auth-open data-auth-guest aria-label="Log in">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
      <a class="nav-action-btn auth-user-btn" href="${accountPage}" data-auth-user hidden aria-label="View account">
        <div class="auth-avatar" data-auth-avatar></div>
      </a>
    </div>`);
  actions.querySelector('[data-auth-open]').addEventListener('click', () => openModal());
}

function addMobileAccountControl() {
  const mobileNav = document.querySelector('.mobile-nav');
  if (!mobileNav || mobileNav.querySelector('.mobile-auth-link')) return;
  mobileNav.insertAdjacentHTML('beforeend', `<button class="mobile-nav-link mobile-auth-link" type="button" data-auth-open data-auth-guest>Login</button><a class="mobile-nav-link mobile-auth-link" href="${accountPage}" data-auth-user hidden>My Account</a>`);
  mobileNav.querySelector('[data-auth-open]').addEventListener('click', () => {
    mobileNav.classList.remove('active');
    document.getElementById('mobileToggle')?.classList.remove('active');
    openModal();
  });
}

function guardAccountPage(user) {
  if (document.body.dataset.authRequired === 'true' && !user) {
    sessionStorage.setItem('jolKonaAfterLogin', window.location.href);
    window.location.replace('index.html?login=1');
  }
}

mountUi();
addNavControl();
addMobileAccountControl();
if (new URLSearchParams(location.search).get('login') === '1') window.addEventListener('load', () => openModal());
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  onAuthStateChanged(auth, user => {
    currentUser = user;
    renderAccount(user);
    guardAccountPage(user);
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
