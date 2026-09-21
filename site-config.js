window.GAIN_STORE = {
  brand: "Gain",
  tagline: "The best Roblox external on the market.",
  version: "v1.5.0",
  discordUrl: "https://discord.gg/PBMHrgJ4Kd",
  stripeFulfillUrl:
    "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/stripe/fulfill",
  stripeDownloadUrl:
    "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/stripe/download",
  salesStatsUrl:
    "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/stripe/stats/sales",
  defaultPlan: "external",

  nav: [
    { id: "home", label: "Home" },
    { id: "tour", label: "Tour" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "setup", label: "Setup" },
    { id: "faq", label: "FAQ" },
  ],

  hero: {
    rating: { score: "4.9/5", count: "1,200+ members", stars: 5 },
    titleLead: "The",
    titleAccent: "Best Roblox",
    titleTail: "External on The Market.",
    copy:
      "Gain goes far beyond the usual external. A full overlay workspace with ESP, silent aim, motion control, a live 3D preview, a built-in Lua VM and a real instance explorer — all in one focused Windows app that stays smooth while you play.",
    ctaPrimary: "Get Gain External",
    ctaSecondary: "Explore the interface",
    bullets: [
      "Undetected · updated within hours of every patch",
      "Lifetime license — one payment, no subscription",
      "Instant delivery, keys land the second you pay",
    ],
  },

  stats: [
    { value: "360", suffix: " FPS", label: "Overlay render cap" },
    { value: "3", suffix: " ms", label: "Typical input latency" },
    { value: "147", suffix: "", label: "Services in Explorer" },
    { value: "100", suffix: "%", label: "External — no injection" },
  ],

  trust: [
    {
      title: "Built for reliability",
      body:
        "Gain runs fully external. Nothing is injected into Roblox, so crashes, kicks and broken updates are rare. When Roblox does patch, offsets are rebuilt and pushed automatically — usually before you notice.",
      icon: "shield",
    },
    {
      title: "Genuinely smooth",
      body:
        "The overlay renders on its own pipeline at up to 360 FPS with a 3 ms input path. Menus animate, ESP tracks cleanly and your game keeps every frame it had before you loaded in.",
      icon: "bolt",
    },
    {
      title: "Everything in one place",
      body:
        "Combat, visuals, world, motion, misc, configs, ESP preview, Lua VM, player list and explorer live in a single draggable workspace. No second tool, no browser tabs, no scattered scripts.",
      icon: "layers",
    },
    {
      title: "Support that answers",
      body:
        "Real humans in Discord, usually within minutes. Setup help, config sharing, patch notes and feature requests all happen in the same place — and requests actually ship.",
      icon: "chat",
    },
  ],

  tour: [
    {
      id: "settings",
      label: "Dashboard",
      title: "A dashboard, not a script menu",
      image: "images/ext-settings.png",
      body:
        "Every module is grouped in a clean sidebar — Combat, Visuals, Modules, Other — with instant search. Theme the whole app with accent colors, scale the menu to your monitor, and keep a keybind list, keystrokes, music player and streamproof mode one toggle away.",
      points: [
        "Instant fuzzy search across every setting",
        "Accent color picker and 0.5x–1.5x menu scaling",
        "Streamproof, blur, snow and skyfall presentation modes",
        "Named config slots with save, load, delete and folder access",
      ],
    },
    {
      id: "visuals",
      label: "Visuals & ESP",
      title: "ESP you can actually read",
      image: "images/ext-workspace.png",
      body:
        "Boxes, fills, names, healthbars, distance, snaplines, skeletons and chams with per-element colors and team checks. Radar, china hat, off-screen arrows and a target HUD round it out, and everything respects your max-distance rules so fights stay legible.",
      points: [
        "Cornered box, full box and fill styles with color shift",
        "Health-based coloring, health numbers and healthbars",
        "Radar, china hat, off-screen indicators and target HUD",
        "Ignore lists, team checks and per-module max distance",
      ],
    },
    {
      id: "preview",
      label: "ESP Preview",
      title: "Tune ESP without leaving the menu",
      image: "images/ext-esp-preview.png",
      body:
        "A live 3D rig you can drag to rotate, rendered with your exact ESP settings. Change a box style, a color or a healthbar and see the result immediately instead of alt-tabbing into a match to guess.",
      points: [
        "Real-time render of your current ESP config",
        "Drag to rotate and inspect from any angle",
        "Distance, name and healthbar mock data included",
        "Perfect for building configs before you queue",
      ],
    },
    {
      id: "luavm",
      label: "Lua VM",
      title: "A scripting environment built in",
      image: "images/ext-luavm.png",
      body:
        "Write, save and run Lua straight from the overlay with a proper editor, a script tree and a live console. Connect the MCP bridge to Cursor or OpenCode and let your editor drive the VM directly.",
      points: [
        "Script tree with save, clear and run/stop controls",
        "Live console output with copy support",
        "MCP bridge for Cursor and OpenCode",
        "Keep a personal library of showcase scripts",
      ],
    },
    {
      id: "players",
      label: "Player List",
      title: "Know every player in the server",
      image: "images/ext-players-explorer.png",
      body:
        "A searchable roster with avatars, health, user id, account age, rig type, distance, team and held tool. Whitelist friends, lock a target or spectate anyone — and cross-reference it all against a full instance explorer.",
      points: [
        "Avatar, health, account age, rig and distance per player",
        "Whitelist, target and spectate in one click",
        "Explorer over 147 services with highlight and finder",
        "Search instances by name or class instantly",
      ],
    },
    {
      id: "toolbar",
      label: "Workspace",
      title: "Windows that go where you want",
      image: "images/ext-toolbar.png",
      body:
        "A floating toolbar opens ESP Preview, Lua VM, Player List and Explorer as independent draggable, resizable windows. Build the layout that fits your setup once and Gain remembers it.",
      points: [
        "Independent draggable and resizable panels",
        "Status bar with FPS, ping, server IP and account",
        "Layouts persist between sessions",
        "Menu key, unload and overlay FPS always reachable",
      ],
    },
  ],

  testimonials: [
    {
      quote:
        "The ESP preview alone sold me. I built a config in two minutes instead of loading twenty matches to test colors.",
      name: "kaiden",
      role: "Lifetime buyer",
    },
    {
      quote:
        "Roblox patched on a Friday night and Gain was working again before I finished dinner. That never happens.",
      name: "vexil",
      role: "External + Skins",
    },
    {
      quote:
        "Runs external so my frames never move. Smoothest overlay I've used and the player list is unreal.",
      name: "m1rror",
      role: "Lifetime buyer",
    },
  ],

  faq: [
    {
      q: "Is Gain External a Roblox script?",
      a: "No. It is a standalone Windows application. You download a zip, open the app and paste your license key. There is no loadstring, no script_key and no executor involved.",
    },
    {
      q: "Is it detected?",
      a: "Gain runs fully external and never injects into Roblox. Status is tracked live in Discord, and if anything changes we pull the build until it is fixed rather than leaving you exposed.",
    },
    {
      q: "How fast is delivery?",
      a: "Instant. Your key and download link appear on the success page the moment your card payment clears, and a copy is emailed to you automatically.",
    },
    {
      q: "Is this a subscription?",
      a: "Never. Every license is lifetime. One payment covers all future updates for that product, including new modules and Roblox patch fixes.",
    },
    {
      q: "What do I need to run it?",
      a: "Windows 10 or 11 with a 64-bit CPU. The overlay is GPU accelerated but light — it runs comfortably on laptop integrated graphics.",
    },
    {
      q: "Can I use one key on two PCs?",
      a: "A license binds to one machine at a time. You can move it yourself from the app, or ask in Discord and support will reset the bind for you.",
    },
    {
      q: "Do you take payments other than card?",
      a: "Yes. Card checkout is instant and self-serve, and Discord purchases are available if you prefer crypto or a manual method. Discount codes work at card checkout.",
    },
    {
      q: "What is the refund policy?",
      a: "If the product genuinely does not work on your system and support cannot fix it, open a ticket with your receipt and we will sort it out. Prices are low because we would rather keep you around.",
    },
  ],

  plans: {
    skins: {
      id: "skins",
      kicker: "Internal",
      name: "Skin Changer",
      title: "Rivals Skin Changer",
      blurb: "In-game cosmetics, visuals, and spoof tools.",
      long:
        "Unlock every weapon skin, wrap and charm with a live preview, then push the game's visuals far past its own settings. Spoof your level, rank, ELO, name and device, and keep it all in named config profiles.",
      price: "$5.00",
      priceWas: "",
      save: "",
      cta: "Pay with card — $5.00",
      stripeUrl: "https://buy.stripe.com/dRm6oGeOv8lW76k106dQQ00",
      loaderUrl:
        "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/license/loader/gain",
      delivery: "Roblox loader script + license key",
      includes: ["Insane performance", "Instant updates", "Lifetime access"],
      highlights: [
        "Every skin, wrap and charm unlocked",
        "Full visual control with 4K reflections",
        "Rank, ELO and device spoofing",
      ],
      setup: [
        "Pay with card, or purchase on Discord.",
        "Join Rivals and open your executor.",
        "Paste the loader, add your key and run it.",
      ],
      features: {
        Cosmetics: [
          "Weapon skins",
          "Wraps",
          "Charms",
          "Live preview",
          "Search & grid picker",
          "Auto-save loadout",
        ],
        Visuals: [
          "Skybox + rotation",
          "Fog, clock, brightness",
          "Bloom, blur, DOF, sun rays",
          "Atmosphere haze / glare",
          "4K reflections",
          "Combat FX cleanup",
        ],
        Chams: [
          "Weapon chams",
          "Arm chams",
          "Invisible arms",
          "Highlights & outlines",
          "14 materials (Neon, Chrome, Prism…)",
        ],
        Camera: ["Third person + bind", "FOV changer", "Stretched resolution"],
        Spoof: [
          "Level / streak / rank",
          "ELO",
          "Name & username",
          "Device type",
          "Custom status",
        ],
        Other: [
          "Config profiles + autoload",
          "Accent color & menu key",
          "Insane performance",
          "Undetected status",
        ],
      },
    },
    external: {
      id: "external",
      kicker: "External",
      name: "Gain External",
      title: "Gain External",
      blurb: "Standalone overlay: ESP, aim, motion, and world tools.",
      long:
        "A complete external workspace. Aimbot, silent aim, trigger and rage, readable ESP, motion control, a live 3D preview, a built-in Lua VM, a full player list and a real instance explorer — rendered at up to 360 FPS outside the game.",
      price: "$3.50",
      priceWas: "$5.00",
      save: "30% off",
      cta: "Pay with card — $3.50",
      stripeUrl: "https://buy.stripe.com/dRm6oG8q7dGg62g4cidQQ02",
      loaderUrl:
        "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/license/loader/external",
      delivery: "Windows app (zip) + license key",
      includes: ["Insane performance", "Instant updates", "Lifetime access"],
      highlights: [
        "Aimbot, silent aim and rage in one tab",
        "Live ESP preview and instance explorer",
        "Built-in Lua VM with MCP bridge",
      ],
      setup: [
        "Pay with card. Your key and download appear on the success page.",
        "Unzip Gain External anywhere and run the app — it is not a Roblox script.",
        "Paste your license key in the app, then press Insert in game to open the menu.",
      ],
      features: {
        Aim: [
          "Aimbot with FOV and smoothing",
          "Silent aim",
          "Trigger & rage modes",
          "Prediction and hit part logic",
          "Target HUD",
          "Lock mouse to player",
        ],
        ESP: [
          "Box, cornered box, fill",
          "Name, healthbar, health number",
          "Distance, snaplines, skeleton",
          "Chams, team check, max distance",
          "Radar, china hat, off-screen",
          "Live ESP preview",
        ],
        Motion: [
          "Speed + fly",
          "Jump power",
          "Teleport to enemy",
          "Orbit + prediction",
          "Noclip, gravity, tickrate",
          "Third person, spinbot",
        ],
        Tools: [
          "Lua VM with console",
          "MCP bridge (Cursor / OpenCode)",
          "Player list with spectate",
          "Instance explorer, 147 services",
          "Whitelist & target",
        ],
        Presentation: [
          "Accent color themes",
          "Menu scaling",
          "Streamproof mode",
          "Keybind list & keystrokes",
          "Blur, snow, skyfall",
        ],
        Other: [
          "Named config slots",
          "Overlay FPS up to 360",
          "No injection, fully external",
          "Undetected status",
        ],
      },
    },
    bundle: {
      id: "bundle",
      kicker: "Both",
      name: "Skin + External",
      title: "Gain Bundle",
      blurb: "Skin Changer and External together. Two keys, one checkout.",
      long:
        "Everything Gain makes, in one payment. Two independent lifetime licenses — the Rivals Skin Changer for cosmetics and visuals, and the External overlay for combat, ESP and tooling.",
      price: "$7.50",
      priceWas: "$8.50",
      save: "Save $1.00",
      cta: "Pay with card — $7.50",
      stripeUrl: "https://buy.stripe.com/28EbJ049R7hSduI5gmdQQ01",
      loaderUrl:
        "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/license/loader/gain",
      delivery: "Loader + Windows app, two keys",
      includes: [
        "Insane performance",
        "Both products included",
        "Lifetime access",
      ],
      highlights: [
        "Both products, two lifetime keys",
        "Cheapest way to own everything",
        "One checkout, instant delivery",
      ],
      setup: [
        "Pay once. You receive two keys on the success page.",
        "Use the Skin Changer key with the executor loader only.",
        "Download External from the success page and paste its key in the app — not in Roblox.",
      ],
      features: {
        Included: [
          "Rivals Skin Changer",
          "Gain External overlay",
          "Two separate licenses",
          "Lifetime on both",
        ],
        Value: ["$5.00 + $3.50 separately", "Bundle $7.50", "Save $1.00"],
        Support: [
          "Priority Discord help",
          "Both products patched together",
          "All future updates included",
        ],
      },
    },
  },

  compare: [
    { row: "Lifetime license", skins: true, external: true, bundle: true },
    { row: "Instant key delivery", skins: true, external: true, bundle: true },
    { row: "Free updates forever", skins: true, external: true, bundle: true },
    { row: "Skins, wraps & charms", skins: true, external: false, bundle: true },
    { row: "Rank / ELO spoofing", skins: true, external: false, bundle: true },
    { row: "Aimbot & silent aim", skins: false, external: true, bundle: true },
    { row: "Full ESP suite", skins: false, external: true, bundle: true },
    { row: "Live ESP preview", skins: false, external: true, bundle: true },
    { row: "Lua VM & explorer", skins: false, external: true, bundle: true },
    { row: "Runs without an executor", skins: false, external: true, bundle: true },
  ],

  executors: [
    "Madium",
    "Potassium",
    "Wave",
    "Real",
    "Volt",
    "Seliware",
    "Cosmic",
    "Delta",
    "Codex",
    "Isaeva",
    "SirHurt",
    "MacSploit",
    "Opiumware",
  ],
};
