import { isReviewedRelation } from '../model';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Database, GitBranch, MagnifyingGlass, Stack, X } from '@phosphor-icons/react';
import { Badge, Button, Input, LinkButton, SearchField, Select, PublicationMeta } from '../ui';
import { CaseRows, EvidenceNote, NotFound, PageHeader, ResetEmpty, SectionHeading, SourceAction } from '../ui/content';
import { caseUrl, dateLabel, filterCases, libraryUrl, type Catalog, type Filters } from '../model';
import { LinkedTerms } from '../ui/LinkedTerms';
import { go } from '../navigation';

export function Home({ catalog }: { catalog: Catalog }) {
  const featured = catalog.cases.find(c => c.slug === 'dropbox-nucleus-sync') || catalog.cases[0];
  const selected = ['discord-message-indexing','stripe-ledger-money-movement','netflix-open-connect-popularity','figma-multiplayer'].flatMap(id => catalog.cases.filter(c => c.slug === id));
  return <>
    <PageHeader title="发现" description="从一手资料，理解真实系统的设计与取舍。" action={<LinkButton href="#/library" variant="primary">浏览案例库<ArrowRight size={16}/></LinkButton>}/>
    <section className="discovery-intro" data-enter><div className="discovery-copy"><Badge variant="secondary">Plica · 软件系统知识库</Badge><h2>拆开软件，<br/>理解设计背后的选择。</h2><p>把复杂系统放回真实问题中。沿着工程团队公开的资料，读懂它如何运行、为何这样设计。</p><div className="catalog-counts"><span><strong>{catalog.cases.length}</strong>案例</span><span><strong>{catalog.mechanisms.length}</strong>机制分类</span><span><strong>{catalog.terms.length}</strong>术语</span><span><strong>{catalog.papers.length}</strong>论文</span></div></div><div className="featured-case"><div className="featured-label"><Badge variant="info">精选案例</Badge><span>{featured.readTime}</span></div><PublicationMeta publisher={featured.company} date={featured.date} readTime={featured.readTime}/><h3>{featured.question}</h3><p>{featured.summary}</p><LinkButton href={caseUrl(featured)} variant="primary">阅读案例<ArrowRight size={16}/></LinkButton></div></section>
    <section className="page-section"><SectionHeading title="选择探索方式"/><div className="explore-entry-grid">{[['products','按产品',`${catalog.products.length} 款产品，从熟悉的软件出发。`],['companies','按团队',`${catalog.organizations.length} 个发布机构，沿着团队实践阅读。`],['systems','按机制',`${catalog.mechanisms.length} 类设计问题，比较实现与约束。`]].map(([path,title,description])=><a className="surface explore-entry" href={'#/'+path} key={path}><strong>{title}<ArrowUpRight size={16}/></strong><p>{description}</p></a>)}</div></section><section className="page-section"><SectionHeading title="按机制探索" href="#/systems"/><div className="mechanism-grid">{catalog.mechanisms.map((m,i) => <a className="mechanism-tile" href={'#/system/'+m.id} key={m.id}><span className="mechanism-icon">{i%3===0?<Database size={18}/>:i%3===1?<Stack size={18}/>:<GitBranch size={18}/>}</span><strong>{m.label}</strong><span>{catalog.cases.filter(c=>c.category===m.id).length} 个案例</span><ArrowUpRight size={16}/></a>)}</div></section>
    <section className="page-section"><SectionHeading title="值得深入的设计" description="从一个具体问题，进入系统内部。" href="#/library"/><div className="surface"><CaseRows cases={selected} catalog={catalog}/></div></section>
    <section className="discovery-bottom"><div><h2>同样的问题，不同的设计。</h2><p>并排比较前提、机制与代价，形成自己的判断。</p></div><LinkButton href="#/compare">比较设计取舍<ArrowRight size={16}/></LinkButton></section>
  </>;
}

export function Library({ catalog, query, focusSearch, onFocused }: { catalog: Catalog; query: URLSearchParams; focusSearch: boolean; onFocused: () => void }) {
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(focusSearch){ref.current?.focus();onFocused();}},[focusSearch,onFocused]);
  const filters: Filters=Object.fromEntries(['q','category','product','company'].map(k=>[k,query.get(k)||'']));
  const results=filterCases(catalog.cases,filters,catalog.mechanisms);
  const update=(patch:Filters,replace=false)=>go(libraryUrl({...filters,...patch}),replace);
  const reset=()=>go('#/library');
  return <>
    <PageHeader title="案例库" description="阅读一线团队公开的系统设计与工程复盘。" action={<Badge variant="secondary">{catalog.cases.length} 个案例</Badge>}/>
    <div className="surface library-panel"><div className="library-search"><SearchField inputRef={ref} value={filters.q||''} onChange={q=>update({q},true)}/></div><div className="filter-row"><Select aria-label="产品" value={filters.product||''} items={{'':'全部产品',...Object.fromEntries(catalog.products.map(p=>[p.name,p.name]))}} onValueChange={v=>update({product:v||''})}/><Select aria-label="发布机构" value={filters.company||''} items={{'':'全部机构',...Object.fromEntries(catalog.organizations.map(o=>[o.name,o.name]))}} onValueChange={v=>update({company:v||''})}/><Select aria-label="系统机制" value={filters.category||''} items={{'':'全部机制',...Object.fromEntries(catalog.mechanisms.map(m=>[m.id,m.label]))}} onValueChange={v=>update({category:v||''})}/><Button variant="ghost" onClick={reset} icon={X}>重置</Button></div></div>
    <div className="result-heading"><span><strong>{results.length}</strong> 个相关案例</span><span>原始资料 · 编辑导读</span></div>
    {results.length?<div className="surface"><CaseRows cases={results} catalog={catalog}/></div>:<div className="surface"><ResetEmpty onReset={reset}/></div>}
  </>;
}

export function Glossary({ catalog, id }: { catalog: Catalog; id?: string }) {
  const [q,setQ]=useState('');
  const term=id?catalog.terms.find(t=>t.id===id):undefined;
  if(id&&!term)return <NotFound/>;
  if(term){const cases=catalog.cases.filter(c=>catalog.relations.some(r=>isReviewedRelation(r)&&r.case===c.slug&&r.term===term.id));return <><PageHeader title={term.name} description={term.zh} breadcrumb={<a href="#/glossary"><ArrowLeft size={14}/>术语库</a>}/><div className="surface term-definition"><Badge variant="secondary">概念与边界</Badge><p>{term.definition}</p>{term.aliases.length>0&&<small>其他写法：{term.aliases.join(' / ')}</small>}</div><section className="page-section"><SectionHeading title="在真实系统中理解它" description="只展示经过编辑审定的案例关联。"/>{cases.length?<div className="surface"><CaseRows cases={cases} catalog={catalog}/></div>:<EvidenceNote>目前尚无审定的生产案例关联。</EvidenceNote>}</section><section className="page-section"><SectionHeading title="相关理论研究"/><div className="related-papers">{catalog.papers.filter(p=>p.category===term.category).map(p=><LinkButton key={p.id} href={'#/paper/'+p.id} variant="secondary">{p.title}<ArrowUpRight size={14}/></LinkButton>)}</div><EvidenceNote research>相同研究领域的主题关联，不代表产品采用了论文方法。</EvidenceNote></section></>;}
  const terms=catalog.terms.filter(t=>[t.name,t.zh,t.definition,...t.aliases].join(' ').toLowerCase().includes(q.trim().toLowerCase()));
  return <><PageHeader title="术语库" description="理解概念的定义，以及它在真实系统中的作用。" action={<Badge variant="secondary">{catalog.terms.length} 个术语</Badge>}/><div className="surface glossary-panel"><div className="glossary-search"><MagnifyingGlass size={18}/><Input aria-label="搜索术语" placeholder="搜索术语或中文释义" className="w-full" value={q} onChange={e=>setQ(e.target.value)}/><span>{terms.length} 个术语</span></div><div className="term-list">{terms.map(t=><a href={'#/term/'+t.id} key={t.id}><div><strong>{t.name}</strong><span>{t.zh}</span></div><p>{t.definition}</p><ArrowUpRight size={17}/></a>)}</div>{!terms.length&&<div className="route-empty"><p>没有找到这个术语。</p><Button onClick={()=>setQ('')}>清空搜索</Button></div>}</div><EvidenceNote>术语定义为 Plica 原创编辑说明，不代表单一原文作者的定义。术语条目不代表已有对应生产案例。</EvidenceNote></>;
}

export function Research({ catalog, id }: { catalog: Catalog; id?: string }) {
  const paper=id?catalog.papers.find(p=>p.id===id):undefined;
  if(id&&!paper)return <NotFound/>;
  if(paper)return <div className="reading-width"><PageHeader title={paper.question} description={paper.summary} breadcrumb={<a href="#/research"><ArrowLeft size={14}/>研究论文</a>}/><h2 className="paper-formal-title">{paper.title}</h2><div className="paper-meta"><Badge variant="info">研究论文</Badge><span>{paper.authors} · {paper.year}</span><span>arXiv:{paper.arxiv}</span></div><EvidenceNote research>{paper.status}</EvidenceNote><div className="surface paper-takeaways"><SectionHeading title="阅读要点"/>{paper.takeaways.map((t,i)=><div className="design-point" key={i}><span>{String(i+1).padStart(2,'0')}</span><p><LinkedTerms text={t} terms={catalog.terms.filter(t=>t.category===paper.category)}/></p></div>)}<div className="reading-actions"><SourceAction href={'https://arxiv.org/abs/'+paper.arxiv}>阅读原始论文</SourceAction><LinkButton href={'#/case/'+paper.related_case}>相关案例<ArrowRight size={16}/></LinkButton></div></div><p className="editor-note">主题相关不等于生产采用，相关案例请独立查证。</p></div>;
  return <><PageHeader title="研究论文" description="从论文的方法和实验出发，保留研究与生产实践的边界。" action={<Badge variant="secondary">{catalog.papers.length} 篇论文</Badge>}/><EvidenceNote research>研究提出一种可能，生产验证一组取舍。论文关联不等于当前生产采用。</EvidenceNote><div className="paper-list">{catalog.papers.map(p=><a className="surface paper-card" href={'#/paper/'+p.id} key={p.id}><div className="paper-card-meta"><Badge variant="info">研究论文</Badge><span>{p.year} · arXiv:{p.arxiv}</span></div><h2>{p.question}</h2><p>{p.summary}</p><div className="paper-card-bottom"><span>{p.title}</span><ArrowUpRight size={18}/></div></a>)}</div><EvidenceNote>感谢 arXiv 的开放访问互操作支持。Plica 与 arXiv 无官方关联；论文权利归作者或出版方。</EvidenceNote></>;
}

export function Comparisons({ catalog }: { catalog: Catalog }) {
  return <><PageHeader title="设计取舍" description="把设计放回各自的约束里，比较前提、机制与代价。" action={<Badge variant="secondary">{catalog.comparisons.length} 组比较</Badge>}/><div className="comparison-list">{catalog.comparisons.map((p,i)=><section className="surface comparison" key={p.id}><div className="comparison-heading"><span className="sequence">{String(i+1).padStart(2,'0')}</span><div><h2>{p.title}</h2><p>{p.description}</p></div><Badge variant="secondary">{catalog.mechanisms.find(m=>m.id===p.category)?.label}</Badge></div><div className="comparison-columns">{p.case_ids.flatMap(id=>catalog.cases.filter(c=>c.slug===id)).map(c=><div key={c.slug}><PublicationMeta publisher={c.company} date={c.date} readTime={c.readTime}/><h3><a href={caseUrl(c)}>{c.question}</a></h3><span className="field-caption">设计取舍</span><p>{c.tradeoff}</p><LinkButton href={caseUrl(c)} variant="secondary" size="sm">阅读案例<ArrowRight size={14}/></LinkButton></div>)}</div></section>)}</div><EvidenceNote>这些比较为 Plica 的编辑归纳，不表示各团队使用同一代系统或在相同工作负载下直接竞争。</EvidenceNote></>;
}
