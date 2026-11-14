# Founding 20 — handoff and verification (14 Nov 2026)

Branch: `integration/founding-20-approved-interiors-20261114`.

Verified against GitHub: branch is 25 commits ahead of main and zero behind at inspection. It contains previews 001 and 007–020, catalogue expansion, and template-ID routing updates. The five approved large HTML previews 002–006 are **not committed to the branch**.

A complete 20-preview review archive exists as `VraxisRSVP_Founding20_Integrated_Site_REVIEW.zip` in the user's ChatGPT Library; it is a historical site snapshot, not a branch-ready merge. Do **not** replace the repository wholesale with that ZIP.

Offline archive structure check: all preview-001 through preview-020 files exist, catalogue links exist, expected preview editing links and embedded invitation frames are present, and checked local asset/page references resolve. Preview HTML totals 144,720,034 bytes. This **does not** mean browser rendering, media quality, upload/publish workflows, payments, or live RSVPs have passed.

## Finishing steps
1. Apply only the five approved `preview-002.html` through `preview-006.html` from the review archive to the integration branch, preserving all other GitHub changes.
2. Run mobile and desktop browser testing for all 20 preview routes, entrances, image crops, accessibility/reduced motion, media loading, and responsiveness.
3. Test one actual customer through preview → personalise → ready/editor → checkout → publish → dashboard → invite → RSVP from a separate device. Verify Supabase records, photo storage/public URLs, RLS, and paid orders via Lemon Squeezy checkout and webhook.
4. Keep customer-facing $15.99/$24.00 pricing; do not revert display prices to historical R250/R399.
5. Commit and merge only after successful checks. Production deployment and payment testing have **not** been completed.

Original approved designs and image assignments should not be changed merely to reduce file size. Optimise cautiously and recheck visual quality.