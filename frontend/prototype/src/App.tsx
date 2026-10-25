import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button, CaseSkeleton, LinkButton, TooltipProvider } from './ui';
import { NotFound } from './ui/content';
import { Home, Library, Glossary, Research, Comparisons } from './pages/CatalogPages';
import { ArticlePage } from './pages/ArticlePage';
import { GraphPage } from './pages/GraphPage';
import { ExplorePage } from './pages/ExplorePages';
import { InfoPage } from './pages/InfoPages';
import { LandingPage } from './pages/LandingPage';
import { PortalShell } from './layout/PortalShell';
import { SiteHeader } from './layout/SiteHeader';
import { knowledgeGroups } from './layout/navigation-sections';
import { ContextSidebar } from './layout/ContextSidebar';
import { publicAssetUrl } from './public-api';
import { pageMetadata } from './page-metadata';
import { ReadingListProvider, useReadingList } from './reading-list';
import { go, useRoute } from './navigation';
import type { Catalog } from './model';

gsap.registerPlugin(useGSAP);
function AppContent(){
  const [catalog,setCatalog]=useState<Catalog|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[focusSearch,setFocusSearch]=useState(false);
  const [theme,setTheme]=useState<'light'|'dark'>(()=>{try{return localStorage.getItem('plica-theme')==='dark'?'dark':'light';}catch{return 'light';}});
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const route=useRoute(),root=useRef<HTMLDivElement>(null),positions=useRef(new Map<string,number>());
  const routeKey=route.page+'/'+route.id+'?'+route.query.toString(),activeRoute=useRef(routeKey),previousView=useRef(route.page+'/'+route.id);
  const readingList=useReadingList();
  const current=route.page==='product'?'products':route.page==='company'?'companies':route.page==='system'?'systems':route.page==='case'?'library':route.page==='term'?'glossary':route.page==='paper'?'research':route.page;
  const title=knowledgeGroups.flatMap(group => [...group.pages]).find(([id])=>id===current)?.[1]||({about:'编辑原则',sponsor:'合作与赞助',skill:'Agent Skill'} as Record<string,string>)[route.page]||'Plica';
  useEffect(()=>{const remember=()=>positions.current.set(activeRoute.current,scrollY);addEventListener('scroll',remember,{passive:true});return()=>removeEventListener('scroll',remember);},[]);
  useLayoutEffect(()=>{const view=route.page+'/'+route.id;activeRoute.current=routeKey;if(view!==previousView.current)scrollTo({top:positions.current.get(routeKey)||0,behavior:'instant'});previousView.current=view;},[routeKey,route.page,route.id]);
  useEffect(()=>{const abort=new AbortController();fetch(publicAssetUrl('api/v1/catalog.json'),{signal:abort.signal,credentials:'omit'}).then(r=>{if(!r.ok)throw new Error('目录暂时无法加载');return r.json();}).then((data:Catalog)=>{if(data.schema_version!=='1.0')throw new Error('目录版本暂不支持');if(['cases','terms','papers','mechanisms','products','organizations','relations','comparisons'].some(k=>!Array.isArray(data[k as keyof Catalog])))throw new Error('目录数据不完整');setCatalog(data);setError('');}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>abort.abort();},[retry]);
  useEffect(()=>{document.documentElement.style.colorScheme=theme;document.documentElement.dataset.mode=theme;try{localStorage.setItem('plica-theme',theme);}catch{}},[theme]);
  useEffect(()=>{document.title='Plica · '+title;},[route.page,route.id,title]);
  useEffect(()=>{if(!catalog)return;const meta=pageMetadata(catalog,route.page,route.id);document.title=meta.title;for(const [attribute,key,value]of [['name','description',meta.description],['property','og:title',meta.title],['property','og:description',meta.description],['property','og:type','website']]){let tag=document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);if(!tag){tag=document.createElement('meta');tag.setAttribute(attribute,key);document.head.appendChild(tag);}tag.content=value;}const section=route.query.get('section');if(section)requestAnimationFrame(()=>document.getElementById(section)?.scrollIntoView());},[catalog,routeKey]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(document.activeElement instanceof HTMLInputElement)document.activeElement.blur();}if(e.key==='/'&&location.hash.startsWith('#/library')&&!(e.target instanceof HTMLElement&&e.target.matches('input,textarea,select,[contenteditable=true]'))){e.preventDefault();setFocusSearch(true);}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setFocusSearch(true);go('#/library');}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[]);
  useEffect(()=>{if(!catalog||!import.meta.env.DEV||!location.hash.startsWith('#figmacapture=')||document.getElementById('figma-capture-script'))return;const script=document.createElement('script');script.id='figma-capture-script';script.src='https://mcp.figma.com/mcp/html-to-design/capture.js';script.async=true;document.head.appendChild(script);},[catalog]);
  useGSAP(()=>{if(!catalog)return;const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',()=>{gsap.from('[data-enter]',{opacity:0,y:8,duration:.24,ease:'power2.out'});},root);return()=>mm.revert();},{scope:root,dependencies:[catalog,route.page,route.id],revertOnUpdate:true});
  let content:ReactNode;
  if(!catalog)content=error?<div className="route-empty"><h1>{error}</h1><p>请检查网络或稍后重试。</p><Button onClick={()=>{setError('');setRetry(x=>x+1);}}>重新加载</Button></div>:<div className="surface loading-state"><h1>正在加载知识库</h1><CaseSkeleton/><CaseSkeleton/><CaseSkeleton/></div>;
  else switch(route.page){case'landing':content=<LandingPage catalog={catalog}/>;break;case'home':content=<Home catalog={catalog}/>;break;case'library':content=<Library catalog={catalog} query={route.query} focusSearch={focusSearch} onFocused={()=>setFocusSearch(false)}/>;break;case'case':content=<ArticlePage key={route.id} catalog={catalog} id={route.id}/>;break;case'products':case'companies':case'systems':content=<ExplorePage catalog={catalog} dimension={route.page} id={route.id||undefined}/>;break;case'product':case'company':case'system':content=<ExplorePage catalog={catalog} dimension={route.page==='product'?'products':route.page==='company'?'companies':'systems'} id={route.id}/>;break;case'about':case'sponsor':case'skill':content=<InfoPage page={route.page}/>;break;case'graph':content=<GraphPage catalog={catalog} query={route.query}/>;break;case'glossary':content=<Glossary catalog={catalog}/>;break;case'term':content=<Glossary key={route.id} catalog={catalog} id={route.id}/>;break;case'research':content=<Research catalog={catalog}/>;break;case'paper':content=<Research catalog={catalog} id={route.id}/>;break;case'compare':content=<Comparisons catalog={catalog}/>;break;default:content=<NotFound/>;}
  const search = () => { setFocusSearch(true); go('#/library'); };
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  if(route.page==='landing')return <TooltipProvider><div ref={root} className="plica-app" data-theme={theme}><PortalShell theme={theme} onThemeChange={toggleTheme} onSearch={search}>{content}</PortalShell></div></TooltipProvider>;
  return <TooltipProvider><div ref={root} className="plica-app" data-theme={theme} data-sidebar-collapsed={sidebarCollapsed} onClickCapture={()=>positions.current.set(activeRoute.current,scrollY)}>
    <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();}}>跳到内容</a>
    <SiteHeader theme={theme} onThemeChange={toggleTheme} onSearch={search} current={current}/>
    {catalog && <ContextSidebar key={current} catalog={catalog} route={route} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(value=>!value)}/>}
    <div className="app-workspace">
      <main id="main" tabIndex={-1} className="app-main">{content}{readingList.error&&<p className="save-error" role="status">{readingList.error}</p>}</main>
      <footer className="app-footer"><span>© 2026 Plica</span><span>原始资料版权归其作者所有</span><nav aria-label="项目信息"><a href="#/about">编辑原则</a><a href="#/skill">Agent Skill</a><a href="#/sponsor">合作与赞助</a><a href="components.html">组件库<ArrowUpRight size={11}/></a></nav><LinkButton href="#/library" size="sm" variant="ghost">继续探索<ArrowRight size={13}/></LinkButton></footer>
    </div>
  </div></TooltipProvider>;
}
export default function App(){return <ReadingListProvider><AppContent/></ReadingListProvider>;}
