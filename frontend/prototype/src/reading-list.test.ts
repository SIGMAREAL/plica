import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReadingList, readSavedCases } from './reading-list-data.ts';

test('saved reading state recovers from malformed or unrelated browser data', () => {
  for (const value of ['broken', '{}', 'null', '42']) assert.deepEqual(parseReadingList(value), []);
  assert.deepEqual(parseReadingList('["case-a",null,3,"case-a","case-b"]'), ['case-a', 'case-b']);
});
test('upgrade merges original and current bookmarks once without resurrecting removed saves',()=>{
  const entries=new Map([['plica:saved','["old","same"]'],['plica-reading-list','["same","new"]']]);
  const storage={getItem:(k:string)=>entries.get(k)||null,setItem:(k:string,v:string)=>{entries.set(k,v);}};
  assert.deepEqual(readSavedCases(storage),['same','new','old']);
  assert.equal(entries.get('plica:saved'),'["old","same"]');
  entries.set('plica-reading-list','["new"]');assert.deepEqual(readSavedCases(storage),['new']);
  const blocked={getItem:storage.getItem,setItem:()=>{throw new Error('readonly');}};
  entries.delete('plica-reading-list-migrated');assert.deepEqual(readSavedCases(blocked),['new','old','same']);
});
