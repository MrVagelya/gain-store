(function () {
  const stage = document.getElementById("esp-demo-stage");
  const scene = document.getElementById("esp-scene");
  const rig = document.getElementById("esp-rig");
  const box = document.getElementById("esp-box");
  const nameEl = document.getElementById("esp-name");
  const healthEl = document.getElementById("esp-health");
  const healthFill = healthEl ? healthEl.querySelector("span") : null;
  const distEl = document.getElementById("esp-distance");
  const toggles = document.getElementById("esp-toggles");
  const styleBtns = document.querySelectorAll("#esp-box-style [data-box]");

  if (!stage || !rig || !box || !toggles) return;

  const state = {
    box: true,
    name: true,
    health: true,
    distance: true,
    boxStyle: "corner",
    healthPct: 72,
    rotY: -18,
    rotX: 8,
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

  const apply = () => {
    box.hidden = !state.box;
    box.dataset.style = state.boxStyle;
    if (nameEl) nameEl.hidden = !state.name;
    if (healthEl) healthEl.hidden = !state.health;
    if (distEl) distEl.hidden = !state.distance;
    if (healthFill) healthFill.style.width = state.healthPct + "%";
    rig.style.transform = `rotateX(${state.rotX}deg) rotateY(${state.rotY}deg)`;
  };

  toggles.querySelectorAll("input[data-opt]").forEach((input) => {
    input.addEventListener("change", () => {
      state[input.dataset.opt] = input.checked;
      apply();
    });
  });

  styleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      styleBtns.forEach((b) => b.classList.toggle("is-on", b === btn));
      state.boxStyle = btn.dataset.box || "corner";
      apply();
    });
  });

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const onDown = (e) => {
    dragging = true;
    const pt = e.touches ? e.touches[0] : e;
    lastX = pt.clientX;
    lastY = pt.clientY;
    scene.classList.add("is-drag");
    if (e.cancelable) e.preventDefault();
  };

  const onMove = (e) => {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - lastX;
    const dy = pt.clientY - lastY;
    lastX = pt.clientX;
    lastY = pt.clientY;
    state.rotY += dx * 0.35;
    state.rotX = Math.max(-28, Math.min(28, state.rotX - dy * 0.25));
    apply();
    if (e.cancelable) e.preventDefault();
  };

  const onUp = () => {
    dragging = false;
    scene.classList.remove("is-drag");
  };

  scene.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  scene.addEventListener("touchstart", onDown, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);

  apply();
})();
