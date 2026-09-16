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

  const root = document.getElementById("compare");
  const wrap = document.getElementById("compare-before-wrap");
  const line = document.getElementById("compare-line");
  const handle = document.getElementById("compare-handle");
  const beforeImg = root && root.querySelector(".compare-before");
  if (root && wrap && line && handle && beforeImg) {
    let split = 50;
    let dragging = false;

    const sizeBefore = () => {
      beforeImg.style.width = root.clientWidth + "px";
    };

    const apply = (pct) => {
      split = Math.min(98, Math.max(2, pct));
      wrap.style.width = split + "%";
      line.style.left = split + "%";
      handle.style.left = split + "%";
      sizeBefore();
    };

    window.addEventListener("resize", sizeBefore);

    const fromEvent = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = root.getBoundingClientRect();
      apply(((x - rect.left) / rect.width) * 100);
    };

    root.addEventListener("mousedown", (e) => {
      dragging = true;
      fromEvent(e);
    });
    window.addEventListener("mousemove", (e) => {
      if (dragging) fromEvent(e);
    });
    window.addEventListener("mouseup", () => {
      dragging = false;
    });
    root.addEventListener("touchstart", (e) => {
      dragging = true;
      fromEvent(e);
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (dragging) fromEvent(e);
    }, { passive: true });
    window.addEventListener("touchend", () => {
      dragging = false;
    });
    apply(50);
  }
})();
