// ========== CONFIG (editable via Tweaks) ==========
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#f6f1e7",
  "halftone": true
}/*EDITMODE-END*/;

// ========== APPLY TWEAKS ==========
function applyTweaks(t){
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.classList.toggle('no-halftone', !t.halftone);
  const cc = document.getElementById('tw-color-custom');
  if (cc) cc.value = t.accent;
  const h = document.getElementById('tw-halftone');
  if (h) h.checked = !!t.halftone;
}
let tweaks = { ...TWEAK_DEFAULTS };
applyTweaks(tweaks);

function pushEdits(edits){
  tweaks = { ...tweaks, ...edits };
  applyTweaks(tweaks);
  try { window.parent.postMessage({type:'__edit_mode_set_keys', edits}, '*'); } catch(e){}
}

// ========== TWEAKS EDIT MODE PROTOCOL ==========
const panel = document.getElementById('tweaks-panel');
window.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === '__activate_edit_mode') panel.hidden = false;
  if (d.type === '__deactivate_edit_mode') panel.hidden = true;
});
try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch(e){}

document.querySelectorAll('#tw-swatches button[data-color]').forEach((button) => {
  button.style.setProperty('--c', button.dataset.color);
});

document.getElementById('tweaks-close').addEventListener('click', () => { panel.hidden = true; });
document.getElementById('tw-halftone').addEventListener('change', (e) => pushEdits({ halftone: e.target.checked }));
document.getElementById('tw-swatches').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-color]');
  if (!btn) return;
  pushEdits({ accent: btn.dataset.color });
});
document.getElementById('tw-color-custom').addEventListener('input', (e) => pushEdits({ accent: e.target.value }));

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const btnText = form.querySelector('.btn-text');
  const btnLoading = form.querySelector('.btn-loading');
  const formStatus = document.getElementById('form-status');

  if (!window.emailjs) {
    if (formStatus) {
      formStatus.textContent = 'Contact form is temporarily unavailable.';
      formStatus.className = 'form-status error';
      formStatus.style.display = 'block';
    }
    return;
  }

  emailjs.init('528mNb5rsXFiU2uwd');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      showFormStatus('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFormStatus('Please enter a valid email address.', 'error');
      return;
    }

    setLoadingState(true);

    try {
      await emailjs.send('service_fqh0j1s', 'template_ou8blqh', {
        from_name: name,
        from_email: email,
        message,
        to_email: 'editedbyalert@gmail.com'
      });

      showFormStatus("Message sent successfully! I'll get back to you soon.", 'success');
      form.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      showFormStatus('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    if (submitBtn) submitBtn.disabled = isLoading;
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = isLoading ? 'inline' : 'none';
  }

  function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';

    if (type === 'success') {
      window.setTimeout(() => {
        formStatus.style.display = 'none';
      }, 5000);
    }
  }

  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}

initContactForm();

// ========== SMOOTH SCROLL ==========
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function initSmoothScroll() {
  if (prefersReducedMotion || !finePointer || typeof window.Lenis !== 'function') return;
  new window.Lenis({ autoRaf: true, anchors: { offset: 0 }, lerp: 0.11, allowNestedScroll: true });
}

initSmoothScroll();

// ========== CUSTOM CURSOR ==========
function initXCursor() {
  if (!finePointer) return;

  const root = document.documentElement;
  const dot = document.createElement('div');
  dot.className = 'x-cursor';
  const ring = document.createElement('div');
  ring.className = 'x-cursor-ring';
  document.body.append(ring, dot);

  const interactive = 'a, button, [role="button"], label, summary, .tile';
  const textual = 'input, textarea, select, [contenteditable="true"]';
  let x = 0;
  let y = 0;
  let ringX = 0;
  let ringY = 0;
  let rafId = null;
  let started = false;

  const tick = () => {
    ringX += (x - ringX) * 0.2;
    ringY += (y - ringY) * 0.2;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    if (Math.abs(x - ringX) < 0.1 && Math.abs(y - ringY) < 0.1) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  const setVisible = (visible) => {
    dot.classList.toggle('is-visible', visible);
    ring.classList.toggle('is-visible', visible);
  };

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (!started) {
      started = true;
      ringX = x;
      ringY = y;
      root.classList.add('has-custom-cursor');
    }
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    setVisible(true);

    const target = event.target instanceof Element ? event.target : null;
    const onText = !!(target && target.closest(textual));
    const onLink = !onText && !!(target && target.closest(interactive));
    dot.classList.toggle('is-text', onText);
    ring.classList.toggle('is-text', onText);
    dot.classList.toggle('is-hover', onLink);
    ring.classList.toggle('is-hover', onLink);

    if (rafId === null) rafId = requestAnimationFrame(tick);
  }, { passive: true });

  window.addEventListener('pointerdown', () => ring.classList.add('is-down'), { passive: true });
  window.addEventListener('pointerup', () => ring.classList.remove('is-down'), { passive: true });
  document.addEventListener('mouseleave', () => setVisible(false));
  document.addEventListener('mouseenter', () => { if (started) setVisible(true); });
  window.addEventListener('blur', () => setVisible(false));
}

initXCursor();

// ========== IMAGE FADE-IN ==========
function initImageFade() {
  document.querySelectorAll('.tile-media img, .founder-photo').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) {
      done();
    } else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });
}

initImageFade();

// ========== SCROLL REVEALS ==========
function initReveals() {
  const groups = [
    '.services-strip > *',
    '.grid .tile',
    '.section-index-strip > *',
    '.stats-v2-lead > *',
    '.stats-v2-cards .stat-box',
    '.founder > *',
    '.contact-left > *',
    '.contact-form'
  ];

  const tracked = new Set();
  groups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      if (tracked.has(el)) return;
      tracked.add(el);
      if (!prefersReducedMotion) {
        el.classList.add('reveal');
        const stagger = el.matches('.tile') ? (index % 2) * 90 : Math.min(index, 4) * 80;
        el.style.setProperty('--reveal-delay', `${stagger}ms`);
      }
    });
  });

  const finish = (el) => {
    el.classList.remove('reveal', 'is-visible');
    el.style.removeProperty('--reveal-delay');
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      el.classList.add('in-view');
      if (!el.classList.contains('reveal')) return;
      el.classList.add('is-visible');
      // Drop reveal styles once done so hover transitions aren't delayed.
      const onEnd = (event) => {
        if (event.target !== el || event.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', onEnd);
        finish(el);
      };
      el.addEventListener('transitionend', onEnd);
      window.setTimeout(() => finish(el), 2000);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  tracked.forEach((el) => observer.observe(el));
}

initReveals();

// ========== COUNT-UP STATS ==========
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length || prefersReducedMotion) return;

  const ease = (t) => 1 - Math.pow(1 - t, 4);
  const run = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round(target * ease(t)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => {
    el.textContent = '0';
    observer.observe(el);
  });
}

initCounters();
