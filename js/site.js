/* Mobile navigation toggle. Progressive enhancement: with JS off the nav
   list stays in the document and the stylesheet shows it at desktop widths. */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      btn.focus();
    }
  });
})();

/* Hero carousel — quiet crossfade with a progress hairline.
   Autoplay never starts for a visitor who asked for reduced motion, and it
   stops for good the moment someone takes control. That is WCAG 2.2.2:
   anything that moves on its own past five seconds needs a way to stop it. */
(function () {
  var box = document.querySelector('[data-hero-carousel]');
  if (!box) return;

  var slides = [].slice.call(box.querySelectorAll('.hero__slide'));
  var dots = [].slice.call(box.querySelectorAll('.hero__rail button'));
  if (slides.length < 2) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wait = parseInt(box.getAttribute('data-hero-carousel'), 10) || 6000;
  var at = 0, timer = null, stopped = calm;

  // one source of truth for the dwell: the fill animation is told how long
  // a frame lasts, so the bar can never drift out of step with the timer
  box.style.setProperty('--dwell', (wait / 1000) + 's');

  function show(next) {
    next = (next + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-on', i === next); });
    dots.forEach(function (d, i) {
      d.setAttribute('aria-current', i === next ? 'true' : 'false');
    });
    at = next;
  }

  function play() { clearInterval(timer); if (stopped) return; timer = setInterval(function () { show(at + 1); }, wait); }
  function pause() { clearInterval(timer); }
  function halt() { stopped = true; clearInterval(timer); box.classList.add('is-manual'); }

  dots.forEach(function (d, i) { d.addEventListener('click', function () { halt(); show(i); }); });
  box.addEventListener('mouseenter', pause);
  box.addEventListener('mouseleave', play);
  box.addEventListener('focusin', pause);
  box.addEventListener('focusout', play);

  show(0);
  play();
})();

/* Gallery lightbox.
   Progressive enhancement: with JS off the thumbnails are still buttons that
   do nothing, and the gallery reads as a grid of photographs, which is fine.
   With JS on, a click opens the full frame and you can move through the whole
   set with the arrows, the keyboard, or a swipe. */
(function () {
  var grid = document.querySelector('[data-gallery]');
  var box = document.getElementById('lightbox');
  if (!grid || !box) return;

  var shots = [].slice.call(grid.querySelectorAll('button[data-full]'));
  if (!shots.length) return;

  var img = box.querySelector('[data-lb-img]');
  var cap = box.querySelector('[data-lb-cap]');
  var pos = box.querySelector('[data-lb-pos]');
  var at = 0, opener = null;

  function render(i) {
    at = (i + shots.length) % shots.length;
    var b = shots[at];
    img.src = b.getAttribute('data-full');
    img.alt = b.querySelector('img').alt;
    if (cap) cap.textContent = b.querySelector('img').alt;
    if (pos) pos.textContent = (at + 1) + ' / ' + shots.length;
  }

  function open(i) {
    opener = document.activeElement;
    render(i);
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    box.querySelector('[data-lb-close]').focus();
  }

  function close() {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    img.removeAttribute('src');
    if (opener && opener.focus) opener.focus();
  }

  shots.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
  box.querySelector('[data-lb-close]').addEventListener('click', close);
  box.querySelector('[data-lb-prev]').addEventListener('click', function () { render(at - 1); });
  box.querySelector('[data-lb-next]').addEventListener('click', function () { render(at + 1); });

  // clicking the backdrop closes; clicking the photograph or a control does not
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lightbox__frame')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { render(at - 1); return; }
    if (e.key === 'ArrowRight') { render(at + 1); return; }
    if (e.key === 'Tab') {                       // keep focus inside the dialog
      var f = [].slice.call(box.querySelectorAll('button'));
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) render(at + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
})();
