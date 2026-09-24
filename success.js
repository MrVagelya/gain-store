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
  const keyPool = Array.isArray(cfg.externalLicenseKeys) ? cfg.externalLicenseKeys.filter(Boolean) : [];

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

  const guessType = (item) => {
    const name = String(item?.name || item?.product || "").toLowerCase();
    if (name.includes("skin")) return "skins";
    if (name.includes("external")) return "external";
    if (name.includes("bundle")) return "bundle";
    return "unknown";
  };

  const orderIncludesExternal = (data) => {
    if (data.items && data.items.length) {
      return data.items.some((item) => {
        const t = guessType(item);
        return t === "external" || t === "bundle";
      });
    }
    const t = guessType({ name: data.productName || data.name || "" });
    if (t === "external" || t === "bundle") return true;
    return Boolean(data.download);
  };

  const orderIncludesSkins = (data) => {
    if (data.items && data.items.length) {
      return data.items.some((item) => {
        const t = guessType(item);
        return t === "skins" || t === "bundle";
      });
    }
    const t = guessType({ name: data.productName || data.name || "" });
    return t === "skins" || t === "bundle";
  };

  const allocateExternalKey = (sid) => {
    if (!keyPool.length) return "";
    const mapKey = "gain-external-key-by-session";
    const indexKey = "gain-external-key-next-index";
    try {
      const map = JSON.parse(localStorage.getItem(mapKey) || "{}");
      if (map[sid]) return map[sid];
      let next = Number.parseInt(localStorage.getItem(indexKey) || "0", 10);
      if (!Number.isFinite(next) || next < 0) next = 0;
      if (next >= keyPool.length) next = keyPool.length - 1;
      const key = keyPool[next];
      map[sid] = key;
      localStorage.setItem(mapKey, JSON.stringify(map));
      localStorage.setItem(indexKey, String(Math.min(next + 1, keyPool.length)));
      return key;
    } catch {
      return keyPool[0] || "";
    }
  };

  if (!sessionId || !fulfillUrl) {
    if (status) status.textContent = "Missing checkout session. Contact support on Discord.";
    return;
  }

  let tries = 0;
  const maxTries = 40;
  let lastItems = [];

  const buildDisplayItems = (data) => {
    const items = [];
    if (orderIncludesExternal(data)) {
      const key = allocateExternalKey(sessionId);
      items.push({
        name: externalTitle,
        key,
        type: "external",
      });
    }
    if (orderIncludesSkins(data)) {
      items.push({
        name: skinTitle,
        key: "",
        type: "skins",
        emailOnly: true,
      });
    }
    return items;
  };

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

        const displayItems = buildDisplayItems(data);
        renderItems(displayItems, orderIncludesSkins(data));
        if (keyBox) keyBox.hidden = false;

        const needsExternal = orderIncludesExternal(data);
        const downloadBtn = document.getElementById("download-btn");
        if (downloadBtn && needsExternal && cfg.stripeDownloadUrl) {
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
