# Airbus Lisboa — Constellation Wall

Static site for GitHub Pages.

## Deploy
1. Create a new GitHub repo and upload the **contents of this `site/` folder** to the repo root (so `index.html` sits at the top level).
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `(root)`, save.
3. Your site goes live at `https://<user>.github.io/<repo>/` in a minute or two.

## Pages
- `index.html` — Sky Network Constellation kiosk (entry point)
- `Sky Network Constellation.html` — same kiosk, named
- `Constellation Wall.html` — Constellation Wall photo booth

`.nojekyll` is included so GitHub Pages serves all files as-is. React/Babel/QR libraries load from CDN, so the live site needs internet access.
