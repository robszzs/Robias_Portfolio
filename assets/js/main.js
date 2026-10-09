(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Fade sections in as they scroll into view
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  }

  // Nav: add a shadow once the page scrolls, highlight the current section
  var nav = document.querySelector('.topnav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    var links = {};
    document.querySelectorAll('.navlinks a[href^="#"]').forEach(function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (link && entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // Copy email to clipboard with a small confirmation toast
  var toast = document.querySelector('.toast');
  var toastTimer;
  var showToast = function (msg) {
    toast.textContent = msg;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-shown'); }, 2200);
  };
  var fallbackCopy = function (text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  };
  // Contact form: send through Web3Forms, or fall back to a pre-filled email
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var key = data.get('access_key');
      var btn = form.querySelector('button[type="submit"]');

      if (!key || key.indexOf('YOUR_') === 0 || !window.fetch) {
        var body = data.get('message') + '\n\n— ' + data.get('name') + ' (' + data.get('email') + ')';
        window.location.href = 'mailto:robiasjenwille@gmail.com?subject=' +
          encodeURIComponent('Project inquiry from ' + data.get('name')) +
          '&body=' + encodeURIComponent(body);
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (!json.success) throw new Error(json.message);
          form.reset();
          showToast('Thanks! Your message was sent. I’ll reply within 24 hours.');
        })
        .catch(function () {
          showToast('Couldn’t send. Please email robiasjenwille@gmail.com instead.');
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = 'Send message';
        });
    });
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      var done = function () { showToast('Email copied: ' + text); };
      var fail = function () {
        if (fallbackCopy(text)) done();
        else showToast('Couldn’t copy. The address is ' + text);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        fail();
      }
    });
  });
})();
