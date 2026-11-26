# CAT v. CANARY — STAGING REPAIR (AWAITING DIRECTOR REVIEW)
Date: 2026-11-25

**NOT APPROVED OR PUBLISHED.** This branch repairs a rejected visual pass and intentionally leaves the Director-approved homepage artwork unchanged.

## Why this branch exists
The previous inner pages, especially Donate, were overly generic: a large flat maroon section, rectilinear cards and undersized/inconsistent connection to the approved illustrated pavilion. Do not restore that styling as 'final'.

## Changes
- All inner pages inherit stronger crimson velvet, checkerboard, gold, ivory/linen and folio treatments via `assets/guild.css`.
- Donate `support.html` uses an ivory stage with a hanging-swag canopy, large editorial copy and a prominent framed crimson/gold giving invitation. Practical verified donor information, Benevity employer-match information and underlying full donation-page sections remain in place.
- No art generation, recoloring, cropping, repainting, typography substitution in the original banner or changes to the approved homepage HTML or image assets.
- A previous approved homepage remains immutable at `assets/theatre-poster.webp`; exact canonical logo file remains `assets/approved-guild-banner.png` (SHA-256 a1160741dc8ce0a1b650f6851aa96e94d41ddd12b9c09251758487be9f086f1e).

## Verification performed
- Compared this branch to `quill/final-review-2026-11-25`: only `assets/guild.css` and `support.html` changed before this note.
- Local browser rendering of 12 HTML pages at both 393 × 852 and 1440 × 900: 24 combinations; all had an H1 and no horizontal overflow or JS page errors. Approved original Guild banner decoded on all inner pages; donation CTA bottom at approximately 788 px on 393 × 852.
- Screenshots supplied directly in the conversation, not via unreliable third-party HTML preview service.
- Full production deployment, phone touch testing, donation payment flow, and photo-rights review are **not** claimed complete.

## Rules
- This is **a proposed repair**, not Director approval. Preserve existing approved site image. No merge to main, deployment, DNS, Squarespace change, or fundraising/payment action without explicit authorization.
- Future revision should compare screens against Director's locked, approved theatrical homepage and confirm actual rendering before announcing 'done'.
