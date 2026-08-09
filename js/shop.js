/* ═══════════════════════════════════════════════════════════════
   জলকণা — Wishlist & Cart Experience
   Static-site friendly: saves items in localStorage and sends orders via Instagram DM.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    wishlist: 'jolKonaWishlist',
    cart: 'jolKonaCart'
  };

  const INSTAGRAM_DM_URL = 'https://www.instagram.com/direct/new/?recipient=jol_kona_&text=';
  const state = {
    currentFilter: 'all',
    searchQuery: ''
  };

  const categoryLabels = {
    'gift-hampers': 'Gift Hamper Bouquet',
    'custom-chocolates': 'Custom Chocolate',
    'clay-jewellery': 'Clay Jewellery',
    'pipe-cleaner': 'Pipe Cleaner',
    'keychains': 'Keychain'
  };

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  function products() {
    return Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'product';
  }

  function getProductId(productOrId) {
    if (typeof productOrId === 'string') return productOrId;
    return productOrId?.id || slugify(productOrId?.name);
  }

  function getCategoryLabel(category) {
    return categoryLabels[category] || category || 'Handmade';
  }

  function readStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (error) {
      console.warn('Unable to read shop storage:', error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Unable to save shop storage:', error);
    }
  }

  function productSnapshot(product) {
    if (!product) return null;
    const images = Array.isArray(product.images) && product.images.length
      ? product.images.filter(Boolean)
      : [];
    return {
      id: getProductId(product),
      name: product.name || 'Handmade Creation',
      category: product.category || 'handmade',
      image: product.image || images[0] || 'img/logo.png',
      images,
      badge: product.badge || '',
      description: product.description || '',
      dmText: product.dmText || `Hi! I am interested in ${product.name || 'this handmade product'}`
    };
  }

  function getWishlistSnapshots() {
    const stored = readStorage(STORAGE_KEYS.wishlist, []);
    const snapshots = {};
    if (!Array.isArray(stored)) return snapshots;

    stored.forEach((item) => {
      if (!item || typeof item === 'string') return;
      const product = productSnapshot(item.product || item);
      if (!product) return;
      const itemId = item.id || product.id;
      product.id = itemId;
      snapshots[itemId] = product;
    });

    return snapshots;
  }

  function getWishlist() {
    const stored = readStorage(STORAGE_KEYS.wishlist, []);
    if (!Array.isArray(stored)) return [];

    return [...new Set(stored
      .map((item) => typeof item === 'string' ? item : item?.id || item?.product?.id)
      .filter(Boolean))];
  }

  function setWishlist(ids) {
    const snapshots = getWishlistSnapshots();
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const payload = uniqueIds.map((id) => snapshots[id] ? { id, product: snapshots[id] } : id);
    writeStorage(STORAGE_KEYS.wishlist, payload);
  }

  function normalizeCartItem(item, id) {
    if (!item) return null;
    const quantity = Math.max(1, parseInt(item.quantity || item.qty || 1, 10));
    const product = productSnapshot(item.product || item);
    if (!product) return null;

    const normalizedId = id || item.id || product.id;
    product.id = normalizedId;
    return { id: normalizedId, quantity, product };
  }

  function getCart() {
    const stored = readStorage(STORAGE_KEYS.cart, {});
    const cart = {};

    if (Array.isArray(stored)) {
      stored.forEach((item) => {
        const normalized = normalizeCartItem(item);
        if (normalized) cart[normalized.id] = normalized;
      });
      return cart;
    }

    if (stored && typeof stored === 'object') {
      Object.entries(stored).forEach(([id, item]) => {
        const normalized = normalizeCartItem(item, id);
        if (normalized) cart[normalized.id] = normalized;
      });
    }

    return cart;
  }

  function setCart(cart) {
    const cleanCart = {};
    Object.entries(cart || {}).forEach(([id, item]) => {
      const normalized = normalizeCartItem(item, id);
      if (normalized && normalized.quantity > 0) cleanCart[normalized.id] = normalized;
    });
    writeStorage(STORAGE_KEYS.cart, cleanCart);
  }

  function findProduct(productId) {
    const currentProduct = products().find((product) => getProductId(product) === productId);
    if (currentProduct) return productSnapshot(currentProduct);

    const cartProduct = getCart()[productId]?.product;
    if (cartProduct) return productSnapshot(cartProduct);

    const wishlistProduct = getWishlistSnapshots()[productId];
    if (wishlistProduct) return productSnapshot(wishlistProduct);

    return null;
  }

  function dmUrl(product, quantity = 1) {
    const message = quantity > 1
      ? `${product.dmText || `Hi! I am interested in ${product.name}`}\nQuantity: ${quantity}`
      : product.dmText || `Hi! I am interested in ${product.name}`;
    return `${INSTAGRAM_DM_URL}${encodeURIComponent(message)}`;
  }

  function scrollToElement(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function scrollToHashWhenReady(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    let attempts = 0;
    const attemptScroll = () => {
      attempts += 1;
      // main.js locks body scrolling until the loader hides; wait for it.
      if (document.body.style.overflow === 'hidden' && attempts < 40) {
        window.setTimeout(attemptScroll, 100);
        return;
      }
      scrollToElement(hash);
    };
    window.setTimeout(attemptScroll, 100);
  }

  function showToast(message) {
    let toast = document.getElementById('shopToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shopToast';
      toast.className = 'cart-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('active');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('active'), 2600);
  }

  function updateBadges() {
    const wishlistCount = getWishlist().length;
    const cartCount = Object.values(getCart()).reduce((total, item) => total + item.quantity, 0);

    const wishlistBadge = document.getElementById('wishlistCount');
    const cartBadge = document.getElementById('cartCount');

    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistCount;
      wishlistBadge.classList.toggle('is-empty', wishlistCount === 0);
      wishlistBadge.setAttribute('aria-label', `${wishlistCount} wishlist item${wishlistCount === 1 ? '' : 's'}`);
    }

    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.classList.toggle('is-empty', cartCount === 0);
      cartBadge.setAttribute('aria-label', `${cartCount} cart item${cartCount === 1 ? '' : 's'}`);
    }
  }

  function updateProductButtons() {
    const wishlist = new Set(getWishlist());
    const cart = getCart();

    document.querySelectorAll('.wishlist-btn[data-product-id]').forEach((button) => {
      const productId = button.dataset.productId;
      const isActive = wishlist.has(productId);
      button.classList.toggle('is-active', isActive);
      button.textContent = isActive ? '♥' : '♡';
      button.setAttribute('aria-pressed', String(isActive));
      button.setAttribute('aria-label', isActive ? 'Remove from wishlist' : 'Add to wishlist');
    });

    document.querySelectorAll('.cart-add-btn[data-product-id]').forEach((button) => {
      const productId = button.dataset.productId;
      const quantity = cart[productId]?.quantity || 0;
      button.classList.toggle('in-cart', quantity > 0);
      button.innerHTML = quantity > 0
        ? `<span class="cart-add-icon">✓</span> In Cart${quantity > 1 ? ` (${quantity})` : ''}`
        : '<span class="cart-add-icon">＋</span> Add to Cart';
    });
  }

  function addToCart(productId, quantity = 1) {
    const product = findProduct(productId);
    if (!product) return;

    const cart = getCart();
    const currentQuantity = cart[productId]?.quantity || 0;
    cart[productId] = {
      id: productId,
      quantity: currentQuantity + Math.max(1, quantity),
      product
    };

    setCart(cart);
    renderSavedShop();
    showToast(`${product.name} added to cart`);
  }

  function setCartQuantity(productId, quantity) {
    const cart = getCart();
    if (!cart[productId]) return;

    if (quantity <= 0) {
      const productName = cart[productId].product.name;
      delete cart[productId];
      setCart(cart);
      renderSavedShop();
      showToast(`${productName} removed from cart`);
      return;
    }

    cart[productId].quantity = quantity;
    setCart(cart);
    renderSavedShop();
  }

  function removeFromCart(productId) {
    setCartQuantity(productId, 0);
  }

  function toggleWishlist(productId) {
    const product = findProduct(productId);
    if (!product) return;

    const wishlist = getWishlist();
    const exists = wishlist.includes(productId);
    const updated = exists
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(updated);
    renderSavedShop();
    showToast(exists ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`);
  }

  function removeFromWishlist(productId) {
    const product = findProduct(productId);
    const updated = getWishlist().filter((id) => id !== productId);
    setWishlist(updated);
    renderSavedShop();
    if (product) showToast(`${product.name} removed from wishlist`);
  }

  function emptyState(type) {
    const isWishlist = type === 'wishlist';
    return `
      <div class="saved-empty-state">
        <div class="saved-empty-icon">${isWishlist ? '♡' : '🛍️'}</div>
        <h4>${isWishlist ? 'Your wishlist is waiting' : 'Your cart is empty'}</h4>
        <p>${isWishlist ? 'Tap the heart on any creation to save it here.' : 'Add handmade favourites to build your order list.'}</p>
        <button type="button" class="saved-mini-btn primary" data-action="go-shop">Browse Shop</button>
      </div>
    `;
  }

  function wishlistItemTemplate(product) {
    return `
      <article class="saved-item" data-product-id="${escapeHtml(product.id)}">
        <img class="saved-item-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
        <div class="saved-item-info">
          <span class="saved-item-category">${escapeHtml(getCategoryLabel(product.category))}</span>
          <h4>${escapeHtml(product.name)}</h4>
          <p>${escapeHtml(product.description)}</p>
          <div class="saved-item-actions">
            <button type="button" class="saved-mini-btn primary" data-action="wishlist-add-cart" data-product-id="${escapeHtml(product.id)}">Add to Cart</button>
            <a class="saved-mini-btn" href="${dmUrl(product)}" target="_blank" rel="noopener">DM Order</a>
            <button type="button" class="saved-mini-btn danger" data-action="wishlist-remove" data-product-id="${escapeHtml(product.id)}">Remove</button>
          </div>
        </div>
      </article>
    `;
  }

  function cartItemTemplate(item) {
    const { product, quantity } = item;
    return `
      <article class="saved-item cart-item" data-product-id="${escapeHtml(product.id)}">
        <img class="saved-item-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
        <div class="saved-item-info">
          <span class="saved-item-category">${escapeHtml(getCategoryLabel(product.category))}</span>
          <h4>${escapeHtml(product.name)}</h4>
          <p>${escapeHtml(product.description)}</p>
          <div class="cart-line-actions">
            <div class="cart-quantity" aria-label="Quantity for ${escapeHtml(product.name)}">
              <button type="button" class="saved-qty-btn" data-action="cart-decrement" data-product-id="${escapeHtml(product.id)}" aria-label="Decrease quantity">−</button>
              <span>${quantity}</span>
              <button type="button" class="saved-qty-btn" data-action="cart-increment" data-product-id="${escapeHtml(product.id)}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="saved-mini-btn danger" data-action="cart-remove" data-product-id="${escapeHtml(product.id)}">Remove</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderWishlist() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;

    const wishlistProducts = getWishlist()
      .map(findProduct)
      .filter(Boolean);

    container.innerHTML = wishlistProducts.length
      ? wishlistProducts.map(wishlistItemTemplate).join('')
      : emptyState('wishlist');
  }

  function renderCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    if (!container || !summary) return;

    const cartItems = Object.values(getCart());
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    container.innerHTML = cartItems.length
      ? cartItems.map(cartItemTemplate).join('')
      : emptyState('cart');

    summary.innerHTML = cartItems.length
      ? `
        <div class="cart-summary-row">
          <span>Total handmade items</span>
          <strong>${totalItems}</strong>
        </div>
        <p class="cart-note">Final price, customization, and delivery timeline will be confirmed by জলকণা on Instagram DM.</p>
        <button type="button" class="checkout-btn" data-action="checkout-cart">Send Order Request on Instagram</button>
      `
      : `
        <p class="cart-note">Add a creation to your cart and we’ll prepare a ready-to-send order message.</p>
      `;
  }

  function renderSavedShop() {
    renderWishlist();
    renderCart();
    updateBadges();
    updateProductButtons();
  }

  function productCardTemplate(product, index) {
    const snapshot = productSnapshot(product);
    const productId = snapshot.id;
    const wishlist = new Set(getWishlist());
    const cart = getCart();
    const inWishlist = wishlist.has(productId);
    const cartQuantity = cart[productId]?.quantity || 0;
    // Tags are rendered as tiny inline chips in the info row (never overlaid on the photo)
    const badgeSlug = snapshot.badge ? slugify(snapshot.badge) : '';
    const badgeVariant = ['bestseller', 'new', 'popular', 'handmade', 'handpainted'].includes(badgeSlug)
      ? ` badge--${badgeSlug}`
      : '';
    const badgeHtml = snapshot.badge
      ? `<span class="product-card-badge${badgeVariant}">${escapeHtml(snapshot.badge)}</span>`
      : '';

    // A product with multiple photos gets an Instagram-style swipe gallery
    const galleryImages = snapshot.images && snapshot.images.length > 1 ? snapshot.images : null;
    const wishlistActions = `
      <div class="product-card-actions">
        <button type="button" class="product-action-btn wishlist-btn ${inWishlist ? 'is-active' : ''}" data-product-id="${escapeHtml(productId)}" aria-label="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}" aria-pressed="${inWishlist}">${inWishlist ? '♥' : '♡'}</button>
      </div>`;
    const imageArea = galleryImages
      ? `
        <div class="product-card-image is-gallery">
          <div class="card-gallery" data-gallery-wrap>
            <div class="card-gallery-track" data-gallery-track role="group" aria-label="Product photos — swipe to browse">
              ${galleryImages.map((src, i) => `
                <div class="card-gallery-slide" data-gallery-slide>
                  <img src="${escapeHtml(src)}" alt="${escapeHtml(snapshot.name)} — photo ${i + 1}" loading="lazy" draggable="false">
                </div>`).join('')}
            </div>
            <div class="card-gallery-progress" data-gallery-progress aria-hidden="true">
              ${galleryImages.map(() => '<span class="card-gallery-progress-seg"></span>').join('')}
            </div>
            <button type="button" class="card-gallery-arrow prev" data-gallery-prev aria-label="Previous photo">‹</button>
            <button type="button" class="card-gallery-arrow next" data-gallery-next aria-label="Next photo">›</button>
          </div>
          ${wishlistActions}
        </div>`
      : `
        <div class="product-card-image">
          <img src="${escapeHtml(snapshot.image)}" alt="${escapeHtml(snapshot.name)}" loading="lazy">
          ${wishlistActions}
        </div>`;

    return `
      <div class="product-card reveal visible" data-category="${escapeHtml(snapshot.category)}" data-product-id="${escapeHtml(productId)}" style="transition-delay:${(index % 4) * 0.05}s">
        ${imageArea}
        <div class="product-card-info">
          <div class="product-card-meta">
            <span class="product-card-category">${escapeHtml(getCategoryLabel(snapshot.category))}</span>
            ${badgeHtml}
          </div>
          <h4 class="product-card-name">${escapeHtml(snapshot.name)}</h4>
          <p class="product-card-desc">${escapeHtml(snapshot.description)}</p>
          <div class="product-card-buttons">
            <button type="button" class="cart-add-btn ${cartQuantity ? 'in-cart' : ''}" data-product-id="${escapeHtml(productId)}">
              ${cartQuantity ? `<span class="cart-add-icon">✓</span> In Cart${cartQuantity > 1 ? ` (${cartQuantity})` : ''}` : '<span class="cart-add-icon">＋</span> Add to Cart'}
            </button>
            <a href="${dmUrl(snapshot)}" target="_blank" rel="noopener" class="dm-order-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
              DM
            </a>
            <button type="button" class="product-customize-toggle" data-action="toggle-customize">✏️ Customize</button>
          </div>
          <div class="product-customize-form">
            <textarea class="customize-textarea" placeholder="Describe how you'd like this customized..."></textarea>
            <button type="button" class="customize-send" data-action="send-customize" data-product-id="${escapeHtml(productId)}">Send via Instagram →</button>
          </div>
        </div>
      </div>
    `;
  }

  function filteredProducts() {
    const query = state.searchQuery.trim().toLowerCase();
    return products().filter((product) => {
      const matchesFilter = state.currentFilter === 'all' || product.category === state.currentFilter;
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || product.description.toLowerCase().includes(query)
        || product.category.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }

  /* ── Instagram-style swipe gallery on product cards ── */
  function initCardGalleries(container) {
    if (!container) return;
    container.querySelectorAll('.card-gallery[data-gallery-wrap]').forEach((wrap) => {
      if (wrap.dataset.galleryReady) return;
      wrap.dataset.galleryReady = '1';

      const track = wrap.querySelector('[data-gallery-track]');
      const slides = [...wrap.querySelectorAll('[data-gallery-slide]')];
      const progressSegs = [...wrap.querySelectorAll('.card-gallery-progress-seg')];
      const prevBtn = wrap.querySelector('[data-gallery-prev]');
      const nextBtn = wrap.querySelector('[data-gallery-next]');
      const count = slides.length;
      if (!track || count < 2) return;

      let index = 0;
      let isDown = false;
      let startX = 0;
      let startScroll = 0;
      let moved = false;

      const sync = () => {
        const width = track.clientWidth || 1;
        index = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / width)));
        progressSegs.forEach((seg, i) => seg.classList.toggle('active', i === index));
        if (prevBtn) prevBtn.classList.toggle('disabled', index === 0);
        if (nextBtn) nextBtn.classList.toggle('disabled', index === count - 1);
      };

      const goTo = (targetIndex) => {
        const width = track.clientWidth || 1;
        track.scrollTo({ left: targetIndex * width, behavior: 'smooth' });
      };

      track.addEventListener('scroll', sync, { passive: true });
      track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { goTo(index + 1); event.preventDefault(); }
        if (event.key === 'ArrowLeft') { goTo(index - 1); event.preventDefault(); }
      });
      track.setAttribute('tabindex', '0');

      prevBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        goTo(index - 1);
      });
      nextBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        goTo(index + 1);
      });

      // Mouse drag-to-swipe (touch uses native scroll + snap — no double handling)
      const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('is-dragging');
        goTo(Math.round(track.scrollLeft / (track.clientWidth || 1)));
      };
      track.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse') return;
        isDown = true;
        moved = false;
        startX = event.clientX;
        startScroll = track.scrollLeft;
        track.classList.add('is-dragging');
        try { track.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
      });
      track.addEventListener('pointermove', (event) => {
        if (!isDown) return;
        const deltaX = event.clientX - startX;
        if (Math.abs(deltaX) > 4) moved = true;
        track.scrollLeft = startScroll - deltaX;
      });
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('pointerleave', endDrag);

      // Don't trigger card handlers (wishlist/customize) after a drag gesture
      track.addEventListener('click', (event) => {
        if (moved) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, true);

      sync();
    });
  }

  function renderProductGrid(items) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = `
        <div class="shop-empty-state">
          <div class="saved-empty-icon">🔎</div>
          <h4>No creations found</h4>
          <p>Try another search or browse all handmade categories.</p>
          <button type="button" class="saved-mini-btn primary" data-action="reset-shop-search">Show All Products</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(productCardTemplate).join('');
    updateProductButtons();
    initCardGalleries(grid);
  }

  function setActiveFilter(filter) {
    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === filter);
    });
  }

  function applyShopFilters() {
    setActiveFilter(state.currentFilter);
    renderProductGrid(filteredProducts());
  }

  function renderProducts(filter = 'all') {
    state.currentFilter = filter;
    applyShopFilters();
  }

  function clearSearch() {
    state.searchQuery = '';
    const input = document.querySelector('.filter-search input');
    if (input) input.value = '';
  }

  function sendCustomize(button) {
    const productId = button.dataset.productId;
    const product = findProduct(productId);
    const card = button.closest('.product-card');
    const textarea = card?.querySelector('.customize-textarea');
    const description = textarea?.value.trim() || '';

    if (!product || !textarea) return;

    if (!description) {
      textarea.style.borderColor = '#e74c3c';
      textarea.setAttribute('placeholder', '⚠️ Please describe your customization first...');
      window.setTimeout(() => {
        textarea.style.borderColor = '';
        textarea.setAttribute('placeholder', 'Describe how you\'d like this customized...');
      }, 2000);
      return;
    }

    const message = `Hi! I'd like to customize the "${product.name}"\n\nMy request: ${description}`;
    window.open(`${INSTAGRAM_DM_URL}${encodeURIComponent(message)}`, '_blank', 'noopener');

    button.textContent = '✓ Opening Instagram...';
    button.style.background = '#4CAF50';
    window.setTimeout(() => {
      button.textContent = 'Send via Instagram →';
      button.style.background = '';
      textarea.value = '';
      card.classList.remove('customize-open');
    }, 1800);
  }

  function checkoutCart() {
    const cartItems = Object.values(getCart());
    if (!cartItems.length) {
      showToast('Your cart is empty');
      return;
    }

    const lines = cartItems.map((item, index) => `${index + 1}. ${item.product.name} × ${item.quantity}`);
    const message = `Hi Jol Kona! I'd like to order these handmade creations:\n\n${lines.join('\n')}\n\nPlease share the price, customization options, and delivery details.`;
    window.open(`${INSTAGRAM_DM_URL}${encodeURIComponent(message)}`, '_blank', 'noopener');
  }

  function handleProductGridClick(event) {
    const wishlistButton = event.target.closest('.wishlist-btn[data-product-id]');
    if (wishlistButton) {
      event.preventDefault();
      event.stopPropagation();
      toggleWishlist(wishlistButton.dataset.productId);
      return;
    }

    const cartButton = event.target.closest('.cart-add-btn[data-product-id]');
    if (cartButton) {
      event.preventDefault();
      event.stopPropagation();
      addToCart(cartButton.dataset.productId);
      return;
    }

    const customizeToggle = event.target.closest('.product-customize-toggle[data-action="toggle-customize"]');
    if (customizeToggle) {
      event.preventDefault();
      event.stopPropagation();
      customizeToggle.closest('.product-card')?.classList.toggle('customize-open');
      return;
    }

    const customizeSend = event.target.closest('.customize-send[data-action="send-customize"]');
    if (customizeSend) {
      event.preventDefault();
      event.stopPropagation();
      sendCustomize(customizeSend);
    }
  }

  function handleSavedShopClick(event) {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;
    const productId = actionElement.dataset.productId;

    if (action === 'go-shop') {
      // The shop grid lives on the homepage; navigate there if it isn't
      // part of the current page (e.g. on wishlist-cart.html).
      if (document.getElementById('shop')) {
        scrollToElement('#shop');
      } else {
        window.location.href = 'index.html#shop';
      }
      return;
    }

    if (action === 'clear-wishlist') {
      setWishlist([]);
      renderSavedShop();
      showToast('Wishlist cleared');
      return;
    }

    if (action === 'clear-cart') {
      setCart({});
      renderSavedShop();
      showToast('Cart cleared');
      return;
    }

    if (action === 'wishlist-add-cart' && productId) {
      addToCart(productId);
      return;
    }

    if (action === 'wishlist-remove' && productId) {
      removeFromWishlist(productId);
      return;
    }

    if (action === 'cart-increment' && productId) {
      const item = getCart()[productId];
      if (item) setCartQuantity(productId, item.quantity + 1);
      return;
    }

    if (action === 'cart-decrement' && productId) {
      const item = getCart()[productId];
      if (item) setCartQuantity(productId, item.quantity - 1);
      return;
    }

    if (action === 'cart-remove' && productId) {
      removeFromCart(productId);
      return;
    }

    if (action === 'checkout-cart') {
      checkoutCart();
    }
  }

  function initShop() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid?.addEventListener('click', handleProductGridClick);

    document.getElementById('wishlist')?.addEventListener('click', handleSavedShopClick);

    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.addEventListener('click', () => {
        state.currentFilter = button.dataset.filter || 'all';
        applyShopFilters();
      });
    });

    document.querySelector('.filter-search input')?.addEventListener('input', (event) => {
      state.searchQuery = event.target.value.toLowerCase();
      applyShopFilters();
    });

    productsGrid?.addEventListener('click', (event) => {
      if (event.target.closest('[data-action="reset-shop-search"]')) {
        clearSearch();
        state.currentFilter = 'all';
        applyShopFilters();
      }
    });

    // The navbar wishlist/cart icons link to wishlist-cart.html#wishlist and
    // wishlist-cart.html#cart. When the matching section already exists on the
    // current page (i.e. we're on wishlist-cart.html), smooth-scroll to it
    // instead of navigating away.
    document.getElementById('wishlistNavBtn')?.addEventListener('click', (event) => {
      if (document.getElementById('wishlist')) {
        event.preventDefault();
        scrollToElement('#wishlist');
      }
    });
    document.getElementById('cartNavBtn')?.addEventListener('click', (event) => {
      if (document.getElementById('cart')) {
        event.preventDefault();
        scrollToElement('#cart');
      }
    });

    renderProducts('all');
    renderSavedShop();

    // If this page was opened via a #wishlist or #cart hash (e.g. from the
    // navbar icons), scroll to it after the dynamic lists have rendered so
    // the anchor lands at the right spot despite the layout shift.
    if (window.location.hash === '#wishlist' || window.location.hash === '#cart') {
      scrollToHashWhenReady(window.location.hash);
    }
  }

  window.JolKonaShop = {
    addToCart,
    removeFromCart,
    setCartQuantity,
    toggleWishlist,
    removeFromWishlist,
    renderSavedShop,
    checkoutCart,
    getCart,
    getWishlist,
    productId: getProductId
  };

  window.renderProducts = renderProducts;
  window.getCategoryLabel = getCategoryLabel;
  window.filterProducts = function filterProducts(category) {
    state.currentFilter = category || 'all';
    clearSearch();
    applyShopFilters();
    scrollToElement('#shop');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShop, { once: true });
  } else {
    initShop();
  }
})();
