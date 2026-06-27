/* ── iOS Safari 100vh fix ──
   Safari's 100vh includes the browser chrome (address bar) which causes
   content to be clipped. We calculate the real viewport height and store
   it in --vh CSS variable used by .hero { min-height: calc(var(--vh)*100) }
── */
(function() {
  function setVH() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', function() {
    setTimeout(setVH, 150); // wait for browser chrome to resize
  });
})();

/* ── Safe localStorage wrapper (Safari private mode, WebView) ── */
var store = (function() {
  try {
    localStorage.setItem('_t', '1');
    localStorage.removeItem('_t');
    return localStorage;
  } catch(e) {
    return { _d: {}, getItem: function(k){ return this._d[k]||null; }, setItem: function(k,v){ this._d[k]=v; }, removeItem: function(k){ delete this._d[k]; } };
  }
})();

/* ── Safe smooth scroll ── */
function smoothScrollTo(target) {
  if (!target) return;
  if ('scrollBehavior' in document.documentElement.style) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', function() {

  /* ── Sticky header ── */
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* ── Mobile burger ── */
  var burger = document.getElementById('burger');
  var nav    = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function() {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        burger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  /* ── IntersectionObserver (guarded) ── */
  if ('IntersectionObserver' in window) {

    /* Active nav link on scroll */
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    var navObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          navLinks.forEach(function(l) { l.classList.remove('active-link'); });
          var active = document.querySelector('.nav__link[href="#' + e.target.id + '"]');
          if (active) active.classList.add('active-link');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function(s) { navObs.observe(s); });

    /* Fade-up animations */
    document.querySelectorAll(
      '.service-card, .benefit, .process__step, .industry-tag, .about__inner, .contact__inner'
    ).forEach(function(el) { el.classList.add('fade-up'); });

    var fadeObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e, i) {
        if (e.isIntersecting) {
          setTimeout(function() { e.target.classList.add('visible'); }, i * 60);
          fadeObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-up').forEach(function(el) { fadeObs.observe(el); });

    /* Counter animation */
    var counterObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(function(el) { counterObs.observe(el); });

  } else {
    /* Fallback: show all animated elements immediately */
    document.querySelectorAll(
      '.service-card, .benefit, .process__step, .industry-tag, .about__inner, .contact__inner'
    ).forEach(function(el) { el.classList.add('fade-up', 'visible'); });
    document.querySelectorAll('.counter').forEach(function(el) { animateCounter(el); });
  }

  function animateCounter(el) {
    var target = +el.dataset.target;
    var duration = 1800;
    var step = 16;
    var increment = target / (duration / step);
    var current = 0;
    var timer = setInterval(function() {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.round(current).toLocaleString();
    }, step);
  }

  /* ── Particle dots (pause when tab hidden) ── */
  var canvas = document.getElementById('particles');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, dots = [], rafId;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < 50; i++) {
      dots.push({
        x: Math.random() * (W || 1200),
        y: Math.random() * (H || 700),
        r: Math.random() * 2 + .5,
        dx: (Math.random() - .5) * .4,
        dy: (Math.random() - .5) * .4,
        o: Math.random() * .4 + .1
      });
    }

    function draw() {
      if (document.hidden) { rafId = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      dots.forEach(function(d) {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > W) d.dx *= -1;
        if (d.y < 0 || d.y > H) d.dy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232,160,32,' + d.o + ')';
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Contact form ── */
  var form = document.getElementById('contactForm');
  var successMsg = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = '...';

      var formData = new FormData(form);

      /* Use fetch if available, fallback to XHR */
      if (typeof fetch !== 'undefined') {
        fetch('https://formspree.io/f/mvzybjly', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).then(function(response) {
          onFormDone(response.ok, btn);
          if (response.ok) { form.reset(); }
        }).catch(function() { onFormDone(false, btn); });
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://formspree.io/f/mvzybjly');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onload = function() { onFormDone(xhr.status === 200, btn); if (xhr.status === 200) form.reset(); };
        xhr.onerror = function() { onFormDone(false, btn); };
        xhr.send(formData);
      }

      function onFormDone(ok, btn) {
        btn.disabled = false;
        var t = window.translations && window.translations[window.currentLang];
        btn.textContent = t ? t.form_submit : 'Nosūtīt pieteikumu';
        if (ok && successMsg) {
          successMsg.classList.add('visible');
          setTimeout(function() { successMsg.classList.remove('visible'); }, 5000);
        } else if (!ok) {
          alert('Kļūda. Lūdzu, mēģiniet vēlreiz.');
        }
      }
    });
  }

  /* ── Cookie Consent Popup ── */
  var cookieOverlay = document.getElementById('cookieOverlay');
  if (cookieOverlay && store.getItem('cookieAccepted')) {
    cookieOverlay.style.display = 'none';
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); smoothScrollTo(target); }
    });
  });

});

/* ── Cookie accept (called from inline onclick) ── */
function cookieAcceptFn() {
  try { store.setItem('cookieAccepted', '1'); } catch(e) {}
  var o = document.getElementById('cookieOverlay');
  if (!o) return;
  o.classList.add('hidden');
  setTimeout(function() { o.style.display = 'none'; }, 500);
}

/* ── Cookie popup language switcher ── */
function cookieLang(lang, btn) {
  // Update cookie popup buttons
  document.querySelectorAll('.cookie-lang-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');

  var texts = {
    lv: { cookie_title: 'PRIVĀTUMS UN SĪKDATNES', cookie_text: 'Mēs apstrādājam Jūsu datus, lai nodrošinātu vietnes darbību un apstrādātu pieteikumus. Turpinot lietot vietni, Jūs piekrītat mūsu <a href="privacy.html" target="_blank">Privātuma politikai</a>.', cookie_accept: 'PIEKRĪTU', cookie_reject: 'NORAIDĪT VISU', cookie_more: 'Privātuma politika' },
    en: { cookie_title: 'PRIVACY & COOKIES', cookie_text: 'We process your data to ensure website functionality and handle enquiries. By continuing to use this site, you agree to our <a href="privacy.html" target="_blank">Privacy Policy</a>.', cookie_accept: 'ACCEPT', cookie_reject: 'REJECT ALL', cookie_more: 'Privacy Policy' },
    ru: { cookie_title: 'КОНФИДЕНЦИАЛЬНОСТЬ И COOKIES', cookie_text: 'Мы обрабатываем ваши данные для обеспечения работы сайта и обработки заявок. Продолжая использовать сайт, вы соглашаетесь с нашей <a href="privacy.html" target="_blank">Политикой конфиденциальности</a>.', cookie_accept: 'ПРИНЯТЬ', cookie_reject: 'ОТКЛОНИТЬ ВСЁ', cookie_more: 'Политика конфиденциальности' }
  };

  var t = texts[lang];
  if (t) {
    var popup = document.getElementById('cookieOverlay');
    if (popup) {
      popup.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
      });
    }
  }

  try { store.setItem('siteLang', lang); } catch(e) {}
  if (typeof applyLang === 'function') {
    applyLang(lang);
  }
}
