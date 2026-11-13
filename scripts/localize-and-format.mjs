import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import prettier from 'prettier';

const root = process.cwd();
const files = await fs.readdir(root);
const interiors = files.filter(name => /^interior-\d{3}\.html$/.test(name));
const failures = [];
let downloaded = 0;
for (const filename of interiors) {
  const id = filename.match(/\d{3}/)[0];
  const target = path.join(root, filename);
  let html = await fs.readFile(target, 'utf8');
  const matches = [...html.matchAll(/https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)(?:\?[^\s"'<>\\)]*)?/g)];
  const photos = new Map();
  for (const match of matches) {
    const photo = match[1];
    if (photos.has(photo)) continue;
    const local = `assets/images/${id}/${photo}.jpg`;
    const disk = path.join(root, local);
    photos.set(photo, local);
    try {
      await fs.access(disk);
    } catch {
      await fs.mkdir(path.dirname(disk), { recursive: true });
      const url = `https://images.unsplash.com/${photo}?w=1800&q=85&fit=crop&fm=jpg`;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 1000) throw Error('Unexpectedly small image');
        await fs.writeFile(disk, bytes);
        downloaded++;
      } catch (error) {
        failures.push(`${filename}: ${photo} (${error.message})`);
        photos.delete(photo);
      }
    }
  }
  html = html.replace(/https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)(?:\?[^\s"'<>\\)]*)?/g, (url, photo) => photos.get(photo) ?? url);
  await fs.writeFile(target, html);
}
const formatted = [];
for (const filename of files) {
  if (!/\.html$/.test(filename)) continue;
  try {
    const original = await fs.readFile(filename, 'utf8');
    const result = await prettier.format(original, { filepath: filename, printWidth: 100, htmlWhitespaceSensitivity: 'css' });
    await fs.writeFile(filename, result);
    formatted.push(filename);
  } catch (error) {
    failures.push(`Formatter ${filename}: ${error.message.split('\n')[0]}`);
  }
}
for (const dir of ['assets']) {
  async function walk(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(css|js)$/.test(entry.name) && !entry.name.endsWith('.min.js')) {
        try {
          const original = await fs.readFile(full, 'utf8');
          const result = await prettier.format(original, { filepath: full, printWidth: 100 });
          await fs.writeFile(full, result);
          formatted.push(full);
        } catch (error) {
          failures.push(`Formatter ${full}: ${error.message.split('\n')[0]}`);
        }
      }
    }
  }
  await walk(dir);
}
await fs.writeFile('MEDIA_REFACTOR_REPORT.md', [
  '# Media refactor report',
  '',
  `Local Unsplash images downloaded: ${downloaded}`,
  `Files formatted: ${formatted.length}`,
  `Warnings: ${failures.length}`,
  '',
  ...failures.map(x => '- ' + x),
  '',
  'Image sources originally came from Unsplash; check each photograph for appropriateness and applicable licensing.',
  'The original embedded Base64 assets in templates 001 and 002 have been extracted into assets/images.',
  'Replace any image by changing its local src or CSS url path in interior-###.html.',
  'Some JS-generated photos, videos, and other background assets may still require manual attention.',
].join('\n') + '\n');
console.log(`Downloaded ${downloaded} images, formatted ${formatted.length} files, warnings ${failures.length}`);
if (failures.length) console.warn(failures.join('\n'));
