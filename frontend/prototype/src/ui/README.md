# Plica UI

Current review target: http://127.0.0.1:5187/components.html. Business pages now use this same component foundation.

`index.ts` exports actual Kumo primitives directly. Kumo owns accessible behavior, sizing and primitive visual states. `patterns.tsx` owns Plica content composition and exposes controlled state through props. `theme.css` owns the shared tokens and pattern styles. The separate component entry does not load the old page stylesheet.

Typography uses self-hosted DM Sans Variable for Latin text and numbers. Chinese uses the installed PingFang SC system font first, then self-hosted MiSans on platforms without PingFang. Both app and component-library entries share `theme.css` and `fonts.css`; no platform detection is needed. MiSans uses the official, unmodified WOFF2 subsets at weights 400/500/600/700 and loads only subsets needed by the page. Font notices ship at `public/fonts/DM-Sans-LICENSE.txt` and `public/fonts/MiSans-LICENSE.pdf`; `public/fonts/MiSans-sources.json` records the official source URLs and hashes. PingFang files are not bundled. Noto Sans SC remains a comparison backup rather than an active site font.

```tsx
import { Button, Input, SearchField, CaseListItem } from './ui';
import './ui/theme.css';

<Button variant="primary" size="base" loading={isLoading}>保存</Button>
<Input label="名称" description="说明" error={error} />
<SearchField value={query} onChange={setQuery} />
```

Inventory: Button/LinkButton, Input, Select, Checkbox, Switch, Tabs, Badge, Tooltip, Dialog; SearchField, CaseListItem, PublicationMeta, SourceLink, EmptyState and CaseSkeleton. Use Kumo's existing props instead of adding a second variant API. Case/search state belongs to the caller; the library performs no backend writes.

Default controls are 36 px, with Kumo's 20/26/40 px alternatives. Body text is 14/22 px, metadata 12/18 px; headings use 20/30, 24/34 and 32/42 px. Spacing follows 4/8/12/16/24/32 px; the 6 px Kumo icon gap is retained. Light/dark mode inherits into portalled controls through the document's color scheme.

[Figma component page](https://www.figma.com/design/HN365jMHk14lQd2YAUSn4y?node-id=15-2) contains editable Light/Dark foundations and light-mode control/pattern specimens. It is a local representation of the installed Kumo implementation, not an imported official Kumo Figma kit. Node and code mappings are recorded in `design/component-library-nodes.json`; these are handoff mappings, not published Figma Code Connect registrations.

Browser evidence: repository `artifacts/component-library/verification.json`, screenshots of all six groups at desktop/mobile light/dark, and interaction recordings. Verified: actual control heights, disabled/loading buttons, field validation, selection, tabs, search/empty reset and clear-focus return, bookmark state, tooltip and dialog focus/escape/return behavior. Business-page adoption, exploration cards/entries and the local reading-question pattern are included in the current redesign.
