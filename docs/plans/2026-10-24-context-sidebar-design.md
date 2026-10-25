# Contextual sidebar

The header owns six approved global entries. The former sidebar repeated those entries, so changing its appearance alone would preserve the navigation problem. The replacement sidebar is scoped to the current column or document.

Reference: OpenAI's research index and the nested in-page contents of https://openai.com/zh-Hans-CN/index/introducing-gpt-6-1-sol/, inspected live on 2026-10-24. Use the distinction between global navigation and document-local navigation, restrained typography, nested links and a current-section marker. This is a Plica implementation of that hierarchy, not a copy of OpenAI's content or a pixel-matched design.

- Product, team and mechanism columns expose their actual child records. Search filters that directory; counts refer to public cases.
- Case-library navigation filters by mechanism while preserving the current search, product and publisher facets. Counts respect those intersections.
- Graph navigation owns the four dimension groups and their real nodes. It replaces the additional graph sidebar and dimension toolbar.
- Glossary and research navigation expose terms and papers. Detail pages also expose local chapters.
- Reading and informational pages use real heading-derived chapter links, nested h3 headings, URL-preserved section anchors and a current-section marker that follows scrolling. The old inline article contents is removed.
- The reading list contains actual browser-local saved cases; validation must restore any changed saved state.

Desktop keeps search and the column label visible while the list scrolls independently. Groups are keyboard-accessible native disclosures. Search opens matching groups, selected records scroll into view, and the sidebar can collapse to a 64px rail. Collapse expands the reading area without altering the approved header.

Mobile uses a labelled column-navigation bar below the global header and the same content in a Kumo modal. The global mobile menu and local directory have separate purposes. Local chapter navigation closes the modal and positions the target below both bars. Kumo owns focus trapping, Escape, return focus and body scroll locking.

Route labels live in navigation-sections.ts; catalog-derived contextual links live in context-navigation.ts. The outline observer handles document headings and active-section state. Content, rendering and global navigation remain separate. No backend content or production deployment changes are included.

Local validation: 15 frontend tests, TypeScript/Vite build, direct-route smoke checks, desktop/mobile screenshots, directory search/empty/clear focus, disclosure toggling, collapse/expand, graph dimension changes, chapter positioning/current state, selected-item visibility and reversible bookmark verification. CI and deployment are separate from these local checks.
