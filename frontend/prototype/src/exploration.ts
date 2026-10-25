import { isReviewedRelation } from './model.ts';
import type { Case, Catalog } from './model';

export type Dimension = 'systems' | 'products' | 'companies' | 'terms';
export const graphDimensions: Record<Dimension, string> = { systems: '机制', products: '产品', companies: '团队', terms: '术语' };
export const graphDimension = (value: string | null): Dimension => value && Object.hasOwn(graphDimensions, value) ? value as Dimension : 'systems';
export interface ExplorationGroup { id: string; name: string; description: string; href: string; cases: Case[]; papers: Catalog['papers'] }
export function explorationGroups(catalog: Catalog, dimension: Dimension): ExplorationGroup[] {
  switch (dimension) {
    case 'products': return catalog.products.map(p => ({ ...p, href: '#/product/'+p.id, cases: catalog.cases.filter(c=>c.product===p.name), papers: [] }));
    case 'companies': return catalog.organizations.map(o => ({ ...o, description: '按公开资料的发布机构整理；具体作者与团队以原文为准。', href: '#/company/'+o.id, cases: catalog.cases.filter(c=>c.company===o.name), papers: [] }));
    case 'terms': return catalog.terms.map(t => ({ id:t.id, name:t.name, description:t.definition, href:'#/term/'+t.id, cases:catalog.cases.filter(c=>catalog.relations.some(r=>isReviewedRelation(r)&&r.case===c.slug&&r.term===t.id)), papers:[] }));
    default: return catalog.mechanisms.map(m => ({ id:m.id, name:m.label, description:m.description, href:'#/system/'+m.id, cases:catalog.cases.filter(c=>c.category===m.id), papers:catalog.papers.filter(p=>p.category===m.id) }));
  }
}
