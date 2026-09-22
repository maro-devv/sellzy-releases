(function () {
  'use strict';

  var C = window.SELLZY_CONFIG;
  var OWNER_KEY = 'sellzy_owner';

  // ---------- Links and prices, all built from config.js ----------
  var waUrl = C.WHATSAPP_URL_BASE + C.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(C.WHATSAPP_MESSAGE);

  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waUrl; });
  // Local display form of the WhatsApp number (201202191790 -> 01202191790), derived from config.js
  var waLocal = '0' + String(C.WHATSAPP_NUMBER).replace(/^20/, '');
  document.querySelectorAll('[data-wa-number]').forEach(function (a) { a.textContent = waLocal; });
  document.querySelectorAll('[data-download]').forEach(function (a) { a.href = C.DOWNLOAD_URL; });

  function formatPrice(n) {
    return Number(n).toLocaleString('en-US', { useGrouping: false });
  }
  document.querySelectorAll('[data-price]').forEach(function (el) {
    var key = el.getAttribute('data-price');
    var value = key === 'lifetime' ? C.PRICE_LIFETIME : key === 'yearly' ? C.PRICE_MONTHLY * 12 : C.PRICE_MONTHLY;
    el.textContent = formatPrice(value);
  });

  // ---------- Founding-offer scarcity badge (lifetime price card) ----------
  var foundingBadge = document.getElementById('founding-badge');
  if (foundingBadge) {
    var foundingRemaining = C.FOUNDING_OFFER_TOTAL - C.FOUNDING_OFFER_SOLD;
    if (foundingRemaining > 0) {
      foundingBadge.textContent = 'عرض الإطلاق: متبقي ' + foundingRemaining + ' من ' + C.FOUNDING_OFFER_TOTAL + ' أماكن بسعر ' + formatPrice(C.PRICE_LIFETIME) + ' جنيه';
      foundingBadge.hidden = false;
    }
  }

  // ---------- Download: never intercepted, only reveals the inline confirmation ----------
  var notice = document.getElementById('win-notice');
  var downloadClicked = false;

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[data-download]');
    if (!link) return;
    downloadClicked = true;
    var scope = link.closest('[data-dl-scope]');
    var confirmBox = scope && scope.querySelector('.confirm');
    if (confirmBox) confirmBox.hidden = false;
    updateNotice();
  });

  // ---------- Windows-only notice (above the hero download button, before the click) ----------
  var narrowQuery = window.matchMedia('(max-width: 899px)');

  function isMobileDevice() {
    var ua = navigator.userAgent || '';
    var iPadOS = /Macintosh|Mac OS X/i.test(ua) && navigator.maxTouchPoints > 1; // iPadOS reports a Mac UA
    return /Android|iPhone|iPad/i.test(ua) || iPadOS;
  }
  function updateNotice() {
    if (!notice) return;
    notice.hidden = downloadClicked || !(isMobileDevice() || narrowQuery.matches);
  }
  updateNotice();
  if (narrowQuery.addEventListener) narrowQuery.addEventListener('change', updateNotice);
  else if (narrowQuery.addListener) narrowQuery.addListener(updateNotice);

  // ---------- Sticky bottom bar: hidden while the hero or free-trial buttons are on screen ----------
  var bottomBar = document.querySelector('.bottombar');
  var ctaGroups = document.querySelectorAll('.hero__text .cta, .cta--trial');

  if (bottomBar && ctaGroups.length && 'IntersectionObserver' in window) {
    var groupsInView = new Set();
    bottomBar.classList.add('is-hidden'); // both groups start near the top, so start hidden (no flash)
    // The bottom margin stops counting a group as "in view" while it sits under the bar itself
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) groupsInView.add(entry.target);
        else groupsInView.delete(entry.target);
      });
      bottomBar.classList.toggle('is-hidden', groupsInView.size > 0);
    }, { rootMargin: '0px 0px -80px 0px' });
    ctaGroups.forEach(function (el) { io.observe(el); });
  }

  // ---------- Owner-only download counter ----------
  // NOTE: this is cosmetic hiding, not security. The GitHub releases API is public, so anyone can read the
  // same numbers. The flag only keeps the badge (and the API call) away from normal visitors.
  function readOwnerFlag() {
    try { return localStorage.getItem(OWNER_KEY) === '1'; } catch (err) { return false; }
  }
  function saveOwnerFlag() {
    try { localStorage.setItem(OWNER_KEY, '1'); } catch (err) { /* storage blocked: nothing to do */ }
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get('owner') === '1') {
    saveOwnerFlag();
    params.delete('owner');
    var qs = params.toString();
    try {
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (err) { /* ignore */ }
  }

  if (readOwnerFlag()) {
    fetch(C.GITHUB_API_BASE + C.GITHUB_REPO + '/releases?per_page=100', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (releases) {
        var total = 0;
        releases.forEach(function (rel) {
          (rel.assets || []).forEach(function (asset) {
            if (asset.name === C.RELEASE_ASSET_NAME) total += Number(asset.download_count) || 0;
          });
        });
        document.getElementById('owner-count').textContent = formatPrice(total);
        document.getElementById('owner-badge').hidden = false;
      })
      .catch(function () { /* on any failure show nothing */ });
  }

  // ---------- Image lightbox ----------
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var closeBtn = document.getElementById('lightbox-close');
  var lastFocus = null;

  function openLightbox(btn) {
    lastFocus = btn;
    lightboxImg.src = btn.getAttribute('data-full');
    lightboxImg.alt = btn.getAttribute('data-alt') || '';
    lightbox.hidden = false;
    lightbox.scrollTop = 0;
    document.documentElement.classList.add('lb-open');
    closeBtn.focus();
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.documentElement.classList.remove('lb-open');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.zoom').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox(); // tap on the dark scrim
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // the close button is the only focusable element
  });
})();
