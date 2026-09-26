/* ==========================================================================
   AMAZING ROY COUTURE — Main JavaScript
   Handles: mobile nav, active link highlighting, smooth scroll,
            scroll reveal animations, header shadow on scroll.
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

    // Create the hamburger button if it doesn't exist
    let toggle = header.querySelector('.nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.setAttribute('aria-label', 'Toggle navigation menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '&#9776;'; // hamburger ☰
      header.querySelector('.nav-wrapper').appendChild(toggle);
    }

    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.innerHTML = isOpen ? '&times;' : '&#9776;'; // × or ☰
    });

    // Close menu when a nav link is clicked (mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          nav.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.innerHTML = '&#9776;';
        }
      });
    });

    // Close menu when clicking outside
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

    // Reset menu state on window resize
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
      // Skip external links and WhatsApp
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

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

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

    targets.forEach(function (el) {
      observer.observe(el);
    });
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
    if ('loading' in HTMLImageElement.prototype) return; // native support
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

    imgs.forEach(function (img) {
      if (img.dataset.src) io.observe(img);
    });
  }

  /* ============================================================
     7. YEAR AUTO-UPDATE IN FOOTER
     ============================================================ */
  function initFooterYear() {
    const yearNodes = document.querySelectorAll('[data-current-year]');
    if (!yearNodes.length) return;
    const year = new Date().getFullYear();
    yearNodes.forEach(function (n) {
      n.textContent = year;
    });
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();