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
    setTimeout(hideLoader, 800);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 800));
  }
  
  // Fallback: force hide after 3 seconds
  setTimeout(hideLoader, 3000);
  
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
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ─── Smooth Scroll for Anchor Links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

  // ─── Search Toggle ───
  const searchToggle = document.getElementById('searchToggle');
  searchToggle.addEventListener('click', () => {
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

  // ─── Reviews Auto Scroll ───
  const reviewsSlider = document.querySelector('.reviews-slider');
  if (reviewsSlider) {
    let isAutoScrolling = true;
    let scrollInterval;
    
    function startAutoScroll() {
      scrollInterval = setInterval(() => {
        if (isAutoScrolling) {
          reviewsSlider.scrollLeft += 1;
          if (reviewsSlider.scrollLeft >= reviewsSlider.scrollWidth - reviewsSlider.clientWidth) {
            reviewsSlider.scrollLeft = 0;
          }
        }
      }, 30);
    }
    
    startAutoScroll();
    
    reviewsSlider.addEventListener('mouseenter', () => { isAutoScrolling = false; });
    reviewsSlider.addEventListener('mouseleave', () => { isAutoScrolling = true; });
    reviewsSlider.addEventListener('touchstart', () => { isAutoScrolling = false; });
    reviewsSlider.addEventListener('touchend', () => {
      setTimeout(() => { isAutoScrolling = true; }, 3000);
    });
  }

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

  // ─── Keyboard Accessibility ───
  document.querySelectorAll('.nav-mobile-toggle').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
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

  // ── Global Category Filter ───
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

  console.log('%c💧 জলকণা (Jol Kona)', 'font-size: 24px; color: #C8956C; font-family: serif;');
  console.log('%cCrafted with Love from Bengal', 'font-size: 12px; color: #6B5E57; font-style: italic;');

})();
