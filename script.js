/* =========================================================================
   LOREM IPSUM — PLANTILLA EDITORIAL — script.js
   Índice:
   1. Utilidades
   2. Navbar (scroll state + menú móvil)
   3. Revelado en scroll (IntersectionObserver)
   4. Parallax del Hero (mouse + scroll)
   5. Slider de testimonios
   6. Botón "volver arriba"
   7. Formulario de newsletter
   8. Enlaces internos (cierre de menú móvil)
   9. Modal de tarjetas (motivo de contacto)
   10. Botones de WhatsApp (Navbar, CTA y flotante)
   ========================================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
     0. DATOS DE PLANES Y COTIZACIÓN (TVU UMSA)
     ----------------------------------------------------------------- */
  const WHATSAPP_NUMBER = '59165677580';

  const GENERAL_WHATSAPP_MESSAGE = 'Hola, TVU UMSA. Visité su página web y estoy interesado(a) en contratar una cobertura para mi fraternidad. Me gustaría recibir asesoramiento para conocer cuál de sus planes se adapta mejor a mis necesidades, además de información sobre el proceso de contratación, requisitos y formas de pago. Muchas gracias.';

  const PLAN_DATA = {
    'Plan Inicio': {
      price: 'Bs 300',
      badge: 'Anunciante',
      features: [
        'Publicación del anuncio de convocatoria.',
        'Difusión en las plataformas digitales de TVU UMSA.',
        'Contenido proporcionado por la fraternidad.'
      ]
    },
    'Plan Destacado': {
      price: 'Bs 500',
      badge: 'Más solicitado',
      features: [
        'Producción de un video promocional.',
        'Edición personalizada.',
        'Coordinación previa con la fraternidad para la planificación de la grabación.',
        'Publicación y difusión en plataformas de TVU UMSA.'
      ]
    },
    'Plan Premium': {
      price: 'Bs 650',
      badge: 'Recomendado',
      features: [
        'Producción audiovisual de mayor nivel.',
        'Planificación conjunta entre el equipo de TVU y la fraternidad.',
        'Edición personalizada con mayor dedicación.',
        'Difusión prioritaria en las plataformas de TVU UMSA.'
      ]
    },
    'Plan Esencial': {
      price: 'Bs 500',
      badge: 'Edición esencial',
      features: [
        'Edición de video. Duración 20 segundos.',
        'Pleca personalizada con el nombre de la fraternidad.',
        'Entrega en formato digital.'
      ]
    },
    'Plan Streaming': {
      price: 'Bs 700',
      badge: 'Más contratado',
      features: [
        'Edición de video. Duración 30 segundos.',
        'Pleca personalizada con el nombre de la fraternidad.',
        'Coordinación previa con la fraternidad.'
      ]
    },
    'Plan Producción Total': {
      price: 'Bs 900',
      badge: 'Experiencia completa',
      features: [
        'Cobertura durante el recorrido.',
        'Pleca personalizada con el nombre de la fraternidad.',
        'Transmisión en vivo.',
        'Producción audiovisual personalizada.',
        'Edición de video. Duración 60 segundos.',
        'Planificación previa junto al equipo de TVU.',
        'Atención prioritaria durante la cobertura.',
        'Entrega prioritaria del material editado.'
      ]
    }
  };

  /* -----------------------------------------------------------------
     1. UTILIDADES
     ----------------------------------------------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Ejecuta un callback como máximo una vez por frame (evita jank en scroll/mousemove) */
  function rafThrottle(callback) {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
    };
  }

  /* -----------------------------------------------------------------
     2. NAVBAR — estado al hacer scroll + menú móvil
     ----------------------------------------------------------------- */
  function initNavbar() {
    const navbar = $('#navbar');
    const burger = $('#burgerBtn');
    const menu   = $('#navMenu');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 40;

    const updateNavbarState = rafThrottle(() => {
      navbar.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    });

    window.addEventListener('scroll', updateNavbarState, { passive: true });
    updateNavbarState();

    if (burger && menu) {
      burger.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        burger.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }
  }

  function closeMobileMenu() {
    const burger = $('#burgerBtn');
    const menu   = $('#navMenu');
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* -----------------------------------------------------------------
     3. REVELADO EN SCROLL
     Cada elemento [data-reveal] se anima al entrar en el viewport.
     data-delay controla el escalonado (0, 1, 2…) → ms progresivos.
     ----------------------------------------------------------------- */
  function initScrollReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    // Aplica el retraso escalonado como transition-delay inline
    items.forEach(el => {
      const step = parseInt(el.getAttribute('data-delay') || '0', 10);
      el.style.transitionDelay = `${step * 130}ms`;
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-inview'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    });

    items.forEach(el => observer.observe(el));
  }

  /* -----------------------------------------------------------------
     4. PARALLAX DEL HERO
     Capas con distinta profundidad: imagen principal, tarjetas
     flotantes y elementos decorativos responden al mouse y al scroll.
     ----------------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReducedMotion) return;

    const hero = $('.hero');
    if (!hero) return;

    const layers = [
      { el: $('.hero__image-wrap'), depth: 10 },
      { el: $('.float-card--top'),  depth: 22 },
      { el: $('.float-card--bottom'), depth: 26 },
      { el: $('.deco-ring'), depth: 34 },
      { el: $('.deco-dots'), depth: 18 }
    ].filter(layer => layer.el);

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (isFinePointer) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      });
      hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });
    }

    // Parallax de scroll: la escena se desplaza ligeramente al bajar
    let scrollFactor = 0;
    const updateScrollFactor = rafThrottle(() => {
      scrollFactor = clamp(window.scrollY / (window.innerHeight || 1), 0, 1);
    });
    window.addEventListener('scroll', updateScrollFactor, { passive: true });

    function animate() {
      // Interpolación suave (easing) hacia el valor objetivo
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      layers.forEach(({ el, depth }) => {
        const tx = currentX * depth;
        const ty = currentY * depth * 0.6 - scrollFactor * depth * 1.4;
        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      });

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* -----------------------------------------------------------------
     5. SLIDER DE TESTIMONIOS
     ----------------------------------------------------------------- */
  function initTestimonialSlider() {
    const track = $('#testimonialTrack');
    const dotsWrap = $('#testimonialDots');
    if (!track || !dotsWrap) return;

    const slides = $$('.testimonial__slide', track);
    const dots = $$('.dot', dotsWrap);
    let current = 0;
    let autoplayId = null;
    const AUTOPLAY_MS = 5500;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    function next() { goTo(current + 1); }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayId = setInterval(next, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (autoplayId) clearInterval(autoplayId);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startAutoplay();
      });
    });

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* -----------------------------------------------------------------
     6. BOTÓN "VOLVER ARRIBA"
     ----------------------------------------------------------------- */
  function initToTop() {
    const btn = $('#toTopBtn');
    if (!btn) return;

    const updateVisibility = rafThrottle(() => {
      btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    });
    window.addEventListener('scroll', updateVisibility, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* -----------------------------------------------------------------
     7. FORMULARIO DE NEWSLETTER (simulado, sin backend)
     ----------------------------------------------------------------- */
  function initNewsletterForm() {
    const form = $('#newsletterForm');
    const msg  = $('#newsletterMsg');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input', form);
      if (!input.value) return;
      msg.textContent = 'Lorem ipsum — dolor sit amet consectetur.';
      input.value = '';
      setTimeout(() => { msg.textContent = ''; }, 4000);
    });
  }

  /* -----------------------------------------------------------------
     8. ENLACES INTERNOS — cierre de menú móvil al navegar
     ----------------------------------------------------------------- */
  function initAnchorLinks() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => closeMobileMenu());
    });
  }

  /* -----------------------------------------------------------------
     9. MODAL DE TARJETAS — abre al hacer clic en una tarjeta,
        cierra con la X, el fondo o Escape, y simula el envío.
     ----------------------------------------------------------------- */
  function initCardModal() {
    const modal = $('#cardModal');
    if (!modal) return;

    const dialog        = $('.modal__dialog', modal);
    const closeTriggers = $$('[data-modal-close]', modal);
    const titleEl        = $('#modalTitle', modal);
    const visualLabelEl  = $('#modalVisualLabel', modal);
    const chipAEl        = $('#modalChipA', modal);
    const quoteWrap      = $('#modalQuote', modal);
    const quoteBadgeEl   = $('#modalQuoteBadge', modal);
    const quotePriceEl   = $('#modalQuotePrice', modal);
    const featuresListEl = $('#modalFeatures', modal);
    const form            = $('#modalForm', modal);
    const textarea        = $('#modalReason', modal);
    const nombreInput     = $('#modalNombre', modal);
    const fraternidadInput = $('#modalFraternidad', modal);
    const planSelect      = $('#modalPlanSelect', modal);
    const msg              = $('#modalMsg', modal);
    const cards            = $$('.card');

    let lastFocused = null;
    let currentPlanTitle = '';

    function openModal(card) {
      lastFocused = document.activeElement;

      const cardTitle = card?.querySelector('.card__title')?.textContent.trim();
      currentPlanTitle = cardTitle || '';

      if (titleEl) {
        titleEl.textContent = cardTitle ? `Información — ${cardTitle}` : 'Solicita tu Cotización';
      }

      const plan = cardTitle ? PLAN_DATA[cardTitle] : null;

      if (plan) {
        if (visualLabelEl) visualLabelEl.textContent = cardTitle;
        if (chipAEl) chipAEl.textContent = plan.badge;

        if (quoteBadgeEl) quoteBadgeEl.textContent = plan.badge;
        if (quotePriceEl) quotePriceEl.textContent = plan.price;
        if (quoteWrap) quoteWrap.hidden = false;

        if (featuresListEl) {
          featuresListEl.innerHTML = plan.features
            .map(feature => `<li>${feature}</li>`)
            .join('');
        }

        if (planSelect) {
          planSelect.value = cardTitle;
          planSelect.disabled = true;
        }
      } else {
        if (visualLabelEl) visualLabelEl.textContent = 'TVU UMSA';
        if (chipAEl) chipAEl.textContent = 'Promociones';
        if (quoteWrap) quoteWrap.hidden = true;
        if (featuresListEl) featuresListEl.innerHTML = '';

        if (planSelect) {
          planSelect.disabled = false;
          planSelect.value = '';
        }
      }

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      window.setTimeout(() => nombreInput?.focus(), prefersReducedMotion ? 0 : 260);
      document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);

      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();

      if (msg) msg.textContent = '';
      form?.reset();
      if (planSelect) planSelect.disabled = false;
      dialog?.classList.remove('is-sent');
    }

    function onKeydown(e) {
      if (e.key === 'Escape') closeModal();
    }

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const link = card.querySelector('.card__link');
        if (link && (e.target === link || link.contains(e.target))) {
          e.preventDefault();
        }
        openModal(card);
      });
    });

    closeTriggers.forEach(trigger => trigger.addEventListener('click', closeModal));

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const plan = PLAN_DATA[currentPlanTitle];
      const planName = currentPlanTitle.replace(/^Plan\s+/i, '');

      const nombre = nombreInput?.value.trim();
      const fraternidad = fraternidadInput?.value.trim();
      const mensaje = textarea?.value.trim();
      const selectedPlan = planSelect && !planSelect.disabled ? planSelect.value : '';

      let waTemplate;

      if (plan) {
        waTemplate = `Hola, TVU UMSA. Soy ${nombre || '[nombre]'}${fraternidad ? `, de ${fraternidad}` : ''}. Me interesa cotizar el Plan ${planName} ${plan.price} para mi fraternidad. Quisiera conocer los requisitos, el proceso de contratación, las formas de pago y cualquier información adicional necesaria para realizar la contratación.${mensaje ? ` Detalle adicional: ${mensaje}.` : ''} Muchas gracias.`;
      } else {
        const planDetail = selectedPlan && selectedPlan !== 'OTRO'
          ? ` Me interesa el ${selectedPlan} (${PLAN_DATA[selectedPlan]?.price || 'a cotizar'}).`
          : '';
        waTemplate = (nombre || fraternidad || mensaje || planDetail)
          ? `Hola, TVU UMSA. Soy ${nombre || '[nombre]'}${fraternidad ? `, de ${fraternidad}` : ''}. Estoy interesado(a) en solicitar una cotización.${planDetail} ${mensaje ? `Requerimiento: ${mensaje}.` : ''} Quisiera recibir asesoramiento sobre el proceso de contratación, requisitos y formas de pago. Muchas gracias.`
          : GENERAL_WHATSAPP_MESSAGE;
      }

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waTemplate)}`;

      dialog?.classList.add('is-sent');
      if (msg) msg.textContent = 'Tu cotización fue preparada — te llevamos a WhatsApp para enviarla.';

      window.open(waUrl, '_blank');
      window.setTimeout(closeModal, 2200);
    });
  }

  /* -----------------------------------------------------------------
     9b. MODAL DE CONTACTO — abre únicamente con el botón "Solicitar
         Cotización" de la sección CTA (#ctaWhatsappBtn). Es independiente
         de #cardModal: tiene sus propios elementos, su propio
         open/close y su propio envío por WhatsApp.
     ----------------------------------------------------------------- */
  function initContactModal() {
    const modal = $('#contactModal');
    if (!modal) return;

    const dialog        = $('.modal__dialog', modal);
    const closeTriggers = $$('[data-modal-close]', modal);
    const form           = $('#contactModalForm', modal);
    const nombreInput    = $('#contactNombre', modal);
    const fraternidadInput = $('#contactFraternidad', modal);
    const planSelect     = $('#contactPlanSelect', modal);
    const textarea       = $('#contactReason', modal);
    const msg             = $('#contactModalMsg', modal);

    let lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      window.setTimeout(() => nombreInput?.focus(), prefersReducedMotion ? 0 : 260);
      document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);

      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();

      if (msg) msg.textContent = '';
      form?.reset();
      dialog?.classList.remove('is-sent');
    }

    function onKeydown(e) {
      if (e.key === 'Escape') closeModal();
    }

    // Único disparador: el botón "Solicitar Cotización" del CTA.
    const ctaBtn = $('#ctaWhatsappBtn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    closeTriggers.forEach(trigger => trigger.addEventListener('click', closeModal));

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = nombreInput?.value.trim();
      const fraternidad = fraternidadInput?.value.trim();
      const mensaje = textarea?.value.trim();
      const selectedPlan = planSelect?.value || '';

      const planDetail = selectedPlan && selectedPlan !== 'OTRO'
        ? ` Me interesa el ${selectedPlan} (${PLAN_DATA[selectedPlan]?.price || 'a cotizar'}).`
        : '';

      const waTemplate = (nombre || fraternidad || mensaje || planDetail)
        ? `Hola, TVU UMSA. Soy ${nombre || '[nombre]'}${fraternidad ? `, de ${fraternidad}` : ''}. Estoy interesado(a) en solicitar una cotización.${planDetail} ${mensaje ? `Requerimiento: ${mensaje}.` : ''} Quisiera recibir asesoramiento sobre el proceso de contratación, requisitos y formas de pago. Muchas gracias.`
        : GENERAL_WHATSAPP_MESSAGE;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waTemplate)}`;

      dialog?.classList.add('is-sent');
      if (msg) msg.textContent = 'Tu cotización fue preparada — te llevamos a WhatsApp para enviarla.';

      window.open(waUrl, '_blank');
      window.setTimeout(closeModal, 2200);
    });
  }

  /* -----------------------------------------------------------------
     10. BOTONES DE COTIZACIÓN GENERAL — Navbar y flotante de WhatsApp;
         abren el mensaje general directo (no ligado a un plan
         específico). El botón de la sección Cotización (CTA) abre el
         modal de contacto en su lugar (ver initContactModal).
     ----------------------------------------------------------------- */
  function initGeneralWhatsappButtons() {
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(GENERAL_WHATSAPP_MESSAGE)}`;
    const selectors = ['#navWhatsappBtn', '#whatsappFloatBtn'];

    selectors.forEach(sel => {
      const btn = $(sel);
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(waUrl, '_blank');
      });
    });
  }

  /* -----------------------------------------------------------------
     INIT
     ----------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollReveal();
    initHeroParallax();
    initTestimonialSlider();
    initToTop();
    initNewsletterForm();
    initAnchorLinks();
    initCardModal();
    initContactModal();
    initGeneralWhatsappButtons();
  });
})();
