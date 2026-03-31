/* ============================================================
   洛阳桥3D交互模型 — 统一入口 (ES Module)
   Combines: textures, bridge model, scene, controls
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Make THREE global for compatibility
window.THREE = THREE;

// ==========================================
// 程序化纹理生成
// ==========================================
const TextureFactory = {
  _canvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    return c;
  },
  stone(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#7a7060';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < size * size * 0.3; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const v = 90 + Math.random() * 50;
      ctx.fillStyle = `rgba(${v},${v - 10},${v - 20},0.3)`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1);
    }
    ctx.strokeStyle = 'rgba(50,40,30,0.12)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let cx = Math.random() * size, cy = Math.random() * size;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) { cx += (Math.random() - 0.5) * 40; cy += (Math.random() - 0.5) * 40; ctx.lineTo(cx, cy); }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },
  darkStone(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#3a3830';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < size * size * 0.2; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const v = 40 + Math.random() * 30;
      ctx.fillStyle = `rgba(${v},${v},${v - 5},0.25)`;
      ctx.fillRect(x, y, 1 + Math.random(), 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },
  oyster(size = 256) {
    const c = this._canvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const r = 3 + Math.random() * 8;
      ctx.fillStyle = `hsla(${80 + Math.random() * 40},${20 + Math.random() * 20}%,${50 + Math.random() * 20}%,0.4)`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
};

// ==========================================
// 桥梁3D模型构建
// ==========================================
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
    this.groups.all.add(this.groups.foundation, this.groups.pier, this.groups.beam, this.groups.railing, this.groups.oyster);
    scene.add(this.groups.all);

    this.mats = {
      stone: new THREE.MeshStandardMaterial({ map: TextureFactory.stone(), color: 0x8a8070, roughness: 0.85, metalness: 0.05 }),
      darkStone: new THREE.MeshStandardMaterial({ map: TextureFactory.darkStone(), color: 0x4a4840, roughness: 0.9, metalness: 0.02 }),
      pier: new THREE.MeshStandardMaterial({ map: TextureFactory.stone(), color: 0x6a7a8a, roughness: 0.8, metalness: 0.08 }),
      oyster: new THREE.MeshStandardMaterial({ map: TextureFactory.oyster(), color: 0x5a6a5a, roughness: 0.95, metalness: 0 }),
      railing: new THREE.MeshStandardMaterial({ map: TextureFactory.stone(), color: 0x9a9080, roughness: 0.75, metalness: 0.1 })
    };

    this.c = {
      bridgeLength: 80, bridgeWidth: 3.5, pierCount: 6, pierSpacing: 14,
      pierHeight: 5, pierWidth: 3, pierDepth: 4.5, pierTipLen: 2,
      beamThickness: 0.6, railingHeight: 1.2, railingPostSpacing: 3,
      foundationWidth: 12, foundationHeight: 2, oysterHeight: 0.8
    };
    this.build();
  }

  build() {
    const c = this.c;
    // Foundation
    const fGeo = new THREE.BoxGeometry(c.bridgeLength + 10, c.foundationHeight, c.foundationWidth);
    const fMesh = new THREE.Mesh(fGeo, this.mats.darkStone);
    fMesh.position.y = -c.pierHeight - c.oysterHeight - c.foundationHeight / 2;
    fMesh.castShadow = true; fMesh.receiveShadow = true;
    fMesh.userData = { part: 'foundation', name: '筏型基础' };
    this.groups.foundation.add(fMesh);
    for (let i = 0; i < 12; i++) {
      const sg = new THREE.BoxGeometry(2 + Math.random() * 3, 0.5 + Math.random(), 2 + Math.random() * 3);
      const sm = new THREE.Mesh(sg, this.mats.darkStone);
      sm.position.set((Math.random() - 0.5) * c.bridgeLength, fMesh.position.y - c.foundationHeight / 2 - 0.3, (Math.random() - 0.5) * c.foundationWidth);
      sm.castShadow = true; sm.userData = { part: 'foundation' };
      this.groups.foundation.add(sm);
    }

    // Oyster layer
    const oGeo = new THREE.BoxGeometry(c.bridgeLength + 6, c.oysterHeight, c.foundationWidth - 1);
    const oMesh = new THREE.Mesh(oGeo, this.mats.oyster);
    oMesh.position.y = -c.pierHeight - c.oysterHeight / 2;
    oMesh.castShadow = true; oMesh.receiveShadow = true;
    oMesh.userData = { part: 'oyster', name: '种蛎固基层' };
    this.groups.oyster.add(oMesh);
    for (let i = 0; i < 30; i++) {
      const r = 0.3 + Math.random() * 0.5;
      const sg = new THREE.SphereGeometry(r, 6, 4);
      const sm = new THREE.Mesh(sg, this.mats.oyster);
      sm.position.set((Math.random() - 0.5) * c.bridgeLength, oMesh.position.y + c.oysterHeight / 2, (Math.random() - 0.5) * (c.foundationWidth - 3));
      sm.scale.y = 0.5; sm.userData = { part: 'oyster' };
      this.groups.oyster.add(sm);
    }

    // Piers
    const startX = -(c.pierCount - 1) * c.pierSpacing / 2;
    for (let i = 0; i < c.pierCount; i++) {
      const px = startX + i * c.pierSpacing;
      const pg = new THREE.Group();
      pg.position.x = px;
      // Boat-shaped pier
      const shape = new THREE.Shape();
      const hw = c.pierWidth / 2, hd = c.pierDepth / 2, tip = c.pierTipLen;
      shape.moveTo(-hd - tip, 0);
      shape.lineTo(-hd, hw);
      shape.lineTo(hd, hw);
      shape.lineTo(hd + tip, 0);
      shape.lineTo(hd, -hw);
      shape.lineTo(-hd, -hw);
      shape.closePath();
      const pierGeo = new THREE.ExtrudeGeometry(shape, { depth: c.pierHeight, bevelEnabled: false });
      pierGeo.rotateX(-Math.PI / 2);
      const pierMesh = new THREE.Mesh(pierGeo, this.mats.pier);
      pierMesh.position.y = -c.pierHeight;
      pierMesh.castShadow = true; pierMesh.receiveShadow = true;
      pierMesh.userData = { part: 'pier', name: `桥墩 #${i + 1}` };
      pg.add(pierMesh);
      // Pier cap
      const capGeo = new THREE.BoxGeometry(c.pierDepth + 1.5, 0.4, c.pierWidth + 0.8);
      const capMesh = new THREE.Mesh(capGeo, this.mats.stone);
      capMesh.position.y = 0.2; capMesh.castShadow = true;
      capMesh.userData = { part: 'pier' };
      pg.add(capMesh);
      this.groups.pier.add(pg);
    }

    // Beams
    for (let i = 0; i < c.pierCount - 1; i++) {
      const spanX = startX + i * c.pierSpacing + c.pierSpacing / 2;
      const beamCount = 5;
      const beamW = c.bridgeWidth / beamCount;
      for (let b = 0; b < beamCount; b++) {
        const bz = -c.bridgeWidth / 2 + beamW * b + beamW / 2;
        const geo = new THREE.BoxGeometry(c.pierSpacing - 1, c.beamThickness, beamW - 0.1);
        const mesh = new THREE.Mesh(geo, this.mats.stone);
        mesh.position.set(spanX, 0.4 + c.beamThickness / 2, bz);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.userData = { part: 'beam', name: `石板梁` };
        this.groups.beam.add(mesh);
      }
    }
    // Deck
    const deckGeo = new THREE.BoxGeometry(c.bridgeLength - 4, 0.15, c.bridgeWidth + 0.2);
    const deckMesh = new THREE.Mesh(deckGeo, this.mats.stone);
    deckMesh.position.y = 0.4 + c.beamThickness + 0.075;
    deckMesh.receiveShadow = true; deckMesh.userData = { part: 'beam' };
    this.groups.beam.add(deckMesh);

    // Railings
    const deckTop = 0.4 + c.beamThickness + 0.15;
    const halfLen = (c.bridgeLength - 6) / 2;
    for (let side = -1; side <= 1; side += 2) {
      const z = side * (c.bridgeWidth / 2 + 0.15);
      const barGeo = new THREE.BoxGeometry(c.bridgeLength - 6, 0.15, 0.15);
      const barMesh = new THREE.Mesh(barGeo, this.mats.railing);
      barMesh.position.set(0, deckTop + c.railingHeight, z);
      barMesh.castShadow = true; barMesh.userData = { part: 'railing' };
      this.groups.railing.add(barMesh);
      const postCount = Math.floor((c.bridgeLength - 6) / c.railingPostSpacing);
      for (let p = 0; p <= postCount; p++) {
        const ppx = -halfLen + p * c.railingPostSpacing;
        const postGeo = new THREE.BoxGeometry(0.25, c.railingHeight, 0.25);
        const postMesh = new THREE.Mesh(postGeo, this.mats.railing);
        postMesh.position.set(ppx, deckTop + c.railingHeight / 2, z);
        postMesh.castShadow = true; postMesh.userData = { part: 'railing' };
        this.groups.railing.add(postMesh);
        if (p % 4 === 0) {
          const lionGeo = new THREE.SphereGeometry(0.3, 8, 6);
          const lionMesh = new THREE.Mesh(lionGeo, this.mats.railing);
          lionMesh.position.set(ppx, deckTop + c.railingHeight + 0.35, z);
          lionMesh.scale.set(1, 1.2, 0.8);
          lionMesh.castShadow = true; lionMesh.userData = { part: 'railing', name: '石狮' };
          this.groups.railing.add(lionMesh);
        }
      }
    }
  }

  highlightPart(partName) {
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
            child.material.opacity = 0.08;
          }
        }
      });
    });
  }

  static getInfo(part) {
    const info = {
      all: { title: '洛阳桥概览', text: '<p>洛阳桥，又名万安桥，位于福建省泉州市洛阳江入海口。北宋（1053-1059年）由蔡襄主持建造，是中国第一座跨海大石桥。2021年入选UNESCO世界文化遗产。</p>' },
      foundation: { title: '筏型基础', text: '<p>在江底沿桥轴线抛填大量石块，形成宽约<strong>25米</strong>的水下石堤，使桥墩荷载均匀分布于基底面上。比西方同类技术早约<strong>700年</strong>。</p>' },
      pier: { title: '船形桥墩', text: '<p>全桥<strong>46座桥墩</strong>两端削尖如船首尾，有效分解潮水冲击力，降低冲力约<strong>40%</strong>——古代流体力学的精妙实践。</p>' },
      beam: { title: '石板梁', text: '<p>桥面铺设<strong>500余块</strong>巨型花岗岩石板梁，最大单块重达<strong>25吨</strong>，采用"浮运架梁法"借潮汐之力安放。</p>' },
      railing: { title: '栏杆与石狮', text: '<p>桥面两侧设石栏杆，栏柱顶端雕刻<strong>石狮</strong>28尊及石塔、石亭等附属建筑。</p>' },
      oyster: { title: '种蛎固基', text: '<p>利用牡蛎分泌的<strong>碳酸钙</strong>将散石胶结为坚固整体——人类首个"<strong>生物工程+土木工程</strong>"融合案例。</p>' }
    };
    return info[part] || info.all;
  }
}

// ==========================================
// 场景初始化
// ==========================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2a3a);
scene.fog = new THREE.FogExp2(0x1a2a3a, 0.008);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(40, 25, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 10;
controls.maxDistance = 120;
controls.target.set(0, 0, 0);

// Lighting
scene.add(new THREE.AmbientLight(0x4a6080, 0.6));
const sun = new THREE.DirectionalLight(0xffeedd, 1.5);
sun.position.set(30, 40, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
sun.shadow.bias = -0.001;
scene.add(sun);
scene.add(new THREE.DirectionalLight(0x8ab5d0, 0.4).translateX(-20).translateY(15).translateZ(-10));
scene.add(new THREE.HemisphereLight(0x88aacc, 0x443322, 0.4));

// Water
const waterGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
const waterMat = new THREE.MeshStandardMaterial({ color: 0x1a5a7e, roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.75 });
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.5;
water.receiveShadow = true;
scene.add(water);
const waterPositions = waterGeo.attributes.position;
const waterOrigY = new Float32Array(waterPositions.count);
for (let i = 0; i < waterPositions.count; i++) waterOrigY[i] = waterPositions.getZ(i);

// Ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x2a3040, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -10; ground.receiveShadow = true;
scene.add(ground);

// Grid
const grid = new THREE.GridHelper(200, 40, 0x1a3050, 0x1a3050);
grid.position.y = -9.9; grid.material.opacity = 0.15; grid.material.transparent = true;
scene.add(grid);

// Build bridge
const bridge = new BridgeModel(scene);

// ==========================================
// UI Interactions
// ==========================================
const infoTitle = document.getElementById('info-title');
const infoBody = document.getElementById('info-body');
const infoPanel = document.getElementById('info-panel');

document.querySelectorAll('.struct-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.struct-btn').forEach(b => b.classList.remove('struct-btn--active'));
    btn.classList.add('struct-btn--active');
    const part = btn.dataset.part;
    bridge.highlightPart(part);
    const info = BridgeModel.getInfo(part);
    infoTitle.textContent = info.title;
    infoBody.innerHTML = info.text;
    infoPanel.classList.remove('info-panel--collapsed');
  });
});

document.getElementById('info-close').addEventListener('click', () => {
  infoPanel.classList.toggle('info-panel--collapsed');
});

const viewPos = {
  front: { pos: [0, 5, 35], target: [0, 2, 0] },
  side: { pos: [60, 8, 0], target: [0, 0, 0] },
  top: { pos: [0, 50, 0.1], target: [0, 0, 0] },
  section: { pos: [0, 10, 15], target: [0, -2, 0] },
  perspective: { pos: [40, 25, 40], target: [0, 0, 0] }
};
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = viewPos[btn.dataset.view];
    if (!v) return;
    const sP = camera.position.clone(), sT = controls.target.clone();
    const eP = new THREE.Vector3(...v.pos), eT = new THREE.Vector3(...v.target);
    let t = 0;
    (function step() {
      t = Math.min(t + 0.03, 1);
      const e = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(sP, eP, e);
      controls.target.lerpVectors(sT, eT, e);
      controls.update();
      if (t < 1) requestAnimationFrame(step);
    })();
  });
});

// Raycaster
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();
renderer.domElement.addEventListener('dblclick', (e) => {
  mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouseVec, camera);
  const hits = raycaster.intersectObjects(bridge.groups.all.children, true);
  if (hits.length > 0 && hits[0].object.userData.part) {
    document.querySelectorAll('.struct-btn').forEach(b => {
      if (b.dataset.part === hits[0].object.userData.part) b.click();
    });
  }
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;
  for (let i = 0; i < waterPositions.count; i++) {
    const x = waterPositions.getX(i), y = waterPositions.getY(i);
    waterPositions.setZ(i, waterOrigY[i] +
      Math.sin(x * 0.05 + time * 2) * 0.15 +
      Math.sin(y * 0.08 + time * 1.5) * 0.1
    );
  }
  waterPositions.needsUpdate = true;
  waterGeo.computeVertexNormals();
  controls.update();
  renderer.render(scene, camera);
}
animate();
