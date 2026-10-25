"""Load, validate and export editorial data without importing a UI renderer."""
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT / 'content'
SCHEMA_VERSION = '1.0'


def slug(value):
    return re.sub(r'[^a-z0-9-]+', '-', value.lower()).strip('-')


def load_catalog(content_dir=CONTENT):
    catalog = {'schema_version': SCHEMA_VERSION}
    metadata = json.loads((content_dir / 'metadata.json').read_text(encoding='utf-8'))
    catalog['edition'] = metadata['edition']
    for name in ('cases', 'papers', 'terms', 'relations', 'mechanisms', 'products', 'comparisons'):
        catalog[name] = json.loads((content_dir / (name + '.json')).read_text(encoding='utf-8'))
    errors = validate_catalog(catalog)
    if errors:
        raise ValueError('\n'.join(errors))
    catalog['organizations'] = [
        {'id': slug(name), 'name': name}
        for name in sorted({c['company'] for c in catalog['cases']})
    ]
    return catalog


def validate_catalog(catalog):
    """Reject malformed records and relationships before publishing any output."""
    errors = []
    fields = {
        'cases': ('slug', 'company', 'product', 'category', 'title', 'date', 'source',
                  'question', 'summary', 'why', 'points', 'tradeoff', 'mechanisms',
                  'signal', 'readTime', 'type'),
        'terms': ('id', 'name', 'aliases', 'zh', 'definition', 'category'),
        'papers': ('id', 'title', 'authors', 'year', 'arxiv', 'category', 'question',
                   'summary', 'takeaways', 'related_case', 'status'),
        'relations': ('term', 'case', 'relation', 'review_status'),
        'mechanisms': ('id', 'label', 'english', 'description'),
        'products': ('id', 'name', 'description'),
        'comparisons': ('id', 'category', 'title', 'case_ids', 'description'),
    }
    list_fields = {'points', 'mechanisms', 'aliases', 'takeaways', 'case_ids'}
    for name, required in fields.items():
        records = catalog.get(name)
        if not isinstance(records, list):
            errors.append(name + ' must be an array')
            continue
        for i, record in enumerate(records):
            if not isinstance(record, dict):
                errors.append(f'{name}[{i}] must be an object')
                continue
            for field in required:
                value = record.get(field)
                if field in list_fields:
                    if not isinstance(value, list) or any(not isinstance(x, str) or not x for x in value):
                        errors.append(f'{name}[{i}] invalid {field} array')
                elif not isinstance(value, str) or not value.strip():
                    errors.append(f'{name}[{i}] missing or invalid {field}')
    if errors:
        return errors

    def unique(values, label):
        if len(values) != len(set(values)):
            errors.append('duplicate ' + label)

    for name in ('terms', 'papers', 'mechanisms', 'products', 'comparisons'):
        unique([x['id'] for x in catalog[name]], name + ' id')
    cases, terms, papers = (catalog[k] for k in ('cases', 'terms', 'papers'))
    case_ids = {c['slug'] for c in cases}
    term_ids = {t['id'] for t in terms}
    mechanism_ids = {m['id'] for m in catalog['mechanisms']}
    product_names = {p['name'] for p in catalog['products']}
    unique([c['slug'] for c in cases], 'case slug')
    unique([c['source'].lower().rstrip('/').replace('www.', '') for c in cases], 'source URL')
    unique([p['arxiv'] for p in papers], 'arXiv id')
    unique([p['name'] for p in catalog['products']], 'product name')
    organization_ids = [slug(n) for n in sorted({c['company'] for c in cases})]
    unique(organization_ids, 'organization id')
    for organization_id in organization_ids:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', organization_id):
            errors.append('invalid organization id: ' + repr(organization_id))
    for name in ('cases', 'terms', 'papers', 'comparisons'):
        for record in catalog[name]:
            if record['category'] not in mechanism_ids:
                errors.append('invalid category: ' + record['category'])
    for name in ('cases', 'terms', 'papers', 'mechanisms', 'products', 'comparisons'):
        key = 'slug' if name == 'cases' else 'id'
        for record in catalog[name]:
            if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', record[key]):
                errors.append(f'invalid {name} identifier: {record[key]}')
    for product in catalog['products']:
        if product['id'] != slug(product['name']):
            errors.append('product id does not match name: ' + product['id'])
    for case in cases:
        if case['product'] not in product_names:
            errors.append('missing product index: ' + case['product'])
        try:
            if re.fullmatch(r'\d{4}', case['date']):
                date(int(case['date']), 1, 1)
            else:
                date.fromisoformat(case['date'])
        except ValueError:
            errors.append('invalid date: ' + case['slug'])
        source = urlparse(case['source'])
        if source.scheme != 'https' or not source.netloc:
            errors.append('invalid https source: ' + case['slug'])
        if len(case['points']) != 3:
            errors.append('not exactly three editorial design points: ' + case['slug'])
    for relation in catalog['relations']:
        if relation['case'] not in case_ids or relation['term'] not in term_ids:
            errors.append('dangling relation: ' + str(relation))
        if relation['review_status'] not in ('editorial', 'verified'):
            errors.append('unreviewed relation: ' + str(relation))
        if relation['relation'] != 'explains_term':
            errors.append('unsupported term/case relation: ' + str(relation))
    unique([(r['term'], r['case']) for r in catalog['relations']], 'term/case relation')
    for paper in papers:
        if paper['related_case'] not in case_ids:
            errors.append('broken research connection: ' + paper['id'])
    for comparison in catalog['comparisons']:
        for case_id in comparison['case_ids']:
            if case_id not in case_ids:
                errors.append('dangling comparison: ' + comparison['id'] + '/' + case_id)
        if len(comparison['case_ids']) < 2:
            errors.append('comparison needs at least two cases: ' + comparison['id'])
        unique(comparison['case_ids'], 'comparison case: ' + comparison['id'])
    return errors


def legacy_index(catalog):
    """Keep the original public discovery index byte-compatible."""
    reviewed = {c['slug']: [] for c in catalog['cases']}
    for relation in catalog['relations']:
        reviewed[relation['case']].append(relation['term'])
    return {
        'schema_version': SCHEMA_VERSION,
        'edition': catalog['edition'],
        'relations': catalog['relations'],
        'cases': [dict(
            id=c['slug'], title=c['title'], question=c['question'], source=c['source'],
            company=c['company'], product=c['product'], category=c['category'], date=c['date'],
            editorial_summary=c['summary'], mechanisms=c['mechanisms'], term_ids=reviewed[c['slug']],
        ) for c in catalog['cases']],
        'papers': [dict(
            id=p['id'], title=p['title'], arxiv_id=p['arxiv'], source='https://arxiv.org/abs/' + p['arxiv'],
            summary=p['summary'], evidence_limit=p['status'],
        ) for p in catalog['papers']],
    }


def export_catalog(output):
    catalog = load_catalog()
    # Validate and read all inputs before creating a release directory.
    skill = (ROOT / 'skills/plica-architecture/SKILL.md').read_text(encoding='utf-8')
    files = {
        'api/v1/catalog.json': catalog,
        'api/v1/index.json': legacy_index(catalog),
        'api/v1/terms.json': catalog['terms'],
    }
    for relative, data in files.items():
        path = output / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    path = output / 'skill/plica-architecture/SKILL.md'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(skill, encoding='utf-8')
    return catalog
