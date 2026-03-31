/* ============================================================
   洛阳古渡·万安长虹 — 横向滚动控制器
   Scroll: 鼠标滚轮/触摸驱动的水平长卷滚动
   ============================================================ */
(function () {
  'use strict';

  const container = document.querySelector('.scroll-container');
  const panels = document.querySelectorAll('.panel');
  const navDots = document.querySelectorAll('.nav-dot');
  const progressFill = document.querySelector('.progress-fill');
  const scrollHint = document.querySelector('.scroll-hint');

  let currentX = 0;
  let targetX = 0;
  let maxScroll = 0;
  let isAnimating = false;

  function init() {
    calcBounds();
    window.addEventListener('resize', calcBounds);
    // Desktop: wheel → horizontal scroll
    window.addEventListener('wheel', onWheel, { passive: false });
    // Mobile: touch swipe
    let touchStartX = 0, touchStartY = 0;
    window.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      const dx = touchStartX - e.touches[0].clientX;
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
        targetX = clamp(targetX + dx * 1.5);
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: false });
    // Keyboard
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { targetX = clamp(targetX + window.innerWidth * 0.3); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { targetX = clamp(targetX - window.innerWidth * 0.3); e.preventDefault(); }
    });
    // Nav dots
    navDots.forEach((dot, i) => {
      dot.addEventListener('click', () => { targetX = i * window.innerWidth; });
    });
    // Start animation loop
    requestAnimationFrame(loop);
  }

  function calcBounds() {
    maxScroll = (panels.length - 1) * window.innerWidth;
  }

  function clamp(val) {
    return Math.max(0, Math.min(val, maxScroll));
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetX = clamp(targetX + delta * 1.2);
  }

  function loop() {
    // Smooth scroll lerp
    currentX += (targetX - currentX) * 0.1;
    if (Math.abs(currentX - targetX) < 0.5) currentX = targetX;
    container.style.transform = `translateX(${-currentX}px)`;

    // Progress bar
    const progress = maxScroll > 0 ? (currentX / maxScroll) * 100 : 0;
    if (progressFill) progressFill.style.width = `${progress}%`;

    // Active nav dot
    const activeIdx = Math.round(currentX / window.innerWidth);
    navDots.forEach((dot, i) => {
      dot.classList.toggle('nav-dot--active', i === activeIdx);
    });

    // Hide scroll hint after first scroll
    if (scrollHint && currentX > 50) {
      scrollHint.style.opacity = '0';
      scrollHint.style.transition = 'opacity 0.5s ease';
    }

    // Reveal animations for active panel
    panels.forEach((panel, i) => {
      const panelLeft = i * window.innerWidth;
      const panelRight = panelLeft + window.innerWidth;
      const isVisible = currentX + window.innerWidth > panelLeft && currentX < panelRight;
      const reveals = panel.querySelectorAll('.reveal');
      reveals.forEach(el => {
        el.classList.toggle('reveal--visible', isVisible);
      });
    });

    // Parallax
    panels.forEach((panel, i) => {
      const offset = currentX - i * window.innerWidth;
      const parallaxLayers = panel.querySelectorAll('.parallax-layer');
      parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed || 0.3);
        layer.style.transform = `translateX(${offset * speed}px)`;
      });
    });

    requestAnimationFrame(loop);
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
