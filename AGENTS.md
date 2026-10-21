# Engineering and editorial rules

- Plica is an independent knowledge base about the meta-architecture of real software systems, not Petwins runtime code, AI news, interview preparation, or the retired Stackworthy prototype.
- Migrate and maintain the existing Python standard-library generator. Do not introduce a second framework, duplicate content authority, or unrelated application dependencies.
- Edit the root JSON files, `build.py`, `skills/plica-architecture/SKILL.md`, and maintained `site/assets/`. Rebuild generated HTML, static API and published Skill; never hand-edit generated copy as a lasting fix.
- Preserve Production versus Research. A thematic relationship is not evidence of deployment. Cite original sources with dates, distinguish editorial interpretation, and do not invent metrics, authorship, system internals or verification results.
- Case–term edges are reviewed entries in `relations.json`, not automatically inferred from word matches. Review both ends of every changed relation.
- Do not republish third-party full text, illustrations or other assets without documented permission. Follow `docs/licensing.md`; public visibility is not a blanket license grant.
- Never commit credentials, private configuration, personal data or confidential architecture. No model-provider keys in client JavaScript. AI responses, accounts, payments, newsletter and sponsorship services remain unimplemented.
- Preserve Drive archives and genuine Git history. No forged historical commits, force pushes, destructive cleanup, or migration of unrelated assets.
- Before publishing, run `python3 validate_content.py`, `python3 build.py`, `node --check site/assets/site.js`, and `python3 test_site.py`. Exercise actual HTTP navigation at root and `/plica/`, desktop/mobile, filters/search, graph/glossary links, detail pages and the preview sidebar. Recheck affected behavior after edits.
- Keep CI and deployment on these same scripts. The production site needs no Python runtime or backend; Playwright is a development/test dependency only.
- Report separately: implemented, tested locally, verified in CI, deployed, and verified live. Never mark skipped or blocked tests as passed. A successful build alone does not prove working interaction, source accuracy, licensing clearance, or deployment.
