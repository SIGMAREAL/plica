import { useRef } from 'react';
import { ArrowRight, ArrowUpRight, GitBranch, SquaresFour, Users } from '@phosphor-icons/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { LinkButton } from '../ui';
import { Brand } from '../ui/Brand';
import { CaseRows } from '../ui/content';
import type { Catalog } from '../model';
import { useReadingList } from '../reading-list';
import './landing.css';

gsap.registerPlugin(useGSAP);
export function LandingPage({ catalog }: { catalog: Catalog }) {
  const root = useRef<HTMLDivElement>(null);
  const { error } = useReadingList();
  const featured = ['discord-message-indexing', 'netflix-open-connect-popularity', 'google-spanner'].flatMap(id => catalog.cases.filter(c => c.slug === id));
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.portal-hero-copy > *', { y: 18, autoAlpha: 0, stagger: .075, duration: .65 })
        .from('.portal-source-strip', { y: 8, autoAlpha: 0, duration: .45 }, .45);
    }, root);
    return () => mm.revert();
  }, { scope: root });
  return <div ref={root}>
    <section className="portal-hero portal-container" aria-labelledby="portal-heading">
      <div className="portal-hero-copy">
        <Brand href="#/landing" variant="hero"/>
        <h1 id="portal-heading" lang="en">How the world’s<br/>software works.</h1>
        <div className="portal-hero-actions"><LinkButton href="#/library" variant="primary" size="lg">探索案例库<ArrowRight size={17}/></LinkButton><LinkButton href="#/about" variant="ghost" size="lg">什么是 Plica？</LinkButton></div>
      </div>
    </section>
    <div className="portal-source-strip portal-container"><span>公开资料涵盖</span><div>{['Dropbox','Figma','Stripe','Netflix','Discord'].map(name => {
      const team = catalog.organizations.find(o => o.name === name);
      return team ? <a href={'#/company/'+team.id} key={name}>{name}</a> : <span key={name}>{name}</span>;
    })}</div><small>独立整理，与上述机构无官方关联</small></div>
    <section id="portal-explore" className="portal-explore portal-container" aria-labelledby="portal-explore-heading">
      <div className="portal-section-heading"><div><span className="portal-kicker">找到你的起点</span><h2 id="portal-explore-heading">带着问题，进入系统。</h2></div><p>从熟悉的产品、一支工程团队，<br/>或一个正在思考的设计问题开始。</p></div>
      <div className="portal-paths">{[
        { path:'products', title:'按产品探索', description:'从你每天使用的软件出发，阅读它背后的工程设计。', count:catalog.products.length+' 款产品', example:'Dropbox · Figma · Stripe', Icon:SquaresFour },
        { path:'companies', title:'按团队探索', description:'沿着同一个团队的公开记录，理解不同系统的选择。', count:catalog.organizations.length+' 个团队', example:'Google · Meta · Netflix', Icon:Users },
        { path:'systems', title:'按机制探索', description:'围绕同一类问题，比较不同场景下的约束与取舍。', count:catalog.mechanisms.length+' 类机制', example:'存储 · 协作 · 推荐 · 发布', Icon:GitBranch },
      ].map(({ path, title, description, count, example, Icon }, i) => <a href={'#/'+path} className="portal-path" key={path}><div className="portal-path-top"><Icon size={22}/><span>0{i+1}</span></div><h3>{title}<ArrowUpRight size={20}/></h3><p>{description}</p><div className="portal-path-bottom"><span>{example}</span><strong>{count}</strong></div></a>)}</div>
    </section>
    <section className="portal-selected portal-container" aria-labelledby="portal-selected-heading"><div className="portal-section-heading"><div><span className="portal-kicker">值得深入的设计</span><h2 id="portal-selected-heading">从一个好问题，读起。</h2></div><LinkButton href="#/library" variant="ghost">全部案例<ArrowRight size={15}/></LinkButton></div>{error && <p className="portal-save-error" role="status">{error}</p>}<div className="portal-selected-list"><CaseRows cases={featured} catalog={catalog}/></div></section>
    <section className="portal-resources portal-container"><div><span className="portal-kicker">让阅读继续</span><h2>连接概念、研究与实践。</h2></div><div className="portal-resource-links">{[['术语库','为概念找到定义与实际案例。','glossary'],['研究论文','独立阅读方法、实验与证据边界。','research'],['开放 Agent Skill','把有出处的知识带进你的设计过程。','skill']].map(([title,description,path]) => <a href={'#/'+path} key={path}><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={19}/></a>)}</div></section>
    <section className="portal-final"><div className="portal-container"><div><h2>理解设计，<br/>从看见选择开始。</h2><p>一手资料、真实问题，以及设计总有的代价。</p></div><LinkButton href="#/" variant="primary" size="lg">进入 Plica 知识库<ArrowRight size={17}/></LinkButton></div></section>
  </div>;
}
