# Plica content backend

Owns editorial content, metadata validation, public JSON and the Agent Skill. No frontend dependency, external Python package or database.

Run from the directory containing `backend/`:

```sh
python3 -m backend validate
python3 -m backend build
python3 -m backend build --output /tmp/plica-api-release
python3 -m backend serve --host 127.0.0.1 --port 8001
```

`build` produces `dist/api/v1/{catalog,index,terms}.json` and `dist/skill/plica-architecture/SKILL.md`. The full [API contract](../docs/api.md) documents all fields and evidence boundaries.

`serve` builds an isolated temporary release and serves only public resources. It supports separate-origin frontend fetches with public, noncredentialed CORS (`*` by default). Pass `--allow-origin http://localhost:5173` to select one UI origin. Restart after editing `content/`. Generated exports may be hosted on any static host; cross-origin hosting must supply its own CORS headers. The server is for development; this change does not deploy a production service.

Edit only `content/` and `skills/` for editorial changes, then validate and rebuild. Keep original source dates/URLs and explicit reviewed relations. Product/organization names are not interchangeable, and research associations are not deployment proof.
