# Public content API v1

This contract lets a separately built UI use Plica content without Python imports or access to editable source files. All content is public, read-only JSON with UTF-8 editorial text. There is no login, model inference or write API.

## Addresses and transport

| Resource | Purpose |
| --- | --- |
| `/api/v1/catalog.json` | Complete content for a replacement UI |
| `/api/v1/index.json` | Existing compact Agent/discovery index; unchanged contract |
| `/api/v1/terms.json` | Existing glossary array; unchanged contract |
| `/skill/plica-architecture/SKILL.md` | Existing public Skill document |

The base URL may include a prefix: current composed site resources use `/plica/api/v1/...`. The local API uses `http://127.0.0.1:8001/api/v1/...` without `/plica/`. Paths are relative to the chosen API base, not the frontend host. API resources contain no UI HTML, theme names, icons or CSS classes.

Development server: GET returns bytes; HEAD returns headers; OPTIONS returns 204 and `Access-Control-Allow-Methods: GET, HEAD, OPTIONS`. Unknown paths return 404, unsupported write methods return 501. There is no directory listing. Default `Access-Control-Allow-Origin: *`; `--allow-origin` selects a single explicit frontend origin. Credentials/cookies are neither required nor enabled. Static production hosting provides its own HTTP/CORS behavior; do not assume the development server's error behavior on Pages.

## Complete catalog

`schema_version` is `"1.0"`. `edition` identifies the editorial release and is currently `"2026-10-19-v1.2"`; architecture-only refactoring does not imply new editorial content. Every collection is an array; record ordering is deterministic but UI sorting is a presentation decision.

| Field | Record fields and meaning |
| --- | --- |
| `cases` | `slug` (ID), `company`, `product`, `category`, `title`, `question`, `summary`, `why`, `points` (three strings), `tradeoff`, `source` (original HTTPS URL), `date` (source year or date), `type`, `mechanisms` (display terms), `signal`, `readTime`; optional `featured` |
| `papers` | `id`, `title`, `authors`, `year`, `arxiv`, `category`, `question`, `summary`, `takeaways` (strings), `related_case` (case slug), `status` (evidence limitations) |
| `terms` | `id`, `name`, `aliases` (strings), `zh`, `definition`, `category` |
| `relations` | `case` (case slug), `term` (term ID), `relation: "explains_term"`, `review_status: "editorial"` or `"verified"` |
| `mechanisms` | `id` (category key), `label`, `english`, `description` |
| `products` | `id`, `name` (case.product key), `description` |
| `organizations` | `id`, `name` (case.company key); derived from publishing organizations |
| `comparisons` | `id`, `category`, `title`, `description`, `case_ids` (ordered case slugs) |

Product/organization IDs are lowercase ASCII slugs of their names. Case product/company references retain the original names for compatibility. Treat IDs as stable public identifiers; changing a name that changes an ID requires a reviewed migration. Organization currently means publisher, not an independently verified internal team. `mechanisms` taxonomy IDs are distinct from the free-text `cases[].mechanisms` terms.

All category references resolve to `mechanisms[].id`. All term/case edges and comparison case IDs must resolve before export. `related_case` and shared research categories mean thematic reading links, not confirmed production adoption. `review_status` records editorial review; it is not a guarantee that a source describes today's internal system. Preserve original source dates/URLs and evidence-limit text in any replacement UI.

## Consume from a new UI

```js
const apiBase = 'http://127.0.0.1:8001/'; // May instead end in /plica/.
const response = await fetch(new URL('api/v1/catalog.json', apiBase), {
  credentials: 'omit',
});
if (!response.ok) throw new Error(`Plica API: ${response.status}`);
const catalog = await response.json();
if (catalog.schema_version !== '1.0') throw new Error('Unsupported Plica catalog version');
const casesById = new Map(catalog.cases.map(c => [c.slug, c]));
```

Use safe text rendering for editorial strings; do not inject them as raw HTML. Implement search, compound filters and graph navigation over these collections in the new UI; no old HTML scraping is required. Build-time consumers may read `backend/dist/api/v1/catalog.json` instead of HTTP.

## Versioning and errors

The old index and terms endpoints retain their prior fields/bytes for unchanged content. The complete catalog is additive. Within v1, consumers should ignore unknown optional fields. Removing/renaming required fields or changing identifier/evidence semantics requires a new contract version and migration. Failed validation exits nonzero before writing a new export; frontend builds reject unknown `schema_version`. Servers expose the last snapshot made at startup, so restart after content changes. No pagination, authentication or mutation semantics are implied.
