/* ==========================================================================
   AMAZING ROY COUTURE — Main JavaScript
   Handles: mobile nav, active link highlighting, smooth scroll,
            scroll reveal, header shadow, portfolio slideshow (with swipe).
   ========================================================================== */

(function () {
  'use strict';

  /* ============================================================
     1. MOBILE NAVIGATION TOGGLE
     ============================================================ */
  function initMobileNav() {
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('.nav-links');
    if (!header || !nav) return;

    let toggle = header.querySelector('.nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.setAttribute('aria-label', 'Toggle navigation menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '&#9776;';
      header.querySelector('.nav-wrapper').appendChild(toggle);
    }

    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.innerHTML = isOpen ? '&times;' : '&#9776;';
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          nav.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = '&#9776;';
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (
        window.innerWidth <= 768 &&
        nav.classList.contains('active') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '&#9776;';
      }
    });

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768) {
          nav.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = '&#9776;';
        }
      }, 150);
    });
  }

  /* ============================================================
     2. ACTIVE NAV LINK HIGHLIGHTING
     ============================================================ */
  function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      const targetPath = href.split('/').pop().split('#')[0] || 'index.html';
      if (targetPath === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ============================================================
     3. HEADER SHADOW ON SCROLL
     ============================================================ */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 20) {
            header.style.boxShadow = '0 4px 20px rgba(53, 5, 57, 0.08)';
          } else {
            header.style.boxShadow = 'none';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ============================================================
     4. SCROLL REVEAL ANIMATIONS
     ============================================================ */
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.process-card, .offering-card, .editorial-card, .founder-profile-card, .certificate-card, .info-block, .contact-form-card'
    );
    if (!targets.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================================
     5. SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ============================================================
     6. LAZY LOAD IMAGES (fallback for older browsers)
     ============================================================ */
  function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) return;
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    if (!imgs.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          io.unobserve(img);
        }
      });
    });

    imgs.forEach(function (img) { if (img.dataset.src) io.observe(img); });
  }

  /* ============================================================
     7. FOOTER YEAR AUTO-UPDATE
     ============================================================ */
  function initFooterYear() {
    const yearNodes = document.querySelectorAll('[data-current-year]');
    if (!yearNodes.length) return;
    const year = new Date().getFullYear();
    yearNodes.forEach(function (n) { n.textContent = year; });
  }

  /* ============================================================
     8. PORTFOLIO SLIDESHOW — with swipe, dots, autoplay, keyboard
     ============================================================ */
  function initPortfolioSlideshow() {
    const track = document.getElementById('slidesTrack');
    const prevBtn = document.getElementById('slidePrev');
    const nextBtn = document.getElementById('slideNext');
    const dotsContainer = document.getElementById('slidesDots');

    if (!track || !prevBtn || !nextBtn) return;

    const slides = Array.from(track.querySelectorAll('.slide-item'));
    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 6000; // 6 seconds

    /* --- Build dots dynamically --- */
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', function () {
          goToSlide(i);
          restartAutoplay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    /* --- Core navigation --- */
    function updateSlidePosition() {
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.dot').forEach(function (dot, i) {
          dot.classList.toggle('active', i === currentIndex);
        });
      }

      // Update slide aria
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', i !== currentIndex ? 'true' : 'false');
      });
    }

    function goToSlide(index) {
      // Wrap around
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;
      updateSlidePosition();
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    /* --- Wire up arrow buttons --- */
    nextBtn.addEventListener('click', function () {
      nextSlide();
      restartAutoplay();
    });

    prevBtn.addEventListener('click', function () {
      prevSlide();
      restartAutoplay();
    });

    /* --- Autoplay --- */
    function startAutoplay() {
      if (totalSlides < 2) return;
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Pause on hover (desktop) — helpful UX
    const wrapper = track.closest('.slideshow-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAutoplay);
      wrapper.addEventListener('mouseleave', startAutoplay);
    }

    // Pause when tab is hidden (saves battery & avoids jump)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    /* ==========================================================
       TOUCH SWIPE SUPPORT (this is the mobile piece)
       ========================================================== */
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;
    const SWIPE_THRESHOLD = 50;   // minimum horizontal distance in px
    const VERTICAL_TOLERANCE = 60; // ignore if vertical scroll is dominant

    const swipeArea = track.closest('.slideshow-wrapper') || track;

    swipeArea.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;
      isSwiping = true;
      stopAutoplay();
    }, { passive: true });

    swipeArea.addEventListener('touchmove', function (e) {
      if (!isSwiping || e.touches.length !== 1) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    swipeArea.addEventListener('touchend', function () {
      if (!isSwiping) return;
      isSwiping = false;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Ignore if the gesture was mostly vertical (user was scrolling)
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > VERTICAL_TOLERANCE) {
        startAutoplay();
        return;
      }

      if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
        startAutoplay();
        return;
      }

      if (deltaX < 0) {
        nextSlide(); // swipe left → next
      } else {
        prevSlide(); // swipe right → previous
      }

      startAutoplay();
    }, { passive: true });

    /* ==========================================================
       MOUSE DRAG SUPPORT (nice on desktop, harmless on touch)
       ========================================================== */
    let isDragging = false;
    let dragStartX = 0;
    let dragEndX = 0;

    swipeArea.addEventListener('mousedown', function (e) {
      // Ignore right-clicks and clicks on links/buttons
      if (e.button !== 0) return;
      if (e.target.closest('a, button')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragEndX = dragStartX;
      stopAutoplay();
      swipeArea.style.cursor = 'grabbing';
    });

    swipeArea.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      dragEndX = e.clientX;
    });

    swipeArea.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      swipeArea.style.cursor = '';

      const delta = dragEndX - dragStartX;
      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        if (delta < 0) nextSlide();
        else prevSlide();
      }
      startAutoplay();
    });

    swipeArea.addEventListener('mouseleave', function () {
      if (isDragging) {
        isDragging = false;
        swipeArea.style.cursor = '';
        startAutoplay();
      }
    });

    /* ==========================================================
       KEYBOARD NAVIGATION (accessibility)
       ========================================================== */
    document.addEventListener('keydown', function (e) {
      // Only when slideshow is visible in viewport
      const rect = swipeArea.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        nextSlide();
        restartAutoplay();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        restartAutoplay();
      }
    });

    /* --- Kick things off --- */
    updateSlidePosition();
    startAutoplay();
  }

  /* ============================================================
     INITIALIZE ON DOM READY
     ============================================================ */
  function init() {
    initMobileNav();
    highlightActiveLink();
    initHeaderScroll();
    initScrollReveal();
    initSmoothScroll();
    initLazyLoad();
    initFooterYear();
    initPortfolioSlideshow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();