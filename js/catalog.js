/* ═══════════════════════════════════════════════════════════════
   জলকণা — Live Catalog Loader (public, read-only)
   ═══════════════════════════════════════════════════════════════
   Fetches products & customer reviews from Firebase Firestore —
   the content the shop owner manages through the private Admin Panel.

   READ-ONLY: Firestore Security Rules allow anyone to READ, but only
   the admin email(s) can WRITE. This file simply displays the data.

   FALLBACK: if Firestore is unreachable or has no content yet, the
   site keeps showing the built-in content (js/products.js + the
   review cards written in the HTML) — nothing breaks.
   ═══════════════════════════════════════════════════════════════ */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore, collection, getDocs
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => htmlEntities[c]);

const sortByOrder = (a, b) => {
  const ao = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
  const bo = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  const at = a.createdAt?.seconds || 0;
  const bt = b.createdAt?.seconds || 0;
  return at - bt;
};

/* ── Products ─────────────────────────────────────────────── */

function applyProducts(docs) {
  const products = docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id, // stable Firestore id keeps wishlist/cart consistent
      name: d.name || 'Handmade Creation',
      category: d.category || 'gift-hampers',
      image: d.image || 'img/logo.png',
      badge: d.badge || '',
      description: d.description || '',
      dmText: d.dmText || '',
    };
  }).sort(sortByOrder);

  if (!products.length) return;
  window.PRODUCTS = products;

  // Ask shop.js (if present on this page) to re-render with live data.
  if (typeof window.renderProducts === 'function') {
    try { window.renderProducts('all'); } catch (e) { console.warn('catalog: grid refresh failed', e); }
  }
  if (window.JolKonaShop && typeof window.JolKonaShop.renderSavedShop === 'function') {
    try { window.JolKonaShop.renderSavedShop(); } catch (e) { /* optional */ }
  }
}

/* ── Reviews ──────────────────────────────────────────────── */

function reviewCardMarkup(review) {
  const stars = Math.max(1, Math.min(5, parseInt(review.stars, 10) || 5));
  const initial = (review.name || 'A').trim().charAt(0).toUpperCase() || 'A';
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${escapeHtml(initial)}</div>
        <div class="review-author-info">
          <div class="review-author-name">${escapeHtml(review.name)}</div>
          <div class="review-author-location">${escapeHtml(review.location || '')}</div>
        </div>
        <div class="review-stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
      </div>
      <p class="review-text">${escapeHtml(review.text)}</p>
    </div>`;
}

function applyReviews(docs) {
  const reviews = docs.map((doc) => doc.data())
    .filter((d) => d && d.name && d.text)
    .sort(sortByOrder);

  if (!reviews.length) return;

  document.querySelectorAll('.reviews-slider').forEach((slider) => {
    // Reset any marquee state the static cards may have built already.
    slider.classList.remove('is-live', 'is-paused');
    slider.removeAttribute('data-marquee-initialized');
    slider.style.removeProperty('--reviews-marquee-duration');
    slider.innerHTML = reviews.map(reviewCardMarkup).join('');
    // Rebuild the seamless marquee with the fresh cards.
    if (window.JolKonaReviewsMarquee && typeof window.JolKonaReviewsMarquee.init === 'function') {
      try { window.JolKonaReviewsMarquee.init(slider); } catch (e) { console.warn('catalog: marquee refresh failed', e); }
    }
  });
}

/* ── Fetch ────────────────────────────────────────────────── */

async function loadCatalog() {
  if (!isFirebaseConfigured) return;
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const [productSnap, reviewSnap] = await Promise.all([
      getDocs(collection(db, 'products')).catch(() => null),
      getDocs(collection(db, 'reviews')).catch(() => null),
    ]);

    if (productSnap && !productSnap.empty) applyProducts(productSnap.docs);
    if (reviewSnap && !reviewSnap.empty) applyReviews(reviewSnap.docs);
  } catch (error) {
    // Firestore may not be enabled yet, or the visitor may be offline —
    // the static content already on the page keeps working. Stay silent.
    console.info('Jol Kona catalog: using built-in content.', error?.code || error);
  }
}

loadCatalog();
