/* ═══════════════════════════════════════════════════════════════
   জলকণা — Private Admin Panel
   ═══════════════════════════════════════════════════════════════
   Only Google accounts listed in js/admin-config.js AND the
   Firestore Security Rules can read the dashboard / write data.
   Everything saved here appears on the live shop instantly.
   ═══════════════════════════════════════════════════════════════ */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';
import { isAdminEmail } from './admin-config.js';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const $ = (id) => document.getElementById(id);
const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => htmlEntities[c]);

const CATEGORY_LABELS = {
  'gift-hampers': 'Gift Hampers',
  'custom-chocolates': 'Custom Chocolates',
  'clay-jewellery': 'Clay Jewellery',
  'hair-accessories': 'Hair Accessories',
  'pipe-cleaner': 'Pipe Cleaner',
  'keychains': 'Keychains',
  'crochet': 'Crochet',
};

/* The 5 reviews currently hard-coded on the homepage (used by the
   one-click importer so the panel starts from existing content). */
const SEED_REVIEWS = [
  { name: 'Sneha Das', location: 'Kolkata, WB', stars: 5, text: "The bouquet I ordered for my mother's birthday was beyond beautiful. She actually cried seeing it! The craftsmanship is incredible. জলকণা truly puts emotion into every piece." },
  { name: 'Rahul Mondal', location: 'Raiganj, WB', stars: 5, text: 'Ordered a personalized gift box for our anniversary. The packaging, the quality, the attention to detail — everything was premium. My wife absolutely loved it!' },
  { name: 'Priya Saha', location: 'Burdwan, WB', stars: 5, text: 'The crochet teddy bear I received was the cutest thing ever! You can feel the love in every stitch. Already planning my next order. This is hands down the best handmade brand!' },
  { name: 'Ananya Roy', location: 'Siliguri, WB', stars: 5, text: 'I ordered handmade earrings for Durga Puja and they were stunning! Everyone asked where I got them. The Bengali touch makes them so special. ❤️' },
  { name: 'Debashish Ghosh', location: 'Malda, WB', stars: 5, text: "Ordered pipe cleaner flowers for my girlfriend on Valentine's Day. She said it was the most thoughtful gift she ever received. Thank you জলকণা for making me look good!" },
];

let productsCache = [];
let reviewsCache = [];

/* ── UI helpers ─────────────────────────────────────────── */

function showState(state) {
  ['adminLoading', 'adminSignin', 'adminDenied', 'adminDashboard'].forEach((id) => {
    $(id).hidden = id !== state;
  });
}

function toast(message) {
  const el = $('adminToast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2800);
}

function setFormMessage(elId, message, type = '') {
  const el = $(elId);
  el.textContent = message || '';
  el.className = `admin-message ${message ? 'show' : ''} ${type}`;
}

function setBusy(button, busy, busyLabel = 'Working…') {
  if (!button) return;
  if (button.dataset.label === undefined) button.dataset.label = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? busyLabel : button.dataset.label;
}

function sortByOrder(list) {
  return [...list].sort((a, b) => {
    const ao = typeof a.order === 'number' ? a.order : Number.POSITIVE_INFINITY;
    const bo = typeof b.order === 'number' ? b.order : Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });
}

function friendlyFirestoreError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firebase rejected the write. Double-check your email is in BOTH js/admin-config.js and the Firestore Rules (see ADMIN-SETUP.md).';
  }
  if (error?.code === 'unavailable' || error?.code === 'failed-precondition') {
    return 'Could not reach Firestore. Has the database been created in the Firebase Console? See ADMIN-SETUP.md step 1.';
  }
  return error?.message || 'Something went wrong. Please try again.';
}

/* ── Auth ───────────────────────────────────────────────── */

function initAuth() {
  if (!isFirebaseConfigured) {
    showState('adminDenied');
    $('adminDeniedText').textContent = 'Firebase is not configured in firebase-config.js yet.';
    return;
  }

  const signInBtn = $('adminGoogleSignIn');
  signInBtn.addEventListener('click', async () => {
    setBusy(signInBtn, true, 'Opening Google…');
    setFormMessage('adminAuthMessage', '');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        setFormMessage('adminAuthMessage', 'Sign-in failed: ' + (error?.message || 'please try again.'), 'error');
      }
    } finally {
      setBusy(signInBtn, false);
    }
  });

  $('adminDeniedSwitch').addEventListener('click', async () => {
    await signOut(auth).catch(() => {});
  });

  $('adminLogout').addEventListener('click', async () => {
    setBusy($('adminLogout'), true);
    await signOut(auth).catch(() => {});
    toast('Logged out. Stay safe! 🔒');
    setBusy($('adminLogout'), false);
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      showState('adminSignin');
      $('adminUserChip').hidden = true;
      $('adminLogout').hidden = true;
      return;
    }
    if (!isAdminEmail(user.email)) {
      showState('adminDenied');
      $('adminDeniedText').innerHTML =
        `The account <strong>${escapeHtml(user.email)}</strong> is not on the admin list.`;
      $('adminUserChip').hidden = true;
      $('adminLogout').hidden = false;
      return;
    }
    // ✔ Admin
    $('adminUserChip').hidden = false;
    $('adminLogout').hidden = false;
    $('adminUserEmail').textContent = user.email;
    const initial = (user.displayName || user.email || 'A').charAt(0).toUpperCase();
    const avatar = $('adminUserChip').querySelector('img, .admin-chip-initial');
    if (avatar) {
      avatar.outerHTML = user.photoURL
        ? `<img src="${escapeHtml(user.photoURL)}" alt="">`
        : `<span class="admin-chip-initial">${escapeHtml(initial)}</span>`;
    }
    showState('adminDashboard');
    refreshProducts();
    refreshReviews();
  });
}

/* ── Tabs ───────────────────────────────────────────────── */

function initTabs() {
  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      document.querySelectorAll('.admin-pane').forEach((pane) => {
        pane.hidden = pane.id !== `pane-${tab.dataset.tab}`;
      });
    });
  });
}

/* ── Products ───────────────────────────────────────────── */

async function refreshProducts() {
  setFormMessage('productFormMessage', '');
  const list = $('productList');
  list.innerHTML = '<div class="admin-empty">Loading…</div>';
  try {
    const snap = await getDocs(collection(db, 'products'));
    productsCache = sortByOrder(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    renderProductList();
  } catch (error) {
    list.innerHTML = `<div class="admin-empty">⚠️ ${escapeHtml(friendlyFirestoreError(error))}</div>`;
  }
}

function renderProductList() {
  const list = $('productList');
  $('productCount').textContent = String(productsCache.length);
  $('productSeedBox').hidden = productsCache.length > 0;

  if (!productsCache.length) {
    list.innerHTML = '<div class="admin-empty">No products yet — the shop is showing the built-in list.<br>Add one with the form, or import your existing products. 👇</div>';
    return;
  }

  list.innerHTML = productsCache.map((p, index) => `
    <div class="admin-item" data-id="${escapeHtml(p.id)}">
      <img class="admin-item-thumb" src="${escapeHtml(p.image || 'img/logo.png')}" alt="" loading="lazy" onerror="this.src='img/logo.png'">
      <div class="admin-item-info">
        <div class="admin-item-name">${escapeHtml(p.name)}</div>
        <div class="admin-item-meta">
          <span class="admin-chip">${escapeHtml(CATEGORY_LABELS[p.category] || p.category || '')}</span>
          ${p.badge ? `<span class="admin-chip">🏷 ${escapeHtml(p.badge)}</span>` : ''}
          <span>#${typeof p.order === 'number' ? p.order : index + 1}</span>
        </div>
        ${p.description ? `<div class="admin-item-desc">${escapeHtml(p.description)}</div>` : ''}
      </div>
      <div class="admin-item-actions">
        <button type="button" class="admin-btn admin-btn-ghost admin-btn-small" data-action="edit">✏️ Edit</button>
        <button type="button" class="admin-btn admin-btn-danger admin-btn-small" data-action="delete">🗑</button>
      </div>
    </div>`).join('');
}

function resetProductForm() {
  $('productForm').reset();
  $('productEditId').value = '';
  $('productFormTitle').textContent = 'Add a new product';
  $('productSaveBtn').textContent = $('productSaveBtn').dataset.label = 'Publish product';
  $('productCancelBtn').hidden = true;
  $('productImageFileName').textContent = 'or paste a link below';
  $('productImagePreview').innerHTML = '<span class="admin-preview-empty">Photo preview</span>';
  setFormMessage('productFormMessage', '');
}

function editProduct(id) {
  const p = productsCache.find((item) => item.id === id);
  if (!p) return;
  $('productEditId').value = p.id;
  $('productName').value = p.name || '';
  $('productCategory').value = p.category || 'gift-hampers';
  $('productBadge').value = p.badge || '';
  $('productOrder').value = typeof p.order === 'number' ? p.order : '';
  $('productImage').value = p.image || '';
  $('productDescription').value = p.description || '';
  $('productDmText').value = p.dmText || '';
  $('productFormTitle').textContent = 'Edit product';
  $('productSaveBtn').textContent = $('productSaveBtn').dataset.label = 'Save changes';
  $('productCancelBtn').hidden = false;
  updateImagePreview(p.image);
  document.getElementById('pane-products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setFormMessage('productFormMessage', '');
}

function updateImagePreview(url) {
  const preview = $('productImagePreview');
  if (url) {
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=\\'admin-preview-empty\\'>⚠️ Could not load this image link</span>'">`;
  } else {
    preview.innerHTML = '<span class="admin-preview-empty">Photo preview</span>';
  }
}

async function uploadProductImage(file) {
  const safeName = (file.name || 'photo.jpg').replace(/[^a-z0-9_.-]+/gi, '-').toLowerCase();
  const path = `products/${Date.now()}-${safeName}`;
  const snapshot = await uploadBytes(ref(storage, path), file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}

async function saveProduct(event) {
  event.preventDefault();
  const saveBtn = $('productSaveBtn');
  setFormMessage('productFormMessage', '');

  const name = $('productName').value.trim();
  const category = $('productCategory').value;
  let image = $('productImage').value.trim();
  const file = $('productImageFile').files[0];
  const editId = $('productEditId').value;

  if (!name) { setFormMessage('productFormMessage', 'Please give the product a name.', 'error'); return; }
  if (!image && !file) { setFormMessage('productFormMessage', 'Please add a photo — upload one or paste an image link.', 'error'); return; }

  setBusy(saveBtn, true, 'Publishing…');
  try {
    if (file) {
      try {
        image = await uploadProductImage(file);
        $('productImage').value = image;
      } catch (uploadError) {
        setFormMessage('productFormMessage',
          uploadError?.code === 'storage/unauthorized'
            ? 'Photo upload was refused. Enable Firebase Storage + its rules (ADMIN-SETUP.md step 2), or paste an ImgBB link instead.'
            : `Photo upload failed: ${uploadError?.message || 'try again'}. You can paste an ImgBB link instead.`,
          'error');
        return;
      }
    }

    const orderValue = $('productOrder').value.trim();
    const existing = editId ? productsCache.find((p) => p.id === editId) : null;
    const data = {
      name,
      category,
      badge: $('productBadge').value.trim(),
      image,
      description: $('productDescription').value.trim(),
      dmText: $('productDmText').value.trim() || `Hi! I'd like to order ${name} 🎁`,
      order: orderValue !== '' ? Math.max(0, parseInt(orderValue, 10) || 0)
        : (existing?.order ?? productsCache.length),
      updatedAt: serverTimestamp(),
    };

    if (editId) {
      await updateDoc(doc(db, 'products', editId), data);
      toast('✅ Product updated — the shop shows it now!');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'products'), data);
      toast('🎉 Product published — live on the shop!');
    }
    resetProductForm();
    await refreshProducts();
  } catch (error) {
    setFormMessage('productFormMessage', friendlyFirestoreError(error), 'error');
  } finally {
    setBusy(saveBtn, false);
  }
}

async function deleteProduct(id) {
  const p = productsCache.find((item) => item.id === id);
  if (!p) return;
  if (!window.confirm(`Delete “${p.name}” from the shop?\n\nThis cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, 'products', id));
    toast(`🗑 “${p.name}” removed from the shop.`);
    if ($('productEditId').value === id) resetProductForm();
    await refreshProducts();
  } catch (error) {
    toast('⚠️ ' + friendlyFirestoreError(error));
  }
}

async function seedProducts() {
  const btn = $('seedProductsBtn');
  const staticProducts = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  if (!staticProducts.length) { toast('No built-in products found.'); return; }
  setBusy(btn, true, 'Importing…');
  try {
    for (const [index, product] of staticProducts.entries()) {
      await addDoc(collection(db, 'products'), {
        name: product.name,
        category: product.category,
        badge: product.badge || '',
        image: product.image,
        description: product.description || '',
        dmText: product.dmText || '',
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    toast(`🌱 Imported ${staticProducts.length} products!`);
    await refreshProducts();
  } catch (error) {
    setFormMessage('productFormMessage', friendlyFirestoreError(error), 'error');
  } finally {
    setBusy(btn, false);
  }
}

function initProducts() {
  $('productForm').addEventListener('submit', saveProduct);
  $('productCancelBtn').addEventListener('click', resetProductForm);
  $('refreshProductsBtn').addEventListener('click', refreshProducts);
  $('seedProductsBtn').addEventListener('click', seedProducts);

  $('productImage').addEventListener('input', (e) => updateImagePreview(e.target.value.trim()));
  $('productImageFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    $('productImageFileName').textContent = file.name;
    const reader = new FileReader();
    reader.onload = () => { $('productImagePreview').innerHTML = `<img src="${reader.result}" alt="Preview">`; };
    reader.readAsDataURL(file);
  });

  $('productList').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.closest('.admin-item')?.dataset.id;
    if (!id) return;
    if (button.dataset.action === 'edit') editProduct(id);
    if (button.dataset.action === 'delete') deleteProduct(id);
  });
}

/* ── Reviews ────────────────────────────────────────────── */

async function refreshReviews() {
  setFormMessage('reviewFormMessage', '');
  const list = $('reviewList');
  list.innerHTML = '<div class="admin-empty">Loading…</div>';
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    reviewsCache = sortByOrder(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    renderReviewList();
  } catch (error) {
    list.innerHTML = `<div class="admin-empty">⚠️ ${escapeHtml(friendlyFirestoreError(error))}</div>`;
  }
}

function renderReviewList() {
  const list = $('reviewList');
  $('reviewCount').textContent = String(reviewsCache.length);
  $('reviewSeedBox').hidden = reviewsCache.length > 0;

  if (!reviewsCache.length) {
    list.innerHTML = '<div class="admin-empty">No reviews yet — the homepage is showing the built-in ones.<br>Add one with the form, or import the existing reviews. 👇</div>';
    return;
  }

  list.innerHTML = reviewsCache.map((r, index) => {
    const stars = Math.max(1, Math.min(5, parseInt(r.stars, 10) || 5));
    return `
      <div class="admin-item" data-id="${escapeHtml(r.id)}">
        <div class="admin-item-stars">${'★'.repeat(stars)}</div>
        <div class="admin-item-info">
          <div class="admin-item-name">${escapeHtml(r.name)}${r.location ? ` · ${escapeHtml(r.location)}` : ''}</div>
          <div class="admin-item-meta"><span>#${typeof r.order === 'number' ? r.order : index + 1}</span></div>
          ${r.text ? `<div class="admin-item-desc">“${escapeHtml(r.text)}”</div>` : ''}
        </div>
        <div class="admin-item-actions">
          <button type="button" class="admin-btn admin-btn-ghost admin-btn-small" data-action="edit">✏️ Edit</button>
          <button type="button" class="admin-btn admin-btn-danger admin-btn-small" data-action="delete">🗑</button>
        </div>
      </div>`;
  }).join('');
}

function resetReviewForm() {
  $('reviewForm').reset();
  $('reviewEditId').value = '';
  $('reviewFormTitle').textContent = 'Add a new review';
  $('reviewSaveBtn').textContent = $('reviewSaveBtn').dataset.label = 'Publish review';
  $('reviewCancelBtn').hidden = true;
  setFormMessage('reviewFormMessage', '');
}

function editReview(id) {
  const r = reviewsCache.find((item) => item.id === id);
  if (!r) return;
  $('reviewEditId').value = r.id;
  $('reviewName').value = r.name || '';
  $('reviewLocation').value = r.location || '';
  $('reviewStars').value = String(Math.max(1, Math.min(5, parseInt(r.stars, 10) || 5)));
  $('reviewOrder').value = typeof r.order === 'number' ? r.order : '';
  $('reviewText').value = r.text || '';
  $('reviewFormTitle').textContent = 'Edit review';
  $('reviewSaveBtn').textContent = $('reviewSaveBtn').dataset.label = 'Save changes';
  $('reviewCancelBtn').hidden = false;
  setFormMessage('reviewFormMessage', '');
}

async function saveReview(event) {
  event.preventDefault();
  const saveBtn = $('reviewSaveBtn');
  setFormMessage('reviewFormMessage', '');

  const name = $('reviewName').value.trim();
  const text = $('reviewText').value.trim();
  const editId = $('reviewEditId').value;

  if (!name) { setFormMessage('reviewFormMessage', 'Please add the customer’s name.', 'error'); return; }
  if (!text) { setFormMessage('reviewFormMessage', 'Please write the review text.', 'error'); return; }

  setBusy(saveBtn, true, 'Publishing…');
  try {
    const orderValue = $('reviewOrder').value.trim();
    const existing = editId ? reviewsCache.find((r) => r.id === editId) : null;
    const data = {
      name,
      location: $('reviewLocation').value.trim(),
      stars: Math.max(1, Math.min(5, parseInt($('reviewStars').value, 10) || 5)),
      text,
      order: orderValue !== '' ? Math.max(0, parseInt(orderValue, 10) || 0)
        : (existing?.order ?? reviewsCache.length),
      updatedAt: serverTimestamp(),
    };

    if (editId) {
      await updateDoc(doc(db, 'reviews', editId), data);
      toast('✅ Review updated — live on the homepage!');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'reviews'), data);
      toast('💬 Review published — live on the homepage!');
    }
    resetReviewForm();
    await refreshReviews();
  } catch (error) {
    setFormMessage('reviewFormMessage', friendlyFirestoreError(error), 'error');
  } finally {
    setBusy(saveBtn, false);
  }
}

async function deleteReview(id) {
  const r = reviewsCache.find((item) => item.id === id);
  if (!r) return;
  if (!window.confirm(`Delete the review from “${r.name}”?\n\nThis cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, 'reviews', id));
    toast('🗑 Review removed.');
    if ($('reviewEditId').value === id) resetReviewForm();
    await refreshReviews();
  } catch (error) {
    toast('⚠️ ' + friendlyFirestoreError(error));
  }
}

async function seedReviews() {
  const btn = $('seedReviewsBtn');
  setBusy(btn, true, 'Importing…');
  try {
    for (const [index, review] of SEED_REVIEWS.entries()) {
      await addDoc(collection(db, 'reviews'), {
        ...review,
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    toast(`🌱 Imported ${SEED_REVIEWS.length} reviews!`);
    await refreshReviews();
  } catch (error) {
    setFormMessage('reviewFormMessage', friendlyFirestoreError(error), 'error');
  } finally {
    setBusy(btn, false);
  }
}

function initReviews() {
  $('reviewForm').addEventListener('submit', saveReview);
  $('reviewCancelBtn').addEventListener('click', resetReviewForm);
  $('refreshReviewsBtn').addEventListener('click', refreshReviews);
  $('seedReviewsBtn').addEventListener('click', seedReviews);

  $('reviewList').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.closest('.admin-item')?.dataset.id;
    if (!id) return;
    if (button.dataset.action === 'edit') editReview(id);
    if (button.dataset.action === 'delete') deleteReview(id);
  });
}

/* ── Boot ───────────────────────────────────────────────── */

initTabs();
initProducts();
initReviews();
initAuth();
