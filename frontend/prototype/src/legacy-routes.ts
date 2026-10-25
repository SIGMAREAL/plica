import { readRoute } from './model.ts';

const legacyPages: Record<string,string>={cases:'case',products:'product',companies:'company',systems:'system',glossary:'term',research:'paper'};
export function normalizeFilters(query: URLSearchParams) {
  if(query.has('system')&&!query.has('category'))query.set('category',query.get('system')||'');
  query.delete('system');
  for(const key of ['category','company','product'])if(query.get(key)==='all')query.delete(key);
  return query;
}
export function legacyLocation(pathname: string, search: string, hash: string) {
  if(hash.startsWith('#/'))return null;
  const parts=pathname.split('/').filter(Boolean),known=new Set(['landing','library','graph','compare','about','sponsor','skill',...Object.keys(legacyPages)]);
  const index=parts.findIndex(p=>known.has(p));
  if(index<0)return null;
  const [page,id]=parts.slice(index),prefix='/'+parts.slice(0,index).join('/')+(index?'/':'');
  const target=id&&id!=='index.html'?(legacyPages[page]||page)+'/'+id:page;
  const query=normalizeFilters(new URLSearchParams(search));
  if(hash&&hash!=='#')query.set('section',hash.slice(1));
  return prefix+'#/'+target+(query.size?'?'+query:'');
}
export function routeWithLegacyFilters(hash: string) {
  const route=readRoute(hash);normalizeFilters(route.query);return route;
}
