# GitHub Pages checkout fix — 14 November 2026

The GitHub Pages fallback previously failed checkout because the Edge Functions sent `Access-Control-Allow-Origin: https://vraxisrsvp.online`. Browsers at `https://vraxisjk36.github.io` therefore reported “Failed to fetch”.

## Changes

- Request-scoped CORS allowlist for the original domain and the GitHub Pages origin. Unknown/missing origins remain rejected. No wildcard CORS was added.
- Checkout return and published-invitation URLs preserve `/Vraxisrsvp` when requests originate on GitHub Pages.
- Dashboard invitation links use the current site's directory. Public share pages default to the working GitHub site, with optional `PUBLIC_SITE_URL` configuration.
- Removed the misleading native-field counter from Final Look. The shared template bindings were excluded from that counter, so zero did not mean no personalisation.
- Customer prices, authentication, ownership/payment checks, webhook validation, existing draft contents and payment mode remain unchanged.

## Deployed backend versions

- create-checkout: 9
- publish-invitation: 2
- submit-rsvp: 2
- invitation-share: 2

## Verification

`node --test tests/edge-origins.test.cjs` (Node 24+) passes seven tests covering both allowed origins, rejected origins, all 20 tier prices, redirect paths, published URLs, RSVP handler and share-page destination. These tests use local stubs and do not create real orders or RSVPs.

18 live HTTP checks pass: OPTIONS and POST for checkout/publishing/RSVP from both configured origins and an unrelated origin. Allowed preflights return 204 with the matching origin; unauthenticated checkout/publishing return readable 401 responses; invalid RSVP returns readable 400; unrelated origin returns 403 without an allow-origin header.

A live Chromium navigation could not run because this managed environment's certificate chain was not trusted by Chromium (`ERR_CERT_AUTHORITY_INVALID`). TLS verification was not disabled. Live HTTP checks used the environment's verified CA/proxy configuration. A signed-in customer checkout, completed payment and persisted RSVP remain to be verified in the user's browser.
