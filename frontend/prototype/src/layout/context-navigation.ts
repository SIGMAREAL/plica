import { explorationGroups, graphDimension, graphDimensions, type Dimension } from '../exploration.ts';
import { filterCases, isReviewedRelation, libraryUrl, type Catalog } from '../model.ts';

export interface ContextRoute { page: string; id: string; query: URLSearchParams }
export interface ContextItem { id: string; label: string; href: string; count?: number; current?: boolean; depth?: number }
export interface ContextGroup { id: string; label: string; items: ContextItem[]; open?: boolean }
export interface ContextNavigation { title: string; search?: string; groups: ContextGroup[]; outline?: boolean }


export function contextNavigation(catalog: Catalog, route: ContextRoute): ContextNavigation {
  const dimensions = { products: 'products', product: 'products', companies: 'companies', company: 'companies', systems: 'systems', system: 'systems' } as const;
  const dimension = dimensions[route.page as keyof typeof dimensions];
  if (dimension) {
    const name = graphDimensions[dimension];
    return { title: name + '目录', search: '查找' + name, groups: [{ id: dimension, label: name + '索引', items: explorationGroups(catalog, dimension).map(g => ({ id: g.id, label: g.name, href: g.href, count: g.cases.length, current: route.id === g.id })) }] };
  }
  if (route.page === 'library') {
    const facets = Object.fromEntries(['q','company','product'].map(key => [key, route.query.get(key) || '']));
    return { title: '浏览案例', groups: [{ id: 'categories', label: '按机制筛选', items: catalog.mechanisms.map(m => ({ id: m.id, label: m.label, href: libraryUrl({ ...facets, category: m.id }), count: filterCases(catalog.cases, { ...facets, category: m.id }, catalog.mechanisms).length, current: route.query.get('category') === m.id })) }] };
  }
  if (route.page === 'graph') {
    const activeDimension = graphDimension(route.query.get('dimension'));
    return { title: '图谱目录', search: '查找节点', groups: (Object.entries(graphDimensions) as [Dimension, string][]).map(([dim, label]) => {
      const groups = explorationGroups(catalog, dim).filter(g => g.cases.length || g.papers.length);
      const requestedId = route.query.get('id') || route.query.get('category');
      const activeId = groups.find(g => g.id === requestedId)?.id || groups[0]?.id;
      return { id: dim, label, open: dim === activeDimension, items: groups.map(g => ({ id: dim + ':' + g.id, label: g.name, count: g.cases.length, href: '#/graph?' + new URLSearchParams({ dimension: dim, id: g.id }), current: dim === activeDimension && activeId === g.id })) };
    }) };
  }
  if (route.page === 'glossary' || route.page === 'term') return { title: '术语目录', search: '查找术语', groups: [{ id: 'terms', label: '概念索引', items: catalog.terms.map(t => ({ id: t.id, label: t.name, href: '#/term/' + t.id, current: route.id === t.id })) }], outline: route.page === 'term' };
  if (route.page === 'research' || route.page === 'paper') return { title: '论文目录', search: '查找论文', groups: [{ id: 'papers', label: '研究索引', items: catalog.papers.map(p => ({ id: p.id, label: p.title, href: '#/paper/' + p.id, current: route.id === p.id })) }], outline: route.page === 'paper' };
  if (route.page === 'case') return { title: '阅读导航', outline: true, groups: [{ id: 'related-terms', label: '关联术语', items: catalog.terms.filter(t => catalog.relations.some(r => isReviewedRelation(r) && r.case === route.id && r.term === t.id)).map(t => ({ id: t.id, label: t.name, href: '#/term/' + t.id })) }].filter(g => g.items.length) };
  return { title: '本页导航', outline: true, groups: [] };
}

export function sectionHref(route: ContextRoute, section: string) {
  const query = new URLSearchParams(route.query); query.set('section', section);
  return '#/' + (route.page === 'home' ? '' : route.page) + (route.id ? '/' + route.id : '') + '?' + query;
}
