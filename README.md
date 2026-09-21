# Gain store (static site)

Free hosting: **GitHub Pages**.

## Structure

The site is a single page with six hash-routed tabs (`#/home`, `#/tour`,
`#/features`, `#/pricing`, `#/setup`, `#/faq`). Every piece of content —
navigation, hero copy, stats, trust cards, product tour, testimonials, FAQ,
plans, the comparison table and the executor list — is data in
`site-config.js`; `main.js` renders it and `styles.css` styles it.

- `index.html` — page shell and tab markup
- `site-config.js` — all copy, pricing and product data
- `main.js` — routing, rendering, tour, lightbox, compare slider
- `styles.css` — full design system
- `success.html` / `success.js` — post-payment license delivery
- `images/ext-*.png` — product screenshots used by the tour and gallery

## Edit before launch

1. Open `site-config.js`
2. Discord invite is already set in `site-config.js`
3. Adjust `plans` prices if needed
4. Add or reorder tour panels in the `tour` array (each needs an image in `images/`)
5. Bump the `?v=` query strings in `index.html` after editing CSS or JS so
   GitHub Pages serves the new files

## Deploy to GitHub Pages

1. Create a **public** repo (e.g. `gain-store`) on GitHub
2. Upload all files in this `website/` folder to the repo root
3. Repo → **Settings** → **Pages** → Source: **Deploy from branch** → `main` / `/ (root)` → Save
4. Site URL: `https://YOUR_USERNAME.github.io/gain-store/`

## Local preview

Open `index.html` in a browser (double-click).
