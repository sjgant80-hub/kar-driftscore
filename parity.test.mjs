// parity.test.mjs — the live page must run the EXACT gated kernel, byte for byte.
// Extracts the inlined kernel source from index.html and asserts it equals kernel.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const MARK_OPEN = '<script type="text/plain" id="kernel-src">';
const MARK_CLOSE = '</script>';

test('index.html inlines kernel.mjs byte-for-byte (live logic == gated logic)', () => {
  const kernel = readFileSync(new URL('./kernel.mjs', import.meta.url), 'utf8');
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

  const start = html.indexOf(MARK_OPEN);
  assert.ok(start >= 0, 'kernel-src script block not found in index.html');
  const contentStart = start + MARK_OPEN.length;
  const end = html.indexOf(MARK_CLOSE, contentStart);
  assert.ok(end >= 0, 'closing </script> not found');

  const inlined = html.slice(contentStart, end);
  assert.notEqual(inlined.trim(), '/*__KERNEL_SRC__*/',
    'index.html still has the placeholder — run `node build-page.mjs`');
  assert.equal(inlined, kernel,
    'inlined kernel differs from kernel.mjs — run `node build-page.mjs` to re-sync');
});
