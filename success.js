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
        return `
        <div class="license-block">
          <p class="kicker">${name}</p>
          <code>${key}</code>
          <button type="button" class="copy-btn" data-kind="key" data-i="${i}">Copy key</button>
          <div class="code">
            <button type="button" class="copy-btn" data-kind="snippet" data-i="${i}">Copy loader</button>
            <pre><code></code></pre>
          </div>
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
            ? "We emailed your license key and loader script to " + data.email + "."
            : "Sending your license to " + data.email + "… You can still copy it below.";
          emailNotice.hidden = false;
        }
        const items =
          data.items && data.items.length
            ? data.items
            : [{ name: "License", key: data.key, snippet: data.loaderSnippet || "" }];
        renderItems(items);
        if (keyBox) keyBox.hidden = false;
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
