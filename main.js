(function () {
  const cfg = window.GAIN_STORE || {};
  const discord = cfg.discordUrl || "#";
  const plans = cfg.plans || {};

  document.querySelectorAll("[data-discord]").forEach((el) => {
    el.href = discord;
  });

  const feat = document.getElementById("feat-grid");
  const exec = document.getElementById("exec-list");
  if (exec && cfg.executors) {
    exec.innerHTML = cfg.executors.map((n) => `<span>${n}</span>`).join("");
  }

  const snippetEl = document.getElementById("loader-snippet");
  const snippetBox = document.getElementById("loader-box");
  const howto = document.getElementById("howto");
  const copy = document.getElementById("copy-snippet");
  let currentSnippet = "";

  const setPlan = (id) => {
    const plan = plans[id] || plans.skins;
    if (!plan) return;

    document.querySelectorAll(".plan").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.plan === id);
    });
    document.querySelectorAll(".media-pane").forEach((pane) => {
      const on = pane.id === "pane-" + id;
      pane.hidden = !on;
      pane.classList.toggle("is-on", on);
    });

    const setText = (elId, value) => {
      const el = document.getElementById(elId);
      if (el) el.textContent = value || "";
    };
    setText("buy-kicker", plan.kicker);
    setText("buy-title", plan.title);
    setText("buy-blurb", plan.blurb);
    setText("buy-price", plan.price);
    setText("buy-sub", plan.includes ? plan.includes.join(" · ") : "Insane performance · Lifetime access");

    const was = document.getElementById("buy-was");
    const save = document.getElementById("buy-save");
    if (was) {
      was.textContent = plan.priceWas || "";
      was.hidden = !plan.priceWas;
    }
    if (save) {
      save.textContent = plan.save || "";
      save.hidden = !plan.save;
    }

    const includes = document.getElementById("buy-includes");
    if (includes) {
      includes.innerHTML = (plan.includes || []).map((x) => `<li>${x}</li>`).join("");
    }

    const cta = document.getElementById("buy-cta");
    if (cta) {
      cta.textContent = plan.cta || "Pay with card";
      cta.href = plan.stripeUrl || "#";
    }

    if (feat && plan.features) {
      feat.innerHTML = Object.entries(plan.features)
        .map(
          ([title, items]) =>
            `<article class="feat"><h3>${title}</h3><ul>${items
              .map((x) => `<li>${x}</li>`)
              .join("")}</ul></article>`
        )
        .join("");
    }

    if (howto) {
      howto.innerHTML = (plan.setup || []).map((x) => `<li>${x}</li>`).join("");
    }

    if (plan.id === "external") {
      currentSnippet = "";
      if (snippetBox) snippetBox.hidden = true;
    } else {
      currentSnippet = `script_key="YOUR_KEY_HERE";
loadstring(game:HttpGet("${plan.loaderUrl || ""}"))()`;
      if (snippetBox) snippetBox.hidden = false;
      if (snippetEl) snippetEl.textContent = currentSnippet;
    }

    requestAnimationFrame(() => {
      document.querySelectorAll(".compare").forEach((el) => {
        const top = el.querySelector(".compare-top");
        const handle = el.querySelector(".compare-ui");
        const rect = el.getBoundingClientRect();
        if (!top || !handle || !rect.width) return;
        top.style.clipPath = "inset(0 50% 0 0)";
        handle.style.left = "50%";
      });
    });
  };

  document.querySelectorAll(".plan").forEach((btn) => {
    btn.addEventListener("click", () => setPlan(btn.dataset.plan));
  });
  setPlan(cfg.defaultPlan || "skins");

  if (copy) {
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(currentSnippet);
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
    if (!salesLine || !salesNum || !Number.isFinite(n) || n < 1) return;
    salesNum.textContent = n.toLocaleString("en-US");
    salesLine.hidden = false;
  };
  if (cfg.salesStatsUrl) {
    fetch(cfg.salesStatsUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && typeof data.sales === "number") {
          showSales(data.sales);
        }
      })
      .catch(() => {});
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

  const bindCompare = (compare, topImg, ui) => {
    if (!compare || !topImg || !ui) return () => {};
    let dragging = false;

    const setSplit = (clientX) => {
      const rect = compare.getBoundingClientRect();
      if (!rect.width) return;
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(1, Math.min(99, pct));
      topImg.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      ui.style.left = pct + "%";
    };

    const center = () => {
      const rect = compare.getBoundingClientRect();
      if (rect.width) setSplit(rect.left + rect.width * 0.5);
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
    center();
    return center;
  };

  const refreshCompares = [
    bindCompare(
      document.querySelector("#pane-skins.compare"),
      document.getElementById("compare-top"),
      document.getElementById("compare-ui")
    ),
    bindCompare(
      document.getElementById("compare-bundle"),
      document.getElementById("compare-top-bundle"),
      document.getElementById("compare-ui-bundle")
    ),
  ];

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
