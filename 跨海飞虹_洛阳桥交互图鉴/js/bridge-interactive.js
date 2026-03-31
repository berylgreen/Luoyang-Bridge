/* ============================================================
   跨海飞虹 — 桥梁结构交互模块
   Bridge Interactive: SVG cross-section & oyster animation
   ============================================================ */
const BridgeInteractive = {
  activeLayer: null,
  init() {
    this.initLayerDiagram();
    this.initOysterAnimation();
    this.initStructureSVG();
  },

  // ---------- 分层结构交互 ----------
  initLayerDiagram() {
    const items = document.querySelectorAll('.layer-diagram__item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const wasActive = item.classList.contains('layer-diagram__item--active');
        items.forEach(i => i.classList.remove('layer-diagram__item--active'));
        if (!wasActive) {
          item.classList.add('layer-diagram__item--active');
          this.activeLayer = item.dataset.layer;
          this.highlightSVGLayer(item.dataset.layer);
        } else {
          this.activeLayer = null;
          this.resetSVGLayers();
        }
      });
    });
  },

  highlightSVGLayer(layerId) {
    const parts = document.querySelectorAll('.bridge-part');
    parts.forEach(p => {
      p.style.opacity = p.dataset.layer === layerId ? '1' : '0.2';
      p.style.filter = p.dataset.layer === layerId ? 'brightness(1.3) drop-shadow(0 0 8px rgba(201,168,76,0.4))' : 'none';
    });
  },

  resetSVGLayers() {
    document.querySelectorAll('.bridge-part').forEach(p => {
      p.style.opacity = '1';
      p.style.filter = 'none';
    });
  },

  // ---------- 种蛎固基动画 ----------
  initOysterAnimation() {
    const container = document.getElementById('oyster-animation');
    if (!container) return;

    const stages = document.querySelectorAll('.oyster-stage');
    const progressFill = document.getElementById('oyster-progress-fill');
    let currentStage = 0;

    const showStage = (idx) => {
      stages.forEach((s, i) => {
        s.classList.toggle('oyster-stage--active', i === idx);
      });
      if (progressFill) {
        progressFill.style.width = ((idx + 1) / stages.length * 100) + '%';
      }
    };

    document.getElementById('oyster-prev')?.addEventListener('click', () => {
      currentStage = Math.max(0, currentStage - 1);
      showStage(currentStage);
    });

    document.getElementById('oyster-next')?.addEventListener('click', () => {
      currentStage = Math.min(stages.length - 1, currentStage + 1);
      showStage(currentStage);
    });

    showStage(0);
  },

  // ---------- SVG桥梁截面渲染 ----------
  initStructureSVG() {
    const svgContainer = document.getElementById('bridge-cross-section');
    if (!svgContainer) return;

    const layers = BridgeData.structureLayers;
    let yOffset = 20;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 800 520');
    svg.setAttribute('class', 'bridge-svg');
    svg.style.width = '100%';

    // 水平线 (水面)
    const waterLine = document.createElementNS(svgNS, 'line');
    waterLine.setAttribute('x1', '0'); waterLine.setAttribute('y1', '230');
    waterLine.setAttribute('x2', '800'); waterLine.setAttribute('y2', '230');
    waterLine.setAttribute('stroke', '#3D8B8B');
    waterLine.setAttribute('stroke-width', '1.5');
    waterLine.setAttribute('stroke-dasharray', '8,6');
    waterLine.setAttribute('opacity', '0.5');
    svg.appendChild(waterLine);

    // 水面标签
    const waterLabel = document.createElementNS(svgNS, 'text');
    waterLabel.setAttribute('x', '780'); waterLabel.setAttribute('y', '225');
    waterLabel.setAttribute('fill', '#3D8B8B');
    waterLabel.setAttribute('font-size', '11');
    waterLabel.setAttribute('text-anchor', 'end');
    waterLabel.setAttribute('font-family', "'Noto Sans SC', sans-serif");
    waterLabel.textContent = '▽ 水面线';
    svg.appendChild(waterLabel);

    layers.forEach((layer, idx) => {
      const group = document.createElementNS(svgNS, 'g');
      group.setAttribute('class', 'bridge-part');
      group.setAttribute('data-layer', layer.id);
      group.style.cursor = 'pointer';
      group.style.transition = 'all 0.4s cubic-bezier(0.16,1,0.3,1)';

      // 主矩形
      const rect = document.createElementNS(svgNS, 'rect');
      const xPadding = idx < 2 ? 120 : (idx < 4 ? 80 : 40);
      rect.setAttribute('x', xPadding);
      rect.setAttribute('y', yOffset);
      rect.setAttribute('width', 800 - xPadding * 2);
      rect.setAttribute('height', layer.height);
      rect.setAttribute('rx', '6');
      rect.setAttribute('fill', layer.color);
      rect.setAttribute('opacity', '0.85');
      group.appendChild(rect);

      // 桥墩的船形尖端
      if (layer.id === 'pier') {
        const leftTip = document.createElementNS(svgNS, 'polygon');
        leftTip.setAttribute('points', `${xPadding},${yOffset + layer.height / 2} ${xPadding - 30},${yOffset + layer.height / 2} ${xPadding},${yOffset}`);
        leftTip.setAttribute('fill', layer.color);
        leftTip.setAttribute('opacity', '0.7');
        group.appendChild(leftTip);

        const rightTip = document.createElementNS(svgNS, 'polygon');
        const rX = 800 - xPadding;
        rightTip.setAttribute('points', `${rX},${yOffset + layer.height / 2} ${rX + 30},${yOffset + layer.height / 2} ${rX},${yOffset}`);
        rightTip.setAttribute('fill', layer.color);
        rightTip.setAttribute('opacity', '0.7');
        group.appendChild(rightTip);
      }

      // 图层名称标签
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', '400');
      label.setAttribute('y', yOffset + layer.height / 2 + 5);
      label.setAttribute('fill', '#E8DFD0');
      label.setAttribute('font-size', '13');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-family', "'Noto Serif SC', serif");
      label.setAttribute('font-weight', '600');
      label.textContent = layer.name;
      group.appendChild(label);

      // hover tooltip
      group.addEventListener('mouseenter', () => {
        this.showTooltip(layer);
      });
      group.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      svg.appendChild(group);
      yOffset += layer.height + 4;
    });

    svgContainer.appendChild(svg);
  },

  showTooltip(layer) {
    let tip = document.getElementById('svg-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'svg-tooltip';
      tip.className = 'tooltip';
      document.body.appendChild(tip);
    }
    tip.innerHTML = `<strong style="color:var(--color-accent-gold)">${layer.name}</strong><br><span style="font-size:12px;color:var(--color-text-secondary)">${layer.description}</span>`;
    tip.classList.add('tooltip--visible');

    document.addEventListener('mousemove', this._moveTooltip);
  },

  _moveTooltip(e) {
    const tip = document.getElementById('svg-tooltip');
    if (tip) {
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top = (e.clientY - 10) + 'px';
    }
  },

  hideTooltip() {
    const tip = document.getElementById('svg-tooltip');
    if (tip) tip.classList.remove('tooltip--visible');
    document.removeEventListener('mousemove', this._moveTooltip);
  }
};
