/* ============================================================
   洛阳桥3D交互模型 — 主控制器
   Scene, Lighting, Camera, Controls, UI interactions
   ============================================================ */
(function() {
  'use strict';

  // ===== SCENE SETUP =====
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2a3a);
  scene.fog = new THREE.FogExp2(0x1a2a3a, 0.008);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(40, 25, 40);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 10;
  controls.maxDistance = 120;
  controls.target.set(0, 0, 0);

  // ===== LIGHTING =====
  // Ambient
  const ambient = new THREE.AmbientLight(0x4a6080, 0.6);
  scene.add(ambient);

  // Main directional (sun)
  const sun = new THREE.DirectionalLight(0xffeedd, 1.5);
  sun.position.set(30, 40, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Fill light
  const fill = new THREE.DirectionalLight(0x8ab5d0, 0.4);
  fill.position.set(-20, 15, -10);
  scene.add(fill);

  // Hemisphere (sky/ground)
  const hemi = new THREE.HemisphereLight(0x88aacc, 0x443322, 0.4);
  scene.add(hemi);

  // ===== WATER PLANE =====
  const waterGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x1a5a7e,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.75
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.5;
  water.receiveShadow = true;
  scene.add(water);

  // Water animation vertices
  const waterPositions = waterGeo.attributes.position;
  const waterOriginalY = new Float32Array(waterPositions.count);
  for (let i = 0; i < waterPositions.count; i++) {
    waterOriginalY[i] = waterPositions.getZ(i);
  }

  // ===== GROUND ======
  const groundGeo = new THREE.PlaneGeometry(300, 300);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a3040, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -10;
  ground.receiveShadow = true;
  scene.add(ground);

  // ===== GRID HELPER =====
  const grid = new THREE.GridHelper(200, 40, 0x1a3050, 0x1a3050);
  grid.position.y = -9.9;
  grid.material.opacity = 0.15;
  grid.material.transparent = true;
  scene.add(grid);

  // ===== BUILD THE BRIDGE =====
  const bridge = new BridgeModel(scene);

  // ===== UI INTERACTIONS =====
  const infoPanel = document.getElementById('info-panel');
  const infoTitle = document.getElementById('info-title');
  const infoBody = document.getElementById('info-body');
  const infoClose = document.getElementById('info-close');

  // Structure buttons
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

  // Close panel
  infoClose.addEventListener('click', () => {
    infoPanel.classList.toggle('info-panel--collapsed');
  });

  // View buttons
  const viewPositions = {
    front: { pos: [0, 5, 35], target: [0, 2, 0] },
    side: { pos: [60, 8, 0], target: [0, 0, 0] },
    top: { pos: [0, 50, 0.1], target: [0, 0, 0] },
    section: { pos: [0, 10, 15], target: [0, -2, 0] },
    perspective: { pos: [40, 25, 40], target: [0, 0, 0] }
  };

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = viewPositions[btn.dataset.view];
      if (view) {
        animateCamera(view.pos, view.target);
      }
    });
  });

  function animateCamera(targetPos, targetLookAt) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos = new THREE.Vector3(...targetPos);
    const endTarget = new THREE.Vector3(...targetLookAt);
    let t = 0;

    function step() {
      t += 0.03;
      if (t > 1) t = 1;
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      camera.position.lerpVectors(startPos, endPos, ease);
      controls.target.lerpVectors(startTarget, endTarget, ease);
      controls.update();
      if (t < 1) requestAnimationFrame(step);
    }
    step();
  }

  // ===== RAYCASTER (click to select part) =====
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  renderer.domElement.addEventListener('dblclick', (e) => {
    mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(bridge.groups.all.children, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData.part) {
        // Find and activate the button
        document.querySelectorAll('.struct-btn').forEach(b => {
          if (b.dataset.part === hit.userData.part) b.click();
        });
      }
    }
  });

  // ===== RESIZE =====
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ===== ANIMATION LOOP =====
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Water waves
    for (let i = 0; i < waterPositions.count; i++) {
      const x = waterPositions.getX(i);
      const y = waterPositions.getY(i);
      const wave = Math.sin(x * 0.05 + time * 2) * 0.15 +
                   Math.sin(y * 0.08 + time * 1.5) * 0.1 +
                   Math.sin((x + y) * 0.03 + time * 3) * 0.05;
      waterPositions.setZ(i, waterOriginalY[i] + wave);
    }
    waterPositions.needsUpdate = true;
    waterGeo.computeVertexNormals();

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
})();
