/* ═══════════════════════════════════════════════════════════════
   জলকণা — Image Frame (Instagram-style swipeable photo frame)
   ═══════════════════════════════════════════════════════════════
   Drop-in multi-photo frame:
     • Swipe / drag left & right (touch + mouse + pen)
     • ◀ ▶ chevron arrows (like Instagram posts)
     • "1/2" counter badge (top-right, like Instagram)
     • dot indicators (bottom, like Instagram)
     • keyboard ← / → support
     • lazy-loads every slide except the first
     • auto-initialises: any element with [data-image-frame]
       and a data-images JSON array gets upgraded automatically.

   Usage (single frame):
     <div class="image-frame"
          data-image-frame
          data-images='["img/a.webp","img/b.webp"]'></div>

   API:
     window.ImageFrame.initAll()  →  upgrade every [data-image-frame]
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const SELECTOR = '[data-image-frame]';
  const SWIPE_THRESHOLD = 40;    // px of drag before the slide snaps
  const MAX_DRAG = 90;           // % of frame width the slide can be dragged

  /* ── helpers ─────────────────────────────────────────────── */

  function parseImages(el) {
    const raw = el.getAttribute('data-images');
    if (!raw) {
      const single = el.getAttribute('data-image');
      return single ? [single] : [];
    }
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list.filter(Boolean) : [];
    } catch (e) {
      console.warn('image-frame: bad data-images JSON', e);
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── the frame ───────────────────────────────────────────── */

  class ImageFrame {
    constructor(root) {
      this.root = root;
      this.index = 0;
      this.count = 0;
      this.dragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.dragDelta = 0;
      this.dragMoved = false;
      this.images = parseImages(root);

      if (this.images.length < 2) return; // nothing to swipe — leave plain

      this.count = this.images.length;
      root.classList.add('image-frame--multi');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-roledescription', 'carousel');
      root.setAttribute('aria-label', 'Photo carousel — swipe to see more photos');
      root.tabIndex = 0;

      this.build();
      this.bind();
      this.render();
    }

    build() {
      const { root, images, count } = this;

      root.innerHTML = `
        <div class="image-frame__track">
          ${images.map((src, i) => `
            <div class="image-frame__slide" role="group" aria-roledescription="slide" aria-label="Photo ${i + 1} of ${count}">
              <img src="${escapeHtml(src)}" alt="Photo ${i + 1} of ${count}" ${i === 0 ? '' : 'loading="lazy"'} draggable="false">
            </div>
          `).join('')}
        </div>

        <span class="image-frame__counter" aria-hidden="true">1/${count}</span>

        <button type="button" class="image-frame__arrow image-frame__arrow--prev" aria-label="Previous photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button type="button" class="image-frame__arrow image-frame__arrow--next" aria-label="Next photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <div class="image-frame__dots" role="tablist" aria-label="Choose photo">
          ${images.map((_, i) => `<button type="button" class="image-frame__dot" role="tab" aria-label="Photo ${i + 1}" aria-selected="${i === 0}"></button>`).join('')}
        </div>
      `;

      this.track = root.querySelector('.image-frame__track');
      this.counter = root.querySelector('.image-frame__counter');
      this.arrows = [root.querySelector('.image-frame__arrow--prev'), root.querySelector('.image-frame__arrow--next')];
      this.dots = Array.from(root.querySelectorAll('.image-frame__dot'));

      // If a photo fails to load (missing file / slow network), swap the
      // slide to a pretty branded placeholder instead of a broken image.
      root.querySelectorAll('.image-frame__slide').forEach((slide) => {
        const img = slide.querySelector('img');
        img.addEventListener('error', () => slide.classList.add('is-missing'));
      });
    }

    bind() {
      const { root, track } = this;

      // ——— swipe / drag (pointer events cover touch + mouse + pen) ———
      track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.dragging = true;
        this.dragMoved = false;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragDelta = 0;
        track.setPointerCapture(e.pointerId);
        root.classList.add('image-frame--dragging');
      });

      track.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        if (!this.dragMoved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        this.dragMoved = true;
        // if the user clearly moved vertically, let the page scroll instead
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
          this.cancelDrag();
          return;
        }
        this.dragDelta = dx;
        const width = root.clientWidth || 1;
        const max = (width * MAX_DRAG) / 100;
        let offset = -this.index * width + dx;
        const lower = -((this.count - 1) * width) - max;
        const upper = max;
        offset = Math.max(lower, Math.min(upper, offset));
        track.style.transform = `translate3d(${offset}px,0,0)`;
      });

      const finishDrag = (e) => {
        if (!this.dragging) return;
        this.dragging = false;
        root.classList.remove('image-frame--dragging');
        const width = root.clientWidth || 1;
        const dx = e.clientX - this.dragStartX;
        const threshold = SWIPE_THRESHOLD;
        if (dx < -threshold) this.go(this.index + 1);
        else if (dx > threshold) this.go(this.index - 1);
        else this.go(this.index); // snap back
      };

      track.addEventListener('pointerup', finishDrag);
      track.addEventListener('pointercancel', () => {
        this.dragging = false;
        root.classList.remove('image-frame--dragging');
        this.go(this.index);
      });

      // after a real drag, swallow the click so the card doesn't open
      track.addEventListener('click', (e) => {
        if (this.dragMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      // ——— arrows ———
      this.arrows[0].addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.go(this.index - 1);
      });
      this.arrows[1].addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.go(this.index + 1);
      });

      // ——— dots ———
      this.dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.go(i);
        });
      });

      // ——— keyboard ———
      root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(this.index - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); this.go(this.index + 1); }
      });
    }

    cancelDrag() {
      this.dragging = false;
      this.root.classList.remove('image-frame--dragging');
      this.go(this.index);
    }

    go(next) {
      if (next < 0 || next >= this.count) return;
      this.index = next;
      this.render();
    }

    render() {
      const { root, track, index, count } = this;
      if (prefersReducedMotion()) {
        track.style.transition = 'none';
      } else {
        track.style.transition = '';
      }
      track.style.transform = `translate3d(${-index * 100}%,0,0)`;
      this.counter.textContent = `${index + 1}/${count}`;
      this.dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
      });
      this.arrows[0].disabled = index === 0;
      this.arrows[1].disabled = index === count - 1;
      root.setAttribute('aria-activedescendant', '');
      this.dots[index]?.focus({ preventScroll: true });
    }
  }

  /* ── auto-init + public API ──────────────────────────────── */

  const upgraded = new WeakSet();

  function upgrade(el) {
    if (upgraded.has(el)) return;
    upgraded.add(el);
    // eslint-disable-next-line no-new
    new ImageFrame(el);
  }

  function initAll(root = document) {
    (root.querySelectorAll ? root.querySelectorAll(SELECTOR) : [])
      .forEach(upgrade);
  }

  window.ImageFrame = { initAll, upgrade };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }

  // pick up frames added later (shop grid re-renders, admin previews, …)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches && node.matches(SELECTOR)) upgrade(node);
        if (node.querySelectorAll) node.querySelectorAll(SELECTOR).forEach(upgrade);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
