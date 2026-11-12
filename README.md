# VraxisRSVP V6 — Studio integration pass

Multi-page website based on V5. All 13 original embedded invitation HTML strings are preserved.

## Added
- Template Studio saves labelled text fields and native editor form values in browser localStorage.
- Photo replacement for labelled image slots, with compression and position controls.
- Export/import draft JSON, including compressed image data.
- Onboarding names/date/location are applied to matching labelled template fields when available.
- Native template editors remain accessible.

## Limitations
- This is a local browser draft, not a published invitation or secure account.
- The original templates have different internal structures. Unlabelled fields, custom canvas imagery, and animations with hard-coded content may need template-specific bindings.
- Photo framing uses CSS object-position, not destructive crop; storage quotas vary by browser. Export drafts as backups.
- For reliable navigation between pages, host the extracted folder over HTTPS. Android content:// file URLs are not a reliable multipage testing environment.
- No backend, payment or live RSVP collection.