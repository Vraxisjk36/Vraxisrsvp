# Founding 20 Integration — status on 14 November 2026

## GitHub branch
`integration/founding-20-approved-interiors-20261114`

**Do not merge or deploy without a final review.**

- Founding 20 catalogue extended with 016–020.
- New preview routes 016–020 added.
- Approved HTML committed to previews 001, 007–015, and 016–020 (15 of 20 total).
- Outstanding direct GitHub preview replacements: **002, 003, 004, 005, 006**. Large image-embedded HTML content hit connector transport limitations.
- Corrected template IDs in start.html, ready.html, assets/personalised-preview.js and invite.html so 016–020 can progress from preview to edit and published renderer.
- Existing Supabase / create-checkout integration and browser storage workflows left intact; no live auth, checkout, webhook, published-RSVP or permission tests performed.
- Complete local review bundle with all approved 20 templates generated as `VraxisRSVP_Founding20_Integrated_Site_REVIEW.zip`. It is based on the user-supplied prior `Vraxisrsvp-main.zip`; compare against live main before replacing the repository.

## Risks
1. Templates 002–006 should be updated from the exact approved files before merging.
2. Template media is very heavy (more than 140 MB of combined preview HTML before ZIP compression). Optimise without changing visuals; test mobile, bandwidth, caches.
3. Some invitation interiors include native RSVP forms that may show browser-only confirmations; verify the canonical public RSVP endpoint in invite.html is the actual persisted submission path.
4. Template 013 includes a remote Pexels image; test load and licence.
5. Ensure customer edits appear identically on `ready.html` and `invite.html` and photo objects survive cross-device publishing.
6. Check Supabase RLS, Lemon Squeezy edge function, webhook, price tier mapping ($15.99/$24.00), payments and hosted public links.

## Source-of-truth preservation
Approved interiors are held in the review ZIP. Main stays unchanged. Never overwrite newer main commits with the older archive.
