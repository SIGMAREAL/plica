# Plica

**Inside the systems we use.** An independent, sourced knowledge base about real-world software architecture, engineering decisions, research and trade-offs.

需求交接与成果查看：[Ithaca 交接指南](docs/ithaca-handoff.md)（ChatGPT 网页需求确认、轮次阶段及最新已部署成果）。

## Frontend / backend boundary

```text
backend/
  content/             Editable cases, terms, papers, reviewed relations,
                       mechanisms, products, comparisons and edition metadata
  skills/              Public Agent Skill source
  catalog.py           Content loading, validation and deterministic API export
  server.py            Read-only, CORS-enabled development API
  dist/                Generated API/Skill release (ignored)
frontend/
  build.py             Existing UI renderer; reads only the public API catalog
  assets/              Maintained HTML UI's CSS, JavaScript and favicon
  prototype/           Independent Kumo React UI, component gallery and Figma ledger
  dist/                Generated UI-only release (ignored)
site/                  Composed deployment snapshot (generated, tracked)
build.py               Backend export → frontend render → compose site/
validate_content.py    Compatibility entry point for backend validation
tests/                 Independent-build and HTTP contract acceptance
```

Backend builds without frontend source. Frontend builds with only its own source and exported JSON; it does not import backend code or read editorial sources. A replacement UI may use any stack and fetch the documented API directly. The retained static renderer remains the parity reference. The separately authorized replacement lives in `frontend/prototype/`: React + TypeScript, Vite, Tailwind, Kumo and GSAP. It consumes the public catalog and preserves the original feature set. See [prototype setup and validation](frontend/prototype/README.md).

GitHub Pages now publishes the Figma-based React UI. The retained static renderer remains an independently buildable parity reference. Build the deployment artifact with:

```sh
npm ci --prefix frontend/prototype
python3 build.py --frontend react
```

The complete static release is in `frontend/prototype/release/`, including public API and Skill files. Open `/landing/` for the independent portal; original URLs and hash routes remain available. `release.json` records the deployed source revision. The Pages workflow validates both independent builds and publishes this React artifact.

The backend is a public read-only content service/exporter. It does not implement AI inference, accounts, payments, subscriptions, newsletter or sponsorship transactions.

## Develop a new UI independently

From the repository root, start the API:

```sh
python3 -m backend serve
```

Read `http://127.0.0.1:8001/api/v1/catalog.json` from your separate frontend. Default CORS is `*` for public, noncredentialed reads; restrict it with `--allow-origin http://localhost:5173`. Restart the server after content edits; it serves a validated snapshot. See [API contract](docs/api.md), [backend commands](backend/README.md) and [frontend handoff](frontend/README.md).

For an offline/static API release:

```sh
python3 -m backend build
python3 frontend/build.py --api-dir backend/dist/api/v1
```

The UI command outputs `frontend/dist/`; pass `--api-base-url http://127.0.0.1:8001` when hosting it separately from the API so its Skill/API links use that origin. API exports can be hosted separately as static files; a separate host must provide CORS headers.

## Build the existing Pages site

```sh
python3 validate_content.py
python3 build.py
node --check frontend/assets/site.js
python3 -m unittest discover -s tests -v
python3 -m pip install -r requirements-test.txt
python3 -m playwright install chromium
python3 test_site.py
python3 -m http.server 8000 --directory site
```

`build.py` keeps existing public routes, API discovery index and Skill address. It adds `/api/v1/catalog.json` with complete editorial fields and independent taxonomy/comparison records. The legacy `/api/v1/index.json` and `/api/v1/terms.json` contracts remain compatible.

The generator/backend use Python standard library only. Playwright is test-only. Browser acceptance checks desktop/mobile at both `/` and `/plica/`. Use `PLICA_BROWSER_PATH` for an installed Chrome and `PLICA_TEST_OUTPUT` for reports. `PLICA_BASE_URL` selects a live composed site. CI runs the same checks and gates Pages publication on `main`.

## Existing content

Baseline v1.2: 32 production cases, 3 research papers, 35 terms, 50 reviewed case–term relations, 16 publishing organizations and 130 HTML pages. Product / Organization / Mechanism indexes, archive filters, comparisons, glossary, graph and public Agent Skill are present. Search covers indexed Plica editorial fields, not external articles' full text. The selection sidebar only prepares/copies a question.

## Editorial authority and rights

Edit `backend/content/`, `backend/skills/`, `frontend/build.py`, `frontend/assets/` or `frontend/prototype/src/`, then rebuild. Never maintain generated `site/` or `dist/` files as a second authority. Organizations derive from cases; no duplicate organization source catalog exists. Research proximity is not evidence of production deployment.

See [architecture](docs/architecture.md), [content model](docs/content-model.md), [roadmap](docs/roadmap.md), [migration provenance](docs/migration-notes.md) and [original requirement](https://github.com/SIGMAREAL/PEtwinsMacOS/issues/39). Preserve source URLs, dates and fact/interpretation boundaries.

No repository-wide license is asserted. The existing Skill's MIT metadata remains scoped; third-party sources retain their rights. See [rights review](docs/licensing.md).
