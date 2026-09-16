(function () {
  const cfg = window.GAIN_STORE || {};
  const discord = document.getElementById("discord-link");
  if (discord && cfg.discordUrl) discord.href = cfg.discordUrl;

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id") || "";
  const status = document.getElementById("status");
  const keyBox = document.getElementById("key-box");
  const keyEl = document.getElementById("license-key");
  const snippetEl = document.getElementById("loader-snippet");
  const fulfillUrl = cfg.stripeFulfillUrl || "";
  const emailNotice = document.getElementById("email-notice");

  if (!sessionId || !fulfillUrl) {
    if (status) status.textContent = "Missing checkout session. Contact support on Discord.";
    return;
  }

  let tries = 0;
  const maxTries = 40;

  const poll = async () => {
    tries += 1;
    try {
      const res = await fetch(`${fulfillUrl}?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json().catch(() => ({}));
      if (data.success && data.key) {
        const showReady = (payload) => {
          if (status) status.textContent = "Your license is ready.";
          if (emailNotice && payload.email) {
            if (payload.emailSent) {
              emailNotice.textContent =
                "We emailed your license key and loader script to " + payload.email + ".";
            } else {
              emailNotice.textContent =
                "Sending your license to " + payload.email + "… You can still copy it below.";
            }
            emailNotice.hidden = false;
          }
          if (keyEl) keyEl.textContent = payload.key;
          if (snippetEl) snippetEl.textContent = payload.loaderSnippet || "";
          if (keyBox) keyBox.hidden = false;
        };
        showReady(data);
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

  const copyKey = document.getElementById("copy-key");
  if (copyKey && keyEl) {
    copyKey.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(keyEl.textContent || "");
        copyKey.textContent = "Copied";
        setTimeout(() => (copyKey.textContent = "Copy key"), 1600);
      } catch (_) {}
    });
  }

  const copySnippet = document.getElementById("copy-snippet");
  if (copySnippet && snippetEl) {
    copySnippet.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(snippetEl.textContent || "");
        copySnippet.textContent = "Copied";
        setTimeout(() => (copySnippet.textContent = "Copy loader"), 1600);
      } catch (_) {}
    });
  }
})();
