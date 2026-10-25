import type { Catalog } from './model.ts';

export function pageMetadata(catalog: Catalog, page: string, id='') {
  const names: Record<string,string>={landing:'软件系统知识门户',home:'发现',library:'案例库',products:'按产品探索',companies:'按团队探索',systems:'按机制探索',graph:'知识图谱',glossary:'术语库',research:'研究论文',compare:'设计取舍',about:'编辑原则',sponsor:'合作与赞助',skill:'Plica Architecture Skill'};
  const paths: Record<string,string>={case:'cases',product:'products',company:'companies',system:'systems',term:'glossary',paper:'research'};
  let title=names[page]||'未找到页面',description='从一手工程资料理解真实软件系统的架构、机制与设计取舍。';
  const record=page==='case'?catalog.cases.find(c=>c.slug===id):page==='term'?catalog.terms.find(t=>t.id===id):page==='paper'?catalog.papers.find(p=>p.id===id):page==='product'?catalog.products.find(p=>p.id===id):page==='company'?catalog.organizations.find(o=>o.id===id):page==='system'?catalog.mechanisms.find(m=>m.id===id):undefined;
  if(record){title='question' in record?record.question:'name' in record?record.name:record.label;const detail='summary' in record?record.summary:'definition' in record?record.definition:'description' in record?record.description:null;description=typeof detail==='string'?detail:`${title} 公开的工程与架构案例。`;}
  return {title:title+' · Plica',description,path:page==='home'?'':(paths[page]||page)+'/'+(id?id+'/':'')};
}
