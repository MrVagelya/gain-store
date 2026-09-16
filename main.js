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
})();
