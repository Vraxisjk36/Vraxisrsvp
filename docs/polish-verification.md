# Collection, builder, editor and sharing polish

## Release scope

- Twenty local cover images, accurate category and edition totals, search and empty states.
- New responsive landing page, consistent collection navigation and visible focus states.
- Six-step builder with validation, scoped drafts, optional photos and review shortcuts.
- Full-screen editor with Explore/Edit modes, phone/wide previews, text/photo/background edits, undo/redo and persisted edits.
- Cloud-save retry reuses the saved invitation; photo ordering, existing uploads and removal are preserved.
- Named guest links with server-rendered social metadata, neutral fallback art, copy confirmation and quick-share options.
- Real RSVP entry points replace native template demo forms on published pages.
- Supabase SDK pinned locally at the existing version. Checkout prices and test mode preserved.

## Verification

- All twenty approved embedded template interiors match the previous main commit.
- Browser tests at 390px and 1440px: homepage and collection have no horizontal overflow; every cover loads; all category/search states pass.
- Edition totals: 14 Signature ($15.99), 6 Prestige ($24.00); category totals are computed from matching templates.
- All twenty designs: six-step editing and text persistence; guided photos; published invitation rendering and RSVP submission, using local backend stubs.
- Targeted photo and background editing: replacement, undo, redo, reload and Explore/Edit mode.
- Save retry and photo preservation/removal tests use local backend stubs.
- Sharing: copied confirmation, blocked-clipboard fallback, named links, WhatsApp/Facebook/email/native payloads and dialog dismissal.
- Nine backend tests and five guest-link Worker tests cover pricing, origins, legacy redirects, signed photo/background access, published-only data, metadata and escaping.

Browser checks use local pages. Live HTTP checks and deployment status are checked separately at release. No real social messages or new purchases are sent by these tests. Social apps may cache previews; copy a fresh link from the updated dashboard. The original custom domain remains unavailable due to its registry hold; the GitHub Pages URL is the supported frontend.
