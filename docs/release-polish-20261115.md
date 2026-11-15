# Final publishing polish — 15 November 2026

- Updated the sitemap to 37 public pages on the working GitHub Pages origin, with corresponding robots rules.
- Added a branded SVG favicon, one canonical URL per public page, and consistent public social-preview images.
- Marked account, management, editing and guest pages noindex/nofollow; excluded legacy studios and source/service paths from crawling. These are indexing hints, not access controls; existing Supabase authentication and ownership rules remain unchanged.
- Added a responsive custom 404 page with working absolute recovery links, including for nested missing paths.
- Replaced the inaccurate demonstration privacy text with the actual Supabase, Lemon Squeezy, local-draft, hosting, photograph and guest-response data flows. The privacy contact remains explicitly pending until the owner supplies a real address; no contact or retention promises were invented.
- Replaced the obsolete local-demo sign-in route with a history-replacing redirect to the real account sign-in, preserving its next parameter for the account page’s existing validation.
- All 17 repository/guest-link automated tests pass. Final privacy/404/storefront checks pass at 320/390/1440px, all local resource references resolve and the sitemap parses with 37 valid public routes. All 25 original/template definitions, their prices and integration logic are unchanged by this pass.

Commercial launch follow-up: supply a public support/privacy address; change and validate Lemon Squeezy live checkout/webhook configuration when ready for real payments, then update the policy’s test-mode sentence. The custom domain still does not resolve; use the working GitHub Pages URL until domain service is restored. No payment-mode settings or customer records were changed during this pass.
