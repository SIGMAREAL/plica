import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { Catalog } from './src/model.ts';
import { pageMetadata } from './src/page-metadata.ts';

// The input is the public export, never backend source or imports.
export function publicPages(): Plugin {
  const root=dirname(fileURLToPath(import.meta.url));let out='';
  return {name:'plica-public-pages',apply:'build',configResolved(config){out=resolve(config.root,config.build.outDir);},closeBundle(){
    const source=process.env.PLICA_CATALOG_PATH||resolve(root,'../../backend/dist/api/v1/catalog.json');
    const catalog:Catalog=JSON.parse(readFileSync(source,'utf8'));
    if(catalog.schema_version!=='1.0')throw new Error('Unsupported public catalog version');
    const shell=readFileSync(resolve(out,'index.html'),'utf8'),escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const routes:[string,string][]=['home','landing','library','products','companies','systems','graph','glossary','research','compare','about','sponsor','skill'].map(page=>[page,'']);
    routes.push(...catalog.cases.map(c=>['case',c.slug] as [string,string]),...catalog.products.map(c=>['product',c.id] as [string,string]),...catalog.organizations.map(c=>['company',c.id] as [string,string]),...catalog.mechanisms.map(c=>['system',c.id] as [string,string]),...catalog.terms.map(c=>['term',c.id] as [string,string]),...catalog.papers.map(c=>['paper',c.id] as [string,string]));
    for(const [page,id] of routes){const meta=pageMetadata(catalog,page,id),depth=meta.path.split('/').filter(Boolean).length;const html=shell.replace(/<title>.*?<\/title>/,`<title>${escape(meta.title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(meta.description)}"/>`).replace('<head>',`<head><base href="${depth?'../'.repeat(depth):'./'}"/><meta property="og:title" content="${escape(meta.title)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:type" content="website"/>`);const target=resolve(out,meta.path,'index.html');mkdirSync(dirname(target),{recursive:true});writeFileSync(target,html);}
  }};
}
