/* ============================================================
   洛阳桥 — Three.js 3D 桥梁模型构建器
   Creates the parametric Luoyang Bridge geometry
   ============================================================ */
class BridgeModel {
  constructor(scene) {
    this.scene = scene;
    this.groups = {
      all: new THREE.Group(),
      foundation: new THREE.Group(),
      pier: new THREE.Group(),
      beam: new THREE.Group(),
      railing: new THREE.Group(),
      oyster: new THREE.Group()
    };
    this.groups.all.add(this.groups.foundation);
    this.groups.all.add(this.groups.pier);
    this.groups.all.add(this.groups.beam);
    this.groups.all.add(this.groups.railing);
    this.groups.all.add(this.groups.oyster);
    scene.add(this.groups.all);

    // Materials
    this.mats = {
      stone: new THREE.MeshStandardMaterial({
        map: TextureFactory.stone(),
        color: 0x8a8070,
        roughness: 0.85,
        metalness: 0.05
      }),
      darkStone: new THREE.MeshStandardMaterial({
        map: TextureFactory.darkStone(),
        color: 0x4a4840,
        roughness: 0.9,
        metalness: 0.02
      }),
      pier: new THREE.MeshStandardMaterial({
        map: TextureFactory.stone(),
        color: 0x6a7a8a,
        roughness: 0.8,
        metalness: 0.08
      }),
      oyster: new THREE.MeshStandardMaterial({
        map: TextureFactory.oyster(),
        color: 0x5a6a5a,
        roughness: 0.95,
        metalness: 0.0
      }),
      railing: new THREE.MeshStandardMaterial({
        map: TextureFactory.stone(),
        color: 0x9a9080,
        roughness: 0.75,
        metalness: 0.1
      })
    };

    // Bridge parameters (scaled: 1 unit = ~2 meters)
    this.config = {
      bridgeLength: 80,       // ~160m section (5 spans)
      bridgeWidth: 3.5,       // ~7m
      pierCount: 6,
      pierSpacing: 14,
      pierHeight: 5,
      pierWidth: 3,
      pierDepth: 4.5,
      pierTipLen: 2,
      beamThickness: 0.6,
      railingHeight: 1.2,
      railingPostSpacing: 3,
      foundationWidth: 12,
      foundationHeight: 2,
      oysterHeight: 0.8,
      waterLevel: -1.5
    };

    this.build();
  }

  build() {
    this._buildFoundation();
    this._buildOysterLayer();
    this._buildPiers();
    this._buildBeams();
    this._buildRailings();
  }

  _buildFoundation() {
    const c = this.config;
    const geo = new THREE.BoxGeometry(c.bridgeLength + 10, c.foundationHeight, c.foundationWidth);
    const mat = this.mats.darkStone;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -c.pierHeight - c.oysterHeight - c.foundationHeight / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { part: 'foundation', name: '筏型基础' };
    this.groups.foundation.add(mesh);

    // Extra foundation stones
    for (let i = 0; i < 15; i++) {
      const sw = 2 + Math.random() * 3;
      const sh = 0.5 + Math.random() * 1;
      const sd = 2 + Math.random() * 3;
      const g = new THREE.BoxGeometry(sw, sh, sd);
      const m = new THREE.Mesh(g, mat);
      m.position.set(
        (Math.random() - 0.5) * (c.bridgeLength + 5),
        mesh.position.y - c.foundationHeight / 2 - sh / 2 + 0.2,
        (Math.random() - 0.5) * (c.foundationWidth - 2)
      );
      m.rotation.y = Math.random() * 0.3;
      m.castShadow = true;
      m.userData = { part: 'foundation' };
      this.groups.foundation.add(m);
    }
  }

  _buildOysterLayer() {
    const c = this.config;
    const geo = new THREE.BoxGeometry(c.bridgeLength + 6, c.oysterHeight, c.foundationWidth - 1);
    const mesh = new THREE.Mesh(geo, this.mats.oyster);
    mesh.position.set(0, -c.pierHeight - c.oysterHeight / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { part: 'oyster', name: '种蛎固基层' };
    this.groups.oyster.add(mesh);

    // Oyster bumps
    for (let i = 0; i < 40; i++) {
      const r = 0.3 + Math.random() * 0.5;
      const g = new THREE.SphereGeometry(r, 6, 4);
      const m = new THREE.Mesh(g, this.mats.oyster);
      m.position.set(
        (Math.random() - 0.5) * (c.bridgeLength + 4),
        mesh.position.y + c.oysterHeight / 2 + r * 0.3,
        (Math.random() - 0.5) * (c.foundationWidth - 3)
      );
      m.scale.y = 0.5;
      m.userData = { part: 'oyster' };
      this.groups.oyster.add(m);
    }
  }

  _buildPiers() {
    const c = this.config;
    const startX = -(c.pierCount - 1) * c.pierSpacing / 2;

    for (let i = 0; i < c.pierCount; i++) {
      const px = startX + i * c.pierSpacing;
      const pierGroup = new THREE.Group();
      pierGroup.position.set(px, 0, 0);

      // Main pier body (boat-shaped using custom geometry)
      const shape = new THREE.Shape();
      const hw = c.pierWidth / 2;
      const hd = c.pierDepth / 2;
      const tip = c.pierTipLen;
      // Boat shape (top view)
      shape.moveTo(-hd - tip, 0);       // left tip
      shape.lineTo(-hd, hw);            // top-left
      shape.lineTo(hd, hw);             // top-right
      shape.lineTo(hd + tip, 0);        // right tip
      shape.lineTo(hd, -hw);            // bottom-right
      shape.lineTo(-hd, -hw);           // bottom-left
      shape.closePath();

      const extrudeSettings = { depth: c.pierHeight, bevelEnabled: false };
      const pierGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      pierGeo.rotateX(-Math.PI / 2);
      const pierMesh = new THREE.Mesh(pierGeo, this.mats.pier);
      pierMesh.position.y = -c.pierHeight;
      pierMesh.castShadow = true;
      pierMesh.receiveShadow = true;
      pierMesh.userData = { part: 'pier', name: `桥墩 #${i + 1}（船形）` };
      pierGroup.add(pierMesh);

      // Pier cap (flat stone slab on top)
      const capGeo = new THREE.BoxGeometry(c.pierDepth + 1.5, 0.4, c.pierWidth + 0.8);
      const capMesh = new THREE.Mesh(capGeo, this.mats.stone);
      capMesh.position.y = 0.2;
      capMesh.castShadow = true;
      capMesh.userData = { part: 'pier' };
      pierGroup.add(capMesh);

      this.groups.pier.add(pierGroup);
    }
  }

  _buildBeams() {
    const c = this.config;
    const startX = -(c.pierCount - 1) * c.pierSpacing / 2;

    for (let i = 0; i < c.pierCount - 1; i++) {
      const spanX = startX + i * c.pierSpacing + c.pierSpacing / 2;
      // Multiple beams side by side
      const beamCount = 5;
      const beamW = c.bridgeWidth / beamCount;
      for (let b = 0; b < beamCount; b++) {
        const bz = -c.bridgeWidth / 2 + beamW * b + beamW / 2;
        const geo = new THREE.BoxGeometry(c.pierSpacing - 1, c.beamThickness, beamW - 0.1);
        const mesh = new THREE.Mesh(geo, this.mats.stone);
        mesh.position.set(spanX, 0.4 + c.beamThickness / 2, bz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { part: 'beam', name: `石板梁（第${i + 1}跨, 第${b + 1}块）` };
        this.groups.beam.add(mesh);
      }
    }

    // Bridge deck surface
    const deckGeo = new THREE.BoxGeometry(c.bridgeLength - 4, 0.15, c.bridgeWidth + 0.2);
    const deckMesh = new THREE.Mesh(deckGeo, this.mats.stone);
    deckMesh.position.y = 0.4 + c.beamThickness + 0.075;
    deckMesh.receiveShadow = true;
    deckMesh.userData = { part: 'beam', name: '桥面铺装' };
    this.groups.beam.add(deckMesh);
  }

  _buildRailings() {
    const c = this.config;
    const deckTop = 0.4 + c.beamThickness + 0.15;
    const halfLen = (c.bridgeLength - 6) / 2;
    const postSpacing = c.railingPostSpacing;

    for (let side = -1; side <= 1; side += 2) {
      const z = side * (c.bridgeWidth / 2 + 0.15);
      // Railing bar (top rail)
      const barGeo = new THREE.BoxGeometry(c.bridgeLength - 6, 0.15, 0.15);
      const barMesh = new THREE.Mesh(barGeo, this.mats.railing);
      barMesh.position.set(0, deckTop + c.railingHeight, z);
      barMesh.castShadow = true;
      barMesh.userData = { part: 'railing', name: '石栏杆' };
      this.groups.railing.add(barMesh);

      // Posts
      const postCount = Math.floor((c.bridgeLength - 6) / postSpacing);
      for (let p = 0; p <= postCount; p++) {
        const px = -halfLen + p * postSpacing;
        // Post
        const postGeo = new THREE.BoxGeometry(0.25, c.railingHeight, 0.25);
        const postMesh = new THREE.Mesh(postGeo, this.mats.railing);
        postMesh.position.set(px, deckTop + c.railingHeight / 2, z);
        postMesh.castShadow = true;
        postMesh.userData = { part: 'railing' };
        this.groups.railing.add(postMesh);

        // Stone lion on some posts
        if (p % 4 === 0) {
          const lionGeo = new THREE.SphereGeometry(0.3, 8, 6);
          const lionMesh = new THREE.Mesh(lionGeo, this.mats.railing);
          lionMesh.position.set(px, deckTop + c.railingHeight + 0.35, z);
          lionMesh.scale.set(1, 1.2, 0.8);
          lionMesh.castShadow = true;
          lionMesh.userData = { part: 'railing', name: '石狮' };
          this.groups.railing.add(lionMesh);
        }
      }

      // Railing panels (between posts)
      for (let p = 0; p < postCount; p++) {
        const px = -halfLen + p * postSpacing + postSpacing / 2;
        const panelGeo = new THREE.BoxGeometry(postSpacing - 0.5, c.railingHeight * 0.6, 0.1);
        const panelMesh = new THREE.Mesh(panelGeo, this.mats.railing);
        panelMesh.position.set(px, deckTop + c.railingHeight * 0.35, z);
        panelMesh.material = this.mats.railing.clone();
        panelMesh.material.transparent = true;
        panelMesh.material.opacity = 0.7;
        panelMesh.userData = { part: 'railing' };
        this.groups.railing.add(panelMesh);
      }
    }
  }

  // Highlight a specific part
  highlightPart(partName) {
    const fade = 0.1;
    Object.keys(this.groups).forEach(key => {
      if (key === 'all') return;
      this.groups[key].traverse(child => {
        if (child.isMesh) {
          if (partName === 'all') {
            child.material.opacity = 1;
            child.material.transparent = false;
            child.visible = true;
          } else if (key === partName) {
            child.material.opacity = 1;
            child.material.transparent = false;
            child.visible = true;
          } else {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = fade;
            child.visible = true;
          }
        }
      });
    });
  }

  // Get info text for a part
  static getInfo(part) {
    const info = {
      all: {
        title: '洛阳桥概览',
        text: '<p>洛阳桥，又名万安桥，位于福建省泉州市洛阳江入海口。北宋皇祐五年至嘉祐四年（1053-1059年）由泉州知府<strong>蔡襄</strong>主持建造。</p><p>它是中国第一座跨海大石桥，其工程技术在当时领先世界数百年，被誉为"海内第一桥"。2021年入选UNESCO世界文化遗产。</p>'
      },
      foundation: {
        title: '筏型基础',
        text: '<p>沿桥轴线在江底抛填大量石块，形成宽约<strong>25米</strong>、长约<strong>500米</strong>的水下石堤，使桥墩荷载均匀分布于整个基底面上。</p><p>这是世界上最早的<strong>筏型基础</strong>实例，比西方同类技术早约<strong>700年</strong>。</p>'
      },
      pier: {
        title: '船形桥墩',
        text: '<p>全桥共<strong>46座桥墩</strong>，两端削尖如船首船尾。这种流线型设计有效分解潮水冲击力，降低冲力约<strong>40%</strong>。</p><p>这是古代<strong>流体力学</strong>原理的精妙实践——通过减小迎水面面积来降低水流阻力。</p>'
      },
      beam: {
        title: '石板梁',
        text: '<p>桥面铺设<strong>500余块</strong>巨型花岗岩石板梁，最大的单块重达<strong>25吨</strong>，长约<strong>11米</strong>。</p><p>每孔桥跨由5-7块石梁并排铺设，采用<strong>"浮运架梁法"</strong>——退潮时将石梁放于双船上，涨潮时运至墩位，退潮后自然落座。</p>'
      },
      railing: {
        title: '栏杆与石狮',
        text: '<p>桥面两侧设石栏杆，栏柱顶端雕刻<strong>石狮</strong>28尊，另有<strong>石塔</strong>、<strong>石亭</strong>等附属建筑。</p><p>石栏杆的间隔与桥墩位置对齐，兼具安全防护与美观装饰功能，体现了宋代工匠的匠心。</p>'
      },
      oyster: {
        title: '种蛎固基',
        text: '<p>蔡襄创造性地利用<strong>牡蛎</strong>的天然附着能力——在桥基石堤上人工养殖牡蛎。牡蛎分泌的<strong>碳酸钙</strong>将散乱石块胶结为坚固整体。</p><p>这是人类历史上首个<strong>"生物工程+土木工程"</strong>融合的案例，堪称天然的"生物水泥"。</p>'
      }
    };
    return info[part] || info.all;
  }
}
