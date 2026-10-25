# Plica typographic portal Hero

**User-approved final composition:** Plica icon and product name, How the world’s software works., then the existing 探索案例库 and 什么是 Plica？ buttons. Remove the positioning line, Chinese subtitle and scroll prompt. Lower exploration/content entrances remain. This decision supersedes the earlier multi-level copy composition below; archival copy is provenance, not an instruction to display every line.

The user rejected the side-by-side heading and case-preview layout. The replacement is a single centered stack: large headline, supporting paragraph and Kumo actions. Product, company, mechanism and reading entrances remain below it. Hero motion is a short scoped GSAP entrance with reduced-motion support.

## Verified release copy and Hero identity

The 2026-10-19 v1.1.1 homepage and v1.2 release generator both specify:

- Positioning: **THE META-ARCHITECTURE OF REAL SYSTEMS**
- Headline: **How the world’s software works.**
- Subtitle: **从产品到团队，从机制到研究。沿着一手资料，理解软件世界的运行原理与架构取舍。**

The user additionally requires a visible Plica icon and product name inside the Hero. The implementation reuses the current shared Kumo brand component through a Hero variant; navigation and footer branding keep their default sizing.

Sources:

- [v1.1.1 homepage HTML](https://drive.google.com/file/d/1qJ73SWGJRpxEOR2UGIPgUo5X5oUy1ktJ/view)
- [v1.2 release build.py](https://drive.google.com/file/d/1eY1ZphtJyL3BtR4OcKWx5tNLlL0nUEzl/view)

Version reconciliation: the v1 homepage used Inside the systems we use.; v1.1 used How software really works.; v1.1.1 and v1.2 used the headline above. The v1.2 README retained the old Inside headline and is not authoritative for the release Hero. The previous implementation incorrectly treated that README and v1 HTML as the final copy.

No separate design specification was found, and the user’s approximate phrase “how meta systems work” is not presented as an exact archival quote. No Drive documents were modified.

## Official references inspected on 2026-10-23

| Reference | Observed content / composition | Plica implication |
| --- | --- | --- |
| [OpenAI](https://openai.com/) | Current text puts the question and message entry before editorial content. Full CSS rendering did not load reliably in this environment. | One obvious starting action; defer the content collection. |
| [Dots](https://chatgpt.com/features/dots/) | Actual rendered page: centered character, large title, quieter explanatory copy and actions vertically arranged. | Headline and subtitle share one axis. |
| [ChatGPT](https://chatgpt.com/overview/) | Actual rendered page: oversized central typography with selectable words; product demonstration follows vertically. | Let the words carry the first screen. |
| [Codex](https://openai.com/codex/) | Official headline is Build anything with Codex, followed by a short promise. Full styled rendering was unavailable, so no exact geometry is claimed. | State one idea and support it briefly. |
| [Arc download](https://arc.net/download) | Actual rendered page: centered icon, question headline, short copy, download action. The current main Arc homepage is a retirement notice, so it is not treated as the old product landing. | Keep a clear vertical reading order. |
| [Dia](https://www.diabrowser.com/) | Actual rendered page: centered promise, oversized wordmark and wide product demonstration; one download action below. | Give each section a clear protagonist; no competing half-width demo. |

Dots here means OpenAI Dots, as explicitly clarified by the user. New Computer Dot is not the reference.

## Implementation and boundaries

`LandingPage.tsx` and `landing.css` retire the preview state, paper-stack decoration, first-screen badges and counts. The verified v1.2 headline, positioning and subtitle replace the earlier copy, with Plica identity above them. Existing Kumo controls, font families, theme state, knowledge-base routes and all lower entrances remain. Separate `#/landing`, `/landing/` and deployment prefixes continue to work.

Existing Figma desktop/mobile portal frames are updated in place. The rejected Hero preview set is removed after its two instances are removed. No Archive page is created. The code remains local and unpublished.

Evidence: ignored `artifacts/portal-final-hero/` contains current screenshots, recordings, visual comparisons and browser verification; `artifacts/hero-references/` contains reference captures and records of blocked headless renders.
