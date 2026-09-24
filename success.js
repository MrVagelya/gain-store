(function () {
  const cfg = window.GAIN_STORE || {};
  const status = document.getElementById("status");
  const emailNotice = document.getElementById("email-notice");
  const keyBox = document.getElementById("key-box");
  const itemsEl = document.getElementById("license-items");
  const fulfillUrl = cfg.stripeFulfillUrl || "";
  const discord = cfg.discordUrl || "https://discord.gg/PBMHrgJ4Kd";
  const discordLink = document.getElementById("discord-link");
  if (discordLink) discordLink.href = discord;

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
  const sessionId = params.get("session_id");

  const guessType = (item) => {
    const name = String(item.name || item.product || "").toLowerCase();
    if (name.includes("external")) return "external";
    if (name.includes("skin")) return "skins";
    if (name.includes("bundle")) return "bundle";
    return "unknown";
  };

  const orderTypes = (data) => {
    if (data.items && data.items.length) {
      return data.items.map((item) => guessType(item));
    }
    const single = guessType({ name: data.productName || data.name || "" });
    return single === "unknown" && data.download ? ["external"] : [single];
  };

  if (!sessionId || !fulfillUrl) {
    if (status) status.textContent = "Missing checkout session. Contact support on Discord.";
    return;
  }

  let tries = 0;
  const maxTries = 40;

  const renderDelivery = (data, types) => {
    if (!itemsEl) return;
    const needsLoader = types.some((t) => t === "skins" || t === "bundle");
    const needsExternal = types.some((t) => t === "external" || t === "bundle");
    const parts = [
      `<p class="hint">License delivery is sent to your email. Keys are no longer shown on this page — check your inbox (and spam) for your receipt and license details.</p>`,
    ];
    if (needsLoader && loaderDownloadUrl) {
      parts.push(
        `<a class="cta" href="${loaderDownloadUrl}" download>Download Loader.zip</a>`,
        `<p class="hint">Extract <strong>Gain.exe</strong> from the zip and sign in with the license from your email.</p>`
      );
    }
    if (needsExternal) {
      parts.push(`<a class="cta" id="download-btn" href="#">Download Gain External</a>`);
    }
    itemsEl.innerHTML = parts.join("");
  };

  const poll = async () => {
    tries += 1;
    try {
      const res = await fetch(`${fulfillUrl}?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => ({}));
      if (data.success && (data.key || (data.items && data.items.length))) {
        if (status) status.textContent = "Payment confirmed — check your email for licenses.";
        if (emailNotice && data.email) {
          emailNotice.textContent = data.emailSent
            ? "We sent your delivery details to " + data.email + "."
            : "Sending your delivery to " + data.email + "…";
          emailNotice.hidden = false;
        }
        const types = orderTypes(data);
        renderDelivery(data, types);
        if (keyBox) keyBox.hidden = false;

        const downloadBtn = document.getElementById("download-btn");
        const needsExternal = types.some((t) => t === "external" || t === "bundle");
        if (downloadBtn && needsExternal && cfg.stripeDownloadUrl) {
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
          "Payment is processing. If you do not receive an email soon, open Discord with your receipt.";
      }
    } catch {
      if (tries < maxTries) setTimeout(poll, 2000);
    }
  };

  poll();
})();
