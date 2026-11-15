import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from './escapeHtml.js';

test('escapes HTML text and attribute delimiters', () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert('x')">&`), '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;');
});

test('handles nullish and non-string values', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(42), '42');
});
