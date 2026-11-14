# Founding 20 deployment verification — 14 November 2026

## Applied to the existing integration branch

- Uploaded approved previews 002, 004 and 005 were committed in 98c848f.
- Uploaded reduced-size previews 003 and 006 complete the set. Existing 001 and 007–020 files were preserved.
- Fixed 006's missing tribute element binding and guarded removed legacy title nodes in 004's native Apply action.
- Personalise redirect accepts 001–020. Shared Final Look/public bindings cover designs without native editor controls; 003/004 invoke their native Apply actions after filling fields.
- Corrected public invitation regex escaping for names, multiline RSVP questions and deadline validation.
- Added narrow viewport rules for 020 inside the constrained Final Look frame.
- Prices remain USD 1599 / 2400 cents ($15.99 / $24.00).

## Supabase changes already applied

Remote migration `20261114185221_allow_founding_twenty_template_ids` extends the existing invitations constraint from 001–013 to 001–020. No grants, RLS policies or customer records were changed. Verified the constraint is validated and all 20 identifiers match.

```sql
set lock_timeout = '5s';
alter table public.invitations drop constraint invitations_template_id_check;
alter table public.invitations add constraint invitations_template_id_check
  check (template_id ~ '^0(0[1-9]|1[0-9]|20)$');
```

Deployed and read back `create-checkout` version 8: supports 016–020 using existing catalogue tiers (017 Prestige, other new entries Signature). All previous tier mappings and prices are retained.

Deployed and read back `lemonsqueezy-webhook` version 3: signed orders must match `LEMON_SQUEEZY_TEST_MODE`, using the same default as create-checkout. Previously all live orders were rejected even when checkout was configured for live mode. Secrets and mode configuration were not changed. HMAC validation, matching order, owner and price checks remain intact. The source files are included under supabase/functions.

## Verification and limitations

- All 20 preview routes loaded at 390px and 1440px; no root horizontal overflow. 006's initial script error was fixed and both widths rechecked.
- Guided builder → Final Look exercised for all 20, including saving draft details and checking names/venue in the invitation frame. Follow-up fixes were rechecked. Template 008 reveals its venue on a later story card; the initial card does not contain it.
- All 20 public invitation routes exercised with **stubbed** public-invitation / submit-rsvp responses. This verifies rendering, multiline extra questions, request payload and success UI, **not database persistence or publication**.
- 516 local top-level HTML page/asset references resolved. Embedded HTML has a pre-existing missing image in 001: `../assets/images/003/embedded-01.webp`. The exact approved source image is needed; no substitute image was invented.
- Remote Pexels image in 010 failed in the headless browser; the same URL returned HTTP 200 through curl. Browser media verification remains incomplete.
- Live create-checkout rejects unauthenticated requests with 401; live submit-rsvp rejects invalid payloads with 400.
- Local webhook checks verify mode isolation and invalid signatures using stubs. No payment was made and no production customer record was created.
- Supabase advisor reported leaked-password protection disabled, plus informational absence of public policies on the private webhook-event table. These settings were not changed.

Template 020 has decorative geometry outside the narrow frame; horizontal scrolling remains disabled. Its narrow grid and typography were adjusted, but a full visual review on a real mobile device is still required.

## Release status

**Do not merge yet.** No authenticated checkout, payment/webhook, photo upload, publishing or persisted cross-device RSVP journey has been verified. No authenticated test session was available.

GitHub Pages responds with a redirect to https://vraxisrsvp.online/. The environment's proxy rejects connections to that custom domain (CONNECT 403), so the production website and deployment cannot be verified here. Main remains unchanged until the required release checks pass. Earlier handoff/audit files describe the historical 15-template state; this report supersedes their missing-file status.
