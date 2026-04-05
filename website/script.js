/* ═══════════════════════════════════════════════════════════
   BRIGHT SPARKS AI — Main Script
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Mobile Nav ─────────────────────────────────────────── */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ─── Scroll Reveal ──────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // If user prefers reduced motion, just show everything immediately
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ─── Email Forms ─────────────────────────────────────────── */
(function initForms() {
  /**
   * To connect to Kit (ConvertKit):
   * 1. Go to app.kit.com → Forms → pick (or create) your form
   * 2. Copy the numeric form ID from the URL: /forms/XXXXXXX/edit
   * 3. Replace "REPLACE_WITH_KIT_FORM_ID" in both <form> tags in index.html
   *
   * The endpoint used here is Kit's public subscription API.
   * No server needed — it's a plain POST from the browser.
   */

  const KIT_ENDPOINT = id =>
    `https://app.kit.com/forms/${id}/subscriptions`;

  function handleForm(formEl, successEl, errorEl) {
    if (!formEl) return;

    formEl.addEventListener('submit', async e => {
      e.preventDefault();

      const email  = formEl.querySelector('[name="email_address"]').value.trim();
      const formId = formEl.dataset.kitFormId;
      const btn    = formEl.querySelector('button[type="submit"]');

      // Basic sanity check
      if (!formId || formId === 'REPLACE_WITH_KIT_FORM_ID') {
        console.warn('Kit form ID not set. Update data-kit-form-id on the <form> element.');
        // Show success anyway for local dev so you can check the UI
        showSuccess(formEl, successEl);
        return;
      }

      // Loading state
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending…';

      try {
        const body       = new URLSearchParams({ email_address: email });
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 8000);
        const res        = await fetch(KIT_ENDPOINT(formId), {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok || res.status === 200 || res.status === 201) {
          showSuccess(formEl, successEl);
          window.plausible?.('Subscribe Clicked', { props: { source: formEl.id || 'website-form' } });
        } else {
          throw new Error(`Status ${res.status}`);
        }
      } catch (err) {
        console.error('Form submission error:', err);
        btn.disabled = false;
        btn.innerHTML = originalText;
        if (errorEl) errorEl.hidden = false;
      }
    });
  }

  function showSuccess(formEl, successEl) {
    formEl.hidden = true;
    if (successEl) successEl.hidden = false;
  }

  // Hero form
  handleForm(
    document.getElementById('hero-form'),
    document.getElementById('hero-success'),
    document.getElementById('hero-error')
  );

  // Footer form
  handleForm(
    document.getElementById('footer-form'),
    document.getElementById('footer-success'),
    document.getElementById('footer-error')
  );
})();


