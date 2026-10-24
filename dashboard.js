/* ============================================
   SMART GARDEN — 3D SCENE ENHANCED v2
   Fitur baru:
   - Volumetric god rays via layered planes
   - Animated butterflies (wing flap)
   - Leaf shader with vein glow
   - Pollen particle burst on click
   - Dew drops shimmering on leaves
   - Day/Night lighting toggle
   - Soil moisture ripple wave
   - Greenhouse neon glow trim
   - Animated drip irrigation tubes
   - Per-plant growth pulse animation
   - Fog layered + depth-of-field feel
   - Camera cinematic auto-tour
============================================ */

(function () {
  "use strict";

  // ── Scene Setup ──────────────────────────────────────
  const canvas = document.getElementById("garden-canvas");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.outputEncoding = THREE.sRGBEncoding || 3001;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8f9ee);
  scene.fog = new THREE.FogExp2(0xd0f5e0, 0.022);

  const camera = new THREE.PerspectiveCamera(
    55,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    120,
  );
  camera.position.set(0, 9, 16);
  camera.lookAt(0, 1, 0);

  // ── Resize ─────────────────────────────────────────
  function onResize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);
  onResize();

  // ── LIGHTS ─────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x8fc9a0, 2.5);
  scene.add(ambientLight);

  // Main sun (warm directional)
  const sunLight = new THREE.DirectionalLight(0xfff0cc, 3.0);
  sunLight.position.set(8, 22, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 80;
  sunLight.shadow.camera.left = -18;
  sunLight.shadow.camera.right = 18;
  sunLight.shadow.camera.top = 18;
  sunLight.shadow.camera.bottom = -18;
  sunLight.shadow.bias = -0.002;
  scene.add(sunLight);

  // Green fill from below
  const fillLight = new THREE.PointLight(0x00ff66, 1.5, 25);
  fillLight.position.set(-6, 3, -4);
  scene.add(fillLight);

  // Cool blue rim
  const rimLight = new THREE.PointLight(0x2255ff, 0.7, 20);
  rimLight.position.set(10, 4, -10);
  scene.add(rimLight);

  // Warm orange accent (sunrise feel)
  const accentLight = new THREE.PointLight(0xff8800, 0.5, 18);
  accentLight.position.set(-10, 6, 8);
  scene.add(accentLight);

  // ── GOD RAYS (Volumetric Light Beams) ──────────────
  function createGodRays() {
    const group = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xccffaa,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const h = 10 + Math.random() * 4;
      const w = 0.4 + Math.random() * 0.6;
      const geo = new THREE.PlaneGeometry(w, h);
      const ray = new THREE.Mesh(geo, rayMat.clone());
      ray.position.set(Math.cos(angle) * 1.5, h / 2 - 1, Math.sin(angle) * 1.5);
      ray.rotation.y = angle + Math.PI / 2;
      ray.rotation.z = (Math.random() - 0.5) * 0.15;
      ray.userData.baseOpacity = 0.025 + Math.random() * 0.04;
      ray.userData.phase = Math.random() * Math.PI * 2;
      group.add(ray);
    }
    group.position.set(0, 2, 0);
    scene.add(group);
    return group;
  }
  const godRays = createGodRays();

  // ── GROUND ─────────────────────────────────────────
  const groundGeo = new THREE.PlaneGeometry(36, 36, 60, 60);
  // Subtle height displacement
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i);
    pos.setZ(i, Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.08);
  }
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x4a2f1a,
    roughness: 0.95,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grass blades
  for (let i = 0; i < 350; i++) {
    const h = 0.15 + Math.random() * 0.25;
    const geo = new THREE.ConeGeometry(0.03, h, 3);
    const col = new THREE.Color().setHSL(
      0.3 + Math.random() * 0.06,
      0.75,
      0.32 + Math.random() * 0.18,
    );
    const mat = new THREE.MeshStandardMaterial({
      color: col,
      roughness: 1,
    });
    const blade = new THREE.Mesh(geo, mat);
    const bx = (Math.random() - 0.5) * 30,
      bz = (Math.random() - 0.5) * 30;
    blade.position.set(bx, h / 2, bz);
    blade.rotation.y = Math.random() * Math.PI * 2;
    blade.rotation.z = (Math.random() - 0.5) * 0.5;
    blade.castShadow = true;
    blade.userData.windOffset = Math.random() * Math.PI * 2;
    scene.add(blade);
  }

  // ── SOIL MOISTURE RIPPLE (animated ring shader) ────
  function createMoistureRipple(x, z) {
    const geo = new THREE.RingGeometry(0.01, 0.8, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x44aaff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.02, z);
    ring.userData.phase = Math.random() * Math.PI * 2;
    ring.userData.speed = 0.6 + Math.random() * 0.4;
    scene.add(ring);
    return ring;
  }
  const ripples = [];
  [
    [-4, -3],
    [0, -3],
    [4, -3],
    [-4, 3],
    [0, 3],
    [4, 3],
  ].forEach(([x, z]) => {
    for (let r = 0; r < 3; r++) {
      const ring = createMoistureRipple(
        x + (Math.random() - 0.5) * 2,
        z + (Math.random() - 0.5) * 1.5,
      );
      ring.userData.phase += r * ((Math.PI * 2) / 3);
      ripples.push(ring);
    }
  });

  // ── SAWI PLANT (Enhanced Shader Leaves) ────────────
  function createSawiPlant(maturityLevel) {
    const group = new THREE.Group();
    const mat = maturityLevel || 0.5 + Math.random() * 0.5;

    // Crown base
    const crownGeo = new THREE.CylinderGeometry(0.09 * mat, 0.065, 0.1, 8);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x2f6b18,
      roughness: 0.85,
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 0.05;
    crown.castShadow = true;
    group.add(crown);

    const numLeaves = 6 + Math.floor(mat * 5);
    for (let i = 0; i < numLeaves; i++) {
      const angle = (i / numLeaves) * Math.PI * 2 + Math.random() * 0.4;
      const leafLen = (0.22 + Math.random() * 0.18) * mat;
      const leafW = 0.09 + Math.random() * 0.07;

      // Petiole
      const petGeo = new THREE.CylinderGeometry(
        0.008,
        0.013,
        leafLen * 0.55,
        4,
      );
      const petMat = new THREE.MeshStandardMaterial({
        color: 0x4a8a22,
        roughness: 0.75,
      });
      const pet = new THREE.Mesh(petGeo, petMat);
      pet.position.set(
        Math.cos(angle) * leafLen * 0.25,
        leafLen * 0.18,
        Math.sin(angle) * leafLen * 0.25,
      );
      pet.rotation.x = -0.45;
      pet.rotation.z = Math.cos(angle) * 0.5;
      pet.castShadow = true;
      group.add(pet);

      // Leaf blade using custom ShaderMaterial for vein glow effect
      const leafGeo = new THREE.SphereGeometry(1, 10, 6);
      leafGeo.scale(leafW, 0.028, leafLen);

      const hue = 0.27 + Math.random() * 0.08;
      const lit = 0.22 + Math.random() * 0.18;
      const leafColor = new THREE.Color().setHSL(hue, 0.8, lit);
      const veinColor = new THREE.Color().setHSL(hue + 0.02, 0.5, lit + 0.25);

      const leafMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: {
            value: 0,
          },
          uLeafColor: {
            value: leafColor,
          },
          uVeinColor: {
            value: veinColor,
          },
          uWindAmt: {
            value: 0,
          },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uWindAmt;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec3 pos = position;
            // Wavy leaf edge deformation
            float wave = sin(pos.x * 6.0 + uTime * 2.0) * 0.015 * uWindAmt;
            pos.y += wave;
            pos.z += cos(pos.x * 5.0 + uTime * 1.5) * 0.01 * uWindAmt;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uLeafColor;
          uniform vec3 uVeinColor;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            // Vein pattern: main + secondary
            float mainVein = smoothstep(0.02, 0.0, abs(vUv.x - 0.5));
            float sideVein1 = smoothstep(0.012, 0.0, abs(vUv.x - 0.3)) * smoothstep(0.8, 0.2, vUv.y);
            float sideVein2 = smoothstep(0.012, 0.0, abs(vUv.x - 0.7)) * smoothstep(0.8, 0.2, vUv.y);
            float veins = max(mainVein, max(sideVein1, sideVein2));
            // Light pulse on veins
            float pulse = 0.5 + 0.5 * sin(uTime * 1.5 + vUv.y * 4.0);
            vec3 col = mix(uLeafColor, uVeinColor, veins * (0.7 + 0.3 * pulse));
            // Fresnel rim
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.0);
            col += vec3(0.05, 0.15, 0.02) * fresnel;
            // Translucency at edges
            float alpha = 0.88 + 0.12 * (1.0 - vUv.y);
            gl_FragColor = vec4(col, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const dist = leafLen * 0.58;
      leaf.position.set(
        Math.cos(angle) * dist,
        leafLen * 0.28 + Math.random() * 0.04,
        Math.sin(angle) * dist,
      );
      leaf.rotation.z = Math.cos(angle) * 0.45;
      leaf.rotation.x = Math.sin(angle) * 0.4 - 0.28;
      leaf.rotation.y = angle;
      leaf.castShadow = false; // shader mats + shadows = expensive
      leaf.userData.isLeaf = true;
      leaf.userData.baseRotY = leaf.rotation.y;
      leaf.userData.baseRotX = leaf.rotation.x;
      leaf.userData.windOffset = Math.random() * Math.PI * 2;
      group.add(leaf);
    }

    // Dew drops on some leaves
    if (Math.random() > 0.4) {
      for (let d = 0; d < 2 + Math.floor(Math.random() * 3); d++) {
        const dewGeo = new THREE.SphereGeometry(
          0.012 + Math.random() * 0.01,
          6,
          6,
        );
        const dewMat = new THREE.MeshStandardMaterial({
          color: 0xaaddff,
          roughness: 0.0,
          metalness: 0.0,
          transparent: true,
          opacity: 0.7,
          envMapIntensity: 2,
        });
        const dew = new THREE.Mesh(dewGeo, dewMat);
        const da = Math.random() * Math.PI * 2;
        const dr = Math.random() * 0.15 * mat;
        dew.position.set(
          Math.cos(da) * dr,
          0.25 * mat + 0.05,
          Math.sin(da) * dr,
        );
        dew.userData.isDew = true;
        dew.userData.phase = Math.random() * Math.PI * 2;
        group.add(dew);
      }
    }

    // Center bud glow
    const budGeo = new THREE.SphereGeometry(0.045 * mat, 8, 8);
    const budMat = new THREE.MeshStandardMaterial({
      color: 0xaaee44,
      roughness: 0.4,
      emissive: 0x336600,
      emissiveIntensity: 0.6,
    });
    const bud = new THREE.Mesh(budGeo, budMat);
    bud.position.y = 0.1 + 0.08 * mat;
    group.add(bud);

    // Growth ring (glowing halo around base)
    const ringGeo = new THREE.RingGeometry(0.08, 0.12, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x44ff88,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.32;
    ring.userData.isGrowthRing = true;
    group.add(ring);

    group.userData.isSawiPlant = true;
    group.userData.windOffset = Math.random() * Math.PI * 2;
    group.userData.mat = mat;
    group.userData.growthPhase = Math.random() * Math.PI * 2;
    group.rotation.y = Math.random() * Math.PI * 2;
    return group;
  }

  // ── GARDEN BEDS ────────────────────────────────────
  function createBed(x, z) {
    const group = new THREE.Group();

    // Soil bed
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x2d1508,
      roughness: 0.97,
    });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 2.3), bedMat);
    bed.position.y = 0.16;
    bed.castShadow = true;
    bed.receiveShadow = true;
    group.add(bed);

    // Wood borders with grain texture feel
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x5c3318,
      roughness: 0.92,
      metalness: 0.0,
    });
    [
      [3.8, 0.22, 0.12, 0, 0.36, 1.15],
      [3.8, 0.22, 0.12, 0, 0.36, -1.15],
      [0.12, 0.22, 2.3, 1.9, 0.36, 0],
      [0.12, 0.22, 2.3, -1.9, 0.36, 0],
    ].forEach(([w, h, d, bx, by, bz]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), borderMat);
      m.position.set(bx, by, bz);
      m.castShadow = true;
      group.add(m);
    });

    // Neon green LED strip on bed edges (emissive glow)
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x00ff66,
      emissive: 0x00ff44,
      emissiveIntensity: 1.5,
      roughness: 0.5,
    });
    [
      [3.8, 0.04, 0.04, 0, 0.48, 1.15],
      [3.8, 0.04, 0.04, 0, 0.48, -1.15],
    ].forEach(([w, h, d, bx, by, bz]) => {
      const led = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ledMat);
      led.position.set(bx, by, bz);
      group.add(led);
    });

    // Drip irrigation tubes
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.3,
    });
    for (let tx = -1.3; tx <= 1.3; tx += 0.87) {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2.3, 6),
        tubeMat,
      );
      tube.position.set(tx, 0.45, 0);
      tube.rotation.x = Math.PI / 2;
      group.add(tube);
    }

    // Plants
    const positions = [
      [-1.3, -0.75],
      [-1.3, 0],
      [-1.3, 0.75],
      [-0.43, -0.75],
      [-0.43, 0],
      [-0.43, 0.75],
      [0.43, -0.75],
      [0.43, 0],
      [0.43, 0.75],
      [1.3, -0.75],
      [1.3, 0],
      [1.3, 0.75],
    ];
    positions.forEach(([px, pz]) => {
      const plant = createSawiPlant(0.5 + Math.random() * 0.5);
      plant.position.set(px, 0.32, pz);
      group.add(plant);
    });

    group.position.set(x, 0, z);
    scene.add(group);
    return group;
  }

  const beds = [
    createBed(-4, -3),
    createBed(0, -3),
    createBed(4, -3),
    createBed(-4, 3),
    createBed(0, 3),
    createBed(4, 3),
  ];

  // ── GREENHOUSE FRAME (Enhanced) ────────────────────
  function createGreenhouse() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x3a6640,
      roughness: 0.5,
      metalness: 0.6,
      emissive: 0x0a1a0a,
      emissiveIntensity: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88ffcc,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      envMapIntensity: 1.5,
    });
    // Neon glow trim
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00ffaa,
      emissive: 0x00ff88,
      emissiveIntensity: 2.0,
      roughness: 0.3,
    });

    const group = new THREE.Group();

    // Main posts
    [
      [-5.8, -4.8],
      [5.8, -4.8],
      [-5.8, 4.8],
      [5.8, 4.8],
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 5.5, 0.14),
        frameMat,
      );
      post.position.set(px, 2.75, pz);
      post.castShadow = true;
      group.add(post);
      // Glow strip on post
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 5.5, 0.04),
        glowMat,
      );
      glow.position.set(px, 2.75, pz);
      group.add(glow);
    });

    // Cross beams
    [[-4.8, 4.8]].forEach((z) => {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(11.6, 0.1, 0.12),
        frameMat,
      );
      b.position.set(0, 5.5, z);
      group.add(b);
    });

    // Ridge beam
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 0.12, 0.12),
      frameMat,
    );
    ridge.position.set(0, 7.0, 0);
    group.add(ridge);

    // Roof panels
    const roofGeo = new THREE.PlaneGeometry(11.5, 6);
    [-1, 1].forEach((s) => {
      const roof = new THREE.Mesh(roofGeo, glassMat);
      roof.position.set(0, 6.2, s * 2.5);
      roof.rotation.x = s * 0.5;
      group.add(roof);
    });

    // Side walls
    const wallGeo = new THREE.PlaneGeometry(9.5, 5.5);
    [-4.8, 4.8].forEach((z, i) => {
      const wall = new THREE.Mesh(wallGeo, glassMat);
      wall.position.set(0, 2.75, z);
      if (i === 1) wall.rotation.y = Math.PI;
      group.add(wall);
    });

    // End walls
    const endGeo = new THREE.PlaneGeometry(11.6, 5.5);
    [-5.8, 5.8].forEach((px, i) => {
      const wall = new THREE.Mesh(endGeo, glassMat);
      wall.position.set(px, 2.75, 0);
      wall.rotation.y = (Math.PI / 2) * (i === 0 ? 1 : -1);
      group.add(wall);
    });

    scene.add(group);
  }
  createGreenhouse();

  // ── BUTTERFLIES ───────────────────────────────────
  function createButterfly() {
    const group = new THREE.Group();

    // Wing material (iridescent)
    const wingColors = [0xff6688, 0xff9922, 0xffdd00, 0x88ddff, 0xaa66ff];
    const wCol = wingColors[Math.floor(Math.random() * wingColors.length)];
    const wingMat = new THREE.MeshStandardMaterial({
      color: wCol,
      emissive: new THREE.Color(wCol).multiplyScalar(0.3),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.3,
    });

    // Left wing
    const lwGeo = new THREE.SphereGeometry(1, 6, 4);
    lwGeo.scale(0.22, 0.04, 0.15);
    const lw = new THREE.Mesh(lwGeo, wingMat);
    lw.position.set(-0.13, 0, 0);
    group.add(lw);

    // Right wing
    const rwGeo = new THREE.SphereGeometry(1, 6, 4);
    rwGeo.scale(0.22, 0.04, 0.15);
    const rw = new THREE.Mesh(rwGeo, wingMat);
    rw.position.set(0.13, 0, 0);
    group.add(rw);

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.18, 5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    group.userData.isButterfly = true;
    group.userData.lw = lw;
    group.userData.rw = rw;
    group.userData.phase = Math.random() * Math.PI * 2;
    group.userData.flapSpeed = 4 + Math.random() * 4;
    group.userData.pathRadius = 2 + Math.random() * 4;
    group.userData.pathSpeed = 0.3 + Math.random() * 0.3;
    group.userData.pathPhase = Math.random() * Math.PI * 2;
    group.userData.height = 1.5 + Math.random() * 3;
    group.userData.cx = (Math.random() - 0.5) * 8;
    group.userData.cz = (Math.random() - 0.5) * 6;

    scene.add(group);
    return group;
  }
  const butterflies = [];
  for (let i = 0; i < 6; i++) butterflies.push(createButterfly());

  // ── POLLEN PARTICLES (burst on click) ─────────────
  const pollenParticles = [];

  function createPollenBurst(x, y, z) {
    for (let i = 0; i < 20; i++) {
      const geo = new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 4, 4);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.12 + Math.random() * 0.08, 1, 0.7),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.04 + Math.random() * 0.06;
      p.userData.vx = Math.sin(phi) * Math.cos(theta) * speed;
      p.userData.vy = Math.abs(Math.cos(phi)) * speed + 0.01;
      p.userData.vz = Math.sin(phi) * Math.sin(theta) * speed;
      p.userData.life = 1.0;
      p.userData.decay = 0.02 + Math.random() * 0.02;
      scene.add(p);
      pollenParticles.push(p);
    }
  }

  // Click anywhere on canvas to spawn pollen
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.2);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    if (target) createPollenBurst(target.x, target.y, target.z);
  });

  // ── DRIP WATER SYSTEM ─────────────────────────────
  const droplets = [];

  function createDropletSystem() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.75,
      roughness: 0.0,
      metalness: 0.1,
    });
    for (let i = 0; i < 60; i++) {
      const geo = new THREE.SphereGeometry(0.022, 5, 5);
      const drop = new THREE.Mesh(geo, mat.clone());
      resetDroplet(drop, true);
      scene.add(drop);
      droplets.push(drop);
    }
  }

  function resetDroplet(drop, random = false) {
    drop.position.x = (Math.random() - 0.5) * 10;
    drop.position.z = (Math.random() - 0.5) * 8;
    drop.position.y = random ? Math.random() * 6 : 6.0;
    drop.userData.speed = 0.06 + Math.random() * 0.1;
    drop.userData.wobble = Math.random() * Math.PI * 2;
    drop.visible = Math.random() > 0.4;
  }
  createDropletSystem();

  let rainEnabled = false;
  document.getElementById("btn-rain").addEventListener("click", () => {
    rainEnabled = !rainEnabled;
    document.getElementById("btn-rain").classList.toggle("active", rainEnabled);
    droplets.forEach((d) => {
      d.visible = rainEnabled;
    });
  });

  // ── AMBIENT MIST PARTICLES ─────────────────────────
  const mistParticles = [];
  for (let i = 0; i < 60; i++) {
    const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 4, 4);
    const col = new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.7, 0.65);
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(
      (Math.random() - 0.5) * 14,
      0.2 + Math.random() * 3.5,
      (Math.random() - 0.5) * 12,
    );
    p.userData.offset = Math.random() * Math.PI * 2;
    p.userData.speed = 0.15 + Math.random() * 0.4;
    p.userData.maxOpac = 0.25 + Math.random() * 0.3;
    scene.add(p);
    mistParticles.push(p);
  }

  // ── DAY/NIGHT TOGGLE ──────────────────────────────
  let isNight = false;
  document.getElementById("btn-rotate").addEventListener("click", () => {
    // reuse btn-rotate for auto rotate but also add night btn below
  });

  // Extra night button injected
  const nightBtn = document.createElement("button");
  nightBtn.className = "g3d-btn";
  nightBtn.id = "btn-night";
  nightBtn.textContent = "🌙 Night Mode";
  document.querySelector(".g3d-controls").appendChild(nightBtn);
  nightBtn.addEventListener("click", () => {
    isNight = !isNight;
    nightBtn.classList.toggle("active", isNight);
    if (isNight) {
      scene.background = new THREE.Color(0x010408);
      scene.fog = new THREE.FogExp2(0x010408, 0.025);
      sunLight.intensity = 0.3;
      sunLight.color.set(0x3355aa);
      ambientLight.intensity = 0.4;
      fillLight.intensity = 2.5;
      fillLight.color.set(0x00ffaa);
    } else {
      scene.background = new THREE.Color(0xe8f9ee);
      scene.fog = new THREE.FogExp2(0xd0f5e0, 0.022);
      sunLight.intensity = 3.0;
      sunLight.color.set(0xfff0cc);
      ambientLight.intensity = 2.5;
      fillLight.intensity = 1.5;
      fillLight.color.set(0x00ff66);
    }
  });

  // ── MOUSE ORBIT CONTROL ────────────────────────────
  let isDragging = false;
  let prevMouse = {
    x: 0,
    y: 0,
  };
  let spherical = {
    theta: 0,
    phi: 0.58,
  };
  let targetSpherical = {
    theta: 0,
    phi: 0.58,
  };
  let autoRotate = true;
  let camDist = 16;
  let targetCamDist = 16;

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevMouse = {
      x: e.clientX,
      y: e.clientY,
    };
    autoRotate = false;
    document.getElementById("btn-rotate").classList.remove("active");
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - prevMouse.x) * 0.005;
    const dy = (e.clientY - prevMouse.y) * 0.003;
    targetSpherical.theta -= dx;
    targetSpherical.phi = Math.max(
      0.15,
      Math.min(1.5, targetSpherical.phi + dy),
    );
    prevMouse = {
      x: e.clientX,
      y: e.clientY,
    };
  });
  canvas.addEventListener("mouseup", () => (isDragging = false));
  canvas.addEventListener("mouseleave", () => (isDragging = false));

  // Touch
  let prevTouch = null;
  canvas.addEventListener("touchstart", (e) => {
    prevTouch = e.touches[0];
    autoRotate = false;
  });
  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!prevTouch) return;
      targetSpherical.theta -=
        (e.touches[0].clientX - prevTouch.clientX) * 0.005;
      prevTouch = e.touches[0];
      e.preventDefault();
    },
    {
      passive: false,
    },
  );
  canvas.addEventListener("touchend", () => (prevTouch = null));

  // Zoom
  canvas.addEventListener("wheel", (e) => {
    targetCamDist = Math.max(6, Math.min(26, targetCamDist + e.deltaY * 0.02));
  });

  // Buttons
  document.getElementById("btn-rotate").addEventListener("click", () => {
    autoRotate = !autoRotate;
    document
      .getElementById("btn-rotate")
      .classList.toggle("active", autoRotate);
  });
  document.getElementById("btn-top").addEventListener("click", () => {
    targetSpherical.theta = 0;
    targetSpherical.phi = 0.1;
    autoRotate = false;
  });

  // ── PLANT COLOR UPDATE ─────────────────────────────
  window.updateGardenCondition = function (soilPct, tempVal) {
    const condition = soilPct < 35 ? "dry" : soilPct > 82 ? "wet" : "normal";
    const colors = {
      dry: new THREE.Color(0x8fba50),
      normal: new THREE.Color(0x3a8a1e),
      wet: new THREE.Color(0x1c6a2a),
    };
    const targetColor = colors[condition];
    scene.traverse((obj) => {
      if (
        obj.isMesh &&
        obj.material &&
        obj.material.uniforms &&
        obj.material.uniforms.uLeafColor
      ) {
        obj.material.uniforms.uLeafColor.value.lerp(targetColor, 0.04);
      } else if (obj.isMesh && obj.material && obj.material.color) {
        const c = obj.material.color;
        if (c.g > c.r && c.g > c.b) c.lerp(targetColor, 0.04);
      }
    });
    // Catatan: label "Status Sawi" di info bar sudah dihilangkan dari UI,
    // jadi di sini cukup mengubah warna daun sesuai kondisi tanah.
  };

  // ── ANIMATION LOOP ─────────────────────────────────
  const clock = new THREE.Clock();
  let windTime = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    windTime = elapsed;

    // Camera orbit
    if (autoRotate) targetSpherical.theta += dt * 0.12;
    spherical.theta += (targetSpherical.theta - spherical.theta) * 0.07;
    spherical.phi += (targetSpherical.phi - spherical.phi) * 0.07;
    camDist += (targetCamDist - camDist) * 0.06;

    camera.position.x =
      camDist * Math.sin(spherical.theta) * Math.sin(spherical.phi);
    camera.position.y = camDist * Math.cos(spherical.phi) + 2;
    camera.position.z =
      camDist * Math.cos(spherical.theta) * Math.sin(spherical.phi);
    camera.lookAt(0, 1.5, 0);

    // God rays pulse
    godRays.children.forEach((ray) => {
      const t = elapsed * 0.7 + ray.userData.phase;
      ray.material.opacity =
        ray.userData.baseOpacity * (0.6 + 0.4 * Math.sin(t));
      ray.rotation.y += dt * 0.02;
    });

    // Wind sway on sawi plants (all leaf shader materials)
    beds.forEach((bed, bi) => {
      bed.children.forEach((child) => {
        if (child.userData && child.userData.isSawiPlant) {
          const wo = child.userData.windOffset || 0;
          child.rotation.z = Math.sin(windTime * 1.1 + bi * 0.7 + wo) * 0.05;
          child.rotation.x = Math.sin(windTime * 0.85 + bi * 0.5 + wo) * 0.035;

          child.children.forEach((leaf) => {
            if (
              leaf.userData &&
              leaf.userData.isLeaf &&
              leaf.material.uniforms
            ) {
              leaf.material.uniforms.uTime.value = elapsed;
              leaf.material.uniforms.uWindAmt.value =
                1.0 + Math.sin(elapsed * 0.5 + wo) * 0.3;
            }
            // Growth ring pulse
            if (leaf.userData && leaf.userData.isGrowthRing) {
              const gp = child.userData.growthPhase;
              leaf.material.opacity =
                0.15 + 0.25 * Math.abs(Math.sin(elapsed * 1.2 + gp));
              const s = 0.9 + 0.2 * Math.sin(elapsed * 1.5 + gp);
              leaf.scale.set(s, s, s);
            }
            // Dew shimmer
            if (leaf.userData && leaf.userData.isDew) {
              leaf.material.opacity =
                0.5 + 0.3 * Math.sin(elapsed * 2 + leaf.userData.phase);
            }
          });
        }
      });
    });

    // Moisture ripples
    ripples.forEach((ring) => {
      const t = elapsed * ring.userData.speed + ring.userData.phase;
      const cycle = (t % (Math.PI * 2)) / (Math.PI * 2);
      ring.scale.set(0.3 + cycle * 2.5, 0.3 + cycle * 2.5, 1);
      ring.material.opacity = (1 - cycle) * 0.25;
    });

    // Butterfly animation
    butterflies.forEach((bf) => {
      const t = elapsed * bf.userData.flapSpeed + bf.userData.phase;
      const flapAngle = Math.sin(t) * 0.7;
      bf.userData.lw.rotation.z = flapAngle + 0.2;
      bf.userData.rw.rotation.z = -flapAngle - 0.2;

      // Circular path
      const pt = elapsed * bf.userData.pathSpeed + bf.userData.pathPhase;
      const r = bf.userData.pathRadius;
      bf.position.x = bf.userData.cx + Math.cos(pt) * r;
      bf.position.z = bf.userData.cz + Math.sin(pt * 0.7) * r * 0.5;
      bf.position.y = bf.userData.height + Math.sin(pt * 1.3) * 0.4;
      bf.rotation.y = -pt + Math.PI / 2;
    });

    // Pollen particles
    for (let i = pollenParticles.length - 1; i >= 0; i--) {
      const p = pollenParticles[i];
      p.position.x += p.userData.vx;
      p.position.y += p.userData.vy;
      p.position.z += p.userData.vz;
      p.userData.vy -= 0.001; // gravity
      p.userData.life -= p.userData.decay;
      p.material.opacity = p.userData.life * 0.9;
      if (p.userData.life <= 0) {
        scene.remove(p);
        pollenParticles.splice(i, 1);
      }
    }

    // Rain drip
    if (rainEnabled) {
      droplets.forEach((drop) => {
        drop.position.y -= drop.userData.speed;
        drop.position.x += Math.sin(elapsed + drop.userData.wobble) * 0.003;
        if (drop.position.y < 0) resetDroplet(drop);
      });
    }

    // Mist particles
    mistParticles.forEach((p) => {
      const t = elapsed * p.userData.speed + p.userData.offset;
      p.position.y += Math.sin(t * 0.8) * 0.005;
      p.position.x += Math.cos(t * 0.5) * 0.004;
      p.material.opacity = Math.max(
        0,
        Math.abs(Math.sin(t)) * p.userData.maxOpac,
      );
      // Reset out-of-bounds
      if (Math.abs(p.position.x) > 8) p.position.x *= -0.9;
      if (p.position.y > 4.5) p.position.y = 0.2;
    });

    // Dynamic lights
    fillLight.intensity =
      (isNight ? 2.5 : 1.5) + Math.sin(elapsed * 0.9) * 0.15;
    accentLight.position.x = Math.cos(elapsed * 0.3) * 10;
    accentLight.position.z = Math.sin(elapsed * 0.3) * 8;

    renderer.render(scene, camera);
  }

  animate();

  // Last update clock
  setInterval(() => {
    const el = document.getElementById("g3d-lastupdate");
    if (el) el.textContent = new Date().toLocaleTimeString("id-ID");
  }, 1000);
})();

// ================= second script block =================
/* ============================================
   SMART GARDEN — DASHBOARD LOGIC
   IoT sensor data, charts, notifications
============================================ */

(function () {
  "use strict";

  // ── Config ───────────────────────────────────────────
  const API_URL = "/api/sensors/latest"; // Flask endpoint
  const POLL_INTERVAL = 5000; // ms
  console.info("[SmartGarden] dashboard.js versi 20261023h dimuat");
  window.SG_JS_VERSION = "20261023h";

  // true  = selalu pakai data dummy (suhu air, pH air, PPM) tanpa memanggil API.
  // false = pakai API sungguhan; field yang kosong/tidak valid otomatis
  //         diganti nilai dummy supaya tampilan tidak pernah kosong.
  const USE_DUMMY_DATA = true;

  // ══════════════════════════════════════════════════════
  // MESIN DATA DUMMY
  // Nilai dummy adalah FUNGSI dari waktu (bukan angka acak murni), jadi
  // riwayat masa lalu dan data realtime selalu nyambung: grafik 24 jam /
  // 7 hari / 30 hari dihitung dari fungsi yang sama dengan nilai "sekarang".
  // ══════════════════════════════════════════════════════
  const DUMMY = (function () {
    const MIN = 60e3;
    const hash = (n) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    // noise halus -1..1 yang berubah pelan tiap `period` ms
    const noise = (t, period, seed) => {
      const k = t / period;
      const i = Math.floor(k);
      const f = k - i;
      const sm = f * f * (3 - 2 * f);
      const a = hash(i + seed * 1013);
      const b = hash(i + 1 + seed * 1013);
      return (a * (1 - sm) + b * sm) * 2 - 1;
    };
    const hourOf = (t) => {
      const d = new Date(t);
      return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    };
    const dayWave = (t, peakHour) =>
      Math.sin((2 * Math.PI * (hourOf(t) - peakHour + 6)) / 24);
    const r1 = (v) => +v.toFixed(1);
    const r2 = (v) => +v.toFixed(2);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const gens = {
      // Suhu air: naik siang hari, turun malam (± 23–30 °C)
      temp: (t) =>
        r1(
          clamp(
            26.5 + 2.8 * dayWave(t, 15) + 0.6 * noise(t, 20 * MIN, 1) +
              0.08 * noise(t, 5e3, 11),
            10,
            45,
          ),
        ),
      hum: (t) =>
        r1(
          clamp(
            70 - 8 * dayWave(t, 15) + 3 * noise(t, 30 * MIN, 2) +
              0.3 * noise(t, 5e3, 12),
            20,
            100,
          ),
        ),
      soil: (t) =>
        r1(
          clamp(
            62 + 4 * dayWave(t, 6) + 8 * noise(t, 180 * MIN, 3) +
              0.3 * noise(t, 5e3, 13),
            0,
            100,
          ),
        ),
      dist: (t) =>
        r1(
          clamp(
            11 + 2 * noise(t, 120 * MIN, 4) + 0.2 * noise(t, 5e3, 14),
            2,
            30,
          ),
        ),
      // pH air: berayun pelan di sekitar 6.0 – 7.0
      ph: (t) =>
        r2(
          clamp(
            6.5 + 0.55 * Math.sin((2 * Math.PI * t) / (3 * 3600e3) + 1) +
              0.15 * noise(t, 15 * MIN, 6) + 0.015 * noise(t, 5e3, 16),
            0,
            14,
          ),
        ),
      // PPM larutan: berayun ± 780–1120 sehingga sesekali melewati batas
      // maksimal (notifikasi) dan sesekali mendekati batas minimal
      ppm: (t) =>
        Math.round(
          clamp(
            960 + 170 * Math.sin((2 * Math.PI * t) / (2 * 3600e3) + 0.8) +
              45 * noise(t, 25 * MIN, 7) + 6 * noise(t, 5e3, 17),
            0,
            2000,
          ),
        ),
    };
    return {
      value: (key, t) => gens[key](t),
      snapshot: (t) => ({
        temp: gens.temp(t),
        hum: gens.hum(t),
        soil: gens.soil(t),
        dist: gens.dist(t),
        ph: gens.ph(t),
        ppm: gens.ppm(t),
      }),
    };
  })();

  // Resolusi grafik per periode (24 jam = tiap 10 menit, 7 hari = tiap jam,
  // 30 hari = tiap 3 jam). Titik terakhir selalu "live" (diperbarui realtime).
  const PERIODS = {
    "24h": { step: 10 * 60e3, points: 144 },
    "7d": { step: 3600e3, points: 168 },
    "30d": { step: 3 * 3600e3, points: 240 },
  };

  // ══════════════════════════════════════════════════════
  // PWA: SERVICE WORKER + NOTIFIKASI NATIVE (system tray HP)
  // ══════════════════════════════════════════════════════
  let swRegistration = null;

  // Ambil service worker registration, tapi jangan menggantung selamanya
  // kalau service worker gagal terdaftar (mis. dibuka via file://).
  async function getSwReg() {
    if (swRegistration) return swRegistration;
    if (!("serviceWorker" in navigator)) return null;
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        swRegistration = await navigator.serviceWorker.register("./sw.js");
        console.log("[SmartGarden] Service worker terdaftar.");
      } catch (err) {
        console.warn("[SmartGarden] Gagal mendaftarkan service worker:", err);
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // PWA: TOMBOL INSTALL / DOWNLOAD APLIKASI
  // ══════════════════════════════════════════════════════
  let deferredInstallPrompt = null;
  const installAppBtn = document.getElementById("install-app-btn");

  function isRunningStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ); // iOS Safari
  }

  function hideInstallButton() {
    if (installAppBtn) installAppBtn.style.display = "none";
  }

  function showInstallButton() {
    if (installAppBtn && !isRunningStandalone())
      installAppBtn.style.display = "flex";
  }

  // Chrome/Edge/Android: browser memberi tahu kita saat aplikasi
  // memenuhi syarat untuk diinstall. Simpan event-nya, lalu munculkan
  // tombol supaya user bisa memicu prompt instalasi kapan saja.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallButton();
  });

  if (installAppBtn) {
    installAppBtn.addEventListener("click", async () => {
      // Kalau browser tidak mengirim beforeinstallprompt (mis. Safari/iOS,
      // atau sudah pernah di-dismiss), tampilkan petunjuk manual.
      if (!deferredInstallPrompt) {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        showNotification(
          "",
          "📲",
          "Install Aplikasi",
          isIOS
            ? 'Ketuk tombol Bagikan (Share) di Safari, lalu pilih "Add to Home Screen".'
            : 'Buka menu (⋮) browser, lalu pilih "Install app" / "Tambahkan ke layar utama".',
        );
        return;
      }

      installAppBtn.disabled = true;
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installAppBtn.disabled = false;

      if (choice.outcome === "accepted") {
        hideInstallButton();
        showNotification(
          "",
          "✅",
          "Aplikasi Terinstall",
          "SmartGarden berhasil ditambahkan ke perangkat Anda.",
        );
      }
    });
  }

  // Setelah benar-benar terinstall (lewat prompt ini ATAU lewat menu
  // browser secara manual), sembunyikan tombolnya.
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    hideInstallButton();
    showNotification(
      "",
      "✅",
      "Aplikasi Terinstall",
      "SmartGarden berhasil ditambahkan ke perangkat Anda.",
    );
  });

  // Kalau sudah berjalan sebagai app ter-install (standalone), tombol
  // install tidak relevan lagi → tetap disembunyikan.
  if (isRunningStandalone()) hideInstallButton();

  // ── Manual Control (Nutrisi A/B, pH Up/Down) ──
  // Catatan: saat ini toggle hanya mengubah tampilan (belum terhubung
  // ke relay/aktuator fisik). Kalau nanti sudah ada API kontrolnya,
  // tinggal tambahkan fetch() ke endpoint tersebut di dalam fungsi ini.
  function handleControlToggle(name, isOn) {
    const card = document.getElementById("control-" + name);
    const status = document.getElementById("status-" + name);
    const toggle = card ? card.querySelector('input[type="checkbox"]') : null;
    const previous = toggle ? !isOn : false;
    if (card) card.classList.toggle("is-on", isOn);
    if (status) status.textContent = isOn ? "ON" : "OFF";
    console.log("[SmartGarden] Kontrol", name, "→", isOn ? "ON" : "OFF");
    if (window.sgFirebase && window.sgFirebase.setPump) {
      window.sgFirebase.setPump(name, isOn).catch(err => {
        console.error('[Firebase kontrol pompa]', err);
        alert('Perintah pompa gagal disimpan ke Firebase: ' + (err.message || err));
        if (toggle) toggle.checked = previous;
        if (card) card.classList.toggle('is-on', previous);
        if (status) status.textContent = previous ? 'ON' : 'OFF';
      });
    } else {
      alert('Firebase belum siap. Muat ulang halaman dan login kembali.');
      if (toggle) toggle.checked = previous;
      if (card) card.classList.toggle('is-on', previous);
      if (status) status.textContent = previous ? 'ON' : 'OFF';
    }

    // Setiap kali dinyalakan (ON), catat sebagai satu kali penambahan.
    if (isOn && typeof recordDoseEvent === "function") {
      recordDoseEvent(name);
    }

    // Nutrisi A/B menaikkan PPM larutan saat dinyalakan (simulasi)
    if (
      isOn &&
      (name === "nutrisi-a" || name === "nutrisi-b") &&
      typeof bumpPpmFromDosing === "function"
    ) {
      bumpPpmFromDosing(name);
    }
  }

  // Dipanggil dari atribut onchange="" di HTML, jadi harus global
  window.handleControlToggle = handleControlToggle;

  const btnEnableNotif = document.getElementById("btn-enable-notif");
  const btnDisableNotif = document.getElementById("btn-disable-notif");
  const notifEnableLabel = document.getElementById("notif-enable-label");
  const notifDisableLabel = document.getElementById("notif-disable-label");

  // ── Menu Pengaturan (dropdown: notifikasi + akun + keluar) ──
  const settingsToggleBtn = document.getElementById("settings-toggle-btn");
  const settingsDropdown = document.getElementById("settings-dropdown");
  if (settingsToggleBtn && settingsDropdown) {
    const closeSettingsMenu = () => {
      settingsDropdown.classList.remove("open");
      settingsToggleBtn.classList.remove("open");
      settingsToggleBtn.setAttribute("aria-expanded", "false");
    };
    settingsToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !settingsDropdown.classList.contains("open");
      settingsDropdown.classList.toggle("open", willOpen);
      settingsToggleBtn.classList.toggle("open", willOpen);
      settingsToggleBtn.setAttribute(
        "aria-expanded",
        willOpen ? "true" : "false",
      );
    });
    document.addEventListener("click", (e) => {
      if (
        !settingsDropdown.contains(e.target) &&
        !settingsToggleBtn.contains(e.target)
      ) {
        closeSettingsMenu();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSettingsMenu();
    });
  }

  // ── Notifikasi (lonceng) di header ──
  const notifToggleBtn = document.getElementById("notif-toggle-btn");
  const notifDropdown = document.getElementById("notif-dropdown");
  if (notifToggleBtn && notifDropdown) {
    const closeNotifMenu = () => {
      notifDropdown.classList.remove("open");
      notifToggleBtn.classList.remove("open");
      notifToggleBtn.setAttribute("aria-expanded", "false");
    };
    notifToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !notifDropdown.classList.contains("open");
      notifDropdown.classList.toggle("open", willOpen);
      notifToggleBtn.classList.toggle("open", willOpen);
      notifToggleBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
    document.addEventListener("click", (e) => {
      if (
        !notifDropdown.contains(e.target) &&
        !notifToggleBtn.contains(e.target)
      ) {
        closeNotifMenu();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNotifMenu();
    });
  }

  // ── Mode Gelap / Terang ──
  const THEME_STORAGE_KEY = "smartgarden-theme";
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");

  function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    if (themeToggleIcon) themeToggleIcon.textContent = isDark ? "☀️" : "🌙";
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggleBtn.title = isDark ? "Mode Terang" : "Mode Gelap";
    }
  }

  // Terapkan preferensi tersimpan (default: terang)
  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) === "dark");

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = !document.body.classList.contains("dark-mode");
      applyTheme(isDark);
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    });
  }

  // ── Pill "Just now" — waktu sejak data sensor terakhir masuk ──
  let lastUpdateTimestamp = Date.now();
  const lastUpdateTextEl = document.getElementById("last-update-text");

  function refreshLastUpdateText() {
    if (!lastUpdateTextEl) return;
    const seconds = Math.max(
      0,
      Math.floor((Date.now() - lastUpdateTimestamp) / 1000),
    );
    let text;
    if (seconds < 10) {
      text = "Just now";
    } else if (seconds < 60) {
      text = `${seconds}s ago`;
    } else if (seconds < 3600) {
      text = `${Math.floor(seconds / 60)}m ago`;
    } else {
      text = `${Math.floor(seconds / 3600)}h ago`;
    }
    lastUpdateTextEl.textContent = text;
  }
  setInterval(refreshLastUpdateText, 1000);

  // ── Navigasi sidebar ala tab: 1 menu = 1 section yang tampil ──
  const navLinksEl = document.getElementById("nav-links");
  const pageSections = document.querySelectorAll(".page-section");
  const topbarTitleEl = document.getElementById("topbar-title");
  const MOBILE_BREAKPOINT = 900;

  function showPageSection(id) {
    pageSections.forEach((sec) => {
      sec.classList.toggle("active-section", sec.id === id);
    });
    // Beberapa canvas (mis. 3D Garden via Three.js) butuh dipicu resize
    // ulang setelah section-nya berpindah dari display:none ke terlihat.
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }

  // ── Sidebar mobile: buka/tutup lewat tombol hamburger di header ──
  const navHamburger = document.getElementById("nav-hamburger");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");

  function setSidebarOpen(open) {
    document.body.classList.toggle("sidebar-open", open);
    if (navHamburger) {
      navHamburger.classList.toggle("open", open);
      navHamburger.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  if (navHamburger) {
    navHamburger.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("sidebar-open");
      setSidebarOpen(!isOpen);
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", () => setSidebarOpen(false));
  }

  if (navLinksEl) {
    navLinksEl.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").slice(1);
        navLinksEl
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        showPageSection(targetId);

        // Judul di topbar ikut berubah sesuai menu yang dipilih
        if (topbarTitleEl) topbarTitleEl.textContent = link.textContent.trim();

        // Di mobile, tutup sidebar otomatis setelah user pilih salah satu menu
        if (window.innerWidth <= MOBILE_BREAKPOINT) setSidebarOpen(false);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    });
  }

  // ── Navbar mengambang: sedikit lebih solid saat halaman discroll ──
  const navbarEl = document.getElementById("navbar");
  if (navbarEl) {
    const onNavScroll = () => {
      navbarEl.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onNavScroll, {
      passive: true,
    });
    onNavScroll();
  }

  // Menyimpan preferensi user secara lokal (terpisah dari izin browser,
  // yang memang tidak bisa dicabut lewat kode — cuma bisa lewat Settings
  // HP). Preferensi ini menentukan apakah kita subscribe/unsubscribe.
  // Status notifikasi HANYA disimpan di memori (bukan localStorage), jadi
  // setiap kali web dibuka / di-refresh notifikasi selalu MATI dulu dan baru
  // aktif setelah pengguna menekan tombol "Aktifkan Notifikasi".
  const PUSH_PREF_KEY = "sg_push_enabled"; // key lama, dibersihkan di bawah
  let notifEnabled = false;
  try {
    localStorage.removeItem(PUSH_PREF_KEY);
  } catch {}

  function getPushPref() {
    return notifEnabled;
  }

  function setPushPref(val) {
    notifEnabled = !!val;
  }

  // Dua tombol terpisah (bukan satu tombol toggle) supaya jelas &
  // sepenuhnya manual: pengguna sendiri yang memutuskan kapan menyalakan
  // atau mematikan notifikasi. Saat halaman pertama kali dibuka, TIDAK
  // ADA permintaan izin notifikasi otomatis — hanya muncul saat tombol
  // "Aktifkan Notifikasi" benar-benar diklik.
  function refreshNotifButtonUI() {
    // Status AKTIF = peringatan di dalam aplikasi menyala. Notifikasi sistem
    // (tray HP) hanya ikut kalau izin browser "granted". Tidak bergantung
    // pada izin browser supaya peringatan tetap muncul walau izin diblokir.
    const active = getPushPref();
    if (notifToggleBtn) notifToggleBtn.textContent = active ? "🔔" : "🔕";
    document.querySelectorAll(".notif-state-text").forEach((el) => {
      el.innerHTML = active
        ? "Status notifikasi: <strong>AKTIF</strong>"
        : "Status notifikasi: <strong>MATI</strong> — aktifkan lewat ikon 🔕 di pojok kanan atas.";
    });
    if (!btnEnableNotif || !btnDisableNotif) return;
    btnEnableNotif.classList.remove("denied");
    btnEnableNotif.disabled = false;
    btnDisableNotif.disabled = false;
    btnEnableNotif.style.display = active ? "none" : "flex";
    btnDisableNotif.style.display = active ? "flex" : "none";
    notifEnableLabel.textContent = "Aktifkan Notifikasi";
    notifDisableLabel.textContent = "Nonaktifkan Notifikasi";
  }

  // Public key VAPID — HARUS sama dengan publicKey di vapid_config.php
  const VAPID_PUBLIC_KEY =
    "BLuuBJwztST6fSbhzjQzbyM1C9kdJNmgWdxNxja6lS72s_rOUL4i1ed5QpD-cv_2Wfy4Tx4vF6Gm6xJRYM-f8p4";

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }

  // Daftarkan HP ini ke server (subscribe) supaya server bisa kirim push
  // notifikasi walau aplikasi ini sudah ditutup total.
  async function subscribeToPush() {
    try {
      const reg = await getSwReg();
      if (!reg || !reg.pushManager) return false;

      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
      console.log("[SmartGarden] Berhasil subscribe push notification.");
      return true;
    } catch (err) {
      console.warn("[SmartGarden] Gagal subscribe push notification:", err);
      return false;
    }
  }

  // Matikan notifikasi: batalkan subscription di browser DAN beri tahu
  // server supaya HP ini dihapus dari daftar penerima push.
  async function unsubscribeFromPush() {
    try {
      const reg = await getSwReg();
      if (!reg || !reg.pushManager) return;

      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
        await subscription.unsubscribe();
      }
      console.log("[SmartGarden] Notifikasi dinonaktifkan.");
    } catch (err) {
      console.warn("[SmartGarden] Gagal unsubscribe:", err);
    }
  }

  // Tombol "Aktifkan Notifikasi": baru di titik INI izin browser
  // (Notification.requestPermission) diminta — bukan otomatis saat
  // halaman dibuka. Kalau user tidak pernah menekan tombol ini,
  // browser tidak akan pernah menampilkan popup izin notifikasi.
  async function enableNotif() {
    btnEnableNotif.disabled = true;

    // Minta izin notifikasi sistem HANYA saat tombol ini diklik. Apa pun
    // hasilnya (diizinkan / ditolak / tidak didukung), peringatan di dalam
    // aplikasi tetap diaktifkan.
    let perm = "unsupported";
    if ("Notification" in window) {
      perm = Notification.permission;
      if (perm === "default") {
        try {
          perm = await Notification.requestPermission();
        } catch {
          perm = Notification.permission;
        }
      }
    }
    const nativeOk = perm === "granted";

    setPushPref(true);
    refreshNotifButtonUI();
    showNotification(
      "",
      "🔔",
      "Notifikasi Aktif",
      nativeOk
        ? "Anda akan diberi tahu saat PPM atau pH di luar batas ideal."
        : "Peringatan PPM/pH tampil di dalam aplikasi. Notifikasi sistem tidak diizinkan atau tidak didukung browser ini.",
    );
    if (nativeOk) {
      sendNativeNotification(
        "",
        "🔔",
        "Notifikasi Aktif",
        "Peringatan PPM dan pH akan dikirim ke perangkat ini.",
        false,
      );
      subscribeToPush().catch(() => {});
    }
    // Langsung cek kondisi PPM & pH saat ini: kalau sudah di luar batas,
    // notifikasi muncul seketika.
    if (typeof reevaluatePpmNotification === "function")
      reevaluatePpmNotification();

    btnEnableNotif.disabled = false;
  }

  // Tombol "Nonaktifkan Notifikasi": matikan subscription push. Izin
  // browser tetap "granted" (itu keterbatasan browser, hanya bisa
  // dicabut manual lewat Settings HP), tapi server tidak akan lagi
  // mengirim notifikasi apa pun ke perangkat ini.
  async function disableNotif() {
    btnDisableNotif.disabled = true;
    setPushPref(false);
    refreshNotifButtonUI();
    if (els.notifContainer) els.notifContainer.innerHTML = "";
    showNotification(
      "",
      "🔕",
      "Notifikasi Dinonaktifkan",
      "Peringatan PPM tidak akan muncul sampai Anda mengaktifkannya lagi.",
    );
    // Batalkan subscription ke server push di latar belakang (opsional).
    unsubscribeFromPush().catch(() => {});
    btnDisableNotif.disabled = false;
  }

  if (btnEnableNotif) {
    btnEnableNotif.addEventListener("click", enableNotif);
  }
  if (btnDisableNotif) {
    btnDisableNotif.addEventListener("click", disableNotif);
  }
  refreshNotifButtonUI();

  // Kalau izin & preferensi user sudah aktif sebelumnya (mis. buka lagi
  // besoknya), langsung pastikan subscription-nya masih terdaftar di server.
  // (Tidak ada lagi auto-subscribe saat halaman dibuka: notifikasi selalu
  // mulai dalam keadaan mati sampai pengguna mengaktifkannya sendiri.)

  // Kirim notifikasi native lewat service worker (tampil di tray notifikasi HP,
  // termasuk saat aplikasi berjalan di background / layar terkunci pada PWA
  // yang sudah ter-install). Jatuh ke Notification API biasa sebagai fallback.
  async function sendNativeNotification(type, icon, title, msg, urgent = true) {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    // PENTING: hormati preferensi manual user. Izin browser yang "granted"
    // tidak berarti notifikasi harus tetap dikirim — kalau user sudah
    // menekan "Nonaktifkan Notifikasi", jangan kirim apa pun sampai
    // dia menekan "Aktifkan Notifikasi" lagi.
    if (!getPushPref()) return;

    const payload = {
      title: `${icon} ${title}`,
      body: msg,
      icon: "/icons/icon-192.png",
      tag: `smartgarden-${title}`,
      urgent,
    };

    try {
      const reg = await getSwReg();
      if (reg && reg.showNotification) {
        await reg.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          badge: "/icons/badge-72.png",
          tag: payload.tag,
          renotify: true,
          vibrate: urgent ? [200, 100, 200, 100, 200] : [120],
        });
        return;
      }
    } catch (e) {
      /* fallback di bawah */
    }

    // Fallback: Notification API langsung (tanpa service worker)
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon,
    });
  }

  // ── History buffers (for mini charts) ────────────────
  const HISTORY_MAX = 200;
  const history = {
    temp: [],
    hum: [],
    soil: [],
    dist: [],
    ph: [],
    ppm: [],
  };

  // ── Sensor thresholds for sawi (mustard greens) ──────
  const THRESHOLDS = {
    temp: {
      min: 15,
      max: 35,
      ideal: [20, 30],
    }, // Sawi optimal 20-30°C
    hum: {
      min: 50,
      max: 90,
      ideal: [60, 80],
    }, // Sawi butuh kelembapan 60-80%
    soil: {
      min: 45,
      max: 85,
      ideal: [55, 75],
    }, // Kelembapan tanah ideal sawi
    dist: {
      min: 3,
      max: 30,
    }, // cm from sensor to water surface
    ph: {
      min: 0,
      max: 14,
      ideal: [6.0, 7.0],
    }, // pH tanah ideal sawi 6.0-7.0
  };

  // ── DOM refs ─────────────────────────────────────────
  const els = {
    tempVal: document.getElementById("temp-val"),
    humVal: document.getElementById("hum-val"),
    soilVal: document.getElementById("soil-val"),
    distVal: document.getElementById("dist-val"),
    phVal: document.getElementById("ph-val"),
    tempBar: document.getElementById("temp-bar"),
    humBar: document.getElementById("hum-bar"),
    soilBar: document.getElementById("soil-bar"),
    phBar: document.getElementById("ph-bar"),
    waterFill: document.getElementById("water-fill"),
    waterLabel: document.getElementById("water-label"),
    tempTrend: document.getElementById("temp-trend"),
    humTrend: document.getElementById("hum-trend"),
    soilTrend: document.getElementById("soil-trend"),
    distTrend: document.getElementById("dist-trend"),
    phTrend: document.getElementById("ph-trend"),
    notifContainer: document.getElementById("notif-container"),
  };

  // ── Mini Chart Setup ─────────────────────────────────
  Chart.defaults.color = "#166534";
  Chart.defaults.borderColor = "#d1fae5";

  const chartDefaults = (color) => ({
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
      animation: {
        duration: 400,
      },
    },
  });

  const miniCharts = {
    temp: new Chart(
      document.getElementById("chart-temp"),
      chartDefaults("#f59e0b"),
    ),
    hum: new Chart(
      document.getElementById("chart-hum"),
      chartDefaults("#60a5fa"),
    ),
    soil: new Chart(
      document.getElementById("chart-soil"),
      chartDefaults("#a16207"),
    ),
    ph: new Chart(
      document.getElementById("chart-ph"),
      chartDefaults("#e11d48"),
    ),
    ppm: new Chart(
      document.getElementById("chart-ppm"),
      chartDefaults("#8b5cf6"),
    ),
  };

  // ── Main Charts ──────────────────────────────────────
  const tempMainChart = new Chart(document.getElementById("chart-temp-main"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Suhu (°C)",
          data: [],
          borderColor: "#f59e0b",
          backgroundColor: "#f59e0b18",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#166534",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
        y: {
          min: 15,
          max: 39,

          ticks: {
            stepSize: 3,
            color: "#b45309",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },

          grid: {
            color: "#d1fae5",
          },
        },
      },
    },
  });

  const humMainChart = new Chart(document.getElementById("chart-hum-main"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Kelembapan (%)",
          data: [],
          borderColor: "#60a5fa",
          backgroundColor: "#60a5fa18",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#166534",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
        y: {
          ticks: {
            color: "#1d4ed8",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
      },
    },
  });

  // ── History storage for period switching ─────────────
  const periodHistory = {
    temp: {
      "24h": {
        labels: [],
        data: [],
      },
      "7d": {
        labels: [],
        data: [],
      },
      "30d": {
        labels: [],
        data: [],
      },
    },
    hum: {
      "24h": {
        labels: [],
        data: [],
      },
      "7d": {
        labels: [],
        data: [],
      },
      "30d": {
        labels: [],
        data: [],
      },
    },
    soil: {
      "24h": {
        labels: [],
        data: [],
      },
      "7d": {
        labels: [],
        data: [],
      },
      "30d": {
        labels: [],
        data: [],
      },
    },
    dist: {
      "24h": {
        labels: [],
        data: [],
      },
      "7d": {
        labels: [],
        data: [],
      },
      "30d": {
        labels: [],
        data: [],
      },
    },
    ph: {
      "24h": {
        labels: [],
        data: [],
      },
      "7d": {
        labels: [],
        data: [],
      },
      "30d": {
        labels: [],
        data: [],
      },
    },
    ppm: {
      "24h": {
        labels: [],
        data: [],
      },
      "7d": {
        labels: [],
        data: [],
      },
      "30d": {
        labels: [],
        data: [],
      },
    },
  };
  const activePeriod = {
    temp: "24h",
    hum: "24h",
    soil: "24h",
    dist: "24h",
    ph: "24h",
    ppm: "24h",
  };

  function getMaxPoints(period) {
    return PERIODS[period] ? PERIODS[period].points : 144;
  }

  function periodLabel(period, t) {
    const d = new Date(t);
    if (period === "24h")
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Masukkan pembacaan realtime ke riwayat semua periode: titik terakhir
  // (bucket waktu yang sedang berjalan) diperbarui di tempat; saat bucket
  // berganti, titik baru ditambahkan dan titik tertua dibuang.
  function pushLivePoint(key, value, now) {
    now = now || Date.now();
    Object.keys(PERIODS).forEach((period) => {
      const cfg = PERIODS[period];
      const hist = periodHistory[key][period];
      const bucket = Math.floor(now / cfg.step) * cfg.step;
      if (hist.bucket === bucket && hist.data.length) {
        hist.data[hist.data.length - 1] = value;
        return;
      }
      hist.labels.push(periodLabel(period, bucket));
      hist.data.push(value);
      hist.bucket = bucket;
      while (hist.labels.length > cfg.points) {
        hist.labels.shift();
        hist.data.shift();
      }
    });
  }

  function applyPeriodChart(chartObj, chartKey, period) {
    const src = periodHistory[chartKey][period];
    chartObj.data.labels = [...src.labels];
    chartObj.data.datasets[0].data = [...src.data];
    chartObj.update("none");
  }

  const soilMainChart = new Chart(document.getElementById("chart-soil-main"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Kelembapan Tanah (%)",
          data: [],
          borderColor: "#a16207",
          backgroundColor: "#a1620722",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#166534",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
        y: {
          ticks: {
            color: "#92400e",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
      },
    },
  });

  const waterMainChart = new Chart(
    document.getElementById("chart-water-main"),
    {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Level Air (cm)",
            data: [],
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f622",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#166534",
              font: {
                family: "DM Mono",
                size: 10,
              },
            },
            grid: {
              color: "#d1fae5",
            },
          },
          y: {
            ticks: {
              color: "#1d4ed8",
              font: {
                family: "DM Mono",
                size: 10,
              },
            },
            grid: {
              color: "#d1fae5",
            },
          },
        },
      },
    },
  );

  const phMainChart = new Chart(document.getElementById("chart-ph-main"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "pH Tanah",
          data: [],
          borderColor: "#e11d48",
          backgroundColor: "#e11d4822",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#166534",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
        y: {
          min: 0,
          max: 14,
          ticks: {
            color: "#be123c",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
      },
    },
  });

  const ppmMainChart = new Chart(document.getElementById("chart-ppm-main"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "PPM Larutan Nutrisi",
          data: [],
          borderColor: "#8b5cf6",
          backgroundColor: "#8b5cf622",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#166534",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
        y: {
          min: 0,
          max: 2000,
          ticks: {
            color: "#6d28d9",
            font: {
              family: "DM Mono",
              size: 10,
            },
          },
          grid: {
            color: "#d1fae5",
          },
        },
      },
    },
  });

  // ── Penghitung penambahan (Nutrisi A/B, pH Up/Down) ──
  const DOSE_LABELS = {
    "nutrisi-a": "Nutrisi A",
    "nutrisi-b": "Nutrisi B",
    "ph-up": "pH Up",
    "ph-down": "pH Down",
  };
  const doseTotal = {
    "nutrisi-a": 0,
    "nutrisi-b": 0,
    "ph-up": 0,
    "ph-down": 0,
  };

  function renderDoseCount(type) {
    const countEl = document.getElementById("count-" + type);
    if (countEl) countEl.textContent = `Ditambahkan: ${doseTotal[type]}x`;
  }

  // Dipanggil setiap kali salah satu kontrol (Nutrisi A/B, pH Up/Down) dinyalakan
  function recordDoseEvent(type) {
    if (!(type in doseTotal)) return;
    doseTotal[type] += 1;
    renderDoseCount(type);
  }

  // ══════════════════════════════════════════════════════
  // PENGATURAN PPM NUTRISI (rentang ideal min–max ditentukan oleh user)
  // ══════════════════════════════════════════════════════
  const PPM_MIN_KEY = "sgPpmTargetMin";
  const PPM_MAX_KEY = "sgPpmTargetMax";
  const PPM_MIN = 0;
  const PPM_MAX = 2000; // batas atas skala bar & input

  const ppmCurrentValEl = document.getElementById("ppm-current-val");
  const ppmBarEl = document.getElementById("ppm-bar");
  const ppmIdealZoneEl = document.getElementById("ppm-ideal-zone");
  const ppmStatusBadgeEl = document.getElementById("ppm-status-badge");
  const ppmRangeLabelEl = document.getElementById("ppm-range-label");
  const ppmTargetMinInputEl = document.getElementById("ppm-target-min-input");
  const ppmTargetMaxInputEl = document.getElementById("ppm-target-max-input");
  const ppmTargetFormEl = document.getElementById("ppm-target-form");
  // Kartu PPM di halaman Dashboard (menampilkan nilai yang sama dengan
  // kartu "Pengaturan PPM Nutrisi" di Manual Control)
  const ppmDashValEl = document.getElementById("ppm-dash-val");
  const ppmDashBarEl = document.getElementById("ppm-dash-bar");
  const ppmDashTrendEl = document.getElementById("ppm-dash-trend");

  // Rentang ideal disimpan per-user di localStorage supaya tetap tersimpan walau halaman di-refresh
  let ppmTargetMin = parseInt(localStorage.getItem(PPM_MIN_KEY), 10);
  let ppmTargetMax = parseInt(localStorage.getItem(PPM_MAX_KEY), 10);
  if (!Number.isFinite(ppmTargetMin) || ppmTargetMin < 0) ppmTargetMin = 800; // default awal
  if (!Number.isFinite(ppmTargetMax) || ppmTargetMax <= ppmTargetMin)
    ppmTargetMax = 1000; // default awal

  // =========================================================
  // DUMMY PPM UNTUK TESTING NOTIFIKASI
  // =========================================================
  let ppmDoseOffset = 0; // kenaikan sementara akibat Nutrisi A/B dinyalakan
  let ppmCurrent = DUMMY.value("ppm", Date.now());

  // Mencegah notifikasi berulang
  // Status terakhir yang SUDAH dinotifikasikan per parameter (null = belum/normal)
  const alertSent = { ppm: null, ph: null };

  if (ppmTargetMinInputEl) ppmTargetMinInputEl.value = ppmTargetMin;
  if (ppmTargetMaxInputEl) ppmTargetMaxInputEl.value = ppmTargetMax;

  function ppmStatus(value) {
    if (value < ppmTargetMin) return "low";
    if (value > ppmTargetMax) return "high";
    return "ok";
  }

  function renderPpmUI() {
    const pct = Math.max(0, Math.min(100, (ppmCurrent / PPM_MAX) * 100));
    const minPct = Math.max(0, Math.min(100, (ppmTargetMin / PPM_MAX) * 100));
    const maxPct = Math.max(0, Math.min(100, (ppmTargetMax / PPM_MAX) * 100));

    if (ppmCurrentValEl) ppmCurrentValEl.textContent = Math.round(ppmCurrent);
    if (ppmBarEl) ppmBarEl.style.width = pct + "%";
    if (ppmIdealZoneEl) {
      ppmIdealZoneEl.style.left = minPct + "%";
      ppmIdealZoneEl.style.width = Math.max(0, maxPct - minPct) + "%";
    }
    if (ppmRangeLabelEl)
      ppmRangeLabelEl.textContent = `Ideal: ${ppmTargetMin} – ${ppmTargetMax} ppm`;

    const status = ppmStatus(ppmCurrent);
    if (ppmStatusBadgeEl) {
      ppmStatusBadgeEl.classList.remove(
        "ppm-badge-low",
        "ppm-badge-ok",
        "ppm-badge-high",
      );
      if (status === "low") {
        ppmStatusBadgeEl.textContent = "Kurang";
        ppmStatusBadgeEl.classList.add("ppm-badge-low");
      } else if (status === "high") {
        ppmStatusBadgeEl.textContent = "Lebih";
        ppmStatusBadgeEl.classList.add("ppm-badge-high");
      } else {
        ppmStatusBadgeEl.textContent = "Ideal";
        ppmStatusBadgeEl.classList.add("ppm-badge-ok");
      }
    }
    if (ppmBarEl) {
      ppmBarEl.classList.remove("ppm-fill-low", "ppm-fill-ok", "ppm-fill-high");
      ppmBarEl.classList.add(
        status === "low"
          ? "ppm-fill-low"
          : status === "high"
            ? "ppm-fill-high"
            : "ppm-fill-ok",
      );
    }

    // Sinkronkan ke kartu sensor PPM di Dashboard
    if (ppmDashValEl) ppmDashValEl.textContent = Math.round(ppmCurrent);
    if (ppmDashBarEl) ppmDashBarEl.style.width = pct + "%";
    if (ppmDashTrendEl) {
      const statusLabel =
        status === "low"
          ? "Kurang dari ideal"
          : status === "high"
            ? "Lebih dari ideal"
            : "Ideal";
      ppmDashTrendEl.textContent = `${statusLabel} · Rentang ideal ${ppmTargetMin}–${ppmTargetMax} ppm`;
    }

    return status;
  }

  // Beri notifikasi hanya saat status berubah (kurang → ideal → lebih, dst),
  // supaya tidak spam setiap 5 detik selagi masih di kondisi yang sama.
  function notifyPpmStatusChange() {
    checkSensorAlerts();
  }

  // Cek PPM dan pH terhadap rentang ideal. Notifikasi dikirim SEKALI setiap
  // kondisi tidak normal muncul (PPM/pH di atas atau di bawah ambang), dan
  // hanya kalau notifikasi sedang aktif. Kembali normal → status di-reset
  // supaya pelanggaran berikutnya diberi notifikasi lagi.
  // Setelah user menyimpan rentang: kalau nilai sekarang di luar rentang tapi
  // notifikasi masih MATI, beri tahu kenapa belum ada peringatan.
  function warnIfNotifOff(status) {
    if (notifEnabled || status === "ok") return;
    showNotification(
      "warn",
      "🔕",
      "Notifikasi Masih Mati",
      "Nilai saat ini di luar rentang. Aktifkan notifikasi lewat ikon 🔕 di pojok kanan atas agar peringatan muncul.",
    );
  }

  function checkSensorAlerts() {
    const phNow = typeof lastData.ph === "number" ? lastData.ph : null;
    const checks = [
      {
        key: "ppm",
        status: ppmStatus(ppmCurrent),
        icon: "🧪",
        high: {
          title: "PPM Terlalu Tinggi",
          msg: `Nilai PPM saat ini ${Math.round(ppmCurrent)} ppm, di atas batas maksimal ${ppmTargetMax} ppm. Tambahkan air atau kurangi konsentrasi nutrisi.`,
          short: `PPM ${Math.round(ppmCurrent)} ppm, di atas batas maksimal ${ppmTargetMax} ppm.`,
        },
        low: {
          title: "PPM Terlalu Rendah",
          msg: `Nilai PPM saat ini ${Math.round(ppmCurrent)} ppm, di bawah batas minimal ${ppmTargetMin} ppm. Tambahkan Nutrisi A & B.`,
          short: `PPM ${Math.round(ppmCurrent)} ppm, di bawah batas minimal ${ppmTargetMin} ppm.`,
        },
      },
    ];
    if (phNow !== null) {
      checks.push({
        key: "ph",
        status: phStatus(phNow),
        icon: "⚗️",
        high: {
          title: "pH Terlalu Tinggi",
          msg: `pH saat ini ${phNow.toFixed(2)}, di atas batas maksimal ${phTargetMax.toFixed(1)}. Tambahkan pH Down.`,
          short: `pH ${phNow.toFixed(2)}, di atas batas maksimal ${phTargetMax.toFixed(1)}.`,
        },
        low: {
          title: "pH Terlalu Rendah",
          msg: `pH saat ini ${phNow.toFixed(2)}, di bawah batas minimal ${phTargetMin.toFixed(1)}. Tambahkan pH Up.`,
          short: `pH ${phNow.toFixed(2)}, di bawah batas minimal ${phTargetMin.toFixed(1)}.`,
        },
      });
    }

    checks.forEach((c) => {
      if (c.status === "ok") {
        alertSent[c.key] = null; // normal lagi → reset
        return;
      }
      // Notifikasi MATI → jangan kirim & jangan tandai, supaya langsung
      // muncul begitu diaktifkan.
      if (!notifEnabled) return;
      if (alertSent[c.key] === c.status) return; // sudah diberi tahu
      alertSent[c.key] = c.status;
      const a = c.status === "high" ? c.high : c.low;
      showNotification("warn", c.icon, a.title, a.msg);
      sendNativeNotification("warning", c.icon, a.title, a.short, true);
    });
  }

  // Dipanggil saat notifikasi baru saja diaktifkan: evaluasi ulang kondisi
  // PPM saat ini dan langsung kirim notifikasi kalau memang sedang tinggi.
  function reevaluatePpmNotification() {
    alertSent.ppm = null;
    alertSent.ph = null;
    checkSensorAlerts();
  }

  // Hitung PPM terbaru dari mesin dummy (+ efek dosis nutrisi yang meluruh).
  // Dipanggil di awal setiap siklus polling.
  function advancePpm() {
    ppmDoseOffset *= 0.85;
    if (Math.abs(ppmDoseOffset) < 1) ppmDoseOffset = 0;
    ppmCurrent = Math.max(
      PPM_MIN,
      Math.min(PPM_MAX, DUMMY.value("ppm", Date.now()) + ppmDoseOffset),
    );
  }

  // Dipanggil tiap siklus polling (5 detik) setelah advancePpm()
  function updatePpmDrift() {
    const status = renderPpmUI();

    // ============================================
    // HISTORY PPM
    // ============================================

    const timeLabel = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    history.ppm.push(Math.round(ppmCurrent));

    if (history.ppm.length > HISTORY_MAX) {
      history.ppm.shift();
    }

    // ============================================
    // MINI CHART PPM
    // ============================================

    if (miniCharts.ppm) {
      updateMiniChart(miniCharts.ppm, timeLabel, Math.round(ppmCurrent));
    }

    // ============================================
    // ANALYTICS
    // ============================================

    pushLivePoint("ppm", Math.round(ppmCurrent));

    applyPeriodChart(ppmMainChart, "ppm", activePeriod.ppm);

    // ============================================
    // NOTIFIKASI
    // HANYA JIKA PPM > MAKSIMUM
    // ============================================

    notifyPpmStatusChange(status);
  }

  // Dipanggil saat Nutrisi A/B dinyalakan: larutan naik mendekati/melebihi rentang ideal
  function bumpPpmFromDosing(type) {
    const boost = 60 + Math.random() * 90;
    ppmDoseOffset += boost;
    ppmCurrent = Math.max(
      PPM_MIN,
      Math.min(PPM_MAX, DUMMY.value("ppm", Date.now()) + ppmDoseOffset),
    );
    const status = renderPpmUI();
    if (miniCharts.ppm) {
      const timeLabel = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      updateMiniChart(miniCharts.ppm, timeLabel, Math.round(ppmCurrent));
    }
    notifyPpmStatusChange(status);
  }

  // User mengatur rentang ideal PPM lewat form di card "Pengaturan PPM Nutrisi"
  if (ppmTargetFormEl) {
    ppmTargetFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawMin = ppmTargetMinInputEl
        ? parseInt(ppmTargetMinInputEl.value, 10)
        : NaN;
      const rawMax = ppmTargetMaxInputEl
        ? parseInt(ppmTargetMaxInputEl.value, 10)
        : NaN;
      if (
        !Number.isFinite(rawMin) ||
        !Number.isFinite(rawMax) ||
        rawMin < 0 ||
        rawMax > PPM_MAX
      ) {
        showNotification(
          "danger",
          "❌",
          "Rentang PPM Tidak Valid",
          `Masukkan angka antara 0 – ${PPM_MAX} ppm untuk minimal maupun maksimal.`,
        );
        return;
      }
      if (rawMin >= rawMax) {
        showNotification(
          "danger",
          "❌",
          "Rentang PPM Tidak Valid",
          "Nilai minimal harus lebih kecil dari nilai maksimal.",
        );
        return;
      }
      ppmTargetMin = rawMin;
      ppmTargetMax = rawMax;
      localStorage.setItem(PPM_MIN_KEY, String(ppmTargetMin));
      localStorage.setItem(PPM_MAX_KEY, String(ppmTargetMax));
      alertSent.ppm = null; // evaluasi ulang setelah rentang ideal berubah
      const status = renderPpmUI();
      showNotification(
        "",
        "✅",
        "Rentang PPM Ideal Disimpan",
        `Rentang PPM ideal diatur ke ${ppmTargetMin} – ${ppmTargetMax} ppm.`,
      );
      notifyPpmStatusChange(status);
      warnIfNotifOff(status);
    });
  }

  renderPpmUI();

  // ══════════════════════════════════════════════════════
  // PENGATURAN pH IDEAL (rentang ideal min–max ditentukan oleh user)
  // ══════════════════════════════════════════════════════
  const PH_MIN_KEY = "sgPhTargetMin";
  const PH_MAX_KEY = "sgPhTargetMax";
  const PH_SCALE_MIN = 0;
  const PH_SCALE_MAX = 14; // skala pH baku

  const phCurrentValEl = document.getElementById("ph-current-val");
  const phSettingsBarEl = document.getElementById("ph-settings-bar");
  const phIdealZoneEl = document.getElementById("ph-ideal-zone");
  const phStatusBadgeEl = document.getElementById("ph-status-badge");
  const phRangeLabelEl = document.getElementById("ph-range-label");
  const phTargetMinInputEl = document.getElementById("ph-target-min-input");
  const phTargetMaxInputEl = document.getElementById("ph-target-max-input");
  const phTargetFormEl = document.getElementById("ph-target-form");

  let phTargetMin = parseFloat(localStorage.getItem(PH_MIN_KEY));
  let phTargetMax = parseFloat(localStorage.getItem(PH_MAX_KEY));
  if (!Number.isFinite(phTargetMin) || phTargetMin < 0) phTargetMin = 6.0; // default: pH ideal sawi 6.0-7.0
  if (!Number.isFinite(phTargetMax) || phTargetMax <= phTargetMin)
    phTargetMax = 7.0;

  if (phTargetMinInputEl) phTargetMinInputEl.value = phTargetMin;
  if (phTargetMaxInputEl) phTargetMaxInputEl.value = phTargetMax;

  function phStatus(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "ok";
    if (value < phTargetMin) return "low";
    if (value > phTargetMax) return "high";
    return "ok";
  }

  // Render kartu "Pengaturan pH Ideal" berdasarkan pembacaan pH terbaru
  function renderPhSettingsUI(ph) {
    const value = typeof ph === "number" ? ph : lastData.ph;
    const pct = Math.max(0, Math.min(100, (value / PH_SCALE_MAX) * 100));
    const minPct = Math.max(
      0,
      Math.min(100, (phTargetMin / PH_SCALE_MAX) * 100),
    );
    const maxPct = Math.max(
      0,
      Math.min(100, (phTargetMax / PH_SCALE_MAX) * 100),
    );

    if (phCurrentValEl) phCurrentValEl.textContent = value.toFixed(1);
    if (phSettingsBarEl) phSettingsBarEl.style.width = pct + "%";
    if (phIdealZoneEl) {
      phIdealZoneEl.style.left = minPct + "%";
      phIdealZoneEl.style.width = Math.max(0, maxPct - minPct) + "%";
    }
    if (phRangeLabelEl)
      phRangeLabelEl.textContent = `Ideal: ${phTargetMin.toFixed(1)} – ${phTargetMax.toFixed(1)} pH`;

    const status = phStatus(value);
    if (phStatusBadgeEl) {
      phStatusBadgeEl.classList.remove(
        "ppm-badge-low",
        "ppm-badge-ok",
        "ppm-badge-high",
      );
      if (status === "low") {
        phStatusBadgeEl.textContent = "Kurang";
        phStatusBadgeEl.classList.add("ppm-badge-low");
      } else if (status === "high") {
        phStatusBadgeEl.textContent = "Lebih";
        phStatusBadgeEl.classList.add("ppm-badge-high");
      } else {
        phStatusBadgeEl.textContent = "Ideal";
        phStatusBadgeEl.classList.add("ppm-badge-ok");
      }
    }
    if (phSettingsBarEl) {
      phSettingsBarEl.classList.remove(
        "ppm-fill-low",
        "ppm-fill-ok",
        "ppm-fill-high",
      );
      phSettingsBarEl.classList.add(
        status === "low"
          ? "ppm-fill-low"
          : status === "high"
            ? "ppm-fill-high"
            : "ppm-fill-ok",
      );
    }

    return status;
  }

  // Beri notifikasi hanya saat status berubah (kurang → ideal → lebih, dst)
  // User mengatur rentang ideal pH lewat form di card "Pengaturan pH Ideal"
  if (phTargetFormEl) {
    phTargetFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawMin = phTargetMinInputEl
        ? parseFloat(phTargetMinInputEl.value)
        : NaN;
      const rawMax = phTargetMaxInputEl
        ? parseFloat(phTargetMaxInputEl.value)
        : NaN;
      if (
        !Number.isFinite(rawMin) ||
        !Number.isFinite(rawMax) ||
        rawMin < PH_SCALE_MIN ||
        rawMax > PH_SCALE_MAX
      ) {
        showNotification(
          "danger",
          "❌",
          "Rentang pH Tidak Valid",
          `Masukkan angka antara ${PH_SCALE_MIN} – ${PH_SCALE_MAX} untuk minimal maupun maksimal.`,
        );
        return;
      }
      if (rawMin >= rawMax) {
        showNotification(
          "danger",
          "❌",
          "Rentang pH Tidak Valid",
          "Nilai minimal harus lebih kecil dari nilai maksimal.",
        );
        return;
      }
      phTargetMin = rawMin;
      phTargetMax = rawMax;
      localStorage.setItem(PH_MIN_KEY, String(phTargetMin));
      localStorage.setItem(PH_MAX_KEY, String(phTargetMax));
      const status = renderPhSettingsUI(lastData.ph);
      alertSent.ph = null;
      showNotification(
        "",
        "✅",
        "Rentang pH Ideal Disimpan",
        `Rentang pH ideal diatur ke ${phTargetMin.toFixed(1)} – ${phTargetMax.toFixed(1)}.`,
      );
      checkSensorAlerts();
      warnIfNotifOff(status);
    });
  }

  renderPhSettingsUI(6.5); // render awal dengan nilai aman sebelum data sensor pertama masuk

  // ── Dummy Data Generator ─────────────────────────────
  let lastData = {
    temp: 22.5,
    hum: 68,
    soil: 55,
    dist: 12,
    ph: 6.5,
  };

  // Menyimpan hasil kalkulasi status terbaru (elemen kartu detailnya sudah
  // dihilangkan, tapi datanya tetap dipakai untuk notifikasi & laporan).
  let latestStatus = {
    state: "normal",
    title: "Kondisi Sawi: Normal",
    desc: "Semua parameter dalam batas optimal.",
    badge: "OPTIMAL",
  };

  function generateDummyData() {
    const snap = DUMMY.snapshot(Date.now());
    return {
      temp: snap.temp,
      hum: snap.hum,
      soil: snap.soil,
      dist: snap.dist,
      ph: snap.ph,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Fetch Sensor Data ────────────────────────────────
  // Coba API sungguhan dulu. Kalau tidak tersedia, pakai data dummy realtime
  // dan baru coba API lagi setelah 60 detik (supaya tidak menunggu timeout
  // di setiap siklus polling).
  let usingDummy = false;
  let apiRetryAt = 0;

  async function fetchSensorData() {
    if (USE_DUMMY_DATA) {
      usingDummy = true;
      return generateDummyData();
    }
    if (usingDummy && Date.now() < apiRetryAt) return generateDummyData();
    try {
      const res = await fetch(API_URL, {
        signal: AbortSignal.timeout(1500),
      });
      if (!res.ok) throw new Error("API error");
      const d = await res.json();
      const fb = DUMMY.snapshot(Date.now());
      // Nilai null / kosong / NaN / 0 dianggap "tidak ada" → pakai dummy
      const pick = (v, f) => {
        if (v === null || v === undefined || v === "") return f;
        const n = Number(v);
        return Number.isFinite(n) && n !== 0 ? n : f;
      };
      usingDummy = false;
      return {
        temp: pick(d.temperature, fb.temp),
        hum: pick(d.humidity, fb.hum),
        soil: pick(d.soil_moisture, fb.soil),
        dist: pick(d.distance, fb.dist),
        ph: pick(d.ph, fb.ph),
        timestamp: d.timestamp,
      };
    } catch {
      usingDummy = true;
      apiRetryAt = Date.now() + 60000;
      return generateDummyData();
    }
  }

  // ── Trend Arrow ──────────────────────────────────────
  function trendText(key, current) {
    const buf = history[key];
    if (buf.length < 2) return "— Mengumpulkan data...";
    const prev = buf[buf.length - 2];
    const diff = +(current - prev).toFixed(1);
    if (Math.abs(diff) < 0.2) return `→ Stabil di ${current}`;
    return diff > 0
      ? `↑ Naik ${Math.abs(diff)} dari pembacaan sebelumnya`
      : `↓ Turun ${Math.abs(diff)} dari pembacaan sebelumnya`;
  }

  // ── Update UI ────────────────────────────────────────
  function updateUI(data) {
    lastData = data;
    advancePpm(); // PPM terbaru dulu, supaya log laporan memakai nilai yang sama
    lastUpdateTimestamp = Date.now();
    refreshLastUpdateText();
    const { temp, hum, soil, dist, ph } = data;
    const timeLabel = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Push to history
    ["temp", "hum", "soil", "dist", "ph"].forEach((k) => {
      history[k].push(data[k]);
      if (history[k].length > HISTORY_MAX) history[k].shift();
    });

    // ── Sensor Values ──
    animateNumber(els.tempVal, temp);
    animateNumber(els.humVal, hum);
    animateNumber(els.soilVal, soil);
    animateNumber(els.distVal, dist);
    animateNumber(els.phVal, ph);

    // ── Bars ──
    els.tempBar.style.width = Math.min(100, (temp / 50) * 100) + "%";
    els.humBar.style.width = hum + "%";
    els.soilBar.style.width = soil + "%";
    els.phBar.style.width = Math.min(100, (ph / 14) * 100) + "%";

    // Water level: tank 30cm, sensor at top; closer dist = more water
    const waterPct = Math.max(0, Math.min(100, 100 - (dist / 30) * 100));
    els.waterFill.style.height = waterPct + "%";
    els.waterLabel.textContent = waterPct.toFixed(0) + "%";

    // ── Trends ──
    els.tempTrend.textContent = trendText("temp", temp);
    els.humTrend.textContent = trendText("hum", hum);
    els.soilTrend.textContent = trendText("soil", soil);
    els.distTrend.textContent = `Jarak: ${dist}cm → Level air: ${waterPct.toFixed(0)}%`;
    els.phTrend.textContent = trendText("ph", ph);

    // ── Mini Charts ──
    updateMiniChart(miniCharts.temp, timeLabel, temp);
    updateMiniChart(miniCharts.hum, timeLabel, hum);
    updateMiniChart(miniCharts.soil, timeLabel, soil);
    updateMiniChart(miniCharts.ph, timeLabel, ph);

    // ── Main Charts ──
    // Push ke semua period history (titik terakhir = nilai realtime)
    const sensorVals = {
      temp,
      hum,
      soil,
      dist,
      ph,
    };
    ["temp", "hum", "soil", "dist", "ph"].forEach((key) => {
      pushLivePoint(key, sensorVals[key]);
    });
    applyPeriodChart(tempMainChart, "temp", activePeriod.temp);
    applyPeriodChart(humMainChart, "hum", activePeriod.hum);
    applyPeriodChart(soilMainChart, "soil", activePeriod.soil);
    applyPeriodChart(waterMainChart, "dist", activePeriod.dist);
    applyPeriodChart(phMainChart, "ph", activePeriod.ph);

    // ── Kartu "Pengaturan pH Ideal" ikut data live ──
    renderPhSettingsUI(ph);

    // ── Status ──
    updateStatus(temp, hum, soil, ph);

    // ── Notifications ──
    // Notifikasi sensor pH, suhu, kelembapan, dan lainnya dinonaktifkan.
    // Notifikasi sensor hanya ditangani oleh PPM ketika melebihi batas maksimal.

    // ── 3D Garden update ──
    if (window.updateGardenCondition) window.updateGardenCondition(soil, temp);

    // ── PPM Nutrisi (larutan berangsur terpakai tiap siklus) ──
    if (typeof updatePpmDrift === "function") updatePpmDrift();
  }

  function updateMiniChart(chart, label, value) {
    if (chart.data.labels.length > 15) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update("none");
  }

  function pushChart(chart, label, values) {
    if (chart.data.labels.length > 24) {
      chart.data.labels.shift();
      chart.data.datasets.forEach((ds) => ds.data.shift());
    }
    chart.data.labels.push(label);
    chart.data.datasets.forEach((ds, i) => ds.data.push(values[i]));
    chart.update("none");
  }

  // ── Animated Number ──────────────────────────────────
  function animateNumber(el, target) {
    if (!el) return;
    const current = parseFloat(el.textContent) || 0;
    const diff = target - current;
    if (Math.abs(diff) < 0.1) {
      el.textContent = target;
      return;
    }
    let frame = 0;
    const frames = 20;
    const step = () => {
      frame++;
      el.textContent = (current + diff * (frame / frames)).toFixed(1);
      if (frame < frames) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  // ── Plant Status Logic ───────────────────────────────
  function updateStatus(temp, hum, soil, ph) {
    let state = "normal";
    let title = "🌱 Kondisi Tanaman: Optimal";
    let desc =
      "Semua parameter dalam rentang ideal untuk pertumbuhan sawi yang maksimal.";
    let badge = "OPTIMAL";

    const issues = [];
    if (soil < 30) issues.push("tanah terlalu kering");
    if (soil > 85) issues.push("tanah terlalu basah");
    if (temp > 32) issues.push("suhu terlalu tinggi");
    if (temp < 12) issues.push("suhu terlalu rendah");
    if (hum < 40) issues.push("kelembapan udara rendah");
    if (typeof ph === "number" && ph < 5.5)
      issues.push("pH tanah terlalu asam");
    if (typeof ph === "number" && ph > 7.5)
      issues.push("pH tanah terlalu basa");

    if (issues.length === 0) {
      state = "normal";
    } else if (issues.length === 1 || (soil < 50 && soil > 30)) {
      state = "warning";
      title = "⚠️ Kondisi Tanaman: Perlu Perhatian";
      desc = `Terdeteksi: ${issues.join(", ")}. Segera lakukan pengecekan.`;
      badge = "PERHATIAN";
    } else {
      state = "danger";
      title = "🚨 Kondisi Tanaman: Kritis";
      desc = `Masalah kritis: ${issues.join(", ")}. Tindakan segera diperlukan!`;
      badge = "KRITIS";
    }

    // Status banner sudah tidak ditampilkan di UI, tapi datanya tetap
    // disimpan untuk digunakan pada laporan PDF & notifikasi.
    latestStatus = {
      state,
      title,
      desc,
      badge,
    };
  }

  // ── Notifications UI ─────────────────────────────────
  // Satu-satunya notifikasi sistem:
  // PPM melebihi batas maksimal yang ditentukan pengguna.
  function showNotification(type, icon, title, msg) {
    const ALLOWED_TITLES = [
      "PPM Terlalu Tinggi",
      "PPM Terlalu Rendah",
      "pH Terlalu Tinggi",
      "pH Terlalu Rendah",
      "Notifikasi Aktif",
      "Notifikasi Masih Mati",
      "Rentang PPM Ideal Disimpan",
      "Rentang pH Ideal Disimpan",
      "Rentang PPM Tidak Valid",
      "Rentang pH Tidak Valid",
      "Notifikasi Dinonaktifkan",
      "Notifikasi Diblokir",
      "Tidak Didukung",
    ];
    if (!ALLOWED_TITLES.includes(title)) return;
    // Peringatan PPM hanya boleh muncul kalau notifikasi sedang AKTIF
    if (/^(PPM|pH) Terlalu/.test(title) && !notifEnabled) return;

    // Hindari toast dengan judul yang sama menumpuk
    els.notifContainer
      .querySelectorAll(`.notif[data-title="${title}"]`)
      .forEach((n) => n.remove());

    const notif = document.createElement("div");
    notif.dataset.title = title;
    notif.className = `notif ${type}`;
    notif.innerHTML = `
      <span class="notif-icon">${icon}</span>
      <div class="notif-text">
        <div class="notif-title">${title}</div>
        <div class="notif-msg">${msg}</div>
      </div>
      <span class="notif-close" onclick="this.parentElement.remove()">✕</span>
    `;
    els.notifContainer.appendChild(notif);
    setTimeout(() => (notif.style.opacity = "0"), 8000);
    setTimeout(() => notif.remove(), 8500);
  }

  // ── Hero Canvas (background particles) ────────────────
  function initHeroCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W,
      H,
      particles = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        a: Math.random(),
        color: Math.random() > 0.2 ? "#22c55e" : "#16a34a",
      });
    }

    function drawHero() {
      ctx.clearRect(0, 0, W, H);

      // Grid overlay
      ctx.strokeStyle = "rgba(34,197,94,0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.a * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.a += (Math.random() - 0.5) * 0.02;
        p.a = Math.max(0.1, Math.min(1, p.a));
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
      });

      requestAnimationFrame(drawHero);
    }
    drawHero();
  }

  // ── Chart Period Buttons ──────────────────────────────
  const chartObjByKey = {
    temp: tempMainChart,
    hum: humMainChart,
    soil: soilMainChart,
    dist: waterMainChart,
    ph: phMainChart,
    ppm: ppmMainChart,
  };
  document.querySelectorAll(".chart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Tombol "Simpan" (form PPM/pH) juga ber-class chart-btn tapi bukan
      // bagian grup periode grafik → abaikan.
      if (!btn.closest(".chart-actions")) return;
      const period = btn.dataset.period;
      const chartKey = btn.dataset.chart;
      if (chartKey && chartObjByKey[chartKey]) {
        btn
          .closest(".chart-actions")
          .querySelectorAll(".chart-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activePeriod[chartKey] = period;
        applyPeriodChart(chartObjByKey[chartKey], chartKey, period);
      } else {
        // fallback for any other chart-btn groups without data-chart
        btn
          .closest(".chart-actions")
          .querySelectorAll(".chart-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });

  // ── Loader ───────────────────────────────────────────
  // Loader ditutup begitu halaman siap, dengan jeda minimal saja (biar
  // tidak "kedip") — BUKAN menunggu penuh 2 detik seperti sebelumnya,
  // supaya tidak terasa lama/nge-hang terutama di HP dengan koneksi lambat.
  let loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    document.getElementById("loader").classList.add("hidden");
  }

  window.addEventListener("load", () => {
    // Jeda kecil sekadar biar animasi loader tidak terpotong kasar
    setTimeout(() => {
      // initHeroCanvas (Three.js) ditunda 1 frame supaya browser sempat
      // repaint dulu — mencegah layar terasa "freeze" sesaat pas loader
      // hilang, terutama di HP Android dengan GPU terbatas.
      requestAnimationFrame(() => {
        try {
          initHeroCanvas();
        } catch (e) {
          console.warn("[SmartGarden] initHeroCanvas gagal:", e);
        }
      });
      hideLoader();
    }, 400);
  });

  // Safety net: kalau event 'load' tidak pernah terpicu (mis. salah satu
  // script CDN gagal/lambat dimuat karena koneksi HP kurang stabil),
  // paksa loader hilang setelah 6 detik supaya user tidak terjebak
  // di layar loading selamanya.
  setTimeout(hideLoader, 6000);

  // ══════════════════════════════════════════════════════
  // SEED RIWAYAT DUMMY
  // Mengisi grafik, mini-chart, dan penghitung penambahan dengan
  // data masa lalu yang dihitung dari mesin dummy yang SAMA dengan data
  // realtime — jadi riwayat dan nilai "sekarang" selalu nyambung.
  // ══════════════════════════════════════════════════════
  function seedDummyHistory() {
    const now = Date.now();
    const keys = ["temp", "hum", "soil", "dist", "ph", "ppm"];
    const mainCharts = {
      temp: tempMainChart,
      hum: humMainChart,
      soil: soilMainChart,
      dist: waterMainChart,
      ph: phMainChart,
      ppm: ppmMainChart,
    };

    // 1) Grafik Analitik 24 jam / 7 hari / 30 hari
    keys.forEach((key) => {
      Object.keys(PERIODS).forEach((period) => {
        const cfg = PERIODS[period];
        const hist = periodHistory[key][period];
        const endBucket = Math.floor(now / cfg.step) * cfg.step;
        hist.labels = [];
        hist.data = [];
        for (let i = cfg.points - 1; i >= 0; i--) {
          const t = endBucket - i * cfg.step;
          hist.labels.push(periodLabel(period, t));
          hist.data.push(DUMMY.value(key, t));
        }
        hist.bucket = endBucket;
      });
      if (mainCharts[key]) applyPeriodChart(mainCharts[key], key, activePeriod[key]);
    });

    // 2) Mini-chart kartu sensor + buffer tren: 14 pembacaan terakhir
    for (let i = 14; i >= 1; i--) {
      const t = now - i * POLL_INTERVAL;
      const label = new Date(t).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      keys.forEach((key) => {
        const v = DUMMY.value(key, t);
        history[key].push(v);
        const mc = miniCharts[key];
        if (mc) {
          mc.data.labels.push(label);
          mc.data.datasets[0].data.push(v);
        }
      });
    }
    Object.values(miniCharts).forEach((mc) => mc.update("none"));

    // 3) Penghitung penambahan nutrisi / pH: dosis terjadi saat nilai dummy
    //    mendekati batas bawah / atas rentang ideal (24 jam terakhir)
    const GAP = 3 * 3600e3;
    const last = { nutri: -Infinity, up: -Infinity, down: -Infinity };
    for (let t = now - 24 * 3600e3; t < now - 5 * 60e3; t += 10 * 60e3) {
      const ppm = DUMMY.value("ppm", t);
      const ph = DUMMY.value("ph", t);
      if (ppm < ppmTargetMin + 50 && t - last.nutri > GAP) {
        last.nutri = t;
        doseTotal["nutrisi-a"] += 1;
        doseTotal["nutrisi-b"] += 1;
      }
      if (ph < phTargetMin + 0.15 && t - last.up > GAP) {
        last.up = t;
        doseTotal["ph-up"] += 1;
      }
      if (ph > phTargetMax - 0.15 && t - last.down > GAP) {
        last.down = t;
        doseTotal["ph-down"] += 1;
      }
    }
    Object.keys(doseTotal).forEach(renderDoseCount);
  }

  // ── Main polling loop ─────────────────────────────────
  let historySeeded = false;

  async function poll() {
    const data = await fetchSensorData();
    // Riwayat dummy hanya diisi kalau data memang dummy (API tidak tersedia)
    if (!historySeeded) {
      historySeeded = true;
      seedDummyHistory();
    }
    updateUI(data);
  }

  // Start immediately then poll
  poll();
  setInterval(poll, POLL_INTERVAL);
})();


// Firebase: sinkronkan status kontrol dengan nilai aktual Realtime Database.
import('./firebase-core.js').then(mod => {
  mod.watchPumps(pumps => {
    const mapping = {
      'nutrisi-a': pumps['Nutrisi A'] === true,
      'nutrisi-b': pumps['Nutrisi B'] === true,
      'ph-up': pumps['pH-Up'] === true,
      'ph-down': pumps['pH-Down'] === true
    };
    Object.entries(mapping).forEach(([name, on]) => {
      const card = document.getElementById('control-' + name);
      const status = document.getElementById('status-' + name);
      const toggle = card ? card.querySelector('input[type="checkbox"]') : null;
      if (toggle) toggle.checked = on;
      if (card) card.classList.toggle('is-on', on);
      if (status) status.textContent = on ? 'ON' : 'OFF';
    });
  }, err => console.error('[Firebase baca Pompa]', err));
}).catch(err => console.error('[Firebase init]', err));
