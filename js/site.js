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

  function show(next) {
    next = (next + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-on', i === next); });
    dots.forEach(function (d, i) {
      var bar = d.querySelector('span');
      if (bar) {                       // restart the fill on the segment now playing
        bar.style.transition = 'none';
        bar.style.width = '0';
        void bar.offsetHeight;
        bar.style.transition = '';
      }
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
