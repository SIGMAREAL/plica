# Plica interactive prototype

The Kumo component foundation is at http://127.0.0.1:5187/components.html. The application uses that same foundation; the previous editorial visual direction was rejected.

Independent React + TypeScript frontend using Vite, Tailwind v4, actual Cloudflare Kumo controls and GSAP with `useGSAP` cleanup. It reads the public catalog over HTTP; editorial content remains in the backend.

The shared global header exposes six first-level entries: Case Library, Products, Teams, Mechanisms, Knowledge and About Plica. The first four are ordinary direct links; Knowledge and About open full-width desktop menus. Mobile shows the same four direct links and two collapsible sections in a Kumo modal with scroll locking and focus restoration. Search sits beside the persistent Get Skill action, which opens the existing Skill page and its actual `SKILL.md` download. The sidebar is contextual: record directories within products/teams/mechanisms/glossary/research, mechanism facets within the case library, four nested graph dimensions, and scroll-aware chapter links while reading. Global destinations remain in the header; the sidebar also exposes the actual browser-local reading list. Desktop supports local search, collapsible groups and a compact rail; mobile opens the same directory in a separate Kumo dialog.

From the repository root, run `python3 -m backend serve --port 8001`. In this directory:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5187/. Vite proxies `/api` and `/skill` to the backend. For another API host, set `VITE_PLICA_API_BASE_URL` before building. The production host must serve the public `/api/v1/catalog.json` and `/skill/plica-architecture/SKILL.md` alongside the frontend, or use that API base override. `npm run build` writes the standalone UI to `dist/`; the root React release command composes it with public API/Skill files for Pages. The build also emits original public URL shells with record-specific title/description/OG metadata. It reads only the exported catalog, defaulting to `../../backend/dist/api/v1/catalog.json`; an independent checkout can supply any public export via `PLICA_CATALOG_PATH=/path/to/catalog.json`. Hosting still supplies public API/Skill resources beside the UI or through `VITE_PLICA_API_BASE_URL`.

The independent portal is at http://127.0.0.1:5187/#/landing. It has a full-width shell and a centered typographic Hero with the shared Plica icon/name, v1.2 headline “How the world’s software works.”, and the original two actions; positioning and subtitle are omitted per the approved final composition. Product/team/mechanism entrances follow below, with selected cases and glossary/research/Skill links. The original `#/` discovery page keeps its knowledge-base layout. Builds also emit `/landing/`, with deployment-prefix support such as `/plica/landing/`. Portal navigation, themes and bookmarks share application state; GSAP motion respects reduced-motion preferences.

[Portal desktop design](https://www.figma.com/design/HN365jMHk14lQd2YAUSn4y?node-id=45-2503) and [mobile design](https://www.figma.com/design/HN365jMHk14lQd2YAUSn4y?node-id=45-3606) are separate editable frames. Their current shared patterns are recorded in `design/portal-nodes.json`; the rejected split Hero and its preview variants have been removed. Browser screenshots, recordings, Figma comparisons, static-prefix checks and the bounded review are in ignored `artifacts/portal-final-hero/` (earlier checks are in `artifacts/portal/`). These are local previews, not a deployment.

The prototype includes discovery, the full searchable case catalog with independent facets, product/team/mechanism indexes and detail pages, case reading with source facts and local selection-question copy preview, reviewed term links, a four-dimension graph (mechanisms/products/teams/terms), glossary with research links, papers, comparisons, editorial principles, sponsorship information and the public Agent Skill. Automatic AI answering is not implemented. Bookmarks are browser-local. Search uses replacement history; navigation restores reading/list scroll. Legacy URLs and `system` filters map to equivalent new routes, keeping section anchors and deployment prefixes. Existing `plica:saved` bookmarks migrate once and merge with the current list. Cmd/Ctrl+K focuses case search, `/` focuses the library search, Escape blurs it, and reduced motion skips entrance animation.

Validation: `node --test src/*.test.ts` and `npm run build`. Browser acceptance evidence is in ignored `artifacts/kumo-redesign/`, including the original Kumo route checks and the feature-parity checks. The old static renderer in `frontend/build.py` is the parity reference; changing the visual language does not authorize removing its features.

[Editable Figma design](https://www.figma.com/design/HN365jMHk14lQd2YAUSn4y?node-id=9-65) contains 22 desktop and 22 mobile frames, including all original route families, graph dimension states and reading-question preview. Shared Kumo variables/components remain editable; index/detail frames use representative records while the application contains the complete catalog. The authoritative current node ledger is `design/kumo-redesign-nodes.json`.

## GitHub Pages release

From the repository root, run `npm ci --prefix frontend/prototype`, then `python3 build.py --frontend react`. This builds against an isolated public backend export and composes UI, public API and Skill into `frontend/prototype/release/`. GitHub Pages publishes that directory after CI passes. `/landing/` opens the portal, including under `/plica/`; the original static URLs remain route-compatible. `release.json` identifies the published revision.

The dormant development-only Figma capture hook activates only with a Figma capture hash. Normal navigation and production builds do not load it.
