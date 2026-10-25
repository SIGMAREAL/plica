# Plica independent portal landing

Superseded Hero direction: see `2026-10-23-typographic-hero.md`. The user rejected the split Hero with case previews; the current Hero is centered typography using the original Drive copy.

**Goal:** Add a separate, full-width Hero landing at `#/landing`, with real entrances to the existing knowledge base. Keep the current `#/` discovery page and all browsing features.

**Architecture:** The existing app owns catalog fetching, theme and keyboard search. A small portal shell owns its navigation and footer. Landing content consumes the same public catalog and Kumo controls. Hero selection only changes the displayed editorial case; it creates no new content authority or architectural claims.

**Stack:** React, TypeScript, Vite, Tailwind, Kumo, scoped GSAP. Retain the existing font and semantic color tokens. Hairline remains deferred.

1. Build a responsive portal navigation, strong two-column Hero with three real case previews, product/team/mechanism entrances, editorial selection and research/Skill links. Use one restrained entrance animation and respect reduced motion.
2. Add the independent route and public HTML/metadata shell, plus an entrance from the existing knowledge base. Preserve old route/filter/bookmark behavior.
3. Verify desktop/mobile, light/dark, keyboard case selection and menu, all meaningful entrances, reduced motion, and actual built static hosting at `/landing/` and `/plica/landing/`. Record the entrance animation and inspect screenshots after the final code change.
4. Add separate editable desktop/mobile Figma landing frames using current Kumo variables and components. Keep existing knowledge-base frames intact. Validate font families, editable structure and rendered composition.

No backend content, publication or deployment changes are included.
