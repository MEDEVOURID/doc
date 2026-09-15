/**
 * app.js — Main Application Logic
 * Educational Website: China as a Global Economic Power
 *
 * Handles:
 * - Trilingual switching (FR / EN / AR) with RTL support
 * - Dynamic Map translation updates
 * - Navigation highlighting on scroll (ScrollSpy)
 * - Smooth scrolling
 * - AOS (Animate On Scroll) initialization
 * - Counter animations for statistics
 * - Pedagogical Answer box reveals
 * - Dynamic Glossary & References rendering
 * - localStorage persistence for language preference
 */

(function () {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  var DEFAULT_LANG = 'fr';
  var STORAGE_KEY = 'china-edu-lang';
  var RTL_LANGUAGES = ['ar'];
  var SCROLL_OFFSET = 85;

  // ========================================
  // STATE
  // ========================================
  var currentLang = DEFAULT_LANG;
  var mapsInitialized = false;
  var countersAnimated = false;

  // ========================================
  // DOM READY
  // ========================================
  document.addEventListener('DOMContentLoaded', function () {
    // Load saved language or default
    var savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && window.translations && window.translations[savedLang]) {
      currentLang = savedLang;
    }

    // Initialize all modules
    initAOS();
    initLanguageSwitcher();
    applyLanguage(currentLang);
    initNavigation();
    initSmoothScroll();
    initScrollSpy();
    initCounterObserver();
    initAnswerToggles();
    initMapsDirectly();
    renderGlossary();
    renderReferences();
  });

  // ========================================
  // AOS INITIALIZATION
  // ========================================
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 750,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
        disable: 'mobile'
      });
    }
  }

  // ========================================
  // LANGUAGE SWITCHING
  // ========================================
  function initLanguageSwitcher() {
    var buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (lang && lang !== currentLang) {
          applyLanguage(lang);
        }
      });
    });
  }

  function applyLanguage(lang) {
    if (!window.translations || !window.translations[lang]) {
      console.warn('Translations not found for:', lang);
      return;
    }

    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Storage unavailable or disabled
    }

    var t = window.translations[lang];
    var isRTL = RTL_LANGUAGES.indexOf(lang) !== -1;

    // Update HTML attributes
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Toggle RTL class on body
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    // Update page title
    document.title = t.siteTitle || 'La Chine : Puissance Économique Mondiale';

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = getNestedValue(t, key);
      if (value !== undefined && typeof value === 'string') {
        el.textContent = value;
      }
    });

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update Map Legends if maps exist
    if (typeof window.updateMapTranslations === 'function') {
      window.updateMapTranslations(lang);
    }

    // Re-render dynamic content
    renderGlossary();
    renderReferences();

    // Refresh AOS
    if (typeof AOS !== 'undefined') {
      setTimeout(function () { AOS.refresh(); }, 120);
    }

    // Invalidate map sizes after RTL switch layout recalculation
    invalidateAllMaps();
  }

  function getNestedValue(obj, key) {
    if (!key) return undefined;
    var parts = key.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current === undefined || current === null) return undefined;
      current = current[parts[i]];
    }
    return current;
  }

  // ========================================
  // NAVIGATION & SCROLLSPY
  // ========================================
  function initNavigation() {
    var header = document.getElementById('site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        var targetId = href.substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          var offsetTop = target.offsetTop - SCROLL_OFFSET;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initScrollSpy() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-sidebar .nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', function () {
      var scrollPos = window.scrollY + SCROLL_OFFSET + 60;

      sections.forEach(function (section) {
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  // ========================================
  // STATS COUNTER ANIMATION
  // ========================================
  function initCounterObserver() {
    var statsSection = document.getElementById('stats-section');
    if (!statsSection) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(statsSection);
  }

  function animateCounters() {
    var counters = document.querySelectorAll('.counter');
    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      var duration = 1800; // ms
      var startTime = null;

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = easeOutExpo(progress);
        var current = Math.floor(target * eased);

        counter.textContent = formatNumber(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = formatNumber(target);
        }
      }

      requestAnimationFrame(step);
    });
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  // ========================================
  // PEDAGOGICAL ANSWER BOX TOGGLES
  // ========================================
  function initAnswerToggles() {
    document.querySelectorAll('.btn-reveal').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = this.getAttribute('data-target');
        var box = document.getElementById(targetId);
        if (!box) return;

        var isHidden = box.classList.contains('d-none');
        box.classList.toggle('d-none');

        var span = this.querySelector('span');
        var t = window.translations && window.translations[currentLang] ? window.translations[currentLang] : {};
        if (span) {
          if (isHidden) {
            span.textContent = t.btnHideAnswer || 'Masquer l\'explication';
            this.classList.replace('btn-outline-danger', 'btn-danger');
            this.classList.replace('btn-outline-success', 'btn-success');
          } else {
            span.textContent = t.btnShowAnswer || 'Afficher l\'explication pédagogique';
            this.classList.replace('btn-danger', 'btn-outline-danger');
            this.classList.replace('btn-success', 'btn-outline-success');
          }
        }
      });
    });
  }

  // ========================================
  // MAPS INITIALIZATION & SIZE HANDLING
  // ========================================
  function initMapsDirectly() {
    if (typeof L !== 'undefined' && typeof window.initMaps === 'function') {
      try {
        window.initMaps();
        mapsInitialized = true;
        invalidateAllMaps();
      } catch (err) {
        console.error('Map initialization error:', err);
      }
    } else {
      setTimeout(initMapsDirectly, 300);
    }

    // Invalidate map sizes when map sections come into view
    ['axis1-section', 'axis2-section'].forEach(function (secId) {
      var sec = document.getElementById(secId);
      if (sec && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              invalidateAllMaps();
            }
          });
        }, { threshold: 0.1 });
        observer.observe(sec);
      }
    });

    window.addEventListener('resize', invalidateAllMaps);
  }

  function invalidateAllMaps() {
    setTimeout(function () {
      if (window.industrialMap && typeof window.industrialMap.invalidateSize === 'function') {
        window.industrialMap.invalidateSize();
      }
      if (window.agriculturalMap && typeof window.agriculturalMap.invalidateSize === 'function') {
        window.agriculturalMap.invalidateSize();
      }
    }, 250);
  }

  // ========================================
  // GLOSSARY RENDERING
  // ========================================
  function renderGlossary() {
    var container = document.getElementById('glossary-container');
    if (!container) return;

    var t = window.translations && window.translations[currentLang];
    if (!t || !t.glossaryTerms || !Array.isArray(t.glossaryTerms)) return;

    var html = '';
    t.glossaryTerms.forEach(function (item, index) {
      html += '<div class="glossary-item" data-aos="fade-up" data-aos-delay="' + (Math.min(index * 40, 300)) + '">';
      html += '  <div class="glossary-term">';
      html += '    <i class="bi bi-bookmark-star-fill"></i>';
      html += '    <strong>' + escapeHtml(item.term) + '</strong>';
      html += '  </div>';
      html += '  <div class="glossary-definition">' + escapeHtml(item.definition) + '</div>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  // ========================================
  // REFERENCES RENDERING
  // ========================================
  function renderReferences() {
    var container = document.getElementById('references-container');
    if (!container) return;

    var t = window.translations && window.translations[currentLang];
    if (!t || !t.references || !Array.isArray(t.references)) return;

    var icons = {
      book: 'bi-book-half',
      website: 'bi-globe-americas',
      data: 'bi-database-check'
    };

    var colors = {
      book: '#c0392b',
      website: '#2980b9',
      data: '#27ae60'
    };

    var html = '<div class="references-list">';
    t.references.forEach(function (ref, index) {
      var icon = icons[ref.type] || 'bi-journal-check';
      var color = colors[ref.type] || '#666';
      html += '<div class="ref-item" data-aos="fade-up" data-aos-delay="' + (Math.min(index * 50, 350)) + '">';
      html += '  <div class="ref-icon" style="color: ' + color + '"><i class="bi ' + icon + '"></i></div>';
      html += '  <div class="ref-text">' + escapeHtml(ref.text) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

})();
