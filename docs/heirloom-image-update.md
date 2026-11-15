# The Heirloom: contextual original imagery

The default artwork in template 001 has been replaced with five original, text-only-generated scenes: blank ivory/burgundy stationery, an estate-garden couple portrait, a first-dance portrait, a garden ceremony and a candlelit reception. No third-party reference image was supplied for this replacement set. These are original generated assets, not described as CC0 or verified public-domain stock. Generation provenance and file references are recorded in `heirloom-image-provenance.json`.

The entrance, hero, both memory frames, ceremony/reception cards, atmospheric backgrounds, collection cover and matching journal thumbnail now use these images. The new cover is 47 KB; default 960px images are approximately 118–209 KB, with responsive variants up to their original 1536px width. The image viewer now uses responsive source choices too.

The blank stationery has no baked-in names, monogram or decorative wording. The memory frames contain photographs rather than photographs of other invitation cards. Ceremony/reception slots show their respective venues. Existing editable names and wording, entrance animation, price, customer uploads, owner-selected overrides, publishing and RSVP behaviour remain intact.

Verification: mobile and desktop image loading/crops, opening, memory viewer, and replacement-photo clearing of default srcsets; original body structure/text/controls; all existing repository tests. Cloudflare account management still returned an authentication loop, so its deployed copy must be checked independently after the source push. A fresh complete static build can be produced with `python scripts/build-static.py` and uploaded as the contents of `dist`.
