# Named invitation links

Public guest-link Worker deployed through Sites. The main site remains on GitHub Pages. This service renders social metadata for published invitations, then embeds the existing guest page and its RSVP flow. Drafts are never exposed. Existing Supabase share URLs redirect here.

Guest URL: `https://our-moment-invitations.fernyplatypus32.chatgpt.site/<names>/inv-<existing-token>`

The name is descriptive; the existing random token identifies the invitation. Image URLs remain stable while the Worker obtains fresh signed photo URLs. Without a photo, it uses the neutral invitation image. Only the project’s invitation photo bucket is proxied.

Run `node --test tests/links.test.mjs` and `bash scripts/build.sh`. The `.openai/hosting.json` contains the existing project ID; reuse it for deployment. Push source before saving and deploying an artifact. No credentials belong in source. Main-site deployment does not automatically deploy this separate service.
