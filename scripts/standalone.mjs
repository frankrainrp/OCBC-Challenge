import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('dist');
let html = await readFile(resolve(root, 'index.html'), 'utf8');
const notices = await readFile(resolve('THIRD_PARTY_NOTICES.md'), 'utf8');
html = html.replace('</head>', () => `<!--\n${notices.replace(/--/g, '- -')}\n-->\n</head>`);
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
for (const [tag, source] of scripts) {
  const code = await readFile(resolve(root, source.replace(/^\.\//, '')), 'utf8');
  html = html.replace(tag, () => `<script type="module">${code.replace(/<\/script/gi, '<\\/script')}</script>`);
}
const styles = [...html.matchAll(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/g)];
for (const [tag, source] of styles) {
  const css = await readFile(resolve(root, source.replace(/^\.\//, '')), 'utf8');
  html = html.replace(tag, () => `<style>${css}</style>`);
}
await writeFile(resolve(root, 'index.html'), html);
await writeFile(resolve('Demo.html'), html);
console.log('Standalone demo ready: Demo.html and dist/index.html');
