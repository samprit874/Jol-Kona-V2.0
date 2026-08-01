/* ═══════════════════════════════════════════════════════════════
   জলকণা (Jol Kona) — Premium Interactions & Animations
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Ensure wheel events are passive (don't block scroll)
  document.addEventListener('wheel', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });

  // ─── Loading Screen ──
  const loader = document.getElementById('loader');

  function hideLoader() {
    if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      if (typeof initScrollReveal === 'function') initScrollReveal();
    }
  }

  // Hide loader when page loads
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 3500);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 800));
  }

  // Fallback: force hide after 3 seconds
  setTimeout(hideLoader, 4500);

  // Initially prevent scroll
  document.body.style.overflow = 'hidden';

  // ─── Mouse Glow Effect ───
  const mouseGlow = document.getElementById('mouseGlow');
  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    mouseGlow.style.left = glowX + 'px';
    mouseGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // ─── Floating Particles ───
  const particlesContainer = document.getElementById('particles');

  function createParticles() {
    const count = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const isDroplet = Math.random() > 0.5;
      particle.className = `particle ${isDroplet ? 'particle--droplet' : 'particle--petal'}`;

      const size = Math.random() * 8 + 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';

      particlesContainer.appendChild(particle);
    }
  }
  createParticles();

  // ─── Navigation Scroll Effect ───
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // ─── Mobile Navigation ───
  // Handled by js/mobile-nav.js (redesigned slide-in drawer).

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // The mobile drawer handles its own links (close first, then scroll).
    if (anchor.closest('.mnav')) return;
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ─── Scroll Reveal Animation ───
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ─── FAQ Accordion ───
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ─── Product Filter ───
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ─── Quick View Modal ───
  const quickViewModal = document.getElementById('quickViewModal');
  const modalClose = document.getElementById('modalClose');

  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const name = card.querySelector('.product-card-name').textContent;
      const category = card.querySelector('.product-card-category').textContent;
      const price = card.querySelector('.current').textContent;
      const original = card.querySelector('.original');
      const emoji = card.querySelector('.product-card-image-placeholder').textContent;
      const bg = card.querySelector('.product-card-image-placeholder').style.background;

      document.getElementById('modalTitle').textContent = name;
      document.getElementById('modalCategory').textContent = category;
      document.getElementById('modalPrice').textContent = price;
      document.getElementById('modalOriginal').textContent = original ? original.textContent : '';
      document.getElementById('modalImage').textContent = emoji;
      document.getElementById('modalImage').style.background = bg;

      quickViewModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  quickViewModal.addEventListener('click', (e) => {
    if (e.target === quickViewModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ─── Water Ripple Click Effect ───
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = (e.clientX - 50) + 'px';
    ripple.style.top = (e.clientY - 50) + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  });

  // ─── Newsletter Form ───
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('.newsletter-input');
    const btn = newsletterForm.querySelector('.newsletter-btn');

    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#4CAF50';
    input.value = '';

    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.style.background = '';
    }, 3000);
  });

  // ─── Occasion Cards Click ───
  document.querySelectorAll('.occasion-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('.occasion-name').textContent;
      // In production, this would navigate to filtered shop
      console.log(`Browsing ${name} gifts`);
    });
  });

  // ─── Product Card 3D Hover Effect ───
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ─── Collection Cards Parallax ───
  document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const bg = card.querySelector('.collection-card-bg');
      bg.style.transform = `scale(1.05) translate(${(x - 0.5) * 10}px, ${(y - 0.5) * 10}px)`;
    });

    card.addEventListener('mouseleave', () => {
      const bg = card.querySelector('.collection-card-bg');
      bg.style.transform = '';
    });
  });

  // ─── Wishlist Toggle ───
  // The full wishlist/cart experience in js/shop.js manages these buttons.
  if (!window.JolKonaShop) {
    document.querySelectorAll('.product-action-btn[aria-label="Add to wishlist"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.textContent === '♡') {
          btn.textContent = '♥';
          btn.style.color = '#e74c3c';
        } else {
          btn.textContent = '♡';
          btn.style.color = '';
        }
      });
    });
  }

  // ─── Search Toggle ───
  const searchToggle = document.getElementById('searchToggle');
  searchToggle?.addEventListener('click', () => {
    const searchInput = document.querySelector('.filter-search input');
    if (searchInput) {
      searchInput.focus();
      document.getElementById('shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ─── Parallax on Scroll ───
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Hero gradient parallax
    const heroGradient = document.querySelector('.hero-gradient');
    if (heroGradient) {
      heroGradient.style.transform = `translate(0, ${scrolled * 0.3}px)`;
    }

    // Story image parallax
    const storyMain = document.querySelector('.story-image-main');
    if (storyMain) {
      const rect = storyMain.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        storyMain.style.transform = `translateY(${(progress - 0.5) * -30}px)`;
      }
    }
  }, { passive: true });

  // ─── Counter Animation ───
  function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(counter => {
      const target = counter.textContent;
      const numericTarget = parseInt(target.replace(/\D/g, ''));
      const suffix = target.replace(/[\d]/g, '');
      let current = 0;
      const increment = numericTarget / 60;

      const updateCounter = () => {
        current += increment;
        if (current < numericTarget) {
          counter.textContent = Math.floor(current) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateCounter();
          observer.unobserve(counter);
        }
      });

      observer.observe(counter);
    });
  }
  animateCounters();

  // ─── Reviews Live Marquee ───
  // Handled by js/reviews-marquee.js so the reviews can loop seamlessly.

  // ─── Smooth Cursor for Interactive Elements ───
  const interactiveElements = document.querySelectorAll('a, button, .product-card, .collection-card, .occasion-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.style.cursor = 'pointer';
    });
    el.addEventListener('mouseleave', () => {
      document.body.style.cursor = '';
    });
  });

  // ─── Customize Request → Instagram DM ───
  window.sendCustomize = function(btn, productName) {
    const card = btn.closest('.product-card');
    const textarea = card.querySelector('.customize-textarea');
    const description = textarea.value.trim();

    if (!description) {
      textarea.style.borderColor = '#e74c3c';
      textarea.setAttribute('placeholder', '⚠️ Please describe your customization first...');
      setTimeout(() => {
        textarea.style.borderColor = '';
        textarea.setAttribute('placeholder', 'Describe how you\'d like this customized...');
      }, 2000);
      return;
    }

    const message = encodeURIComponent(`Hi! I'd like to customize the "${productName}"\n\nMy request: ${description}`);
    const url = `https://www.instagram.com/direct/new/?recipient=jol_kona_&text=${message}`;

    window.open(url, '_blank');

    // Visual feedback
    btn.textContent = '✓ Opening Instagram...';
    btn.style.background = '#4CAF50';
    setTimeout(() => {
      btn.textContent = 'Send via Instagram →';
      btn.style.background = '';
      textarea.value = '';
      card.classList.remove('customize-open');
    }, 2000);
  };

  // ─── Wishlist Toggle ───
  if (!window.JolKonaShop) {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.textContent === '♡') {
          btn.textContent = '♥';
          btn.style.color = '#e74c3c';
        } else {
          btn.textContent = '♡';
          btn.style.color = '';
        }
      });
    });
  }

  // ── Global Category Filter ───
  if (!window.JolKonaShop) {
    window.filterProducts = function(category) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      const targetBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
      if (targetBtn) targetBtn.classList.add('active');

      document.querySelectorAll('.product-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    };
  }

  // ─── Performance: Pause animations when tab is hidden ────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.querySelectorAll('.particle').forEach(p => {
        p.style.animationPlayState = 'paused';
      });
    } else {
      document.querySelectorAll('.particle').forEach(p => {
        p.style.animationPlayState = 'running';
      });
    }
  });

  // ─── Lazy load product transitions ───
  if ('IntersectionObserver' in window) {
    const productObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          productObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' });

    document.querySelectorAll('.product-card').forEach(card => {
      productObserver.observe(card);
    });
  }

  // ─── Mobile UX: Touch feedback for product cards ───
  if ('ontouchstart' in window) {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
      }, { passive: true });

      card.addEventListener('touchend', () => {
        card.style.transform = '';
      }, { passive: true });
    });

    // On mobile, show customization form immediately (no toggle needed)
    document.querySelectorAll('.product-customize-toggle').forEach(btn => {
      btn.textContent = '✏️ Customize Below';
    });

    // Disable 3D tilt on mobile (performance)
    document.querySelectorAll('.product-card').forEach(card => {
      card.onmousemove = null;
      card.onmouseleave = null;
    });
  }

  // ─── Smooth Scroll offset for fixed nav ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // The mobile drawer handles its own links (close first, then scroll).
    if (anchor.closest('.mnav')) return;
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 70;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ─── 1. Scroll Progress Bar ───
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  }, { passive: true });

  // ─── 2. Back to Top Button ───
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (backToTop) {
      if (window.pageYOffset > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── 3. Dark Mode Toggle ───
  const darkModeToggle = document.getElementById('darkModeToggle');
  const savedTheme = localStorage.getItem('jolkona-theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('jolkona-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('jolkona-theme', 'dark');
      }
    });
  }

  // ─── 4. Festival Countdown Timer ───
  const festivals = [
    { name: '🧵 Rakhi', date: new Date('2026-08-28T00:00:00+05:30') },
    { name: '🪔 Durga Puja', date: new Date('2026-10-08T00:00:00+05:30') },
    { name: '🪔 Diwali', date: new Date('2026-11-08T00:00:00+05:30') },
    { name: '🎄 Christmas', date: new Date('2026-12-25T00:00:00+05:30') },
    { name: '❤️ Valentine\'s Day', date: new Date('2027-02-14T00:00:00+05:30') },
    { name: '🌙 Eid ul-Fitr', date: new Date('2027-03-22T00:00:00+05:30') },
    { name: '🌸 Poila Boishakh', date: new Date('2027-04-15T00:00:00+05:30') },
    { name: '👩‍👧 Mother\'s Day', date: new Date('2027-05-09T00:00:00+05:30') },
  ];

  function updateFestivalCountdown() {
    const now = new Date();
    // Sort and find the *nearest* upcoming festival (not just first in array)
    const upcoming = festivals
      .filter(f => f.date > now)
      .sort((a,b) => a.date - b.date);
    const nextFestival = upcoming[0] || null;
    if (!nextFestival) {
      // All 2026-27 festivals passed? Fallback to next year's Rakhi
      const fbName = document.getElementById('festivalName');
      if (fbName) fbName.textContent = '✨ Everyday Celebration';
      return;
    }

    const festivalName = document.getElementById('festivalName');
    if (festivalName) festivalName.textContent = nextFestival.name;

    const diff = nextFestival.date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('countdownDays');
    const hoursEl = document.getElementById('countdownHours');
    const minsEl = document.getElementById('countdownMinutes');
    const secsEl = document.getElementById('countdownSeconds');

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateFestivalCountdown();
  setInterval(updateFestivalCountdown, 1000);

  // ─── 6. Gift Finder Quiz ───
  const giftFinderSteps = document.querySelectorAll('.gift-finder-step');
  const giftFinderDots = document.querySelectorAll('.gift-finder-progress-dot');
  const giftFinderPrev = document.getElementById('giftFinderPrev');
  const giftFinderNext = document.getElementById('giftFinderNext');
  let currentGiftStep = 1;
  const giftFinderAnswers = {};

  // Gift recommendation logic
  const giftRecommendations = {
    'partner-birthday-under-500': { category: 'keychains', text: 'Couple Keychains — a sweet token of love' },
    'partner-birthday-500-1000': { category: 'pipe-cleaner', text: 'Pipe Cleaner Flower Bouquet — handmade with love' },
    'partner-birthday-1000-2000': { category: 'gift-hampers', text: 'Photo & Chocolate Memory Bouquet — unforgettable' },
    'partner-birthday-above-2000': { category: 'gift-hampers', text: 'Premium Gift Hamper — the ultimate expression' },
    'partner-anniversary-under-500': { category: 'keychains', text: 'Couple Heart Keychain — carry your love everywhere' },
    'partner-anniversary-500-1000': { category: 'clay-jewellery', text: 'Clay Name Necklace — personalized forever' },
    'partner-anniversary-1000-2000': { category: 'gift-hampers', text: 'Anniversary Gift Hamper — celebrate your journey' },
    'partner-anniversary-above-2000': { category: 'gift-hampers', text: 'Luxury Anniversary Collection — premium love' },
    'partner-festival-under-500': { category: 'keychains', text: 'Festive Keychain — small joy, big love' },
    'partner-festival-500-1000': { category: 'pipe-cleaner', text: 'Festive Flower Bouquet — bloom together' },
    'partner-festival-1000-2000': { category: 'clay-jewellery', text: 'Festive Clay Jewellery — traditional elegance' },
    'partner-festival-above-2000': { category: 'gift-hampers', text: 'Grand Festive Hamper — celebrate in style' },
    'partner-just-because-under-500': { category: 'keychains', text: 'Surprise Keychain — just because you care' },
    'partner-just-because-500-1000': { category: 'pipe-cleaner', text: 'Surprise Flower Bouquet — no reason needed' },
    'partner-just-because-1000-2000': { category: 'clay-jewellery', text: 'Surprise Clay Necklace — spontaneous love' },
    'partner-just-because-above-2000': { category: 'gift-hampers', text: 'Surprise Gift Box — go all out' },
    'family-birthday-under-500': { category: 'pipe-cleaner', text: 'Handmade Flower Bouquet — for the ones who raised you' },
    'family-birthday-500-1000': { category: 'clay-jewellery', text: 'Clay Hair Pin — elegant & thoughtful' },
    'family-birthday-1000-2000': { category: 'gift-hampers', text: 'Birthday Gift Hamper — make their day special' },
    'family-birthday-above-2000': { category: 'gift-hampers', text: 'Premium Family Gift Collection' },
    'friend-birthday-under-500': { category: 'keychains', text: 'Friendship Keychain — bond forever' },
    'friend-birthday-500-1000': { category: 'pipe-cleaner', text: 'Fun Flower Bouquet — friendship blooms' },
    'friend-birthday-1000-2000': { category: 'gift-hampers', text: 'Birthday Gift Box — for your bestie' },
    'friend-birthday-above-2000': { category: 'gift-hampers', text: 'Premium Gift Hamper — best friend deserves the best' },
    'colleague-birthday-under-500': { category: 'keychains', text: 'Elegant Keychain — professional & thoughtful' },
    'colleague-birthday-500-1000': { category: 'pipe-cleaner', text: 'Desk Flower Bouquet — brighten their day' },
    'colleague-birthday-1000-2000': { category: 'custom-chocolates', text: 'Custom Chocolate Wrapper — sweet surprise' },
    'colleague-birthday-above-2000': { category: 'gift-hampers', text: 'Premium Gift Box — impressive & tasteful' },
  };

  function getDefaultRecommendation() {
    return { category: 'gift-hampers', text: 'Our Best-Selling Gift Hampers — loved by everyone!' };
  }

  function updateGiftFinderUI() {
    giftFinderSteps.forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === currentGiftStep) {
        step.classList.add('active');
      }
    });
    giftFinderDots.forEach(dot => {
      const stepNum = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'completed');
      if (stepNum === currentGiftStep) dot.classList.add('active');
      if (stepNum < currentGiftStep) dot.classList.add('completed');
    });
    if (giftFinderPrev) {
      giftFinderPrev.style.visibility = currentGiftStep > 1 ? 'visible' : 'hidden';
    }
    if (giftFinderNext) {
      if (currentGiftStep === 3) {
        giftFinderNext.textContent = 'Find My Gift ✨';
      } else {
        giftFinderNext.textContent = 'Next →';
      }
    }
  }

  // Gift finder option click
  document.querySelectorAll('.gift-finder-option').forEach(option => {
    option.addEventListener('click', () => {
      const step = option.closest('.gift-finder-step');
      const stepNum = parseInt(step.dataset.step);
      step.querySelectorAll('.gift-finder-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      giftFinderAnswers[stepNum] = option.dataset.value;
    });
  });

  if (giftFinderNext) {
    giftFinderNext.addEventListener('click', () => {
      if (!giftFinderAnswers[currentGiftStep]) {
        // Shake the current step options to indicate selection needed
        const currentStep = document.querySelector(`.gift-finder-step[data-step="${currentGiftStep}"]`);
        if (currentStep) {
          currentStep.style.animation = 'none';
          currentStep.offsetHeight; // Trigger reflow
          currentStep.style.animation = 'shake 0.4s ease';
        }
        return;
      }
      if (currentGiftStep < 3) {
        currentGiftStep++;
        updateGiftFinderUI();
      } else {
        // Show results
        const key = `${giftFinderAnswers[1]}-${giftFinderAnswers[2]}-${giftFinderAnswers[3]}`;
        const recommendation = giftRecommendations[key] || getDefaultRecommendation();
        
        const resultText = document.getElementById('giftFinderResultText');
        if (resultText) resultText.textContent = recommendation.text;
        
        // Show the results step
        giftFinderSteps.forEach(step => step.classList.remove('active'));
        const resultsStep = document.querySelector('.gift-finder-step[data-step="results"]');
        if (resultsStep) resultsStep.classList.add('active');
        
        // Update progress dots
        giftFinderDots.forEach(dot => {
          dot.classList.add('completed');
          dot.classList.remove('active');
        });
        
        // Hide nav
        if (giftFinderPrev) giftFinderPrev.style.visibility = 'hidden';
        if (giftFinderNext) giftFinderNext.style.display = 'none';
        
        // Filter products to show recommended category
        if (window.filterProducts) {
          window.filterProducts(recommendation.category);
        }
      }
    });
  }

  if (giftFinderPrev) {
    giftFinderPrev.addEventListener('click', () => {
      if (currentGiftStep > 1) {
        currentGiftStep--;
        updateGiftFinderUI();
      }
    });
  }

  // ─── 7. Bottom Mobile Nav Active State ───
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  bottomNavItems.forEach(item => {
    item.addEventListener('click', function() {
      bottomNavItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Update bottom nav active state on scroll
  const sections = ['home', 'shop', 'collections', 'story'];
  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 200;
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          bottomNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + sectionId) {
              item.classList.add('active');
            }
          });
        }
      }
    }
    );
  }, { passive: true });

  // ─── 8. Typewriter Effect for Hero Bengali Title ───
  const bengaliTitle = document.querySelector('.hero-bengali-title');
  if (bengaliTitle) {
    const originalText = bengaliTitle.textContent.trim();
    bengaliTitle.textContent = '';
    bengaliTitle.style.opacity = '1';
    let charIndex = 0;
    
    function typeWriter() {
      if (charIndex < originalText.length) {
        bengaliTitle.textContent = originalText.substring(0, charIndex + 1);
        // Add cursor
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        bengaliTitle.appendChild(cursor);
        charIndex++;
        setTimeout(typeWriter, 60 + Math.random() * 40);
      } else {
        // Remove cursor after typing is done
        const cursor = bengaliTitle.querySelector('.typewriter-cursor');
        if (cursor) {
          setTimeout(() => cursor.remove(), 2000);
        }
      }
    }
    
    // Start typewriter after a short delay
    setTimeout(typeWriter, 1500);
  }

  // ─── 9. Cart Badge Bounce ───
  const cartBadge = document.getElementById('cartCount');
  const wishlistBadge = document.getElementById('wishlistCount');
  
  // Observe badge changes for bounce animation
  if (cartBadge) {
    const badgeObserver = new MutationObserver(() => {
      cartBadge.classList.add('bounce');
      setTimeout(() => cartBadge.classList.remove('bounce'), 600);
    });
    badgeObserver.observe(cartBadge, { childList: true, characterData: true, subtree: true });
  }
  
  if (wishlistBadge) {
    const badgeObserver = new MutationObserver(() => {
      wishlistBadge.classList.add('bounce');
      setTimeout(() => wishlistBadge.classList.remove('bounce'), 600);
    });
    badgeObserver.observe(wishlistBadge, { childList: true, characterData: true, subtree: true });
  }

  // ─── Shake animation for gift finder ───
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  console.log('%c💧 জলকণা (Jol Kona)', 'font-size: 24px; color: #C0623A; font-family: serif;');
  console.log('%cCrafted with Love from West Bengal', 'font-size: 12px; color: #6B5E57; font-style: italic;');

})();
