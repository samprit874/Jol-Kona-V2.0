/* ─────────────────────────────────────────────
   Jol Kona — PWA helper
   Registers the service worker, captures the install
   prompt and surfaces an "Install App" button/banner
   so visitors can download the app to their device.
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  var SW_PATH = 'sw.js';
  var DISMISS_KEY = 'jolkona-install-dismissed';
  var deferredPrompt = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  /* ── 1. Register service worker ── */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(SW_PATH)
        .then(function (reg) {
          if (window.console && console.log) {
            console.log('[Jol Kona] Service worker registered', reg.scope);
          }
        })
        .catch(function (err) {
          if (window.console && console.warn) {
            console.warn('[Jol Kona] Service worker registration failed:', err);
          }
        });
    });
  }

  /* ── 2. Install banner UI (injected so it works on every page) ── */
  function injectStyles() {
    if (document.getElementById('jolkona-pwa-styles')) return;
    var style = document.createElement('style');
    style.id = 'jolkona-pwa-styles';
    style.textContent =
      '#jolkonaInstallBar{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;' +
      'display:flex;align-items:center;gap:12px;max-width:420px;margin:0 auto;' +
      'padding:12px 14px;border-radius:16px;background:#fffdf9;color:#2d2016;' +
      'box-shadow:0 12px 32px rgba(45,32,22,.22);border:1px solid #f0e2d0;' +
      'font-family:"Hind Siliguri",Inter,system-ui,sans-serif;' +
      'transform:translateY(140%);opacity:0;transition:transform .35s ease,opacity .35s ease;}' +
      '#jolkonaInstallBar.show{transform:translateY(0);opacity:1}' +
      '#jolkonaInstallBar img{width:44px;height:44px;border-radius:12px;flex:0 0 auto}' +
      '#jolkonaInstallBar .jk-body{flex:1;min-width:0}' +
      '#jolkonaInstallBar .jk-title{font-size:14px;font-weight:700;line-height:1.2}' +
      '#jolkonaInstallBar .jk-sub{font-size:12px;color:#7a6a58;margin-top:2px;line-height:1.3}' +
      '#jolkonaInstallBar button{font-family:inherit;border:none;cursor:pointer;font-size:13px;font-weight:700;border-radius:10px;padding:8px 14px}' +
      '#jolkonaInstallBar .jk-install{background:#c2623a;color:#fff;white-space:nowrap}' +
      '#jolkonaInstallBar .jk-install:hover{background:#a9502e}' +
      '#jolkonaInstallBar .jk-close{background:transparent;color:#8a7a68;padding:8px 6px}' +
      '@media (min-width:480px){#jolkonaInstallBar{left:auto;right:24px;bottom:24px}}' +
      '@media (prefers-color-scheme:dark){#jolkonaInstallBar{background:#2b2119;color:#f6eee4;border-color:#453528;box-shadow:0 12px 32px rgba(0,0,0,.5)}' +
      '#jolkonaInstallBar .jk-sub{color:#b3a48f}#jolkonaInstallBar .jk-close{color:#b3a48f}}';
    document.head.appendChild(style);
  }

  function buildBar() {
    if (document.getElementById('jolkonaInstallBar')) return document.getElementById('jolkonaInstallBar');
    var bar = document.createElement('div');
    bar.id = 'jolkonaInstallBar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Install the Jol Kona app');

    var img = document.createElement('img');
    img.src = 'img/icons/icon-192.png';
    img.alt = 'Jol Kona';
    img.width = 44;
    img.height = 44;

    var body = document.createElement('div');
    body.className = 'jk-body';
    var title = document.createElement('div');
    title.className = 'jk-title';
    title.textContent = 'Install the Jol Kona app';
    var sub = document.createElement('div');
    sub.className = 'jk-sub';
    sub.textContent = isIOS
      ? 'Tap Share, then "Add to Home Screen" to download.'
      : 'Get the app on your device for quick access.';

    body.appendChild(title);
    body.appendChild(sub);

    var installBtn = document.createElement('button');
    installBtn.className = 'jk-install';
    installBtn.type = 'button';
    installBtn.textContent = isIOS ? 'How to install' : 'Install';
    installBtn.addEventListener('click', function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          hideBar();
        }).catch(function () { /* user dismissed */ });
      } else if (isIOS) {
        showIOSInstructions();
      } else {
        showIOSInstructions();
      }
    });

    var closeBtn = document.createElement('button');
    closeBtn.className = 'jk-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () {
      hideBar();
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    });

    bar.appendChild(img);
    bar.appendChild(body);
    bar.appendChild(installBtn);
    bar.appendChild(closeBtn);
    document.body.appendChild(bar);
    return bar;
  }

  function showBar() {
    if (isStandalone()) return;
    injectStyles();
    var bar = buildBar();
    requestAnimationFrame(function () {
      bar.classList.add('show');
    });
  }

  function hideBar() {
    var bar = document.getElementById('jolkonaInstallBar');
    if (bar) bar.classList.remove('show');
  }

  function showIOSInstructions() {
    var msg = 'On iPhone/iPad: tap the Share button in Safari, then choose "Add to Home Screen" to download the Jol Kona app.\n\nOn Android: tap the ⋮ menu and choose "Add to Home screen" / "Install app".';
    if (window.alert) window.alert(msg);
  }

  function shouldShow() {
    if (isStandalone()) return false;
    try {
      return localStorage.getItem(DISMISS_KEY) !== '1';
    } catch (e) {
      return true;
    }
  }

  /* ── 3. Install prompt capture ── */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    // Reveal the in-page install button if one exists (e.g. in the nav)
    var btn = document.getElementById('installAppBtn');
    if (btn) btn.hidden = false;
    if (shouldShow()) {
      // small delay so the page has settled
      setTimeout(showBar, 2500);
    }
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    hideBar();
    var btn = document.getElementById('installAppBtn');
    if (btn) btn.hidden = true;
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
  });

  /* iOS has no beforeinstallprompt → show guidance after a short delay */
  if (isIOS && shouldShow()) {
    window.addEventListener('load', function () {
      setTimeout(showBar, 3500);
    });
  }

  /* ── 4. Optional in-page install button (e.g. #installAppBtn in nav) ── */
  function wireNavButton() {
    var btn = document.getElementById('installAppBtn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          btn.hidden = true;
        }).catch(function () {});
      } else {
        showIOSInstructions();
      }
    });
  }

  function init() {
    if (isStandalone()) {
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    }
    wireNavButton();
    registerSW();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
