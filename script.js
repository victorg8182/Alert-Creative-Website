// ========== CONFIG (editable via Tweaks) ==========
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0A0A0A",
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

const newsletterForm = document.querySelector('.foot-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = newsletterForm.querySelector('button');
    if (button) button.textContent = 'Subscribed ✓';
  });
}

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

function initLuxuryScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let targetY = window.scrollY || window.pageYOffset;
  let currentY = targetY;
  let rafId = null;

  const clampTarget = (value) => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(Math.max(value, 0), maxScroll);
  };

  const animate = () => {
    const delta = targetY - currentY;
    currentY += delta * 0.06;

    if (Math.abs(delta) < 0.35) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      rafId = null;
      return;
    }

    window.scrollTo(0, currentY);
    rafId = window.requestAnimationFrame(animate);
  };

  const kickAnimation = () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(animate);
  };

  window.addEventListener(
    'wheel',
    (event) => {
      if (!event.cancelable) return;
      event.preventDefault();
      targetY = clampTarget(targetY + event.deltaY * 0.7);
      kickAnimation();
    },
    { passive: false }
  );

  window.addEventListener('scroll', () => {
    if (rafId === null) {
      targetY = window.scrollY || window.pageYOffset;
      currentY = targetY;
    }
  });

  window.addEventListener('resize', () => {
    targetY = clampTarget(targetY);
  });
}

initLuxuryScroll();

function initXCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'x-cursor';
  const ring = document.createElement('div');
  ring.className = 'x-cursor-ring';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let dotX = targetX;
  let dotY = targetY;
  let ringX = targetX;
  let ringY = targetY;
  let rafId = null;

  const animate = () => {
    dotX += (targetX - dotX) * 0.3;
    dotY += (targetY - dotY) * 0.3;
    ringX += (targetX - ringX) * 0.14;
    ringY += (targetY - ringY) * 0.14;

    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    rafId = window.requestAnimationFrame(animate);
  };

  const onMove = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    if (!rafId) rafId = window.requestAnimationFrame(animate);
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
}

initXCursor();

function flagSafariBrowser() {
  const ua = navigator.userAgent;
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR/i.test(ua);
  document.documentElement.classList.toggle('is-safari', isSafari);
}

flagSafariBrowser();

function initSubtleReveals() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const groups = [
    '.hero-v4 .hv4-row, .hero-v4 .hv4-sub',
    '.services-strip > *',
    '.grid .tile',
    '.section-index-strip > *',
    '.stats-v2-lead > *',
    '.stats-v2-cards .stat-box',
    '.founder > *',
    '.contact-v2 > *'
  ];

  const revealItems = groups.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
  revealItems.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min((index % 6) * 45, 180)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

initSubtleReveals();
