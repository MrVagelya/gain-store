(function () {
  const cfg = window.GAIN_STORE || {};
  const discord = cfg.discordUrl || "#";
  const stripe = cfg.stripePaymentUrl || "";

  document.querySelectorAll("[data-discord]").forEach((el) => {
    el.href = discord;
  });

  document.querySelectorAll("[data-stripe]").forEach((el) => {
    if (stripe) {
      el.href = stripe;
      el.removeAttribute("aria-disabled");
    } else {
      el.href = "#";
      el.setAttribute("aria-disabled", "true");
      el.addEventListener("click", (e) => e.preventDefault());
    }
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

  const salesLine = document.getElementById("sales-line");
  const salesNum = document.getElementById("sales-num");
  const showSales = (n) => {
    if (!salesLine || !salesNum || !Number.isFinite(n) || n < 0) return;
    salesNum.textContent = n.toLocaleString("en-US");
    salesLine.hidden = false;
  };
  const fallbackSales = Number(cfg.salesOffset) || 0;
  if (cfg.salesStatsUrl) {
    fetch(cfg.salesStatsUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && typeof data.sales === "number") {
          showSales(data.sales);
        } else if (fallbackSales > 0) showSales(fallbackSales);
      })
      .catch(() => {
        if (fallbackSales > 0) showSales(fallbackSales);
      });
  } else if (fallbackSales > 0) {
    showSales(fallbackSales);
  }

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

  const glow = document.getElementById("cursor-glow");
  let gx = innerWidth / 2;
  let gy = innerHeight / 2;
  let tx = gx;
  let ty = gy;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });
  const follow = () => {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    if (glow) glow.style.transform = "translate(" + gx + "px," + gy + "px)";
    requestAnimationFrame(follow);
  };
  follow();

  const canvas = document.getElementById("snow");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const flakes = [];

    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };

    const spawnX = () => {
      const band = Math.min(160, innerWidth * 0.12);
      return Math.random() < 0.5 ? Math.random() * band : innerWidth - Math.random() * band;
    };

    const makeFlake = (anywhereY) => ({
      x: spawnX(),
      y: anywhereY ? Math.random() * innerHeight : -10,
      r: 0.8 + Math.random() * 1.6,
      s: 0.12 + Math.random() * 0.28,
      drift: -0.12 + Math.random() * 0.24,
      a: 0.28 + Math.random() * 0.35,
    });

    const fill = () => {
      const count = innerWidth < 700 ? 40 : 70;
      flakes.length = 0;
      for (let i = 0; i < count; i++) flakes.push(makeFlake(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.s;
        f.x += f.drift + Math.sin((f.y + i) * 0.008) * 0.12;
        ctx.beginPath();
        ctx.fillStyle = "rgba(230,235,245," + f.a + ")";
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        if (f.y > innerHeight + 10) flakes[i] = makeFlake(false);
      }
      requestAnimationFrame(tick);
    };

    resize();
    fill();
    window.addEventListener("resize", () => {
      resize();
      fill();
    });
    tick();
  }
})();
