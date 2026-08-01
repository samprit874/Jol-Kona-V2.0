/* ═══════════════════════════════════════════════════════════════
   জলকণা (Jol Kona) — Dark Mode (shared by secondary pages)
   Applies the saved theme and wires the #darkModeToggle button on
   pages that don't load js/main.js (e.g. custom-order.html).
   Uses the same localStorage key ('jolkona-theme') as js/main.js,
   so the theme stays in sync across the whole site.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE_KEY = 'jolkona-theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Apply the saved theme right away (before wiring the button),
  // so the page matches the rest of the site on load.
  try {
    applyTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    // Storage unavailable (private mode / blocked cookies) — stay in light mode.
  }

  function initToggle() {
    var toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        // Storage unavailable — theme still applies for this page view.
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();
