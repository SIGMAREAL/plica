# Drive to GitHub migration

Migration date: 2026-10-21. Existing project recovery, not a framework rewrite.

## Authoritative baseline

Use [plica-github-pages-v1.2-final.zip](https://drive.google.com/file/d/1vCkKSJT3bTYL1sgFTbkLqIaMNbW68lWs/view), in [v1.2 release](https://drive.google.com/drive/folders/1AYJjwwNPA_v9JqdMpzRnIc4l6w6W-2nE).

Independently downloaded 524242 bytes, computed SHA-256 `b40d660eb8476d1098a2fda128e336e4303f537a7aba1fb48d84cfe70f005433`, matching user-supplied hash. ZIP contains 147 non-directory files, including 130 HTML. Actual JSON has 32 production cases, 3 papers, 35 terms, and 50 explicit case-term relations. No newer accepted Plica version found in the inspected folder tree or Plica-named Drive search. A query for Plica/plica-named items modified after the final package timestamp returned no items. This is scoped discovery, not proof that no unrelated-name file exists elsewhere.

[Original Issue #39](https://github.com/SIGMAREAL/PEtwinsMacOS/issues/39) body and all five returned comments were read in full. Its latest V1.2 acceptance section agrees with the package. The current issue positioning supersedes obsolete Stackworthy/AI-only descriptions and the early Plica-name caution. Original issue remains unchanged.

## Inventory and archive provenance

[Main Drive folder](https://drive.google.com/drive/folders/1D2CDEDIpPdmGfa8pNqLfmgoF0Sz9H4K4) contains ten direct items: v1.2 release folder, v1.1 release folder, v1/v1.1/v1.1.1 source folders and their ZIPs, legacy Stackworthy ZIP, and original source folder. All known source and release folders were recursively listed. The migration inspected the known folder tree recursively and compared seven downloaded release archives; this document records their verified hashes and material differences.

| Package | Drive file ID | Bytes | SHA-256 | Files / HTML |
|---|---|---:|---|---:|
| Stackworthy legacy | 1LIdrJ_LF9N4dGUgGsDDx1QRi58ylotaF | 13912 | 3fe336eb159c0094431cb01e41658ffceb0ce333fa03f0499be4898aa3fe650a | 4 / 1 |
| Plica v1 | 1SzkNlS1RI3_rngj96v4am_AKJ0L2tJFn | 174758 | 87013ae74d76b45e99b0014b4eb22080dc8f4bde564454750435d23825e02454 | 52 / 43 |
| Plica v1.1 main-folder ZIP | 1g58vXbv3Ei07C2IrpRIIqiHHuPqCEXWs | 310393 | 13cd9ecf031977d5b98cf4c13d2dc3ade9e762f34d1839cf05ee0b6bbcd3176d | 96 / 81 |
| Plica v1.1.1 | 1gTX3T_33_I-K_BDJOSUsFcwRVZBjgdah | 314777 | 2881ad7233853b1cbc4e2a2aa5e1e40a699bf66e10e04dd4ca7ec824b75586c1 | 97 / 81 |
| Plica v1.1 release-folder ZIP | 1ZUVurU0WcpQKOfWRQGkSlHVLGDBkTZjz | 315409 | a45578c10e0f6a982bd54d60ee1bc183009187eeba0b1c5963884fcd0124585c | 97 / 81 |
| Plica v1.2 nonfinal | 1yASEbk3inIWBdV89P6eQCBdf_Ay-1v_Q | 524385 | 9383bb6bc81ddaf14c41ea6d6f9a69794823991aeb089200e96f2ef6857de8a2 | 147 / 130 |
| Plica v1.2 final | 1vCkKSJT3bTYL1sgFTbkLqIaMNbW68lWs | 524242 | b40d660eb8476d1098a2fda128e336e4303f537a7aba1fb48d84cfe70f005433 | 147 / 130 |

These are real archive hashes, not invented Git commit history. Keep all original Drive materials unchanged. Historical ZIPs need not be checked into the new repository; documentary provenance suffices and avoids multiple authoritative source trees.

### Verified differences

- v1: 16 cases and 43 generated pages. Initial archive/category/detail/search/comparison/AI-sidebar-preview static site.
- v1 to v1.1: cases.json byte-identical; adds 3 papers, 18 terms, Research/Glossary/Graph, publishing-organization indexes, public Skill source and generated copy, static API indexes. 81 HTML. No relations.json yet.
- v1.1 to v1.1.1: adds relations.json with 21 reviewed links; updates build.py, test_site.py, cases.json and 72 generated files. Still 16 cases / 3 papers / 18 terms / 81 HTML. Explicit relation model and product/company/mechanism filter corrections.
- v1.1.1 to later v1.1 release-folder ZIP: ONLY README.md and test_site.py differ. All generated site bytes identical. Do not rank these packages by filename semver alone.
- v1.1 release to v1.2 final: 16 more cases, 17 more terms, 29 more relations; papers unchanged. Adds validator and 49 HTML pages; updates generator/workflow/editorial data/tests. Final totals32/3/35/50/130.
- v1.2 nonfinal to final: ONLY README.md differs. Source code, JSON, workflow, tests, Skill and all generated website bytes identical. Final README corrects historical V1.1 counts and clarifies V1.2 acceptance and unpublished hosting. It inadvertently omits validator from top structure/run summary while retaining it in V1.2 acceptance; migration README should accurately list validator without suggesting functional source changes.
- Individual historical source folders are partial snapshots, not full release equivalents. v1.1 source folder also contains later test/README/ZIP additions mixed with earlier files. Prefer complete verified ZIPs.


## Files adopted and changes

All 147 files from the authoritative final ZIP were recovered. `build.py`, four JSON data files, the Skill and maintained assets remain unchanged. A fresh build reproduced all original `site/` files byte-for-byte. The old README is preserved as historical release notes; the current README documents maintainable development and publishing. Added AGENTS, ignore rules, technical/provenance/rights documents, a test-only dependency file and reusable CI. The retained Pages workflow now gates deployment on CI.

The browser harness no longer substitutes inline HTML/CSS/JavaScript or disables browser history. It serves the unchanged site over HTTP at both root and `/plica/`, supports portable Chromium discovery/output, and accepts an optional live base URL. No product feature or catalog record was removed or replaced. Local caches and transient test output are not repository source. Historical ZIPs remain in Drive, not duplicated as competing source trees.

## Execution and publication evidence boundaries

`gh auth status` found no authenticated CLI host in the cloud environment. Repository creation used the already authenticated GitHub cloud browser; source publication uses the authorized GitHub connector, not a claimed `gh push`. No new credential was created.

Local content validation, Python generation, JavaScript syntax and static link checks executed successfully. Local Chromium execution was blocked by the cloud executor's socket sandbox before browser assertions could run; no local browser pass is claimed. GitHub Actions is the intended real HTTP Playwright execution environment, and public deployment must be verified separately. Consult the exact commit's Actions results and the migration tracking issue for actual CI/deployment acceptance.

No Drive content was changed. No historical timestamps or commits were fabricated. Original requirement issue #39 is retained. Public repository exposure does not itself establish copyright clearance; see licensing.md.
