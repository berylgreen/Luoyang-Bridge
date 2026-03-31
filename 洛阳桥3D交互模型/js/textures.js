/* ============================================================
   程序化纹理生成器
   Procedural textures for stone, oyster, moss using Canvas
   ============================================================ */
const TextureFactory = {
  _canvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    return c;
  },

  // 石材纹理
  stone(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    // Base color
    ctx.fillStyle = '#7a7060';
    ctx.fillRect(0, 0, size, size);
    // Random noise for grain
    for (let i = 0; i < size * size * 0.3; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const v = 90 + Math.random() * 50;
      ctx.fillStyle = `rgba(${v},${v - 10},${v - 20},0.3)`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1);
    }
    // Cracks
    ctx.strokeStyle = 'rgba(50,40,30,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let cx = Math.random() * size, cy = Math.random() * size;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 6; s++) {
        cx += (Math.random() - 0.5) * 40;
        cy += (Math.random() - 0.5) * 40;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
    // Veins
    ctx.strokeStyle = 'rgba(100,90,70,0.08)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, Math.random() * size);
      ctx.bezierCurveTo(
        Math.random() * size, Math.random() * size,
        Math.random() * size, Math.random() * size,
        Math.random() * size, Math.random() * size
      );
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  // 深色石材（基础/海床）
  darkStone(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#3a3830';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < size * size * 0.2; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const v = 40 + Math.random() * 30;
      ctx.fillStyle = `rgba(${v},${v},${v - 5},0.25)`;
      ctx.fillRect(x, y, 1 + Math.random(), 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  // 牡蛎层
  oyster(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(0, 0, size, size);
    // Oyster clusters
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 3 + Math.random() * 8;
      ctx.fillStyle = `hsla(${80 + Math.random() * 40},${20 + Math.random() * 20}%,${50 + Math.random() * 20}%,0.4)`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  // 水面法线扰动（简易）
  waterNormal(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#8080ff'; // neutral normal
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 128 + (Math.random() - 0.5) * 30;
      const g = 128 + (Math.random() - 0.5) * 30;
      ctx.fillStyle = `rgb(${r|0},${g|0},255)`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
};
