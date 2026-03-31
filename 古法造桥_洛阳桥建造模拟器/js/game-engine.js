/* ============================================================
   古法造桥 — 游戏引擎
   Core: Canvas rendering, game loop, input, scene management
   ============================================================ */
class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.W = 0; this.H = 0;
    this.running = false;
    this.lastTime = 0;
    this.dt = 0;
    this.mouse = { x: 0, y: 0, down: false, clicked: false, released: false };
    this.dragItem = null;
    this.resizeCanvas();
    this._bindEvents();
  }

  resizeCanvas() {
    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());
    const getPos = (e) => {
      const r = this.canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      if (!t) return { x: this.mouse.x, y: this.mouse.y };
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };
    this.canvas.addEventListener('mousemove', e => { const p = getPos(e); this.mouse.x = p.x; this.mouse.y = p.y; });
    this.canvas.addEventListener('mousedown', e => { this.mouse.down = true; this.mouse.clicked = true; });
    this.canvas.addEventListener('mouseup', () => { this.mouse.down = false; this.mouse.released = true; });
    this.canvas.addEventListener('touchmove', e => { e.preventDefault(); const p = getPos(e); this.mouse.x = p.x; this.mouse.y = p.y; }, { passive: false });
    this.canvas.addEventListener('touchstart', e => { const p = getPos(e); this.mouse.x = p.x; this.mouse.y = p.y; this.mouse.down = true; this.mouse.clicked = true; });
    this.canvas.addEventListener('touchend', e => { this.mouse.down = false; this.mouse.released = true; });
  }

  start(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.running = true;
    this.lastTime = performance.now();
    this._loop();
  }

  stop() { this.running = false; }

  _loop() {
    if (!this.running) return;
    const now = performance.now();
    this.dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.updateFn(this.dt);
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.renderFn(this.ctx);
    this.mouse.clicked = false;
    this.mouse.released = false;
    requestAnimationFrame(() => this._loop());
  }

  // ===== Drawing Helpers =====
  drawSky(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.H * 0.5);
    grad.addColorStop(0, '#0a0e1a');
    grad.addColorStop(0.5, '#121a30');
    grad.addColorStop(1, '#1a2540');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H * 0.5);
    // Stars
    const starSeed = 42;
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137 + starSeed) % this.W);
      const sy = ((i * 97 + starSeed * 2) % (this.H * 0.35));
      const sr = 0.5 + (i % 3) * 0.5;
      ctx.fillStyle = `hsla(42,50%,90%,${0.2 + (i % 5) * 0.1})`;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawWater(ctx, waterLevel, time) {
    const wY = this.H * waterLevel;
    // Water body
    const grad = ctx.createLinearGradient(0, wY, 0, this.H);
    grad.addColorStop(0, '#1a5a7e');
    grad.addColorStop(0.3, '#14486a');
    grad.addColorStop(1, '#0a2a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, wY, this.W, this.H - wY);
    // Waves
    ctx.strokeStyle = 'hsla(195,60%,55%,0.15)';
    ctx.lineWidth = 1.5;
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      for (let x = 0; x <= this.W; x += 4) {
        const y = wY + Math.sin(x * 0.008 + time * 1.5 + w * 2) * 4 +
                  Math.sin(x * 0.015 + time * 0.8 + w) * 2 + w * 8;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Shimmering highlights
    ctx.fillStyle = 'hsla(42,60%,70%,0.04)';
    for (let i = 0; i < 8; i++) {
      const sx = ((i * 173 + 50) % this.W);
      const sy = wY + 20 + ((i * 67) % 80);
      const sw = 30 + (i % 4) * 20;
      ctx.fillRect(sx, sy + Math.sin(time + i) * 3, sw, 2);
    }
  }

  drawGround(ctx, groundY) {
    const grad = ctx.createLinearGradient(0, groundY, 0, this.H);
    grad.addColorStop(0, '#3a3020');
    grad.addColorStop(0.3, '#2a2518');
    grad.addColorStop(1, '#1a1510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, this.W, this.H - groundY);
    // Ground texture dots
    ctx.fillStyle = 'hsla(30,30%,35%,0.3)';
    for (let i = 0; i < 30; i++) {
      const gx = (i * 53 + 10) % this.W;
      const gy = groundY + 5 + (i * 37) % 30;
      ctx.fillRect(gx, gy, 2 + i % 3, 1);
    }
  }

  drawStone(ctx, x, y, w, h, color = '#7a7a7a') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 3);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'hsla(0,0%,100%,0.08)';
    ctx.fillRect(x + 2, y + 1, w - 4, h * 0.3);
    // Shadow line
    ctx.fillStyle = 'hsla(0,0%,0%,0.15)';
    ctx.fillRect(x + 2, y + h - 3, w - 4, 2);
  }

  drawBoatPier(ctx, x, y, w, h, color = '#6a6a6a') {
    const tipW = w * 0.25;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - tipW, y + h / 2);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + tipW, y + h / 2);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'hsla(0,0%,100%,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawText(ctx, text, x, y, {
    font = '16px "Noto Sans SC"', color = '#e8dfd0', align = 'center',
    baseline = 'middle', maxWidth = undefined
  } = {}) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    if (maxWidth) ctx.fillText(text, x, y, maxWidth);
    else ctx.fillText(text, x, y);
  }

  isInRect(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
  }
}
