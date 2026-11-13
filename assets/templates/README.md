# Replace invitation photos directly in VS Code

No dashboard upload is required. Download the latest main ZIP, open it in VS Code and create a folder for the template you want to edit:

| ID | Template |
|---|---|
| 001 | The Heirloom |
| 002 | The Grand Affair |
| 003 | The Modern Vow |
| 004 | Midnight Club |
| 005 | The Social Edit |
| 006 | After Hours |
| 007 | The Little Garden |
| 008 | Moonlit Lullaby |
| 009 | The Big Little Secret |
| 010 | Little Wonderland |
| 011 | Sunday, With Love |
| 012 | The Bridal Edit |
| 013 | Something Sweet |
| 014 | The Last Fling |
| 015 | The Brotherhood |

Example: put your file at `assets/templates/004/image-1.jpg`. The preview automatically uses it for the first ordinary image element, if present. Use `image-2.jpg` for the second, etc. If an image element has `data-photo="hero"`, its filename is `hero.jpg` instead. Other named slots use their `data-photo` or `data-img` values. Each embedded invitation iframe starts its own image numbering.

**Grand Affair palace doors:** put `palace-entrance.jpg` inside `assets/templates/002/` to replace the CSS door artwork without changing the animation.

Only JPG filenames are automatically detected. Convert PNG/WebP to JPG, or change the filename construction in `assets/local-template-media.js`. Use descriptive, high-resolution photos and compress them for the web.

Missing local files are ignored; original photographs remain visible. This system affects default preview imagery, not the catalogue covers, not every CSS background/video, and not customer-specific uploaded photos. Existing published cloud media overrides can take precedence. It does not add a ZIP-based media upload service or guarantee that all 15 designs have matching editable image elements.

After editing, commit/push your images to GitHub Pages. A local `file://` preview may not behave exactly like a hosted preview; use VS Code Live Server or a local HTTP server.
