# Founding 20 integration — architecture audit (2026-11-14)

Status: **audit completed; integration not yet applied**. Work on this branch only; do not alter main or existing previews before approved assets are mapped.

## Existing customer journey (verified against main)
- index.html -> choose.html / catalogue.html -> preview-NNN.html -> personalise.html -> ready.html -> dashboard.html / manage.html -> invite.html?slug=...
- preview-NNN.html contains a TEMPLATE HTML string and renders it into iframe#invitation using srcdoc.
- ready.html embeds preview-NNN.html in iframe#frame, and offers studio editing. It uses assets/draft.js, assets/personalised-preview.js, assets/tap-editor.js.
- invite.html renders preview-NNN.html into iframe#template-frame and applies published edits.
- assets/backend.js initializes Supabase client; account.html, dashboard.html, ready.html, manage.html, invite.html use it.
- assets/personalised-preview.js and assets/tap-editor.js manage browser-side changes. Publishing/storage behaviour must be end-to-end tested.
- catalogue.html lists 20 preview links and USD prices.
- Lemon Squeezy integration has NOT been verified in inspected frontend files; do not claim payment is working.

## Integration invariants
1. Use approved interior HTML per ID 001-020; never overwrite it with earlier ZIP drafts.
2. Preserve existing wrapper pages and routes (preview-NNN.html), template IDs, customisation hooks, published invitation renderer, and dashboard links.
3. Replace the embedded TEMPLATE string in each wrapper, not the outer preview application.
4. Escape embedded HTML safely when serializing into JS; preserve script execution within srcdoc.
5. Embed or host reliable images, avoid duplicate/off-event photos; do not cross-reference other templates' assets.
6. Verify personalisation edits propagate to the preview AND public published invitation, including image upload.
7. Test mobile, desktop, RSVP and auth; preserve published customer data and RLS.
8. Confirm checkout/provider integration separately; do not invent Lemon Squeezy keys or endpoints.
9. Compare branches feature/vscode-local-template-media-20261113, fix/manual-template-image-uploads-20261113, fix/template-media-quality-20261113 and refactor/readable-template-interiors-20261113 before merging.
10. No deployment/merge without explicit verification.

## Next technical step
Collect the exact final approved 20 files and create a mapping manifest with file hashes. Diff current wrapper inner TEMPLATE versus approved HTML. Update one preview on this branch, test personalisation and published renderer, then batch remaining templates. Never deploy on assumption.
