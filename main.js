(function () {
  "use strict";

  const cfg = window.GAIN_STORE || {};
  const plans = cfg.plans || {};
  const discordUrl = cfg.discordUrl || "#";
  const planButtons = [...document.querySelectorAll(".plan")];
  const panes = [...document.querySelectorAll(".media-pane")];
  const feat = document.getElementById("feat-grid");
  const exec = document.getElementById("exec-list");
  const snippetEl = document.getElementById("loader-snippet");
  const snippetBox = document.getElementById("loader-box");
  const howto = document.getElementById("howto");
  const copy = document.getElementById("copy-snippet");
  let currentSnippet = "";

  document.querySelectorAll("[data-discord]").forEach((el) => {
    el.href = discordUrl;
    el.rel = "noopener noreferrer";
  });

  if (exec && Array.isArray(cfg.executors)) {
    exec.replaceChildren(
      ...cfg.executors.map((name) => {
        const tag = document.createElement("span");
        tag.textContent = name;
        return tag;
      })
    );
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  const listItems = (items, target, className) => {
    if (!target) return;
    target.replaceChildren(
      ...(items || []).map((item) => {
        const li = document.createElement("li");
        if (className) li.className = className;
        li.textContent = item;
        return li;
      })
    );
  };

  const renderFeatures = (features) => {
    if (!feat) return;
    feat.replaceChildren(
      ...Object.entries(features || {}).map(([title, items]) => {
        const article = document.createElement("article");
        const heading = document.createElement("h3");
        const list = document.createElement("ul");
        article.className = "feat";
        heading.textContent = title;
        listItems(items, list);
        article.append(heading, list);
        return article;
      })
    );
  };

  const updateCheckout = (plan) => {
    const cta = document.getElementById("buy-cta");
    if (!cta) return;
    const hasCheckout = Boolean(plan.stripeUrl && plan.stripeUrl !== "#");
    cta.textContent = plan.cta || "Pay with card";
    cta.href = hasCheckout ? plan.stripeUrl : "#";
    cta.setAttribute("aria-disabled", String(!hasCheckout));
    cta.classList.toggle("is-disabled", !hasCheckout);
  };

  const setPlan = (id, shouldUpdateHash) => {
    const plan = plans[id] || plans.skins;
    if (!plan) return;
    const activeId = plan.id || id;

    planButtons.forEach((button) => {
      const isActive = button.dataset.plan === activeId;
      button.classList.toggle("is-on", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    panes.forEach((pane) => {
      const isActive = pane.id === "pane-" + activeId;
      pane.hidden = !isActive;
      pane.classList.toggle("is-on", isActive);
      pane.setAttribute("aria-hidden", String(!isActive));
    });

    setText("buy-kicker", plan.kicker);
    setText("buy-title", plan.title);
    setText("buy-blurb", plan.blurb);
    setText("buy-price", plan.price);
    setText("buy-sub", (plan.includes || []).join(" · "));

    const was = document.getElementById("buy-was");
    const save = document.getElementById("buy-save");
    if (was) {
      was.textContent = plan.priceWas || "";
      was.hidden = !plan.priceWas;
    }
    if (save) {
      save.textContent = plan.save || "";
      save.hidden = !plan.save;
    }

    listItems(plan.includes, document.getElementById("buy-includes"));
    renderFeatures(plan.features);
    listItems(plan.setup, howto);
    updateCheckout(plan);

    currentSnippet = "";
    if (activeId !== "external") {
      currentSnippet = `script_key="YOUR_KEY_HERE";\nloadstring(game:HttpGet("${plan.loaderUrl || ""}"))()`;
    }
    if (snippetBox) snippetBox.hidden = !currentSnippet;
    if (snippetEl) snippetEl.textContent = currentSnippet;

    if (shouldUpdateHash) {
      const next = new URL(window.location.href);
      next.hash = activeId;
      history.replaceState(null, "", next);
    }

    requestAnimationFrame(() => compareRefreshers.forEach((refresh) => refresh()));
  };

  const activatePlanAt = (index, focus) => {
    const button = planButtons[(index + planButtons.length) % planButtons.length];
    if (!button) return;
    setPlan(button.dataset.plan, true);
    if (focus) button.focus();
  };

  planButtons.forEach((button, index) => {
    button.addEventListener("click", () => setPlan(button.dataset.plan, true));
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        activatePlanAt(index + 1, true);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        activatePlanAt(index - 1, true);
      } else if (event.key === "Home") {
        event.preventDefault();
        activatePlanAt(0, true);
      } else if (event.key === "End") {
        event.preventDefault();
        activatePlanAt(planButtons.length - 1, true);
      }
    });
  });

  if (copy) {
    copy.addEventListener("click", async () => {
      if (!currentSnippet) return;
      try {
        await navigator.clipboard.writeText(currentSnippet);
        copy.textContent = "Copied";
        window.setTimeout(() => (copy.textContent = "Copy"), 1600);
      } catch (_) {
        copy.textContent = "Copy failed";
        window.setTimeout(() => (copy.textContent = "Copy"), 1600);
      }
    });
  }

  const tabs = [...document.querySelectorAll(".tab")];
  const tabPanels = [...document.querySelectorAll(".panel")];
  const ink = document.getElementById("tab-ink");
  const moveInk = (button) => {
    if (!ink || !button) return;
    ink.style.width = `${button.offsetWidth}px`;
    ink.style.left = `${button.offsetLeft}px`;
  };
  const showTab = (id) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === id;
      tab.classList.toggle("is-on", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    tabPanels.forEach((panel) => {
      const isActive = panel.id === "panel-" + id;
      panel.classList.toggle("is-on", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
    });
    moveInk(tabs.find((tab) => tab.dataset.tab === id));
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showTab(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (event.key in keys) {
        event.preventDefault();
        const next = tabs[(index + keys[event.key] + tabs.length) % tabs.length];
        showTab(next.dataset.tab);
        next.focus();
      }
      if (event.key === "Home") { event.preventDefault(); showTab(tabs[0].dataset.tab); tabs[0].focus(); }
      if (event.key === "End") { event.preventDefault(); const last = tabs[tabs.length - 1]; showTab(last.dataset.tab); last.focus(); }
    });
  });
  window.addEventListener("resize", () => moveInk(document.querySelector(".tab.is-on")));

  const bindCompare = (compare, topImage, divider) => {
    if (!compare || !topImage || !divider) return () => {};
    let value = Number(compare.getAttribute("aria-valuenow")) || 50;
    const setSplit = (nextValue) => {
      value = Math.max(1, Math.min(99, Math.round(nextValue)));
      topImage.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
      divider.style.left = `${value}%`;
      compare.setAttribute("aria-valuenow", String(value));
      compare.setAttribute("aria-valuetext", `Before and after split at ${value} percent`);
    };
    const setFromPointer = (event) => {
      const rect = compare.getBoundingClientRect();
      if (rect.width) setSplit(((event.clientX - rect.left) / rect.width) * 100);
    };
    compare.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      compare.setPointerCapture?.(event.pointerId);
      compare.classList.add("is-drag");
      setFromPointer(event);
      event.preventDefault();
    });
    compare.addEventListener("pointermove", (event) => {
      if (!compare.classList.contains("is-drag")) return;
      setFromPointer(event);
    });
    const stop = () => compare.classList.remove("is-drag");
    compare.addEventListener("pointerup", stop);
    compare.addEventListener("pointercancel", stop);
    compare.addEventListener("keydown", (event) => {
      const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? 5 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -5 : 0;
      if (delta) { event.preventDefault(); setSplit(value + delta); }
      if (event.key === "Home") { event.preventDefault(); setSplit(1); }
      if (event.key === "End") { event.preventDefault(); setSplit(99); }
    });
    setSplit(value);
    return () => setSplit(50);
  };

  const compareRefreshers = [
    bindCompare(document.getElementById("pane-skins"), document.getElementById("compare-top"), document.getElementById("compare-ui")),
    bindCompare(document.getElementById("compare-bundle"), document.getElementById("compare-top-bundle"), document.getElementById("compare-ui-bundle")),
  ];

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const hashPlan = window.location.hash.slice(1);
  setPlan(plans[hashPlan] ? hashPlan : cfg.defaultPlan || "skins", false);
  showTab("features");
})();
