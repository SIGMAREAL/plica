import { isReviewedRelation } from '../model';
import { ArrowUpRight, GitBranch } from '@phosphor-icons/react';
import { Badge, LinkButton, Select } from '../ui';
import { CaseRows, EvidenceNote, PageHeader, SectionHeading } from '../ui/content';
import { caseUrl, type Catalog } from '../model';
import { explorationGroups, graphDimension, graphDimensions, type Dimension } from '../exploration';
import { go } from '../navigation';

const slots=[[16,13],[50,13],[84,13],[16,83],[50,83],[84,83]];
const dimensions=graphDimensions;
export function GraphPage({ catalog, query }: { catalog: Catalog; query: URLSearchParams }) {
  const dimension=graphDimension(query.get('dimension'));
  const groups=explorationGroups(catalog,dimension).filter(g=>g.cases.length||g.papers.length);
  const active=groups.find(g=>g.id===(query.get('id')||query.get('category')))||groups[0];
  const navigate=(dim:Dimension,id?:string)=>go('#/graph?'+new URLSearchParams({dimension:dim,...(id?{id}:{})}));
  const cases=active?.cases||[],papers=active?.papers||[];
  const nodes=[...cases.map(c=>({id:c.slug,label:c.company,title:c.question,href:caseUrl(c),kind:'production'})),...papers.map(p=>({id:p.id,label:'研究论文',title:p.title,href:'#/paper/'+p.id,kind:'research'}))],shown=nodes.slice(0,6);
  const terms=catalog.terms.filter(t=>catalog.relations.some(r=>isReviewedRelation(r)&&r.term===t.id&&cases.some(c=>c.slug===r.case)));
  return <><PageHeader title="知识图谱" description="从机制、产品、团队或术语出发，沿着审定关系探索案例。"/>
    <div className="surface graph-surface"><div className="graph-canvas">{active&&<><div className="graph-top"><div><GitBranch size={16}/><strong>{active.name}</strong><Badge variant="secondary">{cases.length} 个案例{papers.length>0?` · ${papers.length} 篇论文`:''}</Badge></div><div className="graph-mobile-select"><Select key={dimension} aria-label={'图谱'+dimensions[dimension]} value={active.id} onValueChange={v=>{if(v)navigate(dimension,v);}} items={Object.fromEntries(groups.map(g=>[g.id,g.name]))}/></div></div><div className="graph-stage"><svg viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden>{shown.map((n,i)=><path key={n.id} d={`M500 210 L${slots[i][0]*10} ${slots[i][1]*4.2}`}/>)}</svg><LinkButton className="graph-center" href={active.href} variant="secondary"><GitBranch size={18}/>{active.name}</LinkButton>{shown.map((n,i)=><a className="graph-node" key={n.id} href={n.href} data-kind={n.kind} style={{left:slots[i][0]+'%',top:slots[i][1]+'%'}}><strong>{n.label}<ArrowUpRight size={12}/></strong><span>{n.title}</span></a>)}</div><div className="graph-legend"><span><i/>{dimensions[dimension]}关联</span><span>展示 {shown.length} / {nodes.length} 个节点</span></div></>}</div></div>
    {terms.length>0&&<div className="graph-terms"><span className="field-caption">关联术语</span>{terms.map(t=><LinkButton href={'#/term/'+t.id} variant="secondary" size="sm" key={t.id}>{t.name}<ArrowUpRight size={12}/></LinkButton>)}</div>}<section className="page-section graph-reading"><SectionHeading title={active?.name||'关联案例'} description="这一节点下的全部案例。"/><div className="surface"><CaseRows cases={cases} catalog={catalog}/></div></section>{papers.length>0&&<section className="page-section"><SectionHeading title="相关理论研究"/><div className="related-papers">{papers.map(p=><LinkButton key={p.id} href={'#/paper/'+p.id} variant="secondary">{p.title}<ArrowUpRight size={14}/></LinkButton>)}</div><EvidenceNote research>论文仅表示相同研究领域的主题关联，不代表产品采用了论文方案。</EvidenceNote></section>}</>;
}
