# Architecture

Plica separates a public content backend from replaceable frontend presentation. Both remain independent of Petwins runtime and build dependencies.

## Backend authority

`backend/content/` owns cases, glossary, papers, reviewed case–term relations, mechanism taxonomy, product descriptions, editorial comparisons and edition metadata. Publishing organizations derive from case publishers. `backend/catalog.py` validates IDs, fields, source URLs, dates, categories and relationship endpoints, then exports a complete public catalog plus backward-compatible discovery indexes. It imports no renderer or frontend code.

`python3 -m backend build` writes only API and Skill release files into `backend/dist/`. `python3 -m backend serve` creates a temporary validated export and exposes only documented public resource paths via GET/HEAD/OPTIONS, with configurable noncredentialed CORS. It serves no UI, editorial source directory or directory listings. This standard-library server is a development entry point, not a new production application platform. Restart it after content edits.

## Frontend boundary

`frontend/build.py` retains the existing UI. Its only content input is exported `api/v1/catalog.json`, selected with `--api-dir`. No backend import, repository-root data read or editorial validation occurs in the frontend. `frontend/assets/` owns maintained CSS/JS/SVG. Icon choices, layout, HTML routes and graph presentation remain frontend responsibilities; taxonomy and comparison content come from the API.

`--output` selects the UI artifact directory (default `frontend/dist/`). `--api-base-url` directs public API/Skill links to a separate host or base path. By default they remain relative for the composed GitHub Pages site. A replacement frontend can fetch the same API at runtime or consume its exported artifact at build time. It need not retain the old Python renderer, CSS or DOM.

## Composition and publication

Root `build.py` invokes each independent build in temporary output directories. The frontend reads the backend artifact, then the wrapper merges UI and API/Skill files into the tracked `site/` deployment snapshot. Existing routes and rendering are preserved; homepage taxonomy ampersands are now safely HTML-escaped. Other existing UI/API bytes are unchanged; the complete catalog is additive. Generated outputs are not source authorities. `validate_content.py` forwards to backend-only validation.

GitHub Pages publishes the current Kumo/React design through `python3 build.py --frontend react`. This alternative composer feeds the isolated public export to Vite, then merges UI and API/Skill into `frontend/prototype/release/`; `release.json` identifies the source revision. The default build still generates `site/` for static parity checks. Both releases require only static hosting, with no production Python runtime. Separately hosted API exports need appropriate CORS headers from that host; the development server supplies them automatically. No deployed runtime server, database, account, inference or payment backend is added.

## Quality gates

`tests/test_separation.py` builds backend in an isolated copy without UI; builds UI from only its own source plus API bytes; rejects unknown schema versions and broken editorial references; verifies old discovery JSON and retained UI bytes; and exercises real independent HTTP paths, CORS, HEAD/OPTIONS and rejected writes/source access. CI also validates content, rebuilds snapshots, checks JavaScript and runs real root/subpath desktop/mobile browser acceptance.

These checks prove build/API boundaries and retained behavior. They do not prove all source claims, source availability or rights clearance. Local results, remote CI and production deployment must be reported separately.
