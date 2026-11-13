# Make every source file readable in VS Code

This repository contains compressed HTML pages, including some large inline JavaScript, CSS and base64-encoded image strings. **Formatting changes whitespace and indentation only; it should not change the design or pricing.**

## One-time setup

1. Install Node.js LTS if it is not installed.
2. Open the extracted project folder in VS Code.
3. Open **Terminal > New Terminal**.
4. Run:

   ```powershell
   npm install
   npm run format
   ```

The format command applies Prettier to **all HTML, CSS, JavaScript, JSON and Markdown files** in the repository, including all 15 `preview-*.html` templates. It also formats embedded CSS and JavaScript where Prettier supports it.

**Important:** Base64 image data and other long encoded strings are not split into readable lines, because splitting them could corrupt the media. For replacing images, use `assets/templates/README.md` instead.

Before publishing, inspect `git diff` and preview the invitations in your browser. To check formatting without changing files, run `npm run format:check`.

## Format one file

Right-click in an HTML file and choose **Format Document With… > Prettier**, or press `Shift+Alt+F` on Windows.

## Automatic formatting

The included VS Code workspace settings enable **Format on Save** when the Prettier extension is installed. These settings only affect your editor.

If `npm` is not recognized, install Node.js LTS and restart VS Code.

This setup does not automatically reformat files already downloaded until you run `npm run format`.
