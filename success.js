(function () {
  const cfg = window.GAIN_STORE || {};
  const plans = cfg.plans || {};
  const discord = cfg.discordUrl || "https://discord.gg/PBMHrgJ4Kd";
  const discordLink = document.getElementById("discord-link");
  if (discordLink) discordLink.href = discord;

  const status = document.getElementById("status");
  const emailNotice = document.getElementById("email-notice");
  const keyBox = document.getElementById("key-box");
  const itemsEl = document.getElementById("license-items");
  const fulfillUrl = cfg.stripeFulfillUrl || "";

  const externalTitle = plans.external?.title || "Gain External";
  const skinTitle = plans.skins?.title || "Rivals Skin Changer";

  const loaderDownloadUrl = (() => {
    const raw = cfg.loaderDownloadUrl || "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    try {
      return new URL(raw, location.href).href;
    } catch {
      return raw;
    }
  })();

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id") || "";

  const hasScriptSnippet = (item) => {
    const s = String(item?.snippet || "");
    return s.includes("loadstring") || s.includes("script_key") || s.includes("/loader/");
  };

  const guessType = (item) => {
    const name = String(item?.name || item?.product || "").toLowerCase();
    if (name.includes("skin")) return "skins";
    if (name.includes("external")) return "external";
    if (name.includes("bundle")) return "bundle";
    if (hasScriptSnippet(item)) return "skins";
    return "external";
  };

  const normalizeItems = (rawItems) => {
    const items = (rawItems || []).map((item) => ({
      name: String(item.name || "License"),
      key: String(item.key || ""),
      snippet: String(item.snippet || ""),
      type: guessType(item),
    }));

    if (items.length === 2) {
      const skinsIdx = items.findIndex((i) => i.type === "skins");
      const extIdx = items.findIndex((i) => i.type === "external");
      if (skinsIdx >= 0 && extIdx >= 0) {
        const skins = items[skinsIdx];
        const ext = items[extIdx];
        const skinsHasScript = hasScriptSnippet(skins);
        const extHasScript = hasScriptSnippet(ext);
        if (!skinsHasScript && extHasScript) {
          const tmp = skins.key;
          skins.key = ext.key;
          ext.key = tmp;
        }
      }
    }

    return items.map((item) => {
      const type = item.type;
      const name = type === "skins" ? skinTitle : externalTitle;
      return { name, key: item.key, type };
    });
  };

  const normalizeSingle = (data) => {
    const name = String(data.productName || data.name || "");
    let type = guessType({ name, snippet: data.loaderSnippet || "" });
    if (!name) {
      type = data.download
        ? "external"
        : hasScriptSnippet({ snippet: data.loaderSnippet })
          ? "skins"
          : "external";
    }
    const key = String(data.key || "");
    const displayName = type === "skins" ? skinTitle : externalTitle;
    return [{ name: displayName, key, type }];
  };

  const toDisplayItems = (data) => {
    const normalized =
      data.items && data.items.length ? normalizeItems(data.items) : normalizeSingle(data);
    const out = [];
    for (const item of normalized) {
      if (item.type === "external") {
        out.push(item);
        continue;
      }
      if (item.type === "skins") {
        out.push({ name: item.name, key: "", type: "skins", emailOnly: true });
      }
    }
    if (!out.length && normalized.some((i) => i.type === "external")) {
      out.push(...normalized.filter((i) => i.type === "external"));
    }
    return out;
  };

  const orderIncludesSkins = (data) => {
    const normalized =
      data.items && data.items.length ? normalizeItems(data.items) : normalizeSingle(data);
    return normalized.some((i) => i.type === "skins");
  };

  const orderIncludesExternal = (data) => {
    const normalized =
      data.items && data.items.length ? normalizeItems(data.items) : normalizeSingle(data);
    return normalized.some((i) => i.type === "external");
  };

  if (!sessionId || !fulfillUrl) {
    if (status) status.textContent = "Missing checkout session. Contact support on Discord.";
    return;
  }

  let tries = 0;
  const maxTries = 40;
  let lastItems = [];

  const renderItems = (items, needsLoader) => {
    lastItems = items;
    if (!itemsEl) return;

    const blocks = items
      .map((item, i) => {
        if (item.type === "skins" && item.emailOnly) {
          return `
        <div class="license-block">
          <p class="kicker">${item.name}</p>
          <p class="hint">Skin Changer delivery is sent to your email. Download Loader.zip below and use the license from that email.</p>
        </div>`;
        }
        const key = String(item.key || "");
        return `
        <div class="license-block">
          <p class="kicker">${item.name}</p>
          <code>${key}</code>
          <button type="button" class="copy-btn" data-kind="key" data-i="${i}">Copy key</button>
          <p class="hint">Paste this key into Gain External. Download the zip below — this is not a Roblox script and has no loader.</p>
        </div>`;
      })
      .join("");

    const extras = [];
    if (needsLoader && loaderDownloadUrl) {
      extras.push(
        `<a class="cta" href="${loaderDownloadUrl}" download>Download Loader.zip</a>`,
        `<p class="hint">Extract <strong>Gain.exe</strong> for Skin Changer setup.</p>`
      );
    }

    itemsEl.innerHTML = blocks + extras.join("");

    itemsEl.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const i = Number(btn.getAttribute("data-i") || 0);
        const item = lastItems[i] || {};
        try {
          await navigator.clipboard.writeText(item.key || "");
          const prev = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(() => (btn.textContent = prev), 1600);
        } catch (_) {}
      });
    });
  };

  const poll = async () => {
    tries += 1;
    try {
      const res = await fetch(`${fulfillUrl}?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => ({}));
      if (data.success && (data.key || (data.items && data.items.length))) {
        if (status) status.textContent = "Your license is ready.";
        if (emailNotice && data.email) {
          emailNotice.textContent = data.emailSent
            ? "We emailed your receipt to " + data.email + "."
            : "Sending your receipt to " + data.email + "…";
          emailNotice.hidden = false;
        }

        const displayItems = toDisplayItems(data);
        renderItems(displayItems, orderIncludesSkins(data));
        if (keyBox) keyBox.hidden = false;

        const downloadBtn = document.getElementById("download-btn");
        if (downloadBtn && orderIncludesExternal(data) && cfg.stripeDownloadUrl) {
          downloadBtn.hidden = false;
          downloadBtn.onclick = async (e) => {
            e.preventDefault();
            downloadBtn.textContent = "Preparing file…";
            try {
              const dres = await fetch(
                `${cfg.stripeDownloadUrl}?session_id=${encodeURIComponent(sessionId)}`
              );
              const ddata = await dres.json().catch(() => ({}));
              if (ddata.success && ddata.url) {
                location.href = ddata.url;
                downloadBtn.textContent = "Download Gain External";
              } else {
                downloadBtn.textContent = "Download unavailable";
              }
            } catch {
              downloadBtn.textContent = "Download failed";
            }
          };
        }

        if (!data.emailSent && data.email && tries < maxTries) {
          setTimeout(poll, 2000);
          return;
        }
        return;
      }
      if (tries < maxTries) {
        setTimeout(poll, 1500);
        return;
      }
      if (status) {
        status.textContent =
          "Payment is processing. If your key does not appear soon, open Discord with your receipt email.";
      }
    } catch {
      if (tries < maxTries) setTimeout(poll, 2000);
    }
  };

  poll();
})();
