import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, sendEmailVerification,
  sendPasswordResetEmail, signOut, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const accountPage = 'account.html';
let auth;
let currentUser = null;

const errorMessages = {
  'auth/invalid-credential': 'That email or password does not look right. Please try again.',
  'auth/email-already-in-use': 'An account already exists with this email. Try logging in instead.',
  'auth/weak-password': 'Please choose a password with at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled. Please try again when you are ready.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Please allow pop-ups and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment before trying again.',
  'auth/network-request-failed': 'We could not connect. Please check your internet connection and try again.'
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
  const message = document.querySelector('#authMessage');
  if (message) { message.textContent = text; message.className = `auth-message ${type}`; }
}
function setBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  button.dataset.label ||= button.textContent;
  button.textContent = busy ? 'Please wait…' : (label || button.dataset.label);
}
function openModal(mode = 'login') {
  const modal = document.querySelector('#authModal');
  if (!modal) return;
  modal.dataset.mode = mode;
  modal.classList.add('is-open');
  document.body.classList.add('auth-modal-open');
  setMessage();
  modal.querySelector(mode === 'signup' ? '#authName' : '#authEmail')?.focus();
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
  const verification = document.querySelector('[data-auth-verification]');
  if (verification) verification.hidden = !user || user.emailVerified;
}

function mountUi() {
  if (document.querySelector('#authModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-modal" id="authModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div class="auth-panel">
        <button class="auth-close" type="button" aria-label="Close account dialog">×</button>
        <p class="auth-kicker">Jol Kona Atelier</p>
        <h2 id="authTitle"><span class="login-copy">Welcome back</span><span class="signup-copy">Create your account</span></h2>
        <p class="auth-subtitle"><span class="login-copy">Sign in to keep your favourites close.</span><span class="signup-copy">Save your favourites and make every gift more personal.</span></p>
        <div class="auth-message" id="authMessage" aria-live="polite"></div>
        <button class="auth-google" id="googleSignIn" type="button"><span>G</span> Continue with Google</button>
        <div class="auth-divider"><span>or continue with email</span></div>
        <form id="authForm" novalidate>
          <label class="auth-field signup-only">Your name<input id="authName" type="text" autocomplete="name" placeholder="Your name"></label>
          <label class="auth-field">Email address<input id="authEmail" type="email" autocomplete="email" required placeholder="you@example.com"></label>
          <label class="auth-field">Password<input id="authPassword" type="password" autocomplete="current-password" minlength="6" required placeholder="At least 6 characters"></label>
          <button class="auth-forgot login-copy" id="forgotPassword" type="button">Forgot password?</button>
          <button class="auth-submit" type="submit"><span class="login-copy">Sign in</span><span class="signup-copy">Create account</span></button>
        </form>
        <p class="auth-switch"><span class="login-copy">New to Jol Kona? <button type="button" data-auth-mode="signup">Create an account</button></span><span class="signup-copy">Already have an account? <button type="button" data-auth-mode="login">Sign in</button></span></p>
      </div>
    </div>`);
  document.querySelectorAll('[data-auth-open]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.authOpen || 'login')));
  document.querySelector('.auth-close').addEventListener('click', closeModal);
  document.querySelector('#authModal').addEventListener('click', e => { if (e.target.id === 'authModal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.authMode)));
  document.querySelector('#authForm').addEventListener('submit', submitEmailForm);
  document.querySelector('#googleSignIn').addEventListener('click', googleSignIn);
  document.querySelector('#forgotPassword').addEventListener('click', forgotPassword);
}

async function submitEmailForm(event) {
  event.preventDefault();
  if (!auth) return setMessage('Authentication is not configured yet. Please contact Jol Kona.', 'error');
  const form = event.currentTarget, button = form.querySelector('[type="submit"]');
  const email = form.authEmail.value.trim(), password = form.authPassword.value, name = form.authName.value.trim();
  const signup = document.querySelector('#authModal').dataset.mode === 'signup';
  if (signup && !name) return setMessage('Please enter your name so we know what to call you.', 'error');
  setBusy(button, true);
  try {
    let credential;
    if (signup) {
      credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      await sendEmailVerification(credential.user);
      setMessage('Your account is ready. We sent a verification link to your inbox.', 'success');
      renderAccount(auth.currentUser);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      closeModal();
    }
  } catch (error) { setMessage(friendlyError(error), 'error'); }
  finally { setBusy(button, false); }
}
async function googleSignIn(event) {
  if (!auth) return setMessage('Authentication is not configured yet. Please contact Jol Kona.', 'error');
  setBusy(event.currentTarget, true);
  try { await signInWithPopup(auth, new GoogleAuthProvider()); closeModal(); }
  catch (error) { setMessage(friendlyError(error), 'error'); }
  finally { setBusy(event.currentTarget, false, 'G  Continue with Google'); }
}
async function forgotPassword() {
  const email = document.querySelector('#authEmail').value.trim();
  if (!email) return setMessage('Enter your email address first, then we’ll send a reset link.', 'error');
  try { await sendPasswordResetEmail(auth, email); setMessage('Password reset link sent — please check your inbox.', 'success'); }
  catch (error) { setMessage(friendlyError(error), 'error'); }
}
async function sendVerification() {
  try { await sendEmailVerification(auth.currentUser); setMessage('Verification email sent. Please check your inbox.', 'success'); }
  catch (error) { setMessage(friendlyError(error), 'error'); }
}

function addNavControl() {
  const actions = document.querySelector('.nav-actions');
  if (!actions || actions.querySelector('.auth-nav-control')) return;
  actions.insertAdjacentHTML('afterbegin', `<div class="auth-nav-control"><button class="nav-action-btn auth-trigger" type="button" data-auth-open="login" data-auth-guest aria-label="Log in"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg></button></div>`);
  actions.querySelector('[data-auth-open]').addEventListener('click', () => openModal('login'));
}

function addMobileAccountControl() {
  const mobileNav = document.querySelector('.mobile-nav');
  if (!mobileNav || mobileNav.querySelector('.mobile-auth-link')) return;
  mobileNav.insertAdjacentHTML('beforeend', `<button class="mobile-nav-link mobile-auth-link" type="button" data-auth-open="login" data-auth-guest>Login</button><a class="mobile-nav-link mobile-auth-link" href="${accountPage}" data-auth-user hidden>My Account</a>`);
  mobileNav.querySelector('[data-auth-open]').addEventListener('click', () => {
    mobileNav.classList.remove('active');
    document.getElementById('mobileToggle')?.classList.remove('active');
    openModal('login');
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
if (new URLSearchParams(location.search).get('login') === '1') window.addEventListener('load', () => openModal('login'));
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
  if (event.target.closest('[data-auth-send-verification]')) { event.preventDefault(); if (auth && currentUser) sendVerification(); }
});

export { openModal, currentUser };
