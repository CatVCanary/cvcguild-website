# Q — WEBSITE REPAIR STATE (2026-11-23)

## Current review
- Branch: `quill/theatre-private-review` (NOT merged or published).
- Visual browser preview: https://htmlpreview.github.io/?https://github.com/CatVCanary/cvcguild-website/blob/quill/theatre-private-review/Q-review/theatre.html
- Mobile QA preview: https://htmlpreview.github.io/?https://github.com/CatVCanary/cvcguild-website/blob/quill/theatre-private-review/Q-review/mobile-check.html
- Review file: `Q-review/theatre.html`; mobile QA file: `Q-review/mobile-check.html`.

## Changes actually committed this session
1. Preserved both unmodified Director-locked frames from `Q-LOCKED/frames/`; corrected mobile layout to preserve 941×1672 artwork proportions.
2. Removed five unauthorized scene SVG drawings and one invented panorama drawing. Neutral ivory staging canvas remains temporary.
3. Added direct information-page links inside each of the five theatre scene panels.
4. Changed the five stage-navigation signs to actual hash links, with CSS `:target` fallback when a third-party HTML preview strips JavaScript. The JS-enhanced animated scene switch remains in place.
5. Corrected the mobile QA text for the single, full-height approved image.
6. Fixed a nonexistent `photos/8.jpg` link in unpublished `index.html` with existing `photos/26.jpg` (actual Guild game-playing photo inspected visually).
7. Audited all 13 HTML pages on this branch: no unresolved relative href/src references after repair.

## Hard rules
- Use exact canonical assets from `Q-LOCKED/frames/LOCKED_MANIFEST.json`. Never redraw or swap either frame.
- Do not substitute the unapproved scene background, use invented human artwork, or apply a generic redesign.
- Do not merge to main, change deployment/DNS, publish to `cvcguild.com`, or resubmit Ad Grants without explicit approval.
- Preserve the approved Guild banner and source art.

## Verified vs unverified
- Verified: GitHub commits applied to review branch; target asset files exist; initial third-party preview loaded rendered HTML rather than showing GitHub code.
- Unverified: full 393×852 mobile visual QA after latest changes, final interactive menu check after CSS-only fallback, complete cross-browser accessibility and form testing.
- Outstanding: exact approved scene-background asset still not positively identified; fallback must not be represented as final approval.
- Broader theatrical scene system for all page content and finished launch-level QA remains unfinished. Do not state site is launch-ready.

## User-facing next step
Use the visual preview link above, not the GitHub code page. Keep working from this branch until design, behavior, and mobile review are approved.
