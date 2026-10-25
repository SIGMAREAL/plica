# Frontend / Backend Separation Implementation Plan

**Goal:** Let a replacement Plica UI develop and build against a documented public content API without importing editorial sources or the existing HTML generator.

**Architecture:** Keep one repository with independently runnable `backend/` and `frontend/`. Backend owns editorial JSON, taxonomy, comparisons, validation and deterministic API/Skill exports. The existing frontend consumes an exported catalog, owns HTML/CSS/JS, and remains replaceable. Root `build.py` composes their outputs for the existing Pages host.

**Tech Stack:** Python standard library for the content backend, API development server and retained static frontend; existing test-only Playwright. No database or new UI framework.

---

## Decision

Moving folders alone leaves the generator/data coupling intact. A database-backed application adds services without a current need. Use an independent, versioned JSON contract with a read-only HTTP development entry point. Preserve all current content and UI behavior; new UI work is explicitly separate.

### Task 1: Prove the separation boundary

- Add `tests/test_separation.py`: backend export without frontend; full catalog/source parity; old API compatibility; frontend build with only exported API; rejected invalid content; HTTP CORS/read-only behavior.
- Run `python3 -m unittest discover -s tests -v` and observe missing implementation failures.

### Task 2: Extract the content backend

- Move four editorial JSON files into `backend/content/`; extract mechanism/product/comparison editorial records from the HTML generator into that same source authority.
- Move public Skill source into `backend/skills/`.
- Add `backend/catalog.py`, `backend/__main__.py`, `backend/server.py`: load/validate, deterministic export, standalone read-only serving.
- Preserve `/api/v1/index.json`, `/api/v1/terms.json`, `/skill/plica-architecture/SKILL.md`; add complete `/api/v1/catalog.json` for replacement frontends.

### Task 3: Extract the current frontend

- Move rendering into `frontend/build.py` and maintained assets into `frontend/assets/`.
- Replace direct editorial-file reads with a required exported catalog. No backend imports in frontend code.
- CLI: `python3 frontend/build.py --api-dir backend/dist/api/v1 --output frontend/dist`.
- Keep existing routes, styling and interaction semantics. Escape any newly externalized editorial text.

### Task 4: Compose and document

- Root `build.py` orchestrates independent exports and renders, then composes `site/`.
- Root `validate_content.py` remains a compatibility entry point for backend validation.
- Update browser fixtures to read the public catalog, CI to run boundary tests, and architecture/content/engineering docs to name new source authorities.
- Document API fields, IDs, evidence boundaries, versioning and separate-origin UI development in `docs/api.md`, `backend/README.md`, `frontend/README.md`.

### Task 5: Acceptance

- Independent backend build and independent frontend build both work from an arbitrary working directory.
- Backend export needs no frontend source; frontend build needs only API bytes and its own source.
- Preserve previous published files except required taxonomy HTML escaping on the homepage; add the new catalog.
- Run content validation, build, Node syntax, backend/boundary tests, existing desktop/mobile/root/subpath HTTP browser suite and review `git diff`.
- Report local implementation/verification separately from publication. No push or deployment in this task.


## Local acceptance — 2026-10-23

- Backend export and frontend build pass independently, including isolated-source tests from an unrelated working directory. Twelve standard-library acceptance tests pass, including source-overlap protection, taxonomy escaping, organization IDs and obsolete asset removal.
- Exact original bytes preserved for all four editorial JSON files, public Skill and maintained CSS/JS/favicon. All previously tracked `site/` files remain unchanged except homepage taxonomy HTML escaping (six ampersands; identical displayed text); `api/v1/catalog.json` is added.
- Content validation, combined build, Python compilation, JavaScript syntax and `git diff --check` pass.
- Existing real Chromium HTTP acceptance passes at both `/` and `/plica/`, desktop 1440×900 and mobile 390×844: 130 pages, 4,828 internal references and 135 HTTP targets per mount; zero broken links, page errors or first-party failures. Local report: `artifacts/separation-browser/report.json` (ignored).
- Separate UI/API origins tested in real Chrome: browser fetch obtains 32 cases/35 terms via CORS, and public index navigation reaches the API origin. Report: `artifacts/separation-browser/separate-origins.json` (ignored).
- No commit, push, remote CI run or production deployment is claimed for this local refactor.

- Independent review found four boundary defects; regression tests reproduced each before fixes. Output/source overlap, taxonomy HTML escaping, derived organization ID validation and stale standalone assets are fixed. Focused re-review found no residual blockers.
