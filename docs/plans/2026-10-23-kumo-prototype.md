# Plica Kumo prototype and Figma design

**Status:** Page direction rejected. Current work follows [component library first](2026-10-23-component-library.md); the previous page frames are draft work.

**Goal:** Design a working website prototype using Kumo, Tailwind, GSAP, Vite and React, then create editable Figma Design screens matching the prototype.

**Visual thesis:** An editorial systems atlas: warm white canvas, ink typography, precise controls, one orange accent and source-backed relationship diagrams.

**Content plan:** A discovery home introduces the publication and a featured source; library provides search and independent product/publisher/mechanism filters; case reading presents problem, mechanisms, trade-offs and original source; graph connects reviewed concepts to cases; glossary/research/comparison reuse the same real catalog.

**Interaction thesis:** Short scoped GSAP entrance sequences establish hierarchy; reading progress follows scroll; graph focus and page changes transition without obstructing navigation. Respect reduced motion. No simulated AI inference, login or transactions.

## Scope and ownership

- Add `frontend/prototype/` as a standalone Vite/React/TypeScript application. The retained static frontend and production deployment stay available for review.
- Use actual `@cloudflare/kumo` controls and Tailwind v4. GSAP runs through `@gsap/react` with scoped cleanup.
- Read only the public catalog over HTTP. No backend source imports or authoritative content copies.
- Implement discovery, library/filter state, article, graph, research, glossary and comparisons. All meaningful navigation and controls work; source links stay real.
- Capture desktop and mobile states; check keyboard behavior, filtering/reset, back navigation, graph selection, original-source links and reduced motion. Save screenshot/recording evidence.
- Figma: create a Design file, discover existing library mappings/tokens, create editable reusable components and desktop/mobile screens, validate screenshots and layer structure. Never flatten complete screens into images.

## Execution

1. Install the specified stack in the isolated prototype directory and inspect Kumo component APIs/tokens.
2. Write catalog types and URL/filter utilities; verify filters combine independently and history links preserve state.
3. Implement responsive views and scoped motion, using actual catalog records and evidence limitations.
4. Run typecheck/build and browser visual/interaction acceptance; refine based on actual screenshots.
5. Create Figma screens and component/token sheet from the prototype, using the official Figma tools after authentication is restored.

## Deliverables

- Working standalone frontend: `frontend/prototype/`; retained static renderer remains independent.
- [Editable Figma file](https://www.figma.com/design/HN365jMHk14lQd2YAUSn4y?node-id=9-65), created after authentication was restored: seven desktop frames, four core mobile frames and a foundations/component page.
- Semantic colors and spacing variables, shared Inter/Instrument Serif/Noto Sans SC text styles, reusable buttons/search/select/tag and case rows. Screen layers contain editable text, vectors and component instances, with no screenshot fills.
- Visual and interaction acceptance evidence is saved under ignored `artifacts/kumo-prototype/`.

The Figma design covers representative records and the principal layouts. Full search, filtering, bookmarks and motion run in the local prototype. Neither artifact is a production deployment.
