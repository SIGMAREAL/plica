#!/usr/bin/env python3
"""Check editorial entity uniqueness, referential integrity, and source metadata."""
import json,re
from urllib.parse import urlparse
from pathlib import Path
root=Path(__file__).parent
cases=json.loads((root/'cases.json').read_text())
papers=json.loads((root/'papers.json').read_text())
terms=json.loads((root/'terms.json').read_text())
rels=json.loads((root/'relations.json').read_text())
import importlib.util
spec=importlib.util.spec_from_file_location('generator',root/'build.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
errors=[]
def unique(items,key,label):
 values=[key(x) for x in items]
 if len(values)!=len(set(values)):errors.append('duplicate '+label)
required=['slug','company','product','category','title','date','source','question','summary','why','points','tradeoff','mechanisms','signal','readTime']
for i,c in enumerate(cases):
 for field in required:
  if not c.get(field):errors.append(f'case[{i}] missing {field}')
 if c['category'] not in m.CATMAP:errors.append('invalid category: '+c['slug'])
 if c['product'] not in m.PRODUCT_INFO:errors.append('missing product index: '+c['product'])
 if not re.fullmatch(r'\d{4}(?:-\d\d-\d\d)?',c['date']):errors.append('invalid date: '+c['slug'])
 if not urlparse(c['source']).scheme=='https':errors.append('non-https source: '+c['slug'])
 if len(c['points'])!=3:errors.append('not exactly three editorial design points: '+c['slug'])
unique(cases,lambda c:c['slug'],'case slug')
unique(cases,lambda c:c['source'].lower().rstrip('/').replace('www.',''),'source URL')
unique(terms,lambda t:t['id'],'term id')
unique(papers,lambda p:p['arxiv'],'arXiv id')
cs={c['slug'] for c in cases};ts={t['id'] for t in terms}
for r in rels:
 if r['case'] not in cs or r['term'] not in ts:errors.append('dangling relation: '+str(r))
 if r.get('review_status') not in ('editorial','verified'):errors.append('unreviewed relation: '+str(r))
unique(rels,lambda r:(r['term'],r['case']),'term/case relation')
for paper in papers:
 if paper['related_case'] not in cs:errors.append('broken research connection '+paper['id'])
if errors:raise SystemExit('\n'.join(errors))
print(f'Content validated: {len(cases)} production cases; {len(papers)} research papers; {len(terms)} terms; {len(rels)} reviewed relations; {len(set(c["company"] for c in cases))} publishers')
