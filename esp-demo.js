import * as THREE from "https://unpkg.com/three@0.170.0/build/three.module.js";

const stage = document.getElementById("esp-demo-stage");
const canvas = document.getElementById("esp-canvas");
const toggles = document.getElementById("esp-toggles");
const styleBtns = document.querySelectorAll("#esp-box-style [data-box]");

if (!stage || !canvas || !toggles) {
  /* module may load before DOM in edge cases */
} else {
  const state = {
    box: true,
    name: true,
    health: true,
    distance: true,
    boxStyle: "corner",
    healthPct: 0.72,
  };

  const options = [
    { id: "box", label: "Box ESP" },
    { id: "name", label: "Name" },
    { id: "health", label: "Health" },
    { id: "distance", label: "Distance" },
  ];

  toggles.innerHTML = options
    .map(
      (o) =>
        `<label class="esp-toggle">
          <input type="checkbox" data-opt="${o.id}" checked />
          <span class="esp-switch"></span>
          <span class="esp-toggle-label">${o.label}</span>
        </label>`
    )
    .join("");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060a14, 0.045);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 2.2, 7.2);

  scene.add(new THREE.AmbientLight(0x6a8fd0, 0.55));
  const key = new THREE.DirectionalLight(0xd8e8ff, 1.35);
  key.position.set(4, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4d8bf5, 0.85);
  rim.position.set(-5, 3, -4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x3d6aad, 0.45, 20);
  fill.position.set(0, 4, 2);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({
      color: 0x0a1222,
      metalness: 0.55,
      roughness: 0.42,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  const grid = new THREE.GridHelper(14, 28, 0x1e3a66, 0x101a2c);
  grid.position.y = 0.002;
  grid.material.opacity = 0.45;
  grid.material.transparent = true;
  scene.add(grid);

  const rig = new THREE.Group();
  scene.add(rig);

  const mat = (color, rough = 0.55) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.08 });

  function part(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const character = new THREE.Group();
  const skin = mat(0xf0b429, 0.62);
  const shirt = mat(0x2f5fd4, 0.48);
  const pants = mat(0x232a38, 0.7);
  const shoe = mat(0x141820, 0.85);

  character.add(part(1, 1, 1, skin, 0, 3.05, 0));
  character.add(part(2.05, 2.05, 1.05, shirt, 0, 1.55, 0));
  character.add(part(0.95, 2.05, 0.95, shirt, -1.55, 1.55, 0));
  character.add(part(0.95, 2.05, 0.95, shirt, 1.55, 1.55, 0));
  character.add(part(0.95, 2.05, 0.95, pants, -0.55, -0.55, 0));
  character.add(part(0.95, 2.05, 0.95, pants, 0.55, -0.55, 0));
  character.add(part(0.95, 0.45, 1.15, shoe, -0.55, -1.75, 0.05));
  character.add(part(0.95, 0.45, 1.15, shoe, 0.55, -1.75, 0.05));

  rig.add(character);

  const espColor = 0x7aa9ff;
  const pad = 0.22;
  const bw = 2.35 + pad * 2;
  const bh = 5.35 + pad * 2;
  const bd = 1.35 + pad * 2;
  const espY = (3.05 + 1.55 - 1.75 - 0.45) / 2;

  const espRoot = new THREE.Group();
  espRoot.position.y = espY;
  rig.add(espRoot);

  function cornerLines(w, h, d, len) {
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;
    const corners = [
      [-hw, -hh, -hd],
      [hw, -hh, -hd],
      [-hw, hh, -hd],
      [hw, hh, -hd],
      [-hw, -hh, hd],
      [hw, -hh, hd],
      [-hw, hh, hd],
      [hw, hh, hd],
    ];
    const pts = [];
    corners.forEach(([cx, cy, cz]) => {
      const dx = cx > 0 ? -len : len;
      const dy = cy > 0 ? -len : len;
      const dz = cz > 0 ? -len : len;
      pts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx + dx, cy, cz));
      pts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx, cy + dy, cz));
      pts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx, cy, cz + dz));
    });
    return pts;
  }

  const cornerGeo = new THREE.BufferGeometry().setFromPoints(
    cornerLines(bw, bh, bd, Math.min(bw, bh, bd) * 0.24)
  );
  const cornerBox = new THREE.LineSegments(
    cornerGeo,
    new THREE.LineBasicMaterial({ color: espColor, transparent: true, opacity: 0.95 })
  );
  espRoot.add(cornerBox);

  const fullBox = new THREE.Mesh(
    new THREE.BoxGeometry(bw, bh, bd),
    new THREE.MeshBasicMaterial({
      color: espColor,
      transparent: true,
      opacity: 0.08,
      wireframe: false,
      depthWrite: false,
    })
  );
  const fullEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(bw, bh, bd)),
    new THREE.LineBasicMaterial({ color: espColor, transparent: true, opacity: 0.95 })
  );
  const fullGroup = new THREE.Group();
  fullGroup.add(fullBox, fullEdges);
  fullGroup.visible = false;
  espRoot.add(fullGroup);

  function textSprite(text, fontSize = 42, color = "#ffffff") {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    c.width = 512;
    c.height = 128;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = `600 ${fontSize}px Inter,Segoe UI,sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.6, 0.65, 1);
    return sprite;
  }

  const nameSprite = textSprite("Enemy");
  nameSprite.position.set(0, bh / 2 + 0.35, 0);
  espRoot.add(nameSprite);

  const distSprite = textSprite("12.0 studs", 34, "#9aa6c2");
  distSprite.position.set(0, -bh / 2 - 0.32, 0);
  espRoot.add(distSprite);

  const healthRoot = new THREE.Group();
  healthRoot.position.set(-bw / 2 - 0.18, 0, 0);
  const healthBg = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, bh * 0.88),
    new THREE.MeshBasicMaterial({ color: 0x0a0e16, transparent: true, opacity: 0.85 })
  );
  const healthFill = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, bh * 0.88),
    new THREE.MeshBasicMaterial({ color: 0x46d18b })
  );
  healthFill.position.z = 0.001;
  healthRoot.add(healthBg, healthFill);
  espRoot.add(healthRoot);

  function updateHealth() {
    const fullH = bh * 0.88;
    const h = fullH * state.healthPct;
    healthFill.scale.y = state.healthPct;
    healthFill.position.y = -(fullH - h) / 2;
  }
  updateHealth();

  function applyEsp() {
    cornerBox.visible = state.box && state.boxStyle === "corner";
    fullGroup.visible = state.box && state.boxStyle === "full";
    nameSprite.visible = state.name;
    distSprite.visible = state.distance;
    healthRoot.visible = state.health;
  }

  toggles.querySelectorAll("input[data-opt]").forEach((input) => {
    input.addEventListener("change", () => {
      state[input.dataset.opt] = input.checked;
      applyEsp();
    });
  });

  styleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      styleBtns.forEach((b) => b.classList.toggle("is-on", b === btn));
      state.boxStyle = btn.dataset.box || "corner";
      applyEsp();
    });
  });

  let rotY = -0.45;
  let rotX = 0.12;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let autoSpin = 0;

  const onDown = (e) => {
    dragging = true;
    autoSpin = 0;
    const pt = e.touches ? e.touches[0] : e;
    lastX = pt.clientX;
    lastY = pt.clientY;
    stage.classList.add("is-drag");
    if (e.cancelable) e.preventDefault();
  };

  const onMove = (e) => {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - lastX;
    const dy = pt.clientY - lastY;
    lastX = pt.clientX;
    lastY = pt.clientY;
    rotY += dx * 0.008;
    rotX = Math.max(-0.55, Math.min(0.55, rotX - dy * 0.006));
    if (e.cancelable) e.preventDefault();
  };

  const onUp = () => {
    dragging = false;
    stage.classList.remove("is-drag");
  };

  stage.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  new ResizeObserver(resize).observe(stage);
  resize();

  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (!dragging) {
      autoSpin += 0.0022;
      rotY += autoSpin;
    }
    rig.rotation.y = rotY;
    rig.rotation.x = rotX;
    character.position.y = Math.sin(t * 1.6) * 0.04;
    healthRoot.lookAt(camera.position);
    nameSprite.lookAt(camera.position);
    distSprite.lookAt(camera.position);
    renderer.render(scene, camera);
  };

  applyEsp();
  animate();
}
