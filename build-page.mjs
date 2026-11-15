// build-page.mjs — inject the EXACT bytes of kernel.mjs into index.html.
// The page loads these bytes at runtime, so the live logic is the gated logic.
// parity.test.mjs then fails CI if index.html and kernel.mjs ever drift apart.
import { readFileSync, writeFileSync } from 'node:fs';

const MARK_OPEN = '<script type="text/plain" id="kernel-src">';
const MARK_CLOSE = '</script>';

const kernel = readFileSync(new URL('./kernel.mjs', import.meta.url), 'utf8');
let html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

const start = html.indexOf(MARK_OPEN);
if (start < 0) { console.error('build-page: kernel-src marker not found'); process.exit(1); }
const contentStart = start + MARK_OPEN.length;
const end = html.indexOf(MARK_CLOSE, contentStart);
if (end < 0) { console.error('build-page: closing </script> not found'); process.exit(1); }

html = html.slice(0, contentStart) + kernel + html.slice(end);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('build-page: injected', kernel.length, 'bytes of kernel.mjs into index.html');
