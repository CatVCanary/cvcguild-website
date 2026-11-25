# CVC Website — full build staging branch
**Director-approved visual:** 2026-11-25. **Status:** code built, NOT authorized for publication.
Source: Guild Drive / Website Working Assets / Q_CVC_WEBSITE_APPROVED_DRAFT_2026-11-25.zip.
Design: exact original poster artwork in Guild Drive (SHA-256 0febd450c5d8191cfd0fd6965a31aa114ec62dbb8c0605df1a481066ae26bc23); browser rendering uses a quality-100 WebP export (same composition) to reduce load; exact original banner bytes in assets/approved-guild-banner.png.
This branch contains 12 page templates (index, about, games, hospitality, volunteer, visit, photographs, stories, support, land, contact, privacy), real Guild photo references from existing photos/, CSS and JS.
The homepage must keep exactly one banner and the approved interactive stage; preserve the typography, red/gold/ivory palette, Cat and Canary, text and composition. No AI replacement art or generic site redesign.
Known release gates: verify photo rights/credits; test all pages, phone breakpoints and touch navigation; validate donation destination and event schedule; confirm DNS/email records before any eventual cutover; remove noindex only with approval. Do not merge to main, change CNAME, deploy, submit Google Ad Grants, cancel Squarespace, or contact anyone until explicitly approved.


## Verified build artifact and next release gates
- [Full 12-page build ZIP (Guild Drive)](https://drive.google.com/file/d/11Or_lawzwO2XkEyhp4MCppg-yQtWmQKi/view)
- [Read-first build note](https://docs.google.com/document/d/12LbiktswCTTPgIwXofCph4uB171nDdIT/edit)
- [QA results (Guild Drive)](https://drive.google.com/file/d/1THGO0ZIYAc3M8eAp58ZkSRPbMHFeJ9s8/view)
- GitHub commit `fe550738abb940c9c205be03ee53d4ee67193794`: twelve full site pages, CSS, JS, exact banner image, optimized poster rendering, and references to the existing original Guild photographs.
- Static QA passed across all 12 pages for headings, relative links, image paths and homepage hotspot navigation. Page count 12. All pages retain staging `noindex,nofollow`.
- Mobile/desktop dynamic visual QA is **not complete**: local Chromium is governed by an administrator URL blocklist. Do not claim interactive browser QA passed. Photo rights, live Venmo destination, and event details also remain to be checked.
- Site branch has NOT been merged to main or deployed. Public cvcguild.com, Squarespace, DNS, Gmail, and Google Ad Grants remain untouched.
