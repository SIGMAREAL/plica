import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { explorationGroups } from './exploration.ts';
import { filterCases, type Catalog } from './model.ts';

const catalog: Catalog=JSON.parse(readFileSync(new URL('../../../backend/dist/api/v1/catalog.json',import.meta.url),'utf8'));
test('every catalog case remains reachable by product, team and mechanism',()=>{
  for(const dimension of ['products','companies','systems'] as const){
    const groups=explorationGroups(catalog,dimension);
    assert.equal(groups.length,catalog[dimension==='companies'?'organizations':dimension==='systems'?'mechanisms':'products'].length);
    assert.deepEqual(groups.flatMap(g=>g.cases.map(c=>c.slug)).sort(),catalog.cases.map(c=>c.slug).sort());
    assert.equal(new Set(groups.map(g=>g.href)).size,groups.length);
  }
});
test('term edges use reviewed records and papers retain their research track',()=>{
  const invalid={...catalog,relations:[...catalog.relations,{case:catalog.cases[0].slug,term:'not-reviewed',review_status:'pending',relation:'explains_term'}],terms:[...catalog.terms,{id:'not-reviewed',name:'Unreviewed',zh:'',definition:'',aliases:[],category:'storage'}]};
  assert.equal(explorationGroups(invalid,'terms').find(g=>g.id==='not-reviewed')?.cases.length,0);
  assert.equal(explorationGroups(catalog,'systems').flatMap(g=>g.papers).length,catalog.papers.length);
  for(const dimension of ['companies','products','terms'] as const)assert.equal(explorationGroups(catalog,dimension).flatMap(g=>g.papers).length,0);
});
test('case search includes the original localized mechanism classification',()=>{
  const group=catalog.mechanisms[0];
  const results=filterCases(catalog.cases,{q:group.label},catalog.mechanisms);
  for(const c of catalog.cases.filter(c=>c.category===group.id))assert.ok(results.includes(c));
});
