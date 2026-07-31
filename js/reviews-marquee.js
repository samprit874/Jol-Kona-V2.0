/* ═══════════════════════════════════════════════════════════════
   Live Reviews Marquee — seamless right-to-left customer slides
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const sliders = document.querySelectorAll('.reviews-slider');
  if (!sliders.length) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const focusableSelector = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function debounce(fn, wait) {
    let timeout;
    return function debounced() {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(fn, wait);
    };
  }

  function pause(slider) {
    slider.classList.add('is-paused');
  }

  function resume(slider) {
    slider.classList.remove('is-paused');
  }

  function setResponsiveDuration(slider, group) {
    const groupWidth = group.scrollWidth || slider.scrollWidth || 900;
    const pixelsPerSecond = window.innerWidth < 768 ? 26 : 38;
    const duration = Math.max(28, Math.round(groupWidth / pixelsPerSecond));
    slider.style.setProperty('--reviews-marquee-duration', `${duration}s`);
  }

  function initReviewsMarquee(slider) {
    if (slider.dataset.marqueeInitialized === 'true') return;

    const originalCards = Array.from(slider.children).filter(child => child.classList && child.classList.contains('review-card'));
    if (originalCards.length < 2) return;

    slider.dataset.marqueeInitialized = 'true';
    slider.setAttribute('aria-label', slider.getAttribute('aria-label') || 'Live customer reviews');

    // Respect reduced motion: keep the original horizontal scroll layout.
    if (motionQuery.matches) return;

    const track = document.createElement('div');
    track.className = 'reviews-track';

    const originalGroup = document.createElement('div');
    originalGroup.className = 'reviews-group reviews-group--original';

    originalCards.forEach(card => originalGroup.appendChild(card));

    const clonedGroup = originalGroup.cloneNode(true);
    clonedGroup.className = 'reviews-group reviews-group--clone';
    clonedGroup.setAttribute('aria-hidden', 'true');

    clonedGroup.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clonedGroup.querySelectorAll(focusableSelector).forEach(el => {
      el.setAttribute('tabindex', '-1');
    });

    track.append(originalGroup, clonedGroup);
    slider.appendChild(track);
    slider.classList.add('is-live');

    setResponsiveDuration(slider, originalGroup);
    window.addEventListener('resize', debounce(() => setResponsiveDuration(slider, originalGroup), 150), { passive: true });

    slider.addEventListener('mouseenter', () => pause(slider));
    slider.addEventListener('mouseleave', () => resume(slider));
    slider.addEventListener('focusin', () => pause(slider));
    slider.addEventListener('focusout', () => resume(slider));
    slider.addEventListener('touchstart', () => pause(slider), { passive: true });
    slider.addEventListener('touchend', () => window.setTimeout(() => resume(slider), 1800), { passive: true });
  }

  sliders.forEach(initReviewsMarquee);

  // Exposed for js/catalog.js: when live reviews arrive from Firestore
  // after page load, the catalog resets the slider and re-inits the marquee.
  window.JolKonaReviewsMarquee = { init: initReviewsMarquee };
})();
