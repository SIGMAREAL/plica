import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCases, readRoute, libraryUrl } from './model.ts';

const cases = [
  { slug: 'a', title: 'Dropbox sync', question: '同步机制', summary: 'Conflict handling', company: 'Dropbox', product: 'Dropbox', category: 'storage', mechanisms: ['Consistency'] },
  { slug: 'b', title: 'Dropbox storage', question: '存储', summary: 'Immutable blocks', company: 'Dropbox', product: 'Dropbox', category: 'storage', mechanisms: ['Blocks'] },
  { slug: 'c', title: 'Meta storage', question: '存储', summary: 'Photo storage', company: 'Meta', product: 'Facebook Photos', category: 'storage', mechanisms: ['Blocks'] },
] as any;

test('search and all three facets intersect without conflating publisher and product', () => {
  assert.deepEqual(filterCases(cases, { q: 'BLOCKS', company: 'Dropbox', product: 'Dropbox', category: 'storage' }).map(c => c.slug), ['b']);
  assert.equal(filterCases(cases, { company: 'Meta', product: 'Dropbox' }).length, 0);
});
test('shared library URL preserves Unicode and independent filters', () => {
  const filters = { q: '同步 & storage', company: 'Dropbox', product: 'Dropbox', category: 'storage' };
  const route = readRoute(libraryUrl(filters));
  assert.equal(route.page, 'library');
  assert.equal(route.query.get('q'), filters.q);
  assert.equal(route.query.get('company'), 'Dropbox');
});
test('empty filters reset to a clean library route', () => {
  assert.equal(libraryUrl({ q: '', category: '', product: '', company: '' }), '#/library');
  assert.equal(readRoute('#/case/dropbox-nucleus-sync').id, 'dropbox-nucleus-sync');
});
