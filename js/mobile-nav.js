/* ═══════════════════════════════════════════════════════════════
   জলকণা — Mobile Navigation Drawer (Optimized)
   Delivers a sleek, professional, high-end mobile menu experience.
   Groups: Account → Quick actions → Browse → Your Account → Say hello.
   Works with js/auth.js (shares [data-auth-*] hooks) and js/shop.js.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE = { wishlist: 'jolKonaWishlist', cart: 'jolKonaCart' };
  var INSTAGRAM = 'https://www.instagram.com/jol_kona_/';
  var EMAIL = 'mailto:jolkona2007@gmail.com';

  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var onHome = page === '' || page === 'index.html';
  var lastFocused = null;

  /* Home-page sections need in-page anchors; every other page links back. */
  function homeLink(hash) {
    return onHome ? hash : 'index.html' + hash;
  }

  var icons = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    collections: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    custom: '<path d="M12 3l2.09 4.53L19 8.27l-3.5 3.6.83 5.13L12 14.77 7.67 17l.83-5.13L5 8.27l4.91-.74z"/>',
    story: '<path d="M4 19.5V6a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 1.5z"/><line x1="8" y1="8" x2="15" y2="8"/><line x1="8" y1="12" x2="15" y2="12"/>',
    occasions: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M12 8S9.5 3 7.5 4.5 9 8 12 8z"/><path d="M12 8s2.5-5 4.5-3.5S15 8 12 8z"/>',
    wishlist: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    orders: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    add: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    shield: '<path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/><polyline points="9 12 11 14 15 10"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevron: '<polyline points="9 18 15 12 9 6"/>'
  };

  function svg(name, size) {
    var s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || '') + '</svg>';
  }

  function row(opts) {
    var tag = opts.href ? 'a' : 'button';
    var attrs = opts.href ? ' href="' + opts.href + '"' : ' type="button"';
    if (opts.attrs) attrs += ' ' + opts.attrs;
    var cls = 'mnav-item' + (opts.className ? ' ' + opts.className : '');
    if (opts.current) cls += ' is-current';
    return '<' + tag + ' class="' + cls + '"' + attrs + '>' +
      '<span class="mnav-item-icon">' + svg(opts.icon, 18) + '</span>' +
      '<span class="mnav-item-label">' + opts.label + '</span>' +
      (opts.current ? '<span class="mnav-item-dot" aria-hidden="true"></span>' : '') +
      (opts.showChevron ? '<span class="mnav-item-chevron">' + svg('chevron', 14) + '</span>' : '') +
      '</' + tag + '>';
  }

  function browseRows() {
    var items = [
      { icon: 'home', label: 'Home', href: onHome ? '#home' : 'index.html', current: onHome },
      { icon: 'shop', label: 'Shop All', href: homeLink('#shop') },
      { icon: 'collections', label: 'Collections', href: homeLink('#collections') },
      { icon: 'occasions', label: 'Occasions', href: homeLink('#occasions') },
      { icon: 'custom', label: 'Custom Order', href: 'custom-order.html', current: page === 'custom-order.html' },
      { icon: 'story', label: 'Our Story', href: page === 'about.html' ? '#top' : 'about.html', current: page === 'about.html' }
    ];
    return items.map(row).join('');
  }

  function markup() {
    return '' +
      '<div class="mnav-backdrop" id="mnavBackdrop" hidden></div>' +
      '<aside class="mnav" id="mnavDrawer" role="dialog" aria-modal="true" aria-label="Navigation Menu" aria-hidden="true">' +
        '<div class="mnav-top">' +
          '<div class="mnav-brand">' +
            '<img src="img/logo.png" alt="জলকণা — Jol Kona">' +
            '<span class="mnav-tagline">Handmade Artistry</span>' +
          '</div>' +
          '<button class="mnav-close" type="button" id="mnavClose" aria-label="Close menu">' + svg('close', 18) + '</button>' +
        '</div>' +

        '<div class="mnav-scroll">' +

          '<!-- Account Header -->' +
          '<section class="mnav-section mnav-account">' +
            '<button class="mnav-signin" type="button" data-auth-open data-auth-guest>' +
              '<span class="mnav-avatar-circle">' + svg('user', 20) + '</span>' +
              '<span class="mnav-identity-text">' +
                '<span class="mnav-identity-title">Sign in or Register</span>' +
                '<span class="mnav-identity-sub">Save favourites &amp; track orders</span>' +
              '</span>' +
              '<span class="mnav-signin-arrow">' + svg('chevron', 14) + '</span>' +
            '</button>' +
            '<div class="mnav-identity" data-auth-user hidden>' +
              '<span class="mnav-avatar" data-auth-avatar aria-hidden="true"></span>' +
              '<span class="mnav-identity-text">' +
                '<span class="mnav-identity-title" data-auth-name>Your account</span>' +
                '<span class="mnav-identity-sub" data-auth-email></span>' +
              '</span>' +
              '<span class="mnav-user-badge">Member</span>' +
            '</div>' +
          '</section>' +

          '<!-- Quick Actions Row -->' +
          '<section class="mnav-section">' +
            '<div class="mnav-quick">' +
              '<button class="mnav-quick-btn" type="button" data-mnav-search aria-label="Search catalog">' +
                svg('search', 17) + '<span>Search</span>' +
              '</button>' +
              '<a class="mnav-quick-btn" href="wishlist-cart.html#wishlist" aria-label="Wishlist">' +
                svg('wishlist', 17) + '<span>Wishlist</span>' +
                '<span class="mnav-quick-badge" data-mnav-count="wishlist" hidden>0</span>' +
              '</a>' +
              '<a class="mnav-quick-btn" href="wishlist-cart.html#cart" aria-label="Shopping Cart">' +
                svg('shop', 17) + '<span>Cart</span>' +
                '<span class="mnav-quick-badge" data-mnav-count="cart" hidden>0</span>' +
              '</a>' +
            '</div>' +
          '</section>' +

          '<!-- Main Navigation -->' +
          '<section class="mnav-section">' +
            '<p class="mnav-label">Main Menu</p>' +
            '<nav class="mnav-list" aria-label="Site sections">' + browseRows() + '</nav>' +
          '</section>' +

          '<!-- Signed In Account Links -->' +
          '<section class="mnav-section" data-auth-user hidden>' +
            '<p class="mnav-label">My Account</p>' +
            '<div class="mnav-list">' +
              row({ icon: 'user', label: 'My Account', href: 'account.html', current: page === 'account.html' }) +
              row({ icon: 'orders', label: 'My Orders', href: 'account.html#orders' }) +
              row({ icon: 'shield', label: 'Admin Panel', href: 'admin.html', attrs: 'data-auth-admin-row hidden', current: page === 'admin.html' }) +
            '</div>' +
            '<div class="mnav-auth-subactions">' +
              '<button class="mnav-subaction-btn" type="button" data-mnav-auth-action="switch-account">' +
                svg('swap', 15) + '<span>Switch Account</span>' +
              '</button>' +
              '<button class="mnav-subaction-btn mnav-subaction-btn--danger" type="button" data-mnav-auth-action="logout">' +
                svg('logout', 15) + '<span>Log Out</span>' +
              '</button>' +
            '</div>' +
          '</section>' +

          '<!-- Say Hello -->' +
          '<section class="mnav-section">' +
            '<p class="mnav-label">Connect</p>' +
            '<div class="mnav-contact">' +
              '<a class="mnav-chip" href="' + INSTAGRAM + '" target="_blank" rel="noopener">' + svg('instagram', 15) + '<span>Instagram</span></a>' +
              '<a class="mnav-chip" href="' + EMAIL + '">' + svg('mail', 15) + '<span>Email us</span></a>' +
            '</div>' +
          '</section>' +

        '</div>' +

        '<div class="mnav-foot">' +
          '<span>জলকণা</span> · Handcrafted Bengal Artistry' +
        '</div>' +
      '</aside>';
  }

  /* ─── Counts ─── */
  function readCount(key) {
    try {
      var raw = window.localStorage.getItem(STORAGE[key]);
      if (!raw) return 0;
      var parsed = JSON.parse(raw);
      if (key === 'wishlist') return Array.isArray(parsed) ? parsed.length : 0;
      return Object.keys(parsed || {}).reduce(function (total, id) {
        return total + (Number(parsed[id] && parsed[id].quantity) || 0);
      }, 0);
    } catch (error) {
      return 0;
    }
  }

  function refreshCounts() {
    var wishlist = readCount('wishlist');
    var cart = readCount('cart');
    setBadge(document.querySelector('[data-mnav-count="wishlist"]'), wishlist);
    setBadge(document.querySelector('[data-mnav-count="cart"]'), cart);
    setBadge(document.querySelector('.mnav-toggle-dot'), wishlist + cart);
  }

  function setBadge(el, value) {
    if (!el) return;
    el.textContent = value > 99 ? '99+' : String(value);
    el.hidden = value === 0;
  }

  /* ─── Open / close ─── */
  function toggles() {
    return Array.prototype.slice.call(document.querySelectorAll('.nav-mobile-toggle'));
  }

  function isOpen() {
    var drawer = document.getElementById('mnavDrawer');
    return !!drawer && drawer.classList.contains('is-open');
  }

  function open() {
    var drawer = document.getElementById('mnavDrawer');
    var backdrop = document.getElementById('mnavBackdrop');
    if (!drawer || isOpen()) return;
    lastFocused = document.activeElement;
    refreshCounts();
    backdrop.hidden = false;
    void backdrop.offsetWidth; // Force frame calculation
    backdrop.classList.add('is-open');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mnav-open');
    toggles().forEach(function (t) { t.classList.add('active'); t.setAttribute('aria-expanded', 'true'); });
    document.addEventListener('keydown', onKeydown);
    window.setTimeout(function () {
      var closeBtn = document.getElementById('mnavClose');
      if (closeBtn) closeBtn.focus();
    }, 180);
  }

  function close() {
    var drawer = document.getElementById('mnavDrawer');
    var backdrop = document.getElementById('mnavBackdrop');
    if (!drawer || !isOpen()) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('mnav-open');
    toggles().forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-expanded', 'false'); });
    document.removeEventListener('keydown', onKeydown);
    window.setTimeout(function () { if (!isOpen()) backdrop.hidden = true; }, 360);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  function onKeydown(event) {
    if (event.key === 'Escape') { close(); return; }
    if (event.key !== 'Tab') return;
    var drawer = document.getElementById('mnavDrawer');
    var focusables = drawer.querySelectorAll('a[href], button:not([disabled])');
    var visible = Array.prototype.filter.call(focusables, function (el) { return el.offsetParent !== null; });
    if (!visible.length) return;
    var first = visible[0];
    var last = visible[visible.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  /* ─── Wiring ─── */
  function enhanceToggles() {
    toggles().forEach(function (toggle) {
      if (toggle.dataset.mnavBound === 'true') return;
      toggle.dataset.mnavBound = 'true';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'mnavDrawer');
      toggle.setAttribute('aria-label', 'Open menu');
      if (!toggle.querySelector('.mnav-toggle-dot')) {
        toggle.insertAdjacentHTML('beforeend', '<span class="mnav-toggle-dot" aria-hidden="true" hidden>0</span>');
      }
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (isOpen()) close(); else open();
      });
      toggle.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle.click(); }
      });
    });
  }

  function focusSearch() {
    var input = document.querySelector('.filter-search input, .search-bar input, #searchInput');
    if (input) {
      close();
      window.setTimeout(function () {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }, 320);
      return;
    }
    window.location.href = onHome ? '#shop' : 'index.html#shop';
    close();
  }

  function build() {
    if (document.getElementById('mnavDrawer')) return;
    document.body.insertAdjacentHTML('beforeend', markup());
    enhanceToggles();
    refreshCounts();

    document.getElementById('mnavBackdrop').addEventListener('click', close);
    document.getElementById('mnavClose').addEventListener('click', close);

    var drawer = document.getElementById('mnavDrawer');
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('[data-mnav-search]')) { focusSearch(); return; }

      var action = event.target.closest('[data-mnav-auth-action]');
      if (action) {
        var proxy = document.querySelector('#accountMenu [data-auth-action="' + action.dataset.mnavAuthAction + '"]');
        close();
        if (proxy) window.setTimeout(function () { proxy.click(); }, 120);
        else if (window.JolKonaAuth && action.dataset.mnavAuthAction === 'logout') {
          if (typeof window.JolKonaAuth.logout === 'function') window.JolKonaAuth.logout();
        }
        return;
      }

      if (event.target.closest('[data-auth-open]')) {
        close();
        window.setTimeout(function () {
          var modal = document.getElementById('authModal');
          if (modal && !modal.classList.contains('is-open') && window.JolKonaAuth) window.JolKonaAuth.openModal();
        }, 200);
        return;
      }

      var link = event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (link.target === '_blank') { close(); return; }
      if (href && href.charAt(0) === '#') {
        event.preventDefault();
        close();
        var target = href === '#top' ? document.body : document.querySelector(href);
        window.setTimeout(function () {
          if (!target) return;
          var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        }, 260);
        return;
      }
      close();
    });

    window.addEventListener('storage', refreshCounts);
    ['wishlistCount', 'cartCount'].forEach(function (id) {
      var badge = document.getElementById(id);
      if (!badge || typeof MutationObserver === 'undefined') return;
      new MutationObserver(refreshCounts).observe(badge, { childList: true, characterData: true, subtree: true });
    });
    document.addEventListener('click', function (event) {
      if (event.target.closest('.wishlist-btn, .cart-btn, [data-action]')) window.setTimeout(refreshCounts, 60);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && isOpen()) close();
    });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);

  window.JolKonaMobileNav = { open: open, close: close, refresh: refreshCounts };
})();
