(function () {
  const cfg = window.GAIN_STORE || {};
  const $ = (id) => document.getElementById(id);

  const brand = cfg.brand || "Gain";
  const tag = cfg.tagline || "Rivals Skin Changer";
  document.title = `${brand} — ${tag}`;
  if ($("brand-name")) $("brand-name").textContent = brand;
  if ($("hero-tag")) $("hero-tag").textContent = tag;
  if ($("footer-brand")) $("footer-brand").textContent = brand;

  const discord = cfg.discordUrl || "#";
  document.querySelectorAll("[data-discord]").forEach((el) => {
    el.href = discord;
  });

  const p = cfg.price || {};
  if ($("price-amount")) $("price-amount").textContent = `${p.currency || "$"}${p.amount || "5"}`;
  if ($("price-label")) $("price-label").textContent = p.label || "Lifetime";
  if ($("price-note")) $("price-note").textContent = p.note || "";

  const grid = $("executor-grid");
  if (grid && Array.isArray(cfg.executors)) {
    grid.innerHTML = cfg.executors
      .map((name) => `<span class="executor-pill">${name}</span>`)
      .join("");
  }

  const loader = cfg.loaderUrl || "";
  const snippet = `script_key="YOUR_KEY_HERE";\nloadstring(game:HttpGet("${loader}"))()`;
  const codeEl = $("loader-snippet");
  if (codeEl) codeEl.textContent = snippet;

  const copyBtn = $("copy-snippet");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(snippet);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      } catch {
        copyBtn.textContent = "Copy manually";
      }
    });
  }

  if ($("year")) $("year").textContent = String(new Date().getFullYear());

  const nav = document.querySelector(".nav-shell");
  const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
