import { ArrowLeft, ArrowUpRight } from '@phosphor-icons/react';
import { Badge, LinkButton } from '../ui';
import { CaseRows, EvidenceNote, NotFound, PageHeader, SectionHeading } from '../ui/content';
import { explorationGroups, type Dimension } from '../exploration';
import type { Catalog } from '../model';
import { ProductCard } from '../ui/ProductCard';

const labels = {
  products: ['按产品探索','从熟悉的软件出发，阅读它背后的系统设计。'],
  companies: ['按团队探索','按公开资料的发布机构，了解团队在不同产品与机制上的实践。'],
  systems: ['按机制探索','从工程问题与约束出发，观察不同团队的设计与取舍。'],
} as const;
export function ExplorePage({ catalog, dimension, id }: { catalog: Catalog; dimension: Exclude<Dimension,'terms'>; id?: string }) {
  const groups=explorationGroups(catalog,dimension),[title,description]=labels[dimension];
  if(id){
    const group=groups.find(g=>g.id===id);
    if(!group)return <NotFound/>;
    const products=dimension==='companies'?catalog.products.filter(p=>group.cases.some(c=>c.product===p.name)):[];
    const teams=dimension==='products'?catalog.organizations.filter(o=>group.cases.some(c=>c.company===o.name)):[];
    return <><PageHeader title={group.name} description={group.description} breadcrumb={<a href={'#/'+dimension}><ArrowLeft size={14}/>{title}</a>} action={<Badge variant="secondary">{group.cases.length} 个案例</Badge>}/>
      {(products.length>0||teams.length>0)&&<div className="explore-related"><span className="field-caption">{dimension==='companies'?'相关产品':'发布团队'}</span>{products.map(p=><LinkButton key={p.id} href={'#/product/'+p.id} variant="secondary" size="sm">{p.name}<ArrowUpRight size={12}/></LinkButton>)}{teams.map(o=><LinkButton key={o.id} href={'#/company/'+o.id} variant="secondary" size="sm">{o.name}<ArrowUpRight size={12}/></LinkButton>)}</div>}
      <section className="page-section"><SectionHeading title="公开工程案例"/>{group.cases.length?<div className="surface"><CaseRows cases={group.cases} catalog={catalog}/></div>:<EvidenceNote>当前尚未收录这一分类下的生产案例。</EvidenceNote>}</section><EvidenceNote>收录公开资料不表示获得该机构认可或与其合作。设计解读请结合原始资料的发布日期。</EvidenceNote></>;
  }
  return <><PageHeader title={title} description={description} action={<Badge variant="secondary">{groups.length} {dimension==='products'?'款产品':dimension==='companies'?'个团队':'类机制'}</Badge>}/>{dimension==='products'
    ? <div className="product-gallery">{groups.map(g=><ProductCard key={g.id} product={g}/>)}</div>
    : <div className="explore-grid">{groups.map(g=><a key={g.id} href={g.href} className="surface explore-card"><div><span className="explore-initial" aria-hidden>{g.name.slice(0,1)}</span><ArrowUpRight size={17}/></div><h2>{g.name}</h2><p>{dimension==='companies'?Array.from(new Set(g.cases.map(c=>catalog.mechanisms.find(m=>m.id===c.category)?.label))).join(' · '):g.description}</p><span>{g.cases.length} 个公开案例</span></a>)}</div>}</>;
}
