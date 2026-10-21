# Plica

**Inside the systems we use.** Plica explores how real-world software systems work: their problems, constraints, architecture, engineering decisions, research and trade-offs.

This independent knowledge base curates first-party engineering articles, talks, research papers and system retrospectives. It is not AI news, a code tutorial site or an interview question bank, and is not part of Petwins application runtime. The retired Stackworthy brand is not the current product.

## Existing product

Migrated from the actual Plica v1.2 final Drive project, not rebuilt in a new framework:

- 32 Production cases, 3 Research papers, 35 glossary terms and 50 editorially reviewed case–term relations.
- 130 generated HTML pages and 16 publishing organizations.
- Product / Organization / Mechanism indexes, archive search and filters, case details and editorial comparisons.
- Glossary links, a knowledge graph with mobile-readable lists, and separate research reading suggestions.
- A publicly generated Agent Skill and read-only static JSON indexes.

The AI selection sidebar is **a preview that prepares/copies a question**, not a working AI backend. Accounts, membership, payments, paid inference, newsletter subscriptions and real sponsorship services are **not implemented**.

## Architecture and source of truth

Python standard-library validation and generation → HTML/CSS/JavaScript → GitHub Pages. No production backend, npm app framework or Python hosting runtime is required.

```text
.github/workflows/       CI and Pages deployment
cases.json              Production editorial records
terms.json              Glossary records
papers.json             Research records
relations.json          Reviewed case–term associations
build.py                The single static generator
validate_content.py     Editorial schema/reference checks
test_site.py            Real HTTP/browser acceptance tests
requirements-test.txt   Test-only Playwright dependency
skills/                 Authoritative public Agent Skill
site/assets/            Maintained CSS/JS/SVG source assets
site/                   Generated pages/API/Skill snapshots
docs/                   Architecture, provenance, roadmap, rights
AGENTS.md               Engineering and editorial guardrails
```

Edit JSON, generator, maintained assets and Skill source, then rebuild. Do not edit generated HTML as a second authority. Search covers the site's indexed editorial material, not full text from external articles.

## Develop and verify

Python 3.12 and Node 22 are used in CI. The generator itself uses only Python's standard library.

```sh
python3 validate_content.py
python3 build.py
node --check site/assets/site.js
python3 -m pip install -r requirements-test.txt
python3 -m playwright install chromium
python3 test_site.py
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000`. On Linux CI, use `python3 -m playwright install --with-deps chromium` to install browser prerequisites. Tests serve unchanged assets over HTTP at both `/` and `/plica/`, test desktop/mobile interaction, and check internal links. `PLICA_TEST_OUTPUT` chooses the report directory; `PLICA_BROWSER_PATH` optionally selects an installed browser. No historical inline-HTML test shortcut is used.

For post-deployment checks:

```sh
PLICA_BASE_URL=https://sigmareal.github.io/plica/ python3 test_site.py
```

## Publish

The repository is `SIGMAREAL/plica`, branch `main`. Configure Settings → Pages → GitHub Actions. The retained `deploy-pages.yml` workflow now waits for reusable `ci.yml` validation and real browser tests, then builds with the same generator and uploads only `site/`. Pull requests run the same CI checks. Relative links support the `/plica/` project prefix.

The expected Pages address is `https://sigmareal.github.io/plica/`. A URL in this README alone is not proof of deployment: confirm the exact commit's successful Actions run and test the live site. No credentials or model-provider keys belong in the repository.

## Provenance and editorial policy

See [migration notes](docs/migration-notes.md), [architecture](docs/architecture.md), [content model](docs/content-model.md), [roadmap](docs/roadmap.md) and the [original requirement](https://github.com/SIGMAREAL/PEtwinsMacOS/issues/39). Historical release notes are preserved separately; Drive archives remain unchanged. ZIP versions are not fabricated Git commits.

Link original sources and their dates; separate sourced facts from editorial interpretation. Research proximity is not evidence of production use. Historical systems do not automatically describe current internals. Do not copy source full text, images, invented metrics or endorsements. Automated validation does not replace factual review.

## Rights and license status

No repository-wide license was present in the supplied project, and none is invented here. Public visibility is not a blanket redistribution grant. The existing Agent Skill's scoped `license: MIT` declaration is retained without extending it to website code, editorial data or linked works. Third-party content retains its own rights. See [licensing review and proposed next steps](docs/licensing.md).
