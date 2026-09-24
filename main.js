(function () {
  const cfg = window.GAIN_STORE || {};
  const plans = cfg.plans || {};
  const discord = cfg.discordUrl || "#";
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );

  document.querySelectorAll("[data-discord]").forEach((el) => (el.href = discord));

  const year = $("year");
  if (year) year.textContent = String(new Date().getFullYear());
  const ver = $("brand-ver");
  if (ver && cfg.version) ver.textContent = cfg.version;

  /* ------------------------------------------------------------------ nav */

  const views = [...document.querySelectorAll(".view")];
  const navItems = cfg.nav && cfg.nav.length ? cfg.nav : views.map((v) => ({ id: v.dataset.view, label: v.dataset.view }));
  const nav = $("mainnav");
  const ink = $("nav-ink");

  if (nav) {
    nav.insertAdjacentHTML(
      "afterbegin",
      navItems
        .map(
          (n) =>
            `<a class="navlink" href="#/${n.id}" data-nav="${esc(n.id)}" role="tab">${esc(n.label)}</a>`
        )
        .join("")
    );
  }

  const footLinks = $("foot-links");
  if (footLinks) {
    footLinks.innerHTML = navItems
      .map((n) => `<a href="#/${n.id}" data-nav-foot="${esc(n.id)}">${esc(n.label)}</a>`)
      .join("");
  }

  let inkReady = false;
  const moveInk = () => {
    if (!ink || !nav) return;
    const active = nav.querySelector(".navlink.is-on");
    if (!active) {
      ink.style.opacity = "0";
      return;
    }
    if (!inkReady) {
      ink.style.transition = "none";
      requestAnimationFrame(() => {
        ink.style.transition = "";
      });
      inkReady = true;
    }
    ink.style.opacity = "1";
    ink.style.width = active.offsetWidth + "px";
    ink.style.transform = "translateX(" + active.offsetLeft + "px)";
  };

  const validView = (id) => views.some((v) => v.dataset.view === id);

  const showView = (id, opts) => {
    const target = validView(id) ? id : navItems[0].id;
    views.forEach((v) => {
      const on = v.dataset.view === target;
      v.hidden = !on;
      v.classList.toggle("is-on", on);
      if (on) {
        v.classList.remove("view-in");
        void v.offsetWidth;
        v.classList.add("view-in");
      }
    });
    document.querySelectorAll(".navlink").forEach((a) => {
      const on = a.dataset.nav === target;
      a.classList.toggle("is-on", on);
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
    moveInk();
    document.body.classList.remove("nav-open");
    const toggle = $("nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (!opts || opts.scroll !== false) window.scrollTo({ top: 0, behavior: "smooth" });
    observeReveals();
  };

  const routeFromHash = () => {
    const raw = (location.hash || "").replace(/^#\/?/, "").trim();
    showView(raw || navItems[0].id, { scroll: false });
  };

  window.addEventListener("hashchange", () => {
    const raw = (location.hash || "").replace(/^#\/?/, "").trim();
    showView(raw || navItems[0].id);
  });
  window.addEventListener("resize", moveInk);

  const toggle = $("nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ----------------------------------------------------------------- hero */

  const hero = cfg.hero || {};
  const rating = $("hero-rating");
  if (rating && hero.rating) {
    const stars = "★".repeat(hero.rating.stars || 5);
    rating.innerHTML =
      `<span class="stars">${stars}</span>` +
      `<b>${esc(hero.rating.score)}</b>` +
      `<span class="rating-sub">${esc(hero.rating.count)}</span>`;
  }

  const heroTitle = $("hero-title");
  if (heroTitle) {
    heroTitle.innerHTML =
      `${esc(hero.titleLead || "")} <em>${esc(hero.titleAccent || "")}</em> ${esc(hero.titleTail || "")}`;
  }
  const heroCopy = $("hero-copy");
  if (heroCopy) heroCopy.textContent = hero.copy || "";
  const bullets = $("hero-bullets");
  if (bullets) bullets.innerHTML = (hero.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("");
  const hc1 = $("hero-cta-1");
  if (hc1 && hero.ctaPrimary) hc1.textContent = hero.ctaPrimary;
  const hc2 = $("hero-cta-2");
  if (hc2 && hero.ctaSecondary) hc2.textContent = hero.ctaSecondary;

  const statstrip = $("statstrip");
  if (statstrip) {
    statstrip.innerHTML = (cfg.stats || [])
      .map((s) => {
        if (s.text) {
          return `<div class="stat"><strong class="stat-text">${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`;
        }
        return `<div class="stat"><strong data-count="${esc(s.value)}" data-suffix="${esc(s.suffix || "")}">0${esc(
          s.suffix || ""
        )}</strong><span>${esc(s.label)}</span></div>`;
      })
      .join("");
  }

  const icons = {
    shield: "M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z",
    bolt: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
    layers: "M12 3l9 5-9 5-9-5 9-5zm0 8l9 5-9 5-9-5 9-5z",
    chat: "M4 5h16v10H9l-5 4V5z",
  };

  const trustGrid = $("trust-grid");
  if (trustGrid) {
    trustGrid.innerHTML = (cfg.trust || [])
      .map(
        (t) => `<article class="trust">
          <span class="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${
            icons[t.icon] || icons.layers
          }"/></svg></span>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.body)}</p>
        </article>`
      )
      .join("");
  }

  const quoteGrid = $("quote-grid");
  if (quoteGrid) {
    quoteGrid.innerHTML = (cfg.testimonials || [])
      .map(
        (t) => `<figure class="quote">
          <span class="rep-tag">${esc(t.rep || "+rep")}</span>
          <blockquote>${esc(t.quote)}</blockquote>
          <figcaption>— ${esc(t.name)}</figcaption>
        </figure>`
      )
      .join("");
  }

  /* ----------------------------------------------------------------- tour */

  const tourItems = cfg.tour || [];
  const rail = $("tour-rail");
  let tourIndex = 0;

  const galleryHtml = (items) =>
    items
      .map(
        (t) => `<figure class="gcard" data-shot="${esc(t.image)}" data-cap="${esc(t.title)}" tabindex="0">
          <div class="gcard-img"><img src="${esc(t.image)}" alt="${esc(t.title)}" loading="lazy" /></div>
          <figcaption><b>${esc(t.label)}</b><span>${esc(t.title)}</span></figcaption>
        </figure>`
      )
      .join("");

  const homeGallery = $("home-gallery");
  if (homeGallery) homeGallery.innerHTML = galleryHtml(tourItems);
  const tourGallery = $("tour-gallery");
  if (tourGallery) tourGallery.innerHTML = galleryHtml(tourItems);

  if (rail) {
    rail.innerHTML = tourItems
      .map(
        (t, i) =>
          `<button class="railbtn${i === 0 ? " is-on" : ""}" type="button" role="tab" data-i="${i}">
            <span class="railnum">${String(i + 1).padStart(2, "0")}</span>
            <span class="railtext"><b>${esc(t.label)}</b><span>${esc(t.title)}</span></span>
          </button>`
      )
      .join("");
  }

  const setTour = (i) => {
    if (!tourItems.length) return;
    tourIndex = (i + tourItems.length) % tourItems.length;
    const item = tourItems[tourIndex];
    const img = $("tour-img");
    if (img) {
      img.classList.remove("fade-in");
      img.src = item.image;
      img.alt = item.title;
      void img.offsetWidth;
      img.classList.add("fade-in");
    }
    const name = $("tour-shot-name");
    if (name) name.textContent = "Gain External — " + item.label;
    const title = $("tour-title");
    if (title) title.textContent = item.title;
    const body = $("tour-body");
    if (body) body.textContent = item.body;
    const points = $("tour-points");
    if (points) points.innerHTML = (item.points || []).map((p) => `<li>${esc(p)}</li>`).join("");
    document.querySelectorAll(".railbtn").forEach((b) => {
      const on = Number(b.dataset.i) === tourIndex;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  document.querySelectorAll(".railbtn").forEach((b) => {
    b.addEventListener("click", () => setTour(Number(b.dataset.i)));
  });
  const tourPrev = $("tour-prev");
  const tourNext = $("tour-next");
  if (tourPrev) tourPrev.addEventListener("click", () => setTour(tourIndex - 1));
  if (tourNext) tourNext.addEventListener("click", () => setTour(tourIndex + 1));
  setTour(0);

  /* ------------------------------------------------------------- lightbox */

  const lightbox = $("lightbox");
  const lbImg = $("lightbox-img");
  const lbCap = $("lightbox-cap");

  const openLightbox = (src, cap) => {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = cap || "";
    if (lbCap) lbCap.textContent = cap || "";
    lightbox.hidden = false;
    document.body.classList.add("lb-open");
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove("lb-open");
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".gcard");
    if (card) openLightbox(card.dataset.shot, card.dataset.cap);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    const card = document.activeElement && document.activeElement.closest(".gcard");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openLightbox(card.dataset.shot, card.dataset.cap);
    }
  });
  const lbClose = $("lightbox-close");
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  const tourZoom = $("tour-zoom");
  if (tourZoom) {
    tourZoom.addEventListener("click", () => {
      const item = tourItems[tourIndex];
      if (item) openLightbox(item.image, item.title);
    });
  }

  /* --------------------------------------------------------- product data */

  const planIds = Object.keys(plans);
  const segHtml = (activeId) =>
    planIds
      .map(
        (id) =>
          `<button class="segbtn${id === activeId ? " is-on" : ""}" type="button" role="tab" data-plan="${esc(
            id
          )}">${esc(plans[id].name)}</button>`
      )
      .join("");

  const plansEl = $("plans");
  if (plansEl) {
    plansEl.innerHTML = planIds
      .map((id) => {
        const p = plans[id];
        const badge = p.save ? `<span class="badge">${esc(p.save)}</span>` : "";
        return `<button class="plan${id === "bundle" ? " plan-best" : ""}" type="button" role="tab" data-plan="${esc(
          id
        )}">
          ${badge}
          <span class="plan-kicker">${esc(p.kicker)}</span>
          <strong>${esc(p.name)}</strong>
          <span class="plan-copy">${esc(p.blurb)}</span>
          <span class="plan-price">${p.priceWas ? "<s>" + esc(p.priceWas) + "</s> " : ""}${esc(p.price)}</span>
          <ul class="plan-list">${(p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          <span class="plan-pick">Select</span>
        </button>`;
      })
      .join("");
  }

  const featureSegment = $("feature-segment");
  const setupSegment = $("setup-segment");

  const compareTable = $("compare-table");
  if (compareTable && cfg.compare) {
    const tick = '<span class="yes">✓</span>';
    const cross = '<span class="no">—</span>';
    compareTable.innerHTML =
      `<thead><tr><th>Feature</th>${planIds
        .map((id) => `<th>${esc(plans[id].name)}</th>`)
        .join("")}</tr></thead>` +
      `<tbody>${cfg.compare
        .map(
          (r) =>
            `<tr><td>${esc(r.row)}</td>${planIds
              .map((id) => `<td>${r[id] ? tick : cross}</td>`)
              .join("")}</tr>`
        )
        .join("")}</tbody>`;
  }

  const assure = $("assure");
  if (assure) {
    assure.innerHTML = [
      ["Instant delivery", "Keys and downloads appear on the success page and in your email immediately."],
      ["Lifetime, not rental", "One payment per product. Every future update is included, forever."],
      ["Card or Discord", "Stripe checkout with discount codes, or a manual purchase in Discord."],
      ["Human support", "Daily staffed tickets. Free license resets when you change machines."],
    ]
      .map(([h, b]) => `<article class="card"><h3>${esc(h)}</h3><p class="card-copy">${esc(b)}</p></article>`)
      .join("");
  }

  const howto = $("howto");
  const featGrid = $("feat-grid");
  let currentPlan = cfg.defaultPlan && plans[cfg.defaultPlan] ? cfg.defaultPlan : planIds[0];

  const setPlan = (id) => {
    const plan = plans[id];
    if (!plan) return;
    currentPlan = id;

    document.querySelectorAll(".plan").forEach((b) => b.classList.toggle("is-on", b.dataset.plan === id));
    if (featureSegment) featureSegment.innerHTML = segHtml(id);
    if (setupSegment) setupSegment.innerHTML = segHtml(id);
    bindSegments();

    document.querySelectorAll(".media-pane").forEach((pane) => {
      const on = pane.id === "pane-" + id;
      pane.hidden = !on;
      pane.classList.toggle("is-on", on);
    });

    const setText = (elId, value) => {
      const el = $(elId);
      if (el) el.textContent = value || "";
    };
    setText("buy-kicker", plan.kicker);
    setText("buy-title", plan.title);
    setText("buy-blurb", plan.long || plan.blurb);
    setText("buy-price", plan.price);
    setText("buy-sub", (plan.includes || []).join(" · "));
    setText("buy-delivery", plan.delivery ? "Delivery: " + plan.delivery : "");
    const delivery = $("buy-delivery");
    if (delivery) delivery.hidden = !plan.delivery;
    setText("feat-title", plan.title);
    setText("feat-long", plan.long || plan.blurb);

    const was = $("buy-was");
    if (was) {
      was.textContent = plan.priceWas || "";
      was.hidden = !plan.priceWas;
    }
    const save = $("buy-save");
    if (save) {
      save.textContent = plan.save || "";
      save.hidden = !plan.save;
    }
    const includes = $("buy-includes");
    if (includes) includes.innerHTML = (plan.includes || []).map((x) => `<li>${esc(x)}</li>`).join("");

    const cta = $("buy-cta");
    if (cta) {
      cta.textContent = plan.cta || "Pay with card";
      cta.href = plan.stripeUrl || "#";
    }

    if (featGrid && plan.features) {
      featGrid.innerHTML = Object.entries(plan.features)
        .map(
          ([title, items]) =>
            `<article class="feat"><h3>${esc(title)}</h3><ul>${items
              .map((x) => `<li>${esc(x)}</li>`)
              .join("")}</ul></article>`
        )
        .join("");
    }

    if (howto) {
      howto.innerHTML = (plan.setup || [])
        .map((x, i) => `<li><span class="step-n">${i + 1}</span><span>${esc(x)}</span></li>`)
        .join("");
    }

    const execIntro = $("exec-intro");
    if (execIntro) {
      execIntro.textContent =
        id === "external"
          ? "Gain External needs no executor at all — it is a standalone Windows app. The list below applies to Skin Changer."
          : "Skin Changer is supported on these executors. Gain External is standalone and needs none.";
    }

    requestAnimationFrame(centerCompares);
  };

  function bindSegments() {
    document.querySelectorAll(".segbtn").forEach((b) => {
      b.addEventListener("click", () => setPlan(b.dataset.plan));
    });
  }

  document.querySelectorAll(".plan").forEach((b) => {
    b.addEventListener("click", () => setPlan(b.dataset.plan));
  });

  const exec = $("exec-list");
  if (exec && cfg.executors) {
    exec.innerHTML = cfg.executors.map((n) => `<span>${esc(n)}</span>`).join("");
  }

  /* ------------------------------------------------------------------ faq */

  const faqList = $("faq-list");
  if (faqList) {
    faqList.innerHTML = (cfg.faq || [])
      .map(
        (f) => `<details class="qa"><summary>${esc(f.q)}<span class="qa-mark"></span></summary><p>${esc(
          f.a
        )}</p></details>`
      )
      .join("");
  }

  /* -------------------------------------------------------------- reveals */

  let observer = null;
  const counted = new WeakSet();

  const runCount = (el) => {
    if (counted.has(el)) return;
    counted.add(el);
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    const dur = 1100;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      document.querySelectorAll("[data-count]").forEach(runCount);
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            entry.target.querySelectorAll("[data-count]").forEach(runCount);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------- sales stats */

  const salesLine = $("sales-line");
  const salesNum = $("sales-num");
  if (cfg.salesStatsUrl && salesLine && salesNum) {
    fetch(cfg.salesStatsUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success && typeof data.sales === "number" && data.sales > 0) {
          salesNum.textContent = data.sales.toLocaleString("en-US");
          salesLine.hidden = false;
        }
      })
      .catch(() => {});
  }

  /* ------------------------------------------------------- compare slider */

  const compares = [];

  const bindCompare = (compare, topImg, ui) => {
    if (!compare || !topImg || !ui) return;
    let dragging = false;

    const setSplit = (clientX) => {
      const rect = compare.getBoundingClientRect();
      if (!rect.width) return;
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(1, Math.min(99, pct));
      topImg.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      ui.style.left = pct + "%";
    };

    const center = () => {
      const rect = compare.getBoundingClientRect();
      if (rect.width) setSplit(rect.left + rect.width * 0.5);
      else {
        topImg.style.clipPath = "inset(0 50% 0 0)";
        ui.style.left = "50%";
      }
    };

    const start = (e) => {
      dragging = true;
      compare.classList.add("is-drag");
      const pt = e.touches ? e.touches[0] : e;
      setSplit(pt.clientX);
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      setSplit(pt.clientX);
      if (e.cancelable) e.preventDefault();
    };
    const end = () => {
      dragging = false;
      compare.classList.remove("is-drag");
    };

    compare.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    compare.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    center();
    compares.push(center);
  };

  function centerCompares() {
    compares.forEach((fn) => fn());
  }

  bindCompare($("pane-skins"), $("compare-top"), $("compare-ui"));
  bindCompare($("compare-bundle"), $("compare-top-bundle"), $("compare-ui-bundle"));
  window.addEventListener("resize", centerCompares);

  /* ------------------------------------------------------------- chrome fx */

  const header = $("site-header");
  const progress = $("nav-progress");
  const onScroll = () => {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-stuck", y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  if (!reduced && fine) {
    const glow = $("cursor-glow");
    let gx = innerWidth / 2;
    let gy = innerHeight / 2;
    let tx = gx;
    let ty = gy;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    const follow = () => {
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      if (glow) glow.style.transform = "translate(" + gx + "px," + gy + "px)";
      requestAnimationFrame(follow);
    };
    follow();

    const visual = $("hero-visual");
    if (visual) {
      visual.addEventListener("mousemove", (e) => {
        const r = visual.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        visual.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
        visual.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
      });
      visual.addEventListener("mouseleave", () => {
        visual.style.setProperty("--rx", "0deg");
        visual.style.setProperty("--ry", "0deg");
      });
    }
  }

  /* ------------------------------------------------------------------ boot */

  setPlan(currentPlan);
  routeFromHash();
  observeReveals();
  requestAnimationFrame(() => {
    moveInk();
    centerCompares();
  });
  window.addEventListener("load", () => {
    moveInk();
    centerCompares();
  });
})();
