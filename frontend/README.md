# Plica frontend — independent UI handoff

This directory owns the current rendering code and maintained visual assets. Replace or redesign it independently. Backend ownership ends at the [public API contract](../docs/api.md); a new UI must not import `backend`, read editable content paths or scrape old HTML.

## Existing UI, independent build

From the repository root:

```sh
python3 -m backend build
python3 frontend/build.py --api-dir backend/dist/api/v1
```

Only `frontend/` and the exported `api/v1/` files are required for that second command. Output is `frontend/dist/` (override `--output`). It contains UI pages/assets, not another authoritative API export. The root composer combines it with the API/Skill artifact for the static compatibility reference. GitHub Pages publishes `python3 build.py --frontend react`, which composes the React UI and the same public export in `frontend/prototype/release/`.

For independent hosting/development, run the API in one terminal:

```sh
python3 -m backend serve
```

Then render/serve UI in another terminal:

```sh
python3 -m backend build
python3 frontend/build.py --api-dir backend/dist/api/v1 --api-base-url http://127.0.0.1:8001
python3 -m http.server 5173 --bind 127.0.0.1 --directory frontend/dist
```

Open `http://127.0.0.1:5173/`. `--api-base-url` makes public index/Skill links use the separate API host; UI page links/assets stay relative to the UI host. The retained UI uses a build-time content snapshot, so rebuild it after content edits. Its existing interaction logic uses the rendered snapshot.

## New UI

The independent [Kumo + Tailwind + GSAP + Vite + React prototype](prototype/README.md) is in `prototype/`. Its development server uses port 5187 and reads this same public catalog over HTTP.

Start the backend development server and fetch `http://127.0.0.1:8001/api/v1/catalog.json` from your UI's own development server. The catalog includes full article summaries/points/trade-offs, taxonomy, organizations, products, glossary, papers, reviewed relations and comparisons. No old renderer, styles, frontend framework or internal Python API is required. A fetch example is in the contract.

Layout, components, theme, routing, icons, client-side search/filter state and graph presentation belong to the new UI. IDs, original-source/evidence boundaries and reviewed editorial relationships remain content contracts. AI/identity/payment operations do not exist; the existing question sidebar remains a preview.
