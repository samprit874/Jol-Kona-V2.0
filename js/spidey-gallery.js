/* ═══════════════════════════════════════════════════════════════
   জলকণা (Jol Kona) — Spidey Lovers swipeable gallery & lightbox
   "All photos in one place — one tap swipes to the next image."

   Exposes:
     SpideyGallery.initGallery(root, images, { start })   → swipeable carousel
     SpideyGallery.openLightbox(images, index)             → fullscreen viewer
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function makeSlides(images, slideClass) {
    return images.map(function (src, i) {
      var slide = document.createElement('div');
      slide.className = slideClass || 'sl-slide';
      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Spidey Lovers keychain photo ' + (i + 1);
      img.loading = 'lazy';
      img.draggable = false;
      slide.appendChild(img);
      return slide;
    });
  }

  function makeTrack(slideEls) {
    var track = document.createElement('div');
    track.className = 'sl-track';
    slideEls.forEach(function (s) { track.appendChild(s); });
    return track;
  }

  /* Build a small dots container (uses <button>) */
  function makeDots(count, onChange) {
    var dots = document.createElement('div');
    dots.className = 'sl-dots';
    for (var i = 0; i < count; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sl-dot' + (idx === 0 ? ' active' : '');
        b.setAttribute('aria-label', 'Go to photo ' + (idx + 1));
        b.addEventListener('click', function () { onChange(idx); });
        dots.appendChild(b);
      })(i);
    }
    return dots;
  }

  function setDotActive(dots, index) {
    Array.prototype.forEach.call(dots.children, function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  function setThumbActive(thumbs, index) {
    if (!thumbs) return;
    Array.prototype.forEach.call(thumbs.children, function (t, i) {
      t.classList.toggle('active', i === index);
    });
  }

  /* ─── Swipeable carousel attached to a provided viewport ─── */
  function attachSwipes(viewport, onChange, opts) {
    var track = viewport.querySelector('.sl-track')
      || viewport.querySelector('.sl-lb-track')
      || viewport;
    var index = 0;
    var startX = 0, startY = 0, startScrollX = 0;
    var dragging = false;
    var suppressed = false;
    var startTarget = null;

    // Number of slides is read live from the DOM so the same carousel can be
    // reused across image sets (e.g. the lightbox is built once with an empty
    // track, then filled on each open).
    function getCount() {
      return track.children.length;
    }

    function update() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      onChange && onChange(index);
    }

    viewport.addEventListener('pointerdown', function (e) {
      dragging = true;
      suppressed = false;
      startX = e.clientX;
      startY = e.clientY;
      startScrollX = index * viewport.clientWidth;
      startTarget = e.target;
      viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!suppressed && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        suppressed = true; // horizontal intent — let us handle it
      }
      if (suppressed) {
        var target = -startScrollX + dx;
        track.style.transition = 'none';
        track.style.transform = 'translateX(' + target + 'px)';
      }
    });

    function settle(dx) {
      var count = getCount();
      track.style.transition = '';
      if (Math.abs(dx) > 45) {
        index = dx < 0
          ? Math.min(count - 1, index + 1)
          : Math.max(0, index - 1);
      }
      update();
    }

    viewport.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var horizontal = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6;
      if (horizontal) {
        settle(dx);
      } else {
        // Ignore taps that began on a button/arrow (they already handle it).
        var interactive = startTarget && startTarget.closest && startTarget.closest('button, a');
        if (interactive) {
          track.style.transition = '';
          update();
          return;
        }
        // A tap (no real drag): advance to the next photo.
        var count = getCount();
        index = index + 1;
        if (index >= count) index = 0; // loop back to start
        update();
      }
    });

    viewport.addEventListener('pointercancel', function () {
      dragging = false;
      track.style.transition = '';
      update();
    });

    return {
      goTo: function (i) {
        var count = getCount();
        if (!count) return;
        if (i < 0) i = count - 1;
        if (i >= count) i = 0;
        index = i;
        update();
      },
      next: function () { this.goTo(index + 1); },
      prev: function () { this.goTo(index - 1); },
      getIndex: function () { return index; }
    };
  }

  /* ─── Public: init a full gallery block (frame + viewport + dots/thumbs) ─── */
  function initGallery(rootSelector, images, options) {
    options = options || {};
    var root = typeof rootSelector === 'string'
      ? document.querySelector(rootSelector)
      : rootSelector;
    if (!root || !images || !images.length) return null;

    var viewport = root.querySelector('.sl-viewport');
    if (!viewport) return null;

    var track = viewport.querySelector('.sl-track');
    if (track) {
      track.innerHTML = '';
    } else {
      track = document.createElement('div');
      track.className = 'sl-track';
      viewport.insertBefore(track, viewport.firstChild);
    }
    makeSlides(images).forEach(function (s) { track.appendChild(s); });

    var countChip = root.querySelector('.sl-count');
    if (countChip) countChip.textContent = '1 / ' + images.length;

    var dotsWrap = root.querySelector('.sl-dots');
    if (dotsWrap) dotsWrap.innerHTML = '';
    var thumbsWrap = root.querySelector('.sl-thumbs');

    var carousel = attachSwipes(viewport, function (i) {
      if (countChip) countChip.textContent = (i + 1) + ' / ' + images.length;
      if (dotsWrap) setDotActive(dotsWrap, i);
      if (thumbsWrap) setThumbActive(thumbsWrap, i);
    }, options);

    // Rebuild dots & thumbnails
    if (dotsWrap) {
      dotsWrap.appendChild(makeDots(images.length, carousel.goTo.bind(carousel)));
    }
    if (thumbsWrap) {
      thumbsWrap.innerHTML = '';
      images.forEach(function (src, i) {
        (function (idx) {
          var t = document.createElement('button');
          t.type = 'button';
          t.className = 'sl-thumb' + (idx === 0 ? ' active' : '');
          t.setAttribute('aria-label', 'Photo ' + (idx + 1));
          var im = document.createElement('img');
          im.src = src;
          im.alt = 'Thumbnail ' + (idx + 1);
          im.loading = 'lazy';
          t.appendChild(im);
          t.addEventListener('click', function () { carousel.goTo(idx); });
          thumbsWrap.appendChild(t);
        })(i);
      });
    }

    // Arrows
    var prevBtn = root.querySelector('.sl-prev');
    var nextBtn = root.querySelector('.sl-next');
    if (prevBtn) prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      carousel.prev();
    });
    if (nextBtn) nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      carousel.next();
    });

    return carousel;
  }

  /* ─── Public: fullscreen lightbox over all photos ─── */
  var lightbox = null;

  function ensureLightbox() {
    if (lightbox) return lightbox;

    var lb = document.createElement('div');
    lb.className = 'sl-lightbox';
    lb.innerHTML =
      '<div class="sl-lb-frame">' +
        '<button type="button" class="sl-lb-close" aria-label="Close">✕</button>' +
        '<div class="sl-lb-viewport">' +
          '<span class="sl-lb-count">1 / 1</span>' +
          '<span class="sl-lb-tap">👆 Tap / swipe for next</span>' +
          '<div class="sl-lb-track"></div>' +
          '<button type="button" class="sl-lb-arrow sl-lb-prev" aria-label="Previous">‹</button>' +
          '<button type="button" class="sl-lb-arrow sl-lb-next" aria-label="Next">›</button>' +
        '</div>' +
        '<div class="sl-lb-dots"></div>' +
      '</div>';
    document.body.appendChild(lb);

    var frame = lb.querySelector('.sl-lb-frame');
    var viewport = lb.querySelector('.sl-lb-viewport');
    var track = lb.querySelector('.sl-lb-track');

    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') carousel.next();
      if (e.key === 'ArrowLeft') carousel.prev();
    }

    var carousel = attachSwipes(viewport, function (i) {
      var count = track.children.length;
      var chip = viewport.querySelector('.sl-lb-count');
      if (chip) chip.textContent = (i + 1) + ' / ' + count;
      var dots = lb.querySelector('.sl-lb-dots');
      if (dots) setDotActive(dots, i);
    }, {});

    lb.querySelector('.sl-lb-close').addEventListener('click', close);
    lb.querySelector('.sl-lb-prev').addEventListener('click', function (e) {
      e.stopPropagation(); carousel.prev();
    });
    lb.querySelector('.sl-lb-next').addEventListener('click', function (e) {
      e.stopPropagation(); carousel.next();
    });
    frame.addEventListener('click', function (e) {
      if (e.target === frame) close();
    });
    // Escape on desktop
    lb.addEventListener('keydown', function () {});

    lb.open = function (images, startIndex) {
      track.innerHTML = '';
      makeSlides(images, 'sl-lb-slide').forEach(function (s) { track.appendChild(s); });
      var dotsWrap = lb.querySelector('.sl-lb-dots');
      dotsWrap.innerHTML = '';
      dotsWrap.appendChild(makeDots(images.length, carousel.goTo.bind(carousel)));
      carousel.goTo(startIndex || 0);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
    };

    lightbox = lb;
    return lb;
  }

  function openLightbox(images, index) {
    if (!images || !images.length) return;
    var lb = ensureLightbox();
    lb.open(images, index || 0);
  }

  window.SpideyGallery = {
    initGallery: initGallery,
    openLightbox: openLightbox
  };
})();
