// ── Mobile nav toggle ──
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ── Scroll reveal ──
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // ── Count-up animation ──
  var counters = document.querySelectorAll('.num[data-to]');
  if (counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-to'), 10);
        var duration = 1600;
        var start = performance.now();
        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var suffix = el.getAttribute('data-suffix') || '+';
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  // ── Contact form (FormSubmit) ──
  var form = document.querySelector('#quote-form');
  if (form) {
    var endpoint = 'https://formsubmit.co/ajax/thelightconstructioncompany@gmail.com';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      var data = Object.fromEntries(new FormData(form).entries());
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) { if (!res.ok) throw new Error('Request failed'); return res.json(); })
        .then(function () { btn.textContent = 'Request Sent ✓'; form.reset(); })
        .catch(function () { btn.textContent = 'Could not send — try WhatsApp'; })
        .finally(function () { setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 3000); });
    });
  }

  // ── Project image data ──
  // To add a new category: just add a key here and data-project="key" on the card.
  // Shared images work naturally — same path in multiple arrays.
  var projectImages = {
    residential: [
      'images/proj-1.jpg',
      'images/proj-2.jpg',
      'images/proj-3.jpg',
      'images/proj-6.jpg',
      'images/proj-7.jpg',
      'images/proj-9.jpg',
      'images/proj-10.jpg',
      'images/proj-11.jpg',
      'images/proj-12.jpg',
      'images/proj-13.jpg',
      'images/proj-14.jpg',
      'images/proj-15.jpg',
      'images/proj-16.jpg',
    ],
    commercial: [
      'images/proj-4.jpg',
      'images/proj-18.jpg',
      'images/proj-19.jpg',
      'images/proj-23.jpg',
      'images/proj-25.jpg',
      'images/proj-11.jpg',
      'images/proj-27.jpg',
      'images/proj-18.jpg',
      'images/proj-19.jpg',
    ],
    renovation: [
      'images/proj-17.jpg',
      'images/proj-6.jpg',
      'images/proj-17.jpg',
      'images/proj-13.jpg',
      'images/proj-10.jpg',
      'images/proj-4.jpg',
      'images/proj-15.jpg',
      'images/proj-20.jpg',
      'images/proj-22.jpg',
      'images/proj-23.jpg',
      'images/proj-24.jpg',
      'images/proj-26.jpg'
    ],
    manufacturing: [
      'images/proj-18.jpg',
      'images/proj-8.jpg',
      // 'images/proj-15.jpg',
    ],
    management: [
      'images/proj-8.jpg',
      'images/proj-9.jpg',
      'images/proj-11.jpg',
      'images/proj-12.jpg',
      'images/proj-13.jpg',
      'images/proj-19.jpg',
      'images/proj-27.jpg'
    ]
  };

  // ── ProjectSlider class ──
  class ProjectSlider {
    constructor(card, images) {
      this.card = card;
      this.thumb = card.querySelector('.proj-thumb');
      this.images = images;
      this.current = 0;
      this.dragging = false;
      this.startX = 0;
      this.dragOffset = 0;
      this.animating = false;

      if (!this.thumb || !this.images.length) return;
      this.build();
      this.attachEvents();
      this.goTo(0, false);
    }

    build() {
      // Clear placeholder
      this.thumb.innerHTML = '';

      // Track
      this.track = document.createElement('div');
      this.track.className = 'pjs-track';
      this.track.setAttribute('role', 'region');
      this.track.setAttribute('aria-label', 'Project image gallery');
      this.track.setAttribute('tabindex', '0');

      // Slides
      this.images.forEach(function (src, i) {
        var slide = document.createElement('div');
        slide.className = 'pjs-slide';
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Project photo ' + (i + 1);
        img.loading = 'lazy';
        img.draggable = false;
        slide.appendChild(img);
        this.track.appendChild(slide);
      }.bind(this));

      this.thumb.appendChild(this.track);

      // Counter
      this.counter = document.createElement('span');
      this.counter.className = 'pjs-counter';
      this.thumb.appendChild(this.counter);

      // Prev / Next
      this.prevBtn = document.createElement('button');
      this.prevBtn.className = 'pjs-arrow pjs-prev';
      this.prevBtn.setAttribute('aria-label', 'Previous image');
      this.prevBtn.innerHTML = '&#10094;';

      this.nextBtn = document.createElement('button');
      this.nextBtn.className = 'pjs-arrow pjs-next';
      this.nextBtn.setAttribute('aria-label', 'Next image');
      this.nextBtn.innerHTML = '&#10095;';

      this.thumb.appendChild(this.prevBtn);
      this.thumb.appendChild(this.nextBtn);
    }

    goTo(index, animate) {
      if (this.animating) return;
      var total = this.images.length;
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      this.current = index;

      if (animate !== false) {
        this.animating = true;
        var self = this;
        setTimeout(function () { self.animating = false; }, 350);
      }

      this.track.style.transform = 'translateX(-' + (index * 100) + '%)';
      this.counter.textContent = (index + 1) + ' / ' + total;
    }

    next() { this.goTo(this.current + 1); }
    prev() { this.goTo(this.current - 1); }

    attachEvents() {
      var self = this;

      // Button clicks
      this.prevBtn.addEventListener('click', function (e) { e.stopPropagation(); self.prev(); });
      this.nextBtn.addEventListener('click', function (e) { e.stopPropagation(); self.next(); });

      // Keyboard
      this.track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); self.prev(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); self.next(); }
      });

      // Touch / mouse drag
      var onStart = function (x) {
        self.dragging = true;
        self.startX = x;
        self.dragOffset = 0;
        self.track.style.transition = 'none';
      };
      var onMove = function (x) {
        if (!self.dragging) return;
        self.dragOffset = x - self.startX;
        var base = -self.current * 100;
        var pct = (self.dragOffset / self.thumb.offsetWidth) * 100;
        self.track.style.transform = 'translateX(' + (base + pct) + '%)';
      };
      var onEnd = function () {
        if (!self.dragging) return;
        self.dragging = false;
        self.track.style.transition = '';
        if (Math.abs(self.dragOffset) > 50) {
          if (self.dragOffset < 0) self.next();
          else self.prev();
        } else {
          self.goTo(self.current, false);
        }
      };

      // Touch events
      this.track.addEventListener('touchstart', function (e) { onStart(e.touches[0].clientX); }, { passive: true });
      this.track.addEventListener('touchmove', function (e) { onMove(e.touches[0].clientX); }, { passive: true });
      this.track.addEventListener('touchend', onEnd);

      // Mouse drag
      this.track.addEventListener('mousedown', function (e) { e.preventDefault(); onStart(e.clientX); });
      document.addEventListener('mousemove', function (e) { onMove(e.clientX); });
      document.addEventListener('mouseup', onEnd);
    }
  }

  // ── Auto-init all project cards ──
  document.querySelectorAll('.proj-card[data-project]').forEach(function (card) {
    var key = card.getAttribute('data-project');
    if (projectImages[key] && projectImages[key].length) {
      new ProjectSlider(card, projectImages[key]);
    }
  });
});
