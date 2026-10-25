import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyLocation, routeWithLegacyFilters } from './legacy-routes.ts';

test('old detail and list URLs preserve root/prefix, facets and section anchors',()=>{
  assert.equal(legacyLocation('/cases/dropbox-magic-pocket/','','#source'),'/#/case/dropbox-magic-pocket?section=source');
  assert.equal(legacyLocation('/plica/glossary/feature-flags/','',''),'/plica/#/term/feature-flags');
  assert.equal(legacyLocation('/plica/research/paxos-vs-raft/index.html','',''),'/plica/#/paper/paxos-vs-raft');
  const target=legacyLocation('/plica/library/','?system=storage&company=Dropbox&product=Dropbox&q=块','');
  assert.ok(target?.startsWith('/plica/#/library?'));const route=routeWithLegacyFilters(target!.slice(target!.indexOf('#')));
  assert.equal(route.query.get('category'),'storage');assert.equal(route.query.get('q'),'块');assert.equal(route.query.get('company'),'Dropbox');
  assert.equal(routeWithLegacyFilters('#/library?system=storage').query.get('category'),'storage');
  assert.equal(legacyLocation('/cases/old/','','#/case/new'),null);
});
