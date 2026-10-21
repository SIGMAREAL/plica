# Content model

The root JSON files are the editable authority. Preserve the existing schema rather than creating a parallel CMS database.

- `cases.json`: 32 production case studies at the migration baseline. Each has a unique slug and original source URL, publishing company, product/category and mechanisms, source date, editorial introduction, trade-offs and supporting points. Source dates describe the cited work, not necessarily the present architecture.
- `terms.json`: 35 glossary entries with stable IDs, definitions and engineering context. Definitions and case commentary are independently written summaries, not licensed copies of source articles.
- `papers.json`: 3 research entries with original arXiv identifiers and editorial related-case links. Keep these distinct from Production.
- `relations.json`: 50 explicit reviewed case–term edges with valid endpoint IDs and review status. Do not infer production edges from prose at build time.

`build.py` derives product, organization and mechanism indexes, 130 HTML pages, research and glossary detail pages, the graph, comparisons and public API JSON. The 16 publishing organizations are a derived index, not a separate authority.

## Editing checklist

1. Open the first-party article, talk, paper or retrospective; verify title, publisher, date and claim scope.
2. Write a concise original summary explaining problem, constraints, mechanism, trade-offs and evolution. Link the source; do not import full text or illustrations without permission.
3. Use stable unique IDs and avoid duplicating an existing case under a second title.
4. Review all case–term and research–case associations manually. Mark interpretation as such.
5. Run content validation, generation and browser tests. Review changed generated pages and preserve baseline records unless a documented editorial correction requires removal.

Automated checks establish schema/link consistency, not the truth of every technical claim or continued availability of external sources. Future editorial review should track corrections, provenance, link rot and rights clearance explicitly.
