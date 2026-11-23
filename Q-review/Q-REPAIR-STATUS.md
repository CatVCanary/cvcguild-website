# Cat v. Canary website repair — Director review status

**Date:** 2026-11-23
**Status:** UNPUBLISHED director review, not a production launch.

## Completed and verified
- Replaced the previous unreliable theatrical review page with a tested, responsive version at `Q-review/theatre.html`.
- Approved frame assets remain untouched: `Q-LOCKED/frames/desktop-web.png` and `Q-LOCKED/frames/mobile-original.png`. Their SHA-256 values match `Q-LOCKED/frames/LOCKED_MANIFEST.json`.
- Five working theatre scenes (Home, Games, Guild, Visit, Donate) with native anchor links, CSS-only navigation fallback, and enhanced transitions.
- Removed the unauthorized scenery drawings; uses a neutral ivory interim stage. No invented alternative to the missing approved landscape scene.
- Repaired the missing `photos/8.jpg` homepage image reference to the verified `photos/26.jpg`.
- Repo-wide static check of 13 HTML files found no broken relative `href` or `src` references in this branch.
- A locally created **self-contained HTML review** (including original locked PNGs) passed **12 browser tests**: viewport sizes 1440×900, 1024×768, 768×1024, 393×852, 375×812, and 320×700, each with JavaScript ON and OFF. Tests covered all five navigation scenes, image decoding, no horizontal overflow, no runtime errors.
- Browser-generated desktop and phone preview screenshots were captured and supplied to the Director.

## Review access
- Source page: https://github.com/CatVCanary/cvcguild-website/blob/quill/theatre-private-review/Q-review/theatre.html
- **Do not use `htmlpreview.github.io` as the only preview route.** Its link produced an empty page for the Director. A fully self-contained local review file with inlined images was created and tested instead.
- A short-name branch `quill-director-review` was also created for browsing the source without affecting `main`. It is a snapshot, not auto-synchronized with later review branch updates.

## Unresolved / must not falsely report complete
1. Exact approved parchment-and-landscape scenery artwork remains unidentified; only the design direction is established, not a verified exact file. Do not fabricate a replacement.
2. Production launch/merge, cvcguild.com DNS, GitHub Pages configuration, and Google Ad Grants resubmission require explicit Director approval and remain unchanged.
3. Existing privacy, programs, and gallery pages still need end-to-end human publication-permission and content review before launch.
4. A visual preview and code QA are not substitutes for review of approved artwork and final site publication readiness.

## Locked instructions
- Never redraw or replace the approved pavilion frames, banner, or Guild identity.
- Kingthings treatment of approved banner is image-owned and never to be retypeset.
- No AI-generated human illustrations; no dominant tree or foreground grass.
- Do not merge/publish anything until the Director explicitly approves.
