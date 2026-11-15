import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDraft } from './draftStorage.js';

function createStorage(value) {
  return {
    getItem(key) {
      assert.equal(key, 'registre_draft');
      return value;
    }
  };
}

test('restores and migrates the saved draft', () => {
  const migrated = { siteName: 'CSS Casablanca', rows: [] };
  const result = loadDraft(createStorage(JSON.stringify({ siteName: 'Old' })), () => ({}), raw => {
    assert.deepEqual(raw, { siteName: 'Old' });
    return migrated;
  });
  assert.equal(result, migrated);
});

test('uses defaults when no draft exists', () => {
  const defaults = { siteName: 'Default' };
  assert.equal(loadDraft(createStorage(null), () => defaults, value => value), defaults);
});

test('uses defaults when storage is unavailable or the draft is invalid', () => {
  const defaults = { siteName: 'Default' };
  assert.deepEqual(loadDraft(() => { throw new Error('blocked'); }, () => defaults, value => value), defaults);
  assert.deepEqual(loadDraft(createStorage('{invalid'), () => defaults, value => value), defaults);
});
