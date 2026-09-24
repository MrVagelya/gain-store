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
  const fulfillUrl = cfg.externalFulfillUrl || "";
  const externalTitle = plans.external?.title || "Gain External";

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id") || "";

  if (!sessionId) {
    if (status) status.textContent = "Missing checkout session. Contact support on Discord.";
    return;
  }
  if (!fulfillUrl) {
    if (status) {
      status.textContent =
        "Gain External delivery is not configured yet. Open Discord with your receipt.";
    }
    return;
  }

  let tries = 0;
  const maxTries = 40;
  let lastKey = "";

  const renderExternalKey = (key) => {
    lastKey = key;
    if (!itemsEl) return;
    itemsEl.innerHTML = `
      <div class="license-block">
        <p class="kicker">${externalTitle}</p>
        <code>${key}</code>
        <button type="button" class="copy-btn" id="copy-external-key">Copy key</button>
        <p class="hint">This is your KeyAuth license for Gain External. Paste it into the app after you download the zip below.</p>
      </div>`;
    const copyBtn = document.getElementById("copy-external-key");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(lastKey);
          const prev = copyBtn.textContent;
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = prev), 1600);
        } catch (_) {}
      });
    }
  };

  const poll = async () => {
    tries += 1;
    try {
      const res = await fetch(`${fulfillUrl}?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => ({}));
      if (data.success && data.key) {
        if (status) status.textContent = "Your license is ready.";
        if (emailNotice && data.email) {
          emailNotice.textContent = "Purchased as " + data.email + ". Save your KeyAuth key below.";
          emailNotice.hidden = false;
        }
        renderExternalKey(String(data.key));
        if (keyBox) keyBox.hidden = false;

        const downloadBtn = document.getElementById("download-btn");
        if (downloadBtn && cfg.stripeDownloadUrl) {
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
        return;
      }
      if (tries < maxTries) {
        setTimeout(poll, 1500);
        return;
      }
      if (status) {
        status.textContent =
          "Payment is processing or delivery is unavailable. Open Discord with your receipt email.";
      }
    } catch {
      if (tries < maxTries) setTimeout(poll, 2000);
    }
  };

  poll();
})();
