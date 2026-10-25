# Component library first

The page direction was rejected. Freeze the page layouts and establish a reusable Kumo component layer before doing more page work.

Scope: native Kumo buttons (six variants, four sizes, disabled/loading and real hover/focus), inputs with label/help/validation, search, select, checkbox, switch, tabs, badge, tooltip and dialog. Plica composites: case item, publication metadata, source link, search/empty/loading states. Tokens cover neutral surfaces/text, semantic action, brand, spacing, radii and a legible Chinese/Latin type hierarchy.

Code is authoritative: primitive exports come directly from Kumo rather than copied wrappers. Reusable composites live in `src/ui/`; the independent `components.html` entry demonstrates the same exports. Previous page CSS is not loaded into the library. Existing page integration comes after the library is reviewed.

Acceptance: production build succeeds; actual Chrome desktop/mobile and light/dark screenshots are inspected; filtering, clear/focus return, validation, selection, tabs, dialog/Escape/focus return and disabled/loading states work. Figma adds a dedicated component page with editable variants and token/style bindings derived from code. No new business pages or deployment.
