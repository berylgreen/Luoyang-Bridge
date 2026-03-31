/* ============================================================
   跨海飞虹 — 滚动动画系统
   ============================================================ */
const ScrollAnimations = {
  observers: [],
  init() {
    this.initRevealAnimations();
    this.initStaggerAnimations();
    this.initCounterAnimations();
    this.initProgressBar();
    this.initNavScrollBehavior();
    this.initBackToTop();
  },
  initRevealAnimations() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('reveal--visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => obs.observe(el));
    this.observers.push(obs);
  },
  initStaggerAnimations() {
    const els = document.querySelectorAll('.reveal-stagger');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('reveal-stagger--visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
    this.observers.push(obs);
  },
  initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { this.animateCounter(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => obs.observe(el));
    this.observers.push(obs);
  },
  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();
    const update = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(update);
      else el.textContent = prefix + target.toLocaleString() + suffix;
    };
    requestAnimationFrame(update);
  },
  initProgressBar() {
    const bar = document.querySelector('.nav__progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  },
  initNavScrollBehavior() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 80);
      this.updateActiveNavLink();
    }, { passive: true });
  },
  updateActiveNavLink() {
    const sections = document.querySelectorAll('.section[id]');
    const links = document.querySelectorAll('.nav__link[data-section]');
    if (!sections.length || !links.length) return;
    let cur = '';
    const sy = window.scrollY + window.innerHeight / 3;
    sections.forEach(s => { if (sy >= s.offsetTop) cur = s.id; });
    links.forEach(l => {
      l.classList.toggle('nav__link--active', l.getAttribute('data-section') === cur);
    });
  },
  initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('back-to-top--visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  },
  destroy() { this.observers.forEach(o => o.disconnect()); this.observers = []; }
};
