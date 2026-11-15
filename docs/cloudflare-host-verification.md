# Cloudflare hostname verification

Verified `https://vraxisrsvp.kazadijoel36.workers.dev/` returns HTTP 200. The homepage, template metadata, optimised template 004, photo processor, guest viewer and dashboard match the latest optimised source. This establishes that the owner’s deployment is serving the current build; the Cloudflare management connector itself has not been verified.

The initial live preflights from this origin returned 403 for checkout, publishing and RSVP. The exact origin was added to the existing allowlists, preserving GitHub/custom-domain support and rejecting unrelated workers.dev origins. Live preflights now return 204 with the matching allow-origin header; an unrelated workers.dev test origin still returns 403.

Deployed functions: create-checkout v11, publish-invitation v3, submit-rsvp v3. Only the trusted-origin map changed. Prices, checkout mode, authentication, ownership validation, webhook processing and customer records were preserved. Automated origin, pricing, redirect and RSVP contract tests pass.

Email-confirmation redirects still need verification in Supabase Auth URL Configuration. The account page requests `https://vraxisrsvp.kazadijoel36.workers.dev/account.html` for new-account confirmation. This URL must be allowed there before relying on confirmation emails on the new host. Existing password sign-in was not tested with customer credentials, and no real purchase or RSVP was created. Named guest links currently continue to use the verified existing guest-link service and GitHub viewer; canonical URLs have not been switched as part of this origin-only fix.
