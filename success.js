(function () {
  const cfg = window.GAIN_STORE || {};
  const discord = document.getElementById("discord-link");
  if (discord && cfg.discordUrl) discord.href = cfg.discordUrl;

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id") || "";
  const status = document.getElementById("status");
  const keyBox = document.getElementById("key-box");
  const itemsEl = document.getElementById("license-items");
  const fulfillUrl = cfg.stripeFulfillUrl || "";
  const emailNotice = document.getElementById("email-notice");

  if (!sessionId || !fulfillUrl) {
    if (status) status.textContent = "Missing checkout session. Contact support on Discord.";
    return;
  }

  let tries = 0;
  const maxTries = 40;

  let lastItems = [];

  const renderItems = (items) => {
    lastItems = items;
    if (!itemsEl) return;
    itemsEl.innerHTML = items
      .map((item, i) => {
        const name = String(item.name || "License");
        const key = String(item.key || "");
        const snippet = String(item.snippet || "");
        const snippetHtml = snippet
          ? `<div class="code">
            <button type="button" class="copy-btn" data-kind="snippet" data-i="${i}">Copy loader</button>
            <pre><code></code></pre>
          </div>`
          : `<p class="hint">Paste this key into Gain External. Download the zip below — this is not a Roblox script and has no loader.</p>`;
        return `
        <div class="license-block">
          <p class="kicker">${name}</p>
          <code>${key}</code>
          <button type="button" class="copy-btn" data-kind="key" data-i="${i}">Copy key</button>
          ${snippetHtml}
        </div>`;
      })
      .join("");
    itemsEl.querySelectorAll(".license-block").forEach((block, i) => {
      const code = block.querySelector("pre code");
      if (code) code.textContent = items[i].snippet || "";
    });
    itemsEl.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const i = Number(btn.getAttribute("data-i") || 0);
        const kind = btn.getAttribute("data-kind");
        const item = lastItems[i] || {};
        const value = kind === "snippet" ? item.snippet : item.key;
        try {
          await navigator.clipboard.writeText(value || "");
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
            ? "We emailed your delivery details to " + data.email + "."
            : "Sending your delivery to " + data.email + "… You can still copy it below.";
          emailNotice.hidden = false;
        }
        const items =
          data.items && data.items.length
            ? data.items
            : [{ name: "License", key: data.key, snippet: data.loaderSnippet || "" }];
        renderItems(items);
        if (keyBox) keyBox.hidden = false;
        const downloadBtn = document.getElementById("download-btn");
        if (downloadBtn && data.download && cfg.stripeDownloadUrl) {
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
