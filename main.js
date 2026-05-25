document.addEventListener('DOMContentLoaded', () => {

  /* ── Sticky header ── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ── Mobile burger ── */
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
    });
  });

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active-link'));
        const active = document.querySelector(`.nav__link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active-link');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));

  /* ── Fade-up animations ── */
  document.querySelectorAll(
    '.service-card, .benefit, .process__step, .industry-tag, .about__inner, .contact__inner'
  ).forEach(el => el.classList.add('fade-up'));

  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        fadeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

  /* ── Counter animation ── */
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

  function animateCounter(el) {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.round(current).toLocaleString();
    }, step);
  }

  /* ── Particle dots ── */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, dots = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      dots.push({
        x: Math.random() * (W || 1200),
        y: Math.random() * (H || 700),
        r: Math.random() * 2 + .5,
        dx: (Math.random() - .5) * .4,
        dy: (Math.random() - .5) * .4,
        o: Math.random() * .4 + .1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > W) d.dx *= -1;
        if (d.y < 0 || d.y > H) d.dy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,160,32,${d.o})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Contact form ── */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = '...';

      try {
        const response = await fetch('https://formspree.io/f/mvzybjly', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          successMsg.classList.add('visible');
          setTimeout(() => successMsg.classList.remove('visible'), 5000);
        } else {
          alert('Kļūda. Lūdzu, mēģiniet vēlreiz.');
        }
      } catch (err) {
        alert('Kļūda. Lūdzu, mēģiniet vēlreiz.');
      }

      btn.disabled = false;
      const t = window.translations && window.translations[window.currentLang];
      btn.textContent = t ? t.form_submit : 'Nosūtīt pieteikumu';
    });
  }

  /* ── Cookie Consent Popup ── */
  const cookieOverlay = document.getElementById('cookieOverlay');
  const cookieAccept  = document.getElementById('cookieAccept');
  if (cookieOverlay) {
    if (localStorage.getItem('cookieAccepted')) {
      cookieOverlay.style.display = 'none';
    }
    if (cookieAccept) {
      cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', '1');
        cookieOverlay.classList.add('hidden');
        setTimeout(() => cookieOverlay.style.display = 'none', 500);
      });
    }
  }

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
