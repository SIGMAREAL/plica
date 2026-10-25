export interface Case {
  slug: string; company: string; product: string; category: string; title: string;
  question: string; summary: string; why: string; points: string[]; tradeoff: string;
  source: string; date: string; type: string; mechanisms: string[]; signal: string;
  readTime: string; featured?: boolean;
}
export interface Term { id: string; name: string; aliases: string[]; zh: string; definition: string; category: string }
export interface Paper { id: string; title: string; authors: string; year: string; arxiv: string; category: string; question: string; summary: string; takeaways: string[]; related_case: string; status: string }
export interface Relation { case: string; term: string; relation: string; review_status: string }
export const isReviewedRelation = (relation: Relation) => ['editorial','verified'].includes(relation.review_status);
export interface Catalog {
  schema_version: string; edition: string; cases: Case[]; terms: Term[]; papers: Paper[]; relations: Relation[];
  mechanisms: { id: string; label: string; english: string; description: string }[];
  products: { id: string; name: string; description: string }[];
  organizations: { id: string; name: string }[];
  comparisons: { id: string; category: string; title: string; description: string; case_ids: string[] }[];
}
export type Filters = Partial<Record<'q' | 'company' | 'product' | 'category', string>>;
export function filterCases(cases: Case[], filters: Filters, mechanisms: Catalog['mechanisms'] = []) {
  const query = (filters.q || '').trim().toLocaleLowerCase();
  return cases.filter(c =>
    (!filters.company || c.company === filters.company) &&
    (!filters.product || c.product === filters.product) &&
    (!filters.category || c.category === filters.category) &&
    (!query || [c.title, c.question, c.summary, c.company, c.product, mechanisms.find(m=>m.id===c.category)?.label||'', ...c.mechanisms].join(' ').toLocaleLowerCase().includes(query)),
  );
}
export function libraryUrl(filters: Filters) {
  const query = new URLSearchParams(Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return '#/library' + (query.size ? '?' + query : '');
}
export function readRoute(hash: string) {
  const [path, search = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  return { page: parts[0] || 'home', id: parts[1] || '', query: new URLSearchParams(search) };
}
export const caseUrl = (c: Case) => '#/case/' + c.slug;
export const dateLabel = (date: string) => date.replaceAll('-', '.');
