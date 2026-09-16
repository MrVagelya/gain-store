(function () {
  const cfg = window.GAIN_STORE || {};
  const discord = cfg.discordUrl || "#";

  document.querySelectorAll("[data-discord]").forEach((el) => {
    el.href = discord;
  });

  const feat = document.getElementById("feat-grid");
  if (feat && cfg.features) {
    feat.innerHTML = Object.entries(cfg.features)
      .map(
        ([title, items]) =>
          `<article class="feat"><h3>${title}</h3><ul>${items
            .map((x) => `<li>${x}</li>`)
            .join("")}</ul></article>`
      )
      .join("");
  }

  const exec = document.getElementById("exec-list");
  if (exec && cfg.executors) {
    exec.innerHTML = cfg.executors.map((n) => `<span>${n}</span>`).join("");
  }

  const snippet = `script_key="YOUR_KEY_HERE";
loadstring(game:HttpGet("${cfg.loaderUrl || ""}"))()`;
  const code = document.getElementById("loader-snippet");
  if (code) code.textContent = snippet;

  const copy = document.getElementById("copy-snippet");
  if (copy) {
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(snippet);
        copy.textContent = "Copied";
        setTimeout(() => (copy.textContent = "Copy"), 1600);
      } catch (_) {}
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const tabs = [...document.querySelectorAll(".tab")];
  const ink = document.getElementById("tab-ink");
  const moveInk = (btn) => {
    if (!ink || !btn) return;
    ink.style.width = btn.offsetWidth + "px";
    ink.style.left = btn.offsetLeft + "px";
  };
  const showTab = (id) => {
    tabs.forEach((t) => t.classList.toggle("is-on", t.dataset.tab === id));
    document.querySelectorAll(".panel").forEach((p) => {
      p.classList.toggle("is-on", p.id === "panel-" + id);
    });
    moveInk(tabs.find((t) => t.dataset.tab === id));
  };
  tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
  window.addEventListener("resize", () => moveInk(document.querySelector(".tab.is-on")));
  showTab("features");

  const compare = document.getElementById("compare");
  const topImg = document.getElementById("compare-top");
  const ui = document.getElementById("compare-ui");
  if (compare && topImg && ui) {
    let dragging = false;

    const setSplit = (clientX) => {
      const rect = compare.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(1, Math.min(99, pct));
      topImg.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      ui.style.left = pct + "%";
    };

    const start = (e) => {
      dragging = true;
      compare.classList.add("is-drag");
      const pt = e.touches ? e.touches[0] : e;
      setSplit(pt.clientX);
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      setSplit(pt.clientX);
      if (e.cancelable) e.preventDefault();
    };
    const end = () => {
      dragging = false;
      compare.classList.remove("is-drag");
    };

    compare.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    compare.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    setSplit(compare.getBoundingClientRect().left + compare.clientWidth * 0.5);
  }
})();
