import { useRef, useState } from 'react';
import { ArrowLeft, BookmarkSimple, Check, Copy } from '@phosphor-icons/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Badge, Button, LinkButton, PublicationMeta, SourceLink } from '../ui';
import { CaseRows, EvidenceNote, NotFound, PageHeader, SectionHeading, SourceAction } from '../ui/content';
import { isReviewedRelation, type Catalog } from '../model';
import { LinkedTerms } from '../ui/LinkedTerms';
import { ReadingQuestion } from '../ui/ReadingQuestion';
import { useReadingList } from '../reading-list';

gsap.registerPlugin(ScrollTrigger, useGSAP);
export function ArticlePage({ catalog, id }: { catalog: Catalog; id: string }) {
  const c=catalog.cases.find(c=>c.slug===id),ref=useRef<HTMLDivElement>(null),article=useRef<HTMLElement>(null);
  const {saved,toggle,error}=useReadingList();
  const [copied,setCopied]=useState(false),[copyError,setCopyError]=useState('');
  useGSAP(()=>{if(!c)return;gsap.fromTo('.reading-progress',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:ref.current,start:'top top',end:'bottom bottom',scrub:true}});},{scope:ref,dependencies:[id],revertOnUpdate:true});
  if(!c)return <NotFound/>;
  const terms=catalog.terms.filter(t=>catalog.relations.some(r=>isReviewedRelation(r)&&r.case===id&&r.term===t.id));
  const related=catalog.cases.filter(r=>r.slug!==id&&(r.category===c.category||r.company===c.company)).slice(0,3);
  const product=catalog.products.find(p=>p.name===c.product),team=catalog.organizations.find(o=>o.name===c.company);
  const category=catalog.mechanisms.find(m=>m.id===c.category)?.label;

  return <div ref={ref} className="article-page"><div className="reading-progress"/><PageHeader title={c.question} description={<LinkedTerms text={c.summary} terms={terms}/>} breadcrumb={<><a href="#/library"><ArrowLeft size={14}/>案例库</a><span>/</span><a href={'#/system/'+c.category}>{category}</a></>}/><div className="article-meta"><PublicationMeta publisher={c.company} date={c.date} readTime={c.readTime}/><Badge variant="secondary">{category}</Badge></div><div className="reading-actions"><SourceAction href={c.source}>阅读原始资料</SourceAction><Button variant="secondary" icon={saved.includes(id)?Check:BookmarkSimple} aria-pressed={saved.includes(id)} onClick={()=>toggle(id)}>{saved.includes(id)?'已收藏':'收藏'}</Button><Button variant="ghost" icon={copied?Check:Copy} onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);setCopyError('');}catch{setCopyError('无法复制，请从地址栏复制链接。');}}}>{copied?'已复制':'复制链接'}</Button></div>{(error||copyError)&&<p role="status" className="editor-note">{error||copyError}</p>}
  <div className="surface source-facts"><h2>来源信息</h2><dl>{[['原文标题',c.title],['发布机构',c.company],['发布日期',c.date],['资料形式',c.type],['阅读时长',c.readTime]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="explore-related">{product&&<LinkButton variant="secondary" size="sm" href={'#/product/'+product.id}>产品 · {product.name}</LinkButton>}{team&&<LinkButton variant="secondary" size="sm" href={'#/company/'+team.id}>团队 · {team.name}</LinkButton>}</div></div><div className="article-layout"><article ref={article} className="article-body"><section id="context"><h2>为什么值得读</h2><p><LinkedTerms text={c.why} terms={terms}/></p></section><section id="mechanisms"><h2>关键机制</h2>{c.points.map((p,i)=><div className="design-point" key={i}><span>{String(i+1).padStart(2,'0')}</span><p><LinkedTerms text={p} terms={terms}/></p></div>)}</section><section id="tradeoffs"><h2>设计取舍</h2><blockquote><LinkedTerms text={c.tradeoff} terms={terms}/></blockquote><EvidenceNote>以上为对原始资料的编辑归纳，不代表该机构当前内部系统的完整实现。请结合来源日期与原文语境阅读。</EvidenceNote></section><section id="source"><h2>原始资料</h2><SourceLink href={c.source} title={c.title} publisher={c.company}/><div className="tags">{c.mechanisms.map(m=><Badge variant="secondary" key={m}>{m}</Badge>)}</div></section></article></div><section className="page-section"><SectionHeading title="沿着机制与团队，继续阅读"/>{related.length>0&&<div className="surface"><CaseRows cases={related} catalog={catalog}/></div>}</section><ReadingQuestion article={article}/></div>;
}
