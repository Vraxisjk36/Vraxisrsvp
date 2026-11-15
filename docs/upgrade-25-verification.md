# November 2026: incremental site upgrade and Prestige expansion

## What changed

The existing site layouts and all twenty approved invitation interiors remain intact. Shared finishing adds consistent focus/touch behaviour, more reliable artwork, calmer motion and native cross-document transitions with reduced-motion support. Transition cancellation is handled without changing links, navigation history or forms.

About now has actual invitation photography and correct USD pricing and collection size. Journal gains imagery, reading aids and three new guides (host checklist, wording for non-wedding celebrations, photographs). Collection gains a persistent local shortlist, sorting, new categories, and accurate counts: 25 total / 14 Signature / 11 Prestige. Dashboard gains invitation artwork, name/occasion search and sorting without changing authentication or ownership checks. Landing keeps its layout, with the new designs featured and final interaction/detail polish.

Original non-wedding Prestige designs 021–025:

- The Velvet Hour — Birthday; Art Deco opening, private-club ticket and evening itinerary.
- A Sky Full of Wonder — Baby Shower; lunar opening, interactive star wishes and soft cloud artwork.
- The Next Chapter — Graduation; book opening, academic arches and editorial chapter layout.
- An Open Door — Housewarming; illustrated door opening, warm house notes and tiled details.
- The Unhurried Club — Retirement; travel stamp opening, coastal postcard and boarding pass.

Each costs $24.00, has original local SVG cover art, editable text and photographs, calendar export, map links, accessible photo viewing, an expandable programme and the existing published RSVP integration. Editable sources and embedded previews match. Existing Signature pricing remains $15.99; the existing payment test mode, variant IDs, webhook and publishing functions are preserved.

## Guest link correction

The public guest page decodes the invitation JSON directly; it never navigates a guest frame to a collection preview. A hidden frame becomes visible only after personalisation and saved edits apply. Owner template-photo overrides remain supported. Native demo forms are replaced with the real RSVP entry point, now a dialog over the invitation. Storefront navigation and footer are not visible in the published experience. Internal anchor navigation scrolls without adding fragment history. No guest history manipulation or forced return URLs were added. A browser or messaging app retains control over its own Back behaviour.

The JSON decoder uses a linear scan so legacy files with large embedded images do not overflow the regex engine. It parses JSON and does not execute storefront scripts.

## Verification performed

- All original twenty embedded invitation documents match previous main.
- All 25: six-step builder, text edits, undo/redo, reload persistence; published photos and real RSVP request contracts using local backend stubs.
- Five new invitations: their distinctive interactive controls, local artwork, photo dialog, preview-only reply message, responsive layouts at 320/390/768/1440px, calendar download content, map links and reduced motion.
- Core pages: 320/390/768/1440px, no horizontal overflow; collection edition/category counts, saved shortlist persistence, sorting and resets.
- Authenticated dashboard with local records: search, filtering, sorting, artwork and correct new-design pricing.
- Guest route in a nested share frame: no collection wrapper; internal links and RSVP modal add no history entries; one Back returns to the referring page.
- Cloud-save retry and existing/new photo preservation/removal regression tests use local stubs.
- Twelve repository tests plus five existing guest-link service tests pass.
- Local HTML script syntax and resource-reference checks pass.

## Backend release

The live `invitations_template_id_check` previously permitted only 001–020. Supabase migration `20261115033137_expand_invitation_templates_to_twenty_five` adds 021–025 and was verified as validated. No customer invitation rows were changed. `create-checkout` version 10 adds only the five Prestige tier mappings; its remainder matches the previous live version 9. Security advisory findings are unchanged: webhook-event table intentionally has RLS with no client policy; leaked-password protection is an existing Auth warning ([Supabase guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).

Live deployment status and HTTP resource checks are verified separately after publishing. No new purchases or messages are sent by QA. Real WhatsApp delivery and app-controlled Back behaviour are not simulated as completed transactions. The custom domain remains on registry hold; GitHub Pages is the working storefront URL.
