import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contextNavigation, sectionHref } from './layout/context-navigation.ts';
import { readRoute, type Catalog } from './model.ts';

const catalog: Catalog = JSON.parse(readFileSync(new URL('../../../backend/dist/api/v1/catalog.json', import.meta.url), 'utf8'));
const globalEntries = new Set(['#/library','#/products','#/companies','#/systems','#/graph','#/glossary','#/research','#/compare','#/about','#/skill','#/sponsor']);

test('column directories expose every record through child links without repeating global entries', () => {
  for (const [index, detail, records] of [['products','product',catalog.products],['companies','company',catalog.organizations],['systems','system',catalog.mechanisms],['glossary','term',catalog.terms],['research','paper',catalog.papers]] as const) {
    const selected = records.at(-1)!;
    const navigation = contextNavigation(catalog, readRoute('#/' + detail + '/' + selected.id));
    const items = navigation.groups.flatMap(g => g.items);
    assert.equal(items.length, records.length, index);
    assert.equal(items.filter(item => item.current).length, 1);
    assert.equal(items.find(item => item.current)?.href, '#/' + detail + '/' + selected.id);
    assert.ok(items.every(item => !globalEntries.has(item.href)));
  }
});

test('sidebar mechanism filtering preserves the library search and independent product/team facets', () => {
  const route = readRoute('#/library?' + new URLSearchParams({ q: '文件 & 一致性', product: 'Dropbox', company: 'Dropbox', category: 'old' }));
  const item = contextNavigation(catalog, route).groups[0].items[0];
  const result = readRoute(item.href);
  assert.equal(result.page, 'library');
  assert.equal(result.query.get('q'), '文件 & 一致性');
  assert.equal(result.query.get('product'), 'Dropbox');
  assert.equal(result.query.get('company'), 'Dropbox');
  assert.equal(result.query.get('category'), catalog.mechanisms[0].id);
});

test('graph directories preserve all four dimensions and resolve invalid selection to the displayed default', () => {
  const navigation = contextNavigation(catalog, readRoute('#/graph?dimension=invalid&id=unknown'));
  assert.equal(navigation.groups.length, 4);
  assert.equal(navigation.groups.find(g => g.open)?.id, 'systems');
  assert.equal(navigation.groups.flatMap(g => g.items).filter(item => item.current).length, 1);
  for (const group of navigation.groups) {
    assert.ok(group.items.length);
    for (const item of group.items) {
      const route = readRoute(item.href);
      assert.equal(route.query.get('dimension'), group.id);
      assert.ok(route.query.get('id'));
      assert.ok(!globalEntries.has(item.href));
    }
  }
});

test('article navigation includes only reviewed term relations', () => {
  const article = catalog.cases[0].slug;
  const extra = { id: 'pending-test-term', name: 'Pending', zh: '', definition: '', aliases: [], category: 'storage' };
  const modified = { ...catalog, terms: [...catalog.terms, extra], relations: [...catalog.relations, { case: article, term: extra.id, relation: 'explains_term', review_status: 'pending' }] };
  assert.ok(!contextNavigation(modified, readRoute('#/case/' + article)).groups.flatMap(g => g.items).some(item => item.id === extra.id));
});

test('local chapter URLs retain the SPA route and existing query parameters', () => {
  const route = readRoute('#/case/dropbox-nucleus-sync?source=目录&section=old');
  const result = readRoute(sectionHref(route, 'mechanisms'));
  assert.equal(result.page, route.page); assert.equal(result.id, route.id);
  assert.equal(result.query.get('source'), '目录'); assert.equal(result.query.get('section'), 'mechanisms');
});

test('sidebar facet counts respect intersecting product and team filters', () => {
  const route = readRoute('#/library?product=Dropbox&company=Stripe');
  assert.ok(contextNavigation(catalog, route).groups[0].items.every(item => item.count === 0));
});
