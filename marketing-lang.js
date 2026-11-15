/* ===================================================================
   Nakshatra — marketing pages language switcher (EN / HI)
   ===================================================================
   Loaded on all 10 static marketing pages (about.html, faq.html,
   how-it-works.html, kundli-matching.html, pricing.html, privacy.html,
   refund-policy.html, responsible-guidance.html, sample-report.html,
   terms.html), AFTER marketing-i18n.js (which defines window.NK_I18N)
   and AFTER main.js in each page's script order.

   Language rules (same as the app, app/app.js): English is the default for
   every visitor; the browser language is NOT consulted. Hindi appears only
   after the person picks it with the globe button. The choice is saved in the
   browser under ONE shared localStorage key ("nakshatra.lang"), which the app
   also reads and writes, so every page and the app stay in step until the
   person changes it. Storage is read/written inside try/catch, so with storage
   blocked (private browsing) the pages simply stay English.

   Markup contract, per page:
     <div class="nk-lang-toggle-wrap">
       <button class="nk-lang-toggle" type="button" aria-label="Change language"
               aria-haspopup="true" aria-expanded="false">🌐</button>
       <div class="nk-lang-menu">
         <button type="button" data-lang="en">English</button>
         <button type="button" data-lang="hi">हिन्दी</button>
       </div>
     </div>
   ...one such block in .nk-nav-actions (desktop + mobile-visible), since the
   toggle is intentionally NOT hidden by the 900px .nk-nav-actions rule that
   hides Log In / Start Free — see style.css's .nk-lang-toggle-wrap comment.

   Text elements to translate carry either:
     data-i18n="some.key"        -> el.textContent = tr(key)
     data-i18n-html="some.key"   -> el.innerHTML = tr(key)   (copy with inline
                                     tags, e.g. an <em> or a mailto link)
   =================================================================== */
(function () {
  'use strict';

  // English is the default for every visitor (the browser language is NOT consulted).
  // Hindi appears only after the person picks it; the choice is kept under ONE shared
  // localStorage key, also used by the app (app/app.js), so every page agrees.
  var LANG_KEY = 'nakshatra.lang';
  function readSavedLang() {
    try { return localStorage.getItem(LANG_KEY) === 'hi' ? 'hi' : 'en'; } catch (e) { return 'en'; }
  }
  function saveLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage blocked: not remembered */ }
  }

  var currentLang = readSavedLang();

  function dict(lang) {
    return (window.NK_I18N && window.NK_I18N[lang]) || {};
  }

  function tr(key) {
    var d = dict(currentLang);
    if (Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    var en = dict('en');
    if (Object.prototype.hasOwnProperty.call(en, key)) return en[key];
    return key; // last resort — surfaces missing keys visibly instead of blanking text
  }

  function applyLang(lang) {
    currentLang = (lang === 'hi') ? 'hi' : 'en';
    document.documentElement.setAttribute('lang', currentLang === 'hi' ? 'hi' : 'en');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = tr(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = tr(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', tr(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', tr(el.getAttribute('data-i18n-aria')));
    });

    document.querySelectorAll('.nk-lang-menu').forEach(function (menu) {
      menu.querySelectorAll('button[data-lang]').forEach(function (b) {
        var active = b.getAttribute('data-lang') === currentLang;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-current', active ? 'true' : 'false');
      });
    });
  }

  function closeAllMenus() {
    document.querySelectorAll('.nk-lang-menu.is-open').forEach(function (menu) {
      menu.classList.remove('is-open');
      var wrap = menu.closest('.nk-lang-toggle-wrap');
      var btn = wrap && wrap.querySelector('.nk-lang-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function initToggles() {
    document.querySelectorAll('.nk-lang-toggle-wrap').forEach(function (wrap) {
      var btn = wrap.querySelector('.nk-lang-toggle');
      var menu = wrap.querySelector('.nk-lang-menu');
      if (!btn || !menu) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !menu.classList.contains('is-open');
        closeAllMenus();
        if (willOpen) {
          menu.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      menu.querySelectorAll('button[data-lang]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          applyLang(b.getAttribute('data-lang'));
          saveLang(currentLang);
          closeAllMenus();
        });
      });
    });

    document.addEventListener('click', closeAllMenus);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllMenus();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initToggles();
    applyLang(currentLang);
  });
})();
