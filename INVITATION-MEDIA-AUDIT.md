# Invitation interior media audit

| Template | Interior changes |
| --- | --- |
| The Heirloom | Preserved the ribbon reveal artwork, replaced the wedding portrait, memories, ceremony and reception photographs, and changed the RSVP backdrop to candlelight. |
| The Grand Affair | Preserved the split-door artwork and animation. Replaced the hall, hero, story, ceremony, reception, programme and gallery imagery. Corrected the catalogue and preview display to R399. |
| The Modern Vow | Replaced the editorial hero, wedding imagery and venue photos. Adjusted the hero crop. |
| Midnight Club | Replaced the nightclub entrance, hero and atmospheric backgrounds. The gallery lightbox now reads the current thumbnail image. |
| The Social Edit | Updated the entrance, hero, tablescape and celebration photographs. Kept the dress inspiration panels. |
| After Hours | Replaced dinner and programme backgrounds and the interactive scene images. The gallery lightbox uses current images, and the reel retains a customer replacement as it advances. |
| The Little Garden | Replaced the woodland entrance and baby shower story image. |
| Moonlit Lullaby | Added a moonlit newborn photo to the book’s photo page. Kept the illustrated pages and moon animation. |
| The Big Little Secret | Updated the entrance, hero, story and gallery with maternity, baby shoes and gender reveal photographs. |
| Little Wonderland | Replaced woodland backgrounds and updated the baby and family photographs. Preserved the layered pop-up scenes. |
| Sunday, With Love | Replaced the hero, family gallery and parents’ photo with maternity and newborn imagery. |
| The Bridal Edit | Updated the magazine cover, opening and portrait with bridal photography. Replaced the memory gallery imagery. |
| Something Sweet | Replaced the cover and friends photograph with bridal imagery. |
| The Last Fling | Updated the hero, bride portrait and friends photo. Kept the outfit inspiration panels. |
| The Brotherhood | Replaced the hero and memories with a groom portrait and tuxedo group photography. |

The Final Look and guest page share a template-specific mapping for guided uploads. Customer photos take precedence over global template overrides. Tap edits use higher-resolution compression and the existing private storage upload flow. Published tap edits still depend on the public invitation function returning signed URLs by selector.

## Source and rights

The new stock files come from Pexels. Its [license](https://www.pexels.com/license/) permits using photos within templates sold commercially and makes attribution optional. It prohibits resale of unaltered stock as standalone copies and implied endorsement. The invitation photography is presented inside the invitation design.

- [002.webp](https://www.pexels.com/photo/elegant-wedding-couple-in-classic-ballroom-setting-32167201/)
- [003.webp](https://www.pexels.com/photo/elegant-wedding-couple-in-black-and-white-29369793/)
- [004.webp](https://www.pexels.com/photo/group-of-friends-at-the-party-3419643/)
- [005.webp](https://www.pexels.com/photo/birthday-celebration-with-elegant-dinner-setting-36956814/)
- [006.webp](https://www.pexels.com/photo/festive-table-setting-with-champagne-and-candlelight-29616283/)
- [007.webp](https://www.pexels.com/photo/charming-baby-shower-setup-with-pastel-decor-35204098/)
- [008.webp](https://www.pexels.com/photo/adorable-newborn-sleeping-in-cozy-studio-setup-34889332/)
- [009.webp](https://www.pexels.com/photo/colorful-gender-reveal-setup-at-kutaisi-park-31779567/)
- [011.webp](https://www.pexels.com/photo/adorable-baby-sneakers-with-balloons-background-36840022/)
- [012.webp](https://www.pexels.com/photo/women-in-pajamas-on-bridal-party-7507078/)
- [014.webp](https://www.pexels.com/photo/photo-of-the-bride-and-bridesmaids-9042000/)
- [015.webp](https://www.pexels.com/photo/four-men-in-tuxedos-standing-together-27691949/)
- [chapel.webp](https://www.pexels.com/photo/aisle-inside-a-church-5804254/)
- [candles.webp](https://www.pexels.com/photo/elegant-candlelit-wedding-reception-table-setup-30742026/)
- [palace.webp](https://www.pexels.com/photo/elegant-palace-corridor-with-chandelier-32477609/)
- [groom.webp](https://www.pexels.com/photo/man-in-suit-in-black-and-white-18247649/)
- [nightclub.webp](https://www.pexels.com/photo/people-dancing-in-a-nightclub-14065666/)
- [bridal.webp](https://www.pexels.com/photo/elegant-bridal-portrait-with-veil-close-up-35536273/)
- [woodland.webp](https://www.pexels.com/photo/serene-woodland-path-under-lush-green-canopy-40493004/)
- [maternity.webp](https://www.pexels.com/photo/intimate-maternity-portrait-in-black-and-white-31934208/)
- [shower.webp](https://www.pexels.com/photo/elegant-pink-themed-bridal-shower-party-table-37055248/)
- [expecting.webp](https://www.pexels.com/photo/expecting-couple-holding-baby-shoes-30315678/)

The ribbon and split-door assets were already embedded in the repository. Their original provenance and the rights for remaining legacy Unsplash files need individual verification. The original split-door image is 245 × 397 pixels and still needs a high-resolution replacement matched to the two-panel geometry.

## Verification and open items

- The 15 nested invitation documents and modified scripts passed JavaScript syntax checks. Local WebP references resolved and the files passed image integrity checks.
- The live Grand Affair palace entrance and gallery were checked before deployment of this branch. The live preview displayed $24.00 at that point.
- Desktop and mobile browser QA is pending. The local Chromium process exited on a denied socket call.
- Live customer upload, signed URL hydration, RSVP submissions, owner overrides and checkout remain unverified. The repository does not include the deployed checkout function. R399 is a catalogue and preview correction only.
- There are no video elements in the 15 invitation srcdocs. Catalogue videos are a separate feature. The After Hours film reel uses still images and animation.
