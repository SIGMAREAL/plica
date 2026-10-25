# Plica Kumo site redesign implementation plan

**Goal:** Apply the established Kumo component foundation to every current Plica route, then update the existing Figma desktop/mobile designs.

**Architecture:** React frontend consumes the public catalog only. Shared Kumo primitives, content patterns, theme tokens and application navigation serve every route. Preserve URL filters, history/scroll restoration, source boundaries and local bookmarks. Route views own content composition; shell owns navigation, theme and keyboard search.

**Tech stack:** React, TypeScript, Vite, Tailwind, Kumo and scoped GSAP. Hairline was investigated and installed at the user's request, then explicitly deferred: do not use it, draw its figures or include its runtime dependency in this redesign.

1. Replace the rejected visual language with the shared UI tokens and Kumo controls. Build the responsive sidebar/topbar and content frame.
2. Redesign discovery, case library, case detail, knowledge graph, glossary/term, research/paper, comparison, loading/error/not-found states. Reuse content patterns and preserve real source links/relationships.
3. Verify the production build, utility tests and actual desktop/mobile Chrome interactions, including search/facets, bookmarks, shortcuts, history, graph/term links, theme, reduced motion and unavailable API.
4. Update the exact existing Figma frames in place using current components/tokens; remove obsolete visual content instead of adding Archive pages. Inspect editable structure and screenshots.

No backend content or production deployment changes are part of this work.

## Feature parity correction

The user identified that the new UI omitted existing product/team browsing. The source baseline was verified against origin/main at 742120fb4cb559eae0b445e2201b0f9fc8bbc101 on 2026-10-23. This was an incomplete frontend migration, not missing backend data.

Before further visual or Figma work, restore and verify every existing route family: discovery; cases/library; products/product; companies/company; systems/system; graph with four dimensions and research links; glossary/term and related research; research/paper; comparison; about; sponsor; Agent Skill. Preserve source facts, inline term links, local question-copy preview, search classifications, and all existing interactions. Keep public content authoritative in the backend export.

The restored code is separate from the retained static renderer. No publishing or deployment is included. After the user resumed, restored route families, graph dimensions and reading-question previews were synchronized into the existing Figma file. Legacy URLs/filter/anchor compatibility, one-time bookmark migration and per-record static sharing metadata were also restored after review.
