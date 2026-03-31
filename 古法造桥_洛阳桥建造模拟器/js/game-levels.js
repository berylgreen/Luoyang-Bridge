/* ============================================================
   古法造桥 — 五关卡实现
   Levels: 5 playable game stages
   ============================================================ */
const Levels = {
  // ==========================================
  // 关卡1：观潮选址 — 在潮位最低时点击
  // ==========================================
  level1: {
    time: 0, tidePhase: 0, score: 0, attempts: 0, maxAttempts: 5,
    bestHit: 999, flagY: 0, particles: [], resultShown: false,

    init(engine) {
      this.time = 0; this.score = 0; this.attempts = 0;
      this.bestHit = 999; this.particles = []; this.resultShown = false;
      this.tideSpeed = 1.8;
    },

    getWaterLevel(t) {
      return 0.45 + Math.sin(t * this.tideSpeed) * 0.12 + Math.sin(t * this.tideSpeed * 2.1 + 1) * 0.04;
    },

    update(dt, engine, game) {
      this.time += dt;
      const wl = this.getWaterLevel(this.time);
      this.flagY = engine.H * wl;

      if (engine.mouse.clicked && this.attempts < this.maxAttempts && !this.resultShown) {
        this.attempts++;
        // Calculate how close to minimum (ideal = sin valley ≈ -1)
        const sinVal = Math.sin(this.time * this.tideSpeed);
        const accuracy = Math.max(0, (1 - (sinVal + 1)) * 100); // 0-100, 100 = perfect low tide
        const points = Math.round(accuracy * 0.4);
        this.score += points;
        if (sinVal < this.bestHit) this.bestHit = sinVal;
        // Score popup
        this.particles.push({ x: engine.mouse.x, y: engine.mouse.y, text: `+${points}`, life: 1 });
        if (this.attempts >= this.maxAttempts) {
          setTimeout(() => game.levelComplete(this.score), 800);
        }
      }
      // Update particles
      this.particles = this.particles.filter(p => { p.life -= dt; p.y -= 40 * dt; return p.life > 0; });
    },

    render(ctx, engine) {
      engine.drawSky(ctx);
      const wl = this.getWaterLevel(this.time);
      engine.drawWater(ctx, wl, this.time);
      // Tide gauge on left
      const gaugeX = 60, gaugeTop = engine.H * 0.2, gaugeBot = engine.H * 0.75;
      ctx.strokeStyle = 'hsla(42,60%,60%,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(gaugeX, gaugeTop); ctx.lineTo(gaugeX, gaugeBot); ctx.stroke();
      // Gauge markers
      for (let i = 0; i <= 5; i++) {
        const gy = gaugeTop + (gaugeBot - gaugeTop) * (i / 5);
        ctx.fillStyle = 'hsla(42,60%,60%,0.4)';
        ctx.fillRect(gaugeX - 8, gy, 16, 1);
        engine.drawText(ctx, `${(5 - i).toFixed(0)}m`, gaugeX - 25, gy, { font: '11px "Noto Sans SC"', color: 'hsla(42,60%,60%,0.5)', align: 'right' });
      }
      // Water level indicator
      const indY = engine.H * wl;
      ctx.fillStyle = '#5ab5b0';
      ctx.beginPath();
      ctx.moveTo(gaugeX + 12, indY);
      ctx.lineTo(gaugeX + 22, indY - 6);
      ctx.lineTo(gaugeX + 22, indY + 6);
      ctx.closePath();
      ctx.fill();
      // Instruction
      const remaining = this.maxAttempts - this.attempts;
      engine.drawText(ctx, `在潮位最低时点击画面！剩余 ${remaining} 次`, engine.W / 2, engine.H * 0.12,
        { font: 'bold 18px "Noto Serif SC"', color: '#c9a84c' });
      // Visual cue: pulsing circle at center
      const pulseR = 20 + Math.sin(this.time * 4) * 5;
      ctx.strokeStyle = `hsla(42,70%,62%,${0.3 + Math.sin(this.time * 4) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(engine.W / 2, engine.H * 0.5, pulseR, 0, Math.PI * 2); ctx.stroke();
      // Score particles
      this.particles.forEach(p => {
        engine.drawText(ctx, p.text, p.x, p.y, { font: 'bold 22px "Noto Serif SC"', color: `hsla(42,70%,62%,${p.life})` });
      });
    }
  },

  // ==========================================
  // 关卡2：抛石筑基 — 拖拽石块到水中目标区
  // ==========================================
  level2: {
    time: 0, score: 0, stones: [], placed: [], targetSlots: [],
    stoneIdx: 0, waterLevel: 0.55,

    init(engine) {
      this.time = 0; this.score = 0; this.stones = []; this.placed = [];
      this.targetSlots = []; this.stoneIdx = 0;
      const W = engine.W, H = engine.H;
      // Source stones on the shore (left bottom)
      for (let i = 0; i < 10; i++) {
        this.stones.push({
          x: 40 + (i % 5) * 70, y: H * 0.78 + Math.floor(i / 5) * 50,
          w: 50 + Math.random() * 20, h: 30 + Math.random() * 15,
          origX: 40 + (i % 5) * 70, origY: H * 0.78 + Math.floor(i / 5) * 50,
          dragging: false, placed: false, color: `hsl(30,${8 + i * 2}%,${45 + i * 3}%)`
        });
      }
      // Target slots in water
      const baseX = W * 0.4, baseY = H * 0.62;
      for (let i = 0; i < 10; i++) {
        this.targetSlots.push({
          x: baseX + (i % 5) * 65, y: baseY + Math.floor(i / 5) * 40,
          w: 55, h: 32, filled: false
        });
      }
    },

    update(dt, engine, game) {
      this.time += dt;
      this.waterLevel = 0.55 + Math.sin(this.time * 0.5) * 0.03; // gentle tide
      const mx = engine.mouse.x, my = engine.mouse.y;

      if (engine.mouse.clicked) {
        // Try to pick up a stone
        for (let s of this.stones) {
          if (!s.placed && engine.isInRect(mx, my, s.x, s.y, s.w, s.h)) {
            s.dragging = true;
            engine.dragItem = s;
            break;
          }
        }
      }
      // Drag
      if (engine.mouse.down && engine.dragItem) {
        engine.dragItem.x = mx - engine.dragItem.w / 2;
        engine.dragItem.y = my - engine.dragItem.h / 2;
      }
      // Release — check if over target
      if (engine.mouse.released && engine.dragItem) {
        const s = engine.dragItem;
        let snapped = false;
        for (let slot of this.targetSlots) {
          if (!slot.filled && engine.isInRect(s.x + s.w / 2, s.y + s.h / 2, slot.x - 15, slot.y - 15, slot.w + 30, slot.h + 30)) {
            s.x = slot.x; s.y = slot.y; s.placed = true; slot.filled = true;
            snapped = true;
            this.score += 15;
            break;
          }
        }
        if (!snapped) { s.x = s.origX; s.y = s.origY; }
        s.dragging = false;
        engine.dragItem = null;
      }
      // Check completion
      if (this.targetSlots.every(s => s.filled)) {
        setTimeout(() => game.levelComplete(this.score), 600);
      }
    },

    render(ctx, engine) {
      engine.drawSky(ctx);
      engine.drawWater(ctx, this.waterLevel, this.time);
      engine.drawGround(ctx, engine.H * 0.75);
      // Label
      engine.drawText(ctx, '将石块拖拽到水中的目标区域，铺设筏型基础', engine.W / 2, engine.H * 0.08,
        { font: 'bold 17px "Noto Serif SC"', color: '#c9a84c' });
      // Target slots (underwater grid)
      for (let slot of this.targetSlots) {
        if (!slot.filled) {
          ctx.strokeStyle = 'hsla(42,60%,60%,0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
          ctx.setLineDash([]);
        }
      }
      // Stones
      for (let s of this.stones) {
        if (!s.placed || s.dragging) {
          engine.drawStone(ctx, s.x, s.y, s.w, s.h, s.color);
          if (s.dragging) {
            ctx.strokeStyle = 'hsla(42,70%,62%,0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(s.x - 2, s.y - 2, s.w + 4, s.h + 4);
          }
        } else {
          engine.drawStone(ctx, s.x, s.y, s.w, s.h, s.color);
        }
      }
      // Shore label
      engine.drawText(ctx, '🪨 岸边备石区', 180, engine.H * 0.75 - 15,
        { font: '13px "Noto Sans SC"', color: 'hsla(42,60%,60%,0.5)' });
    }
  },

  // ==========================================
  // 关卡3：种蛎固基 — 点击石缝种牡蛎
  // ==========================================
  level3: {
    time: 0, score: 0, oysterSpots: [], particles: [],

    init(engine) {
      this.time = 0; this.score = 0; this.particles = [];
      this.oysterSpots = [];
      const W = engine.W, H = engine.H;
      const baseX = W * 0.25, baseY = H * 0.5;
      for (let i = 0; i < 12; i++) {
        this.oysterSpots.push({
          x: baseX + (i % 4) * (W * 0.15),
          y: baseY + Math.floor(i / 4) * 45 + (i % 3) * 8,
          stage: 0, // 0=empty, 1=seeded, 2=growing, 3=bonded
          growTimer: 0, radius: 12 + Math.random() * 6
        });
      }
    },

    update(dt, engine, game) {
      this.time += dt;
      const mx = engine.mouse.x, my = engine.mouse.y;

      // Click to seed
      if (engine.mouse.clicked) {
        for (let sp of this.oysterSpots) {
          if (sp.stage === 0) {
            const dist = Math.hypot(mx - sp.x, my - sp.y);
            if (dist < sp.radius + 15) {
              sp.stage = 1; sp.growTimer = 0;
              this.score += 10;
              this.particles.push({ x: sp.x, y: sp.y, text: '🦪+10', life: 1 });
              break;
            }
          }
        }
      }
      // Grow over time
      for (let sp of this.oysterSpots) {
        if (sp.stage >= 1 && sp.stage < 3) {
          sp.growTimer += dt;
          if (sp.stage === 1 && sp.growTimer > 2) { sp.stage = 2; sp.growTimer = 0; }
          if (sp.stage === 2 && sp.growTimer > 3) { sp.stage = 3; this.score += 10; }
        }
      }
      // Particles
      this.particles = this.particles.filter(p => { p.life -= dt * 0.8; p.y -= 30 * dt; return p.life > 0; });
      // Completion
      if (this.oysterSpots.every(sp => sp.stage === 3)) {
        setTimeout(() => game.levelComplete(this.score), 800);
      }
    },

    render(ctx, engine) {
      engine.drawSky(ctx);
      engine.drawWater(ctx, 0.35, this.time);
      // Stone foundation underwater
      const W = engine.W, H = engine.H;
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(W * 0.2, H * 0.45, W * 0.6, H * 0.35);
      ctx.fillStyle = 'hsla(0,0%,100%,0.05)';
      ctx.fillRect(W * 0.2, H * 0.45, W * 0.6, 3);
      // Stone texture
      for (let i = 0; i < 20; i++) {
        const sx = W * 0.22 + (i % 5) * (W * 0.12);
        const sy = H * 0.47 + Math.floor(i / 5) * 35;
        engine.drawStone(ctx, sx, sy, 40 + i % 3 * 10, 22, `hsl(30,${5 + i}%,${35 + i * 2}%)`);
      }
      // Label
      engine.drawText(ctx, '点击石缝处播撒牡蛎种苗', engine.W / 2, engine.H * 0.08,
        { font: 'bold 17px "Noto Serif SC"', color: '#c9a84c' });
      // Oyster spots
      for (let sp of this.oysterSpots) {
        if (sp.stage === 0) {
          // Empty spot - glowing crack
          ctx.strokeStyle = 'hsla(42,60%,60%,0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'hsla(42,60%,60%,0.08)';
          ctx.fill();
        } else if (sp.stage === 1) {
          // Seeded - small dots
          ctx.fillStyle = '#b8b090';
          for (let d = 0; d < 4; d++) {
            ctx.beginPath();
            ctx.arc(sp.x + Math.cos(d * 1.5) * 6, sp.y + Math.sin(d * 1.5) * 6, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (sp.stage === 2) {
          // Growing - larger clusters
          ctx.fillStyle = '#c8c0a0';
          for (let d = 0; d < 6; d++) {
            ctx.beginPath();
            const gr = 4 + sp.growTimer * 1.5;
            ctx.arc(sp.x + Math.cos(d) * 8, sp.y + Math.sin(d) * 8, gr, 0, Math.PI * 2);
            ctx.fill();
          }
          // Progress ring
          ctx.strokeStyle = 'hsla(42,70%,62%,0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius + 5, -Math.PI / 2, -Math.PI / 2 + (sp.growTimer / 3) * Math.PI * 2);
          ctx.stroke();
        } else {
          // Bonded - solid mass
          ctx.fillStyle = '#a09870';
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.radius + 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'hsla(42,60%,70%,0.3)';
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.radius - 2, 0, Math.PI * 2); ctx.fill();
          engine.drawText(ctx, '✓', sp.x, sp.y, { font: 'bold 14px sans-serif', color: '#5ab5b0' });
        }
      }
      // Particles
      this.particles.forEach(p => {
        engine.drawText(ctx, p.text, p.x, p.y, { font: 'bold 18px "Noto Serif SC"', color: `hsla(42,70%,62%,${p.life})` });
      });
    }
  },

  // ==========================================
  // 关卡4：砌筑桥墩 — 组装船形桥墩
  // ==========================================
  level4: {
    time: 0, score: 0, blocks: [], slots: [], placed: 0, totalSlots: 8,

    init(engine) {
      this.time = 0; this.score = 0; this.placed = 0;
      this.blocks = []; this.slots = [];
      const W = engine.W, H = engine.H;
      const pierCX = W * 0.55, pierBaseY = H * 0.42;
      // Build slots (where blocks should go) — pier shape
      const slotDefs = [
        { dx: -60, dy: 0, w: 120, h: 28, label: '底层左' },
        { dx: 60, dy: 0, w: 120, h: 28, label: '底层右' },
        { dx: -40, dy: -32, w: 80, h: 28, label: '中层左' },
        { dx: 40, dy: -32, w: 80, h: 28, label: '中层右' },
        { dx: 0, dy: -32, w: 80, h: 28, label: '中层中' },
        { dx: -20, dy: -64, w: 120, h: 28, label: '上层' },
        { dx: -100, dy: -16, w: 40, h: 50, label: '左尖' },
        { dx: 140, dy: -16, w: 40, h: 50, label: '右尖' },
      ];
      slotDefs.forEach((def, i) => {
        this.slots.push({
          x: pierCX + def.dx, y: pierBaseY + def.dy,
          w: def.w, h: def.h, filled: false, label: def.label
        });
      });
      // Source blocks
      for (let i = 0; i < this.totalSlots; i++) {
        this.blocks.push({
          x: 30 + (i % 4) * 90, y: H * 0.7 + Math.floor(i / 4) * 55,
          w: this.slots[i].w, h: this.slots[i].h,
          origX: 30 + (i % 4) * 90, origY: H * 0.7 + Math.floor(i / 4) * 55,
          targetIdx: i, dragging: false, placed: false,
          color: `hsl(${200 + i * 8},${10 + i * 2}%,${40 + i * 3}%)`
        });
      }
    },

    update(dt, engine, game) {
      this.time += dt;
      const mx = engine.mouse.x, my = engine.mouse.y;
      if (engine.mouse.clicked) {
        for (let b of this.blocks) {
          if (!b.placed && engine.isInRect(mx, my, b.x, b.y, b.w, b.h)) {
            b.dragging = true; engine.dragItem = b; break;
          }
        }
      }
      if (engine.mouse.down && engine.dragItem) {
        engine.dragItem.x = mx - engine.dragItem.w / 2;
        engine.dragItem.y = my - engine.dragItem.h / 2;
      }
      if (engine.mouse.released && engine.dragItem) {
        const b = engine.dragItem;
        const slot = this.slots[b.targetIdx];
        if (slot && !slot.filled && engine.isInRect(b.x + b.w / 2, b.y + b.h / 2, slot.x - 20, slot.y - 20, slot.w + 40, slot.h + 40)) {
          b.x = slot.x; b.y = slot.y; b.placed = true; slot.filled = true;
          this.placed++; this.score += 16;
        } else {
          b.x = b.origX; b.y = b.origY;
        }
        b.dragging = false; engine.dragItem = null;
      }
      if (this.placed >= this.totalSlots) {
        setTimeout(() => game.levelComplete(this.score), 700);
      }
    },

    render(ctx, engine) {
      engine.drawSky(ctx);
      engine.drawWater(ctx, 0.52, this.time);
      engine.drawGround(ctx, engine.H * 0.65);
      // Foundation base
      const W = engine.W, H = engine.H;
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(W * 0.35, H * 0.44, W * 0.35, H * 0.12);
      // Label
      engine.drawText(ctx, '将石块拖拽到正确位置，组装船形桥墩', W / 2, H * 0.08,
        { font: 'bold 17px "Noto Serif SC"', color: '#c9a84c' });
      // Slots
      for (let slot of this.slots) {
        if (!slot.filled) {
          ctx.strokeStyle = 'hsla(42,60%,60%,0.3)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
          ctx.setLineDash([]);
          engine.drawText(ctx, slot.label, slot.x + slot.w / 2, slot.y + slot.h / 2,
            { font: '11px "Noto Sans SC"', color: 'hsla(42,60%,60%,0.3)' });
        }
      }
      // Blocks
      for (let b of this.blocks) {
        engine.drawStone(ctx, b.x, b.y, b.w, b.h, b.placed ? '#6a7a8a' : b.color);
        if (b.dragging) {
          ctx.strokeStyle = 'hsla(42,70%,62%,0.5)';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
        }
      }
    }
  },

  // ==========================================
  // 关卡5：浮运架梁 — 利用潮汐放置石板梁
  // ==========================================
  level5: {
    time: 0, score: 0, phase: 'wait', // wait, rising, position, falling, placed
    beamX: 0, beamY: 0, tideTime: 0,
    targetX: 0, pierLeftX: 0, pierRightX: 0, pierTopY: 0,
    beamsPlaced: 0, totalBeams: 3, beamHistory: [],
    adjustX: 0,

    init(engine) {
      this.time = 0; this.score = 0; this.beamsPlaced = 0;
      this.beamHistory = []; this.phase = 'wait'; this.tideTime = 0;
      const W = engine.W, H = engine.H;
      this.pierLeftX = W * 0.3; this.pierRightX = W * 0.6;
      this.pierTopY = H * 0.42;
      this.targetX = (this.pierLeftX + this.pierRightX) / 2;
      this.resetBeam(engine);
    },

    resetBeam(engine) {
      this.beamX = engine.W * 0.15;
      this.beamY = engine.H * 0.7;
      this.phase = 'wait';
      this.tideTime = 0;
      this.adjustX = 0;
    },

    getWL(t) { return 0.5 + Math.sin(t * 0.8) * 0.15; },

    update(dt, engine, game) {
      this.time += dt;
      this.tideTime += dt;
      const wl = this.getWL(this.tideTime);
      const waterY = engine.H * wl;

      if (this.phase === 'wait') {
        // Click beam to start
        if (engine.mouse.clicked && engine.isInRect(engine.mouse.x, engine.mouse.y, this.beamX - 10, this.beamY - 10, 180, 30)) {
          this.phase = 'rising';
          this.tideTime = 0; // reset tide cycle
        }
      } else if (this.phase === 'rising') {
        // Beam floats up with tide
        this.beamY = waterY - 15;
        if (engine.mouse.down) {
          this.beamX += (engine.mouse.x - this.beamX - 80) * dt * 2;
        }
        // When tide reaches near peak, switch to positioning
        const sinVal = Math.sin(this.tideTime * 0.8);
        if (sinVal > 0.85) { this.phase = 'position'; }
      } else if (this.phase === 'position') {
        // Player can fine-tune horizontal position
        this.beamY = waterY - 15;
        if (engine.mouse.down) {
          this.beamX += (engine.mouse.x - this.beamX - 80) * dt * 3;
        }
        const sinVal = Math.sin(this.tideTime * 0.8);
        if (sinVal < 0.3) { this.phase = 'falling'; }
      } else if (this.phase === 'falling') {
        // Tide recedes, beam settles
        this.beamY = waterY - 15;
        if (this.beamY >= this.pierTopY - 8) {
          this.beamY = this.pierTopY - 8;
          this.phase = 'placed';
          // Score based on alignment
          const beamCenterX = this.beamX + 80;
          const dist = Math.abs(beamCenterX - this.targetX);
          const accuracy = Math.max(0, 100 - dist * 0.8);
          const points = Math.round(accuracy * 0.7);
          this.score += points;
          this.beamsPlaced++;
          this.beamHistory.push({ x: this.beamX, y: this.pierTopY - 8, points });
          if (this.beamsPlaced >= this.totalBeams) {
            setTimeout(() => game.levelComplete(this.score), 1000);
          } else {
            setTimeout(() => this.resetBeam(engine), 1500);
          }
        }
      }
    },

    render(ctx, engine) {
      engine.drawSky(ctx);
      const wl = this.getWL(this.tideTime);
      engine.drawWater(ctx, wl, this.time);
      const W = engine.W, H = engine.H;
      // Foundation
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(W * 0.15, H * 0.55, W * 0.7, H * 0.15);
      // Two piers
      engine.drawBoatPier(ctx, this.pierLeftX - 30, this.pierTopY, 60, H * 0.55 - this.pierTopY, '#5a6a6a');
      engine.drawBoatPier(ctx, this.pierRightX - 30, this.pierTopY, 60, H * 0.55 - this.pierTopY, '#5a6a6a');
      // Target zone
      ctx.strokeStyle = 'hsla(42,70%,62%,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(this.pierLeftX + 20, this.pierTopY - 12, this.pierRightX - this.pierLeftX - 40, 10);
      ctx.setLineDash([]);
      // Previously placed beams
      for (let bh of this.beamHistory) {
        ctx.fillStyle = '#8a7a5a';
        ctx.fillRect(bh.x, bh.y, 160, 10);
        ctx.fillStyle = 'hsla(0,0%,100%,0.08)';
        ctx.fillRect(bh.x, bh.y, 160, 3);
      }
      // Current beam
      if (this.phase !== 'placed' || this.beamsPlaced < this.totalBeams) {
        ctx.fillStyle = this.phase === 'wait' ? '#a08a50' : '#c9a84c';
        ctx.fillRect(this.beamX, this.beamY, 160, 12);
        ctx.fillStyle = 'hsla(0,0%,100%,0.1)';
        ctx.fillRect(this.beamX, this.beamY, 160, 4);
        if (this.phase === 'wait') {
          engine.drawText(ctx, '点击石梁开始', this.beamX + 80, this.beamY - 15,
            { font: '13px "Noto Sans SC"', color: '#c9a84c' });
        }
      }
      // Boats (when beam floating)
      if (this.phase === 'rising' || this.phase === 'position') {
        const boatY = engine.H * wl - 8;
        ctx.fillStyle = '#6a4a1a';
        ctx.beginPath();
        ctx.moveTo(this.beamX - 15, boatY + 15);
        ctx.lineTo(this.beamX + 5, boatY + 25);
        ctx.lineTo(this.beamX + 40, boatY + 25);
        ctx.lineTo(this.beamX + 50, boatY + 15);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.beamX + 110, boatY + 15);
        ctx.lineTo(this.beamX + 125, boatY + 25);
        ctx.lineTo(this.beamX + 165, boatY + 25);
        ctx.lineTo(this.beamX + 175, boatY + 15);
        ctx.closePath(); ctx.fill();
      }
      // Instructions
      const msgs = {
        wait: '点击石梁放上双船，等待涨潮',
        rising: '潮水上涨中…拖动调整石梁位置',
        position: '精准对位！拖拽石梁对准两墩之间',
        falling: '潮水退去，石梁缓缓落座…',
        placed: `石梁就位！(${this.beamsPlaced}/${this.totalBeams})`
      };
      engine.drawText(ctx, msgs[this.phase] || '', W / 2, H * 0.08,
        { font: 'bold 17px "Noto Serif SC"', color: '#c9a84c' });
      // Tide indicator
      engine.drawText(ctx, `潮位: ${(wl * 10).toFixed(1)}m`, W - 100, H * 0.08,
        { font: '13px "Noto Sans SC"', color: '#5ab5b0' });
    }
  }
};
