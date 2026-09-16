/** Edit these before you share the site */
window.GAIN_STORE = {
  brand: "Gain",
  tagline: "Rivals Skin Changer",
  discordUrl: "https://discord.gg/YOUR_INVITE", // ← paste your Discord invite
  supportEmail: "", // optional: "you@email.com"
  loaderUrl:
    "https://repssuepvwmpfctiztvj.supabase.co/functions/v1/license/loader/gain",
  plans: [
    {
      id: "lifetime",
      name: "Lifetime",
      price: "9.99",
      currency: "€",
      period: "one-time",
      highlight: true,
      features: [
        "Full skin changer access",
        "1 device (HWID locked)",
        "Lifetime updates",
        "Discord support",
      ],
    },
    {
      id: "monthly",
      name: "Monthly",
      price: "4.99",
      currency: "€",
      period: "/ month",
      highlight: false,
      features: [
        "Same features as Lifetime",
        "Renew each month",
        "1 device (HWID locked)",
      ],
    },
  ],
};
