# Q — Director website review: November 25, 2026

## Preview status
The third-party `htmlpreview.github.io` viewer has repeatedly appeared blank in the Director's mobile browser. **Do not give it as a working preview URL.** This branch is an unpublished code review, not a deployed GitHub Pages site.

## What is fixed
- Homepage references existing `assets/theatre-poster.webp` and renders in a self-contained local browser check.
- All eleven inner HTML pages had literal `{t}` labels in the primary navigation; these were replaced by Home, The Guild, Games, Hospitality, Visit, Photographs, Donate, and Contact.
- Local review checks: 12 HTML pages, no missing local page/asset paths when including the 11 authentic photos already present in GitHub; desktop and 393px phone tests showed the poster and no horizontal overflow.
- Home poster, locked approved Guild banner, characters and page appearance were not redrawn or redesigned.

## Canonical corrected source package
Guild Google Drive (account: cvcguild@gmail.com) → Website Working Assets → [Q_CVC_WEBSITE_REVIEW_FIXED_2026-11-25.zip](https://drive.google.com/file/d/1W_ACLXJl5yDNrd7v8s3q0rwtJdNVtGTs/view). This supersedes the earlier 12-page ZIP with broken navigation labels.

## Approval gates
No merge to main, deployment, custom-domain cutover, Squarespace change, Ad Grants resubmission, or external publication without separate Director authorization. To provide a reliable clickable website preview, deploy an explicitly approved staging site rather than continuing with the broken third-party HTML preview.

## Remaining QA
Actual mobile click testing on a deployed preview, accessible keyboard and tap targets, photo permissions, donation payment destinations, real-world performance and full browser QA.
