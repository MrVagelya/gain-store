(function () {
  const cfg = window.GAIN_STORE || {};
  const $ = (sel) => document.querySelector(sel);

  document.getElementById("brand-name").textContent = cfg.brand || "Gain";
  document.getElementById("hero-tag").textContent = cfg.tagline || "Rivals Skin Changer";
  document.title = `${cfg.brand || "Gain"} — ${cfg.tagline || "Rivals Skin Changer"}`;

  const discord = cfg.discordUrl || "#";
  document.querySelectorAll("[data-discord]").forEach((el) => {
    el.href = discord;
  });

  const pricing = document.getElementById("pricing-grid");
  if (pricing && Array.isArray(cfg.plans)) {
    pricing.innerHTML = cfg.plans
      .map(
        (p) => `
      <article class="price-card${p.highlight ? " highlight" : ""}">
        ${p.highlight ? '<span class="badge">Best value</span>' : ""}
        <h3>${p.name}</h3>
        <p class="price">${p.currency || "€"}${p.price}<small>${p.period || ""}</small></p>
        <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <a class="btn btn-primary" style="width:100%" data-discord href="${discord}">
          Buy via Discord
        </a>
      </article>`
      )
      .join("");
  }

  const loader = cfg.loaderUrl || "";
  const snippet = `script_key="YOUR_KEY_HERE";
loadstring(game:HttpGet("${loader}"))()`;

  const codeEl = document.getElementById("loader-snippet");
  if (codeEl) codeEl.textContent = snippet;

  const preview = document.getElementById("preview-code");
  if (preview) {
    preview.textContent = snippet.replace("YOUR_KEY_HERE", "••••••••••••••••");
  }

  const copyBtn = document.getElementById("copy-snippet");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(snippet);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      } catch {
        copyBtn.textContent = "Select & copy";
      }
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
