#!/usr/bin/env python3
"""Generate a framework-free static editorial site for GitHub Pages.

Run: python3 build.py. No dependencies outside Python standard library.
"""
import json, html, pathlib, re, shutil

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / 'site'
DATA = json.loads((ROOT / 'cases.json').read_text())
CATS = [
  ('storage','存储与数据','Storage & data','file-stack','01','对象存储 / 同步 / 数据库'),
  ('video','音视频系统','Video & media','clapperboard','02','转码 / 带宽 / 传输'),
  ('recommendation','推荐与个性化','Recommendation','git-branch','03','召回 / 排序 / 在线学习'),
  ('collaboration','实时协作与通信','Collaboration','users','04','同步 / 消息 / 冲突处理'),
  ('release','发布、实验与交付','Delivery & experiments','toggle-right','05','CI/CD / Feature Flags / A/B'),
  ('search','搜索与索引','Search & discovery','search','06','检索 / 索引 / 查询延迟'),
  ('developer','Agent 与开发平台','Developer platforms','terminal','07','Harness / 代码管理 / 验证'),
  ('runtime','客户端与运行时','Client runtime','layers','08','小程序 / 沙箱 / 跨端引擎'),
  ('finance','支付与账务','Payments & ledgers','book','09','资金流 / 不可变账本 / 清算'),
  ('traffic','边缘流量与可靠性','Traffic & reliability','globe','10','排队 / 限流 / 容量规划')
]
CATMAP = {k: {'label':label,'english':english,'symbol':sym,'num':num,'descr':descr} for k,label,english,sym,num,descr in CATS}
PRODUCTS = [
 ('Dropbox','文件存储、同步与版本演进','D'),('YouTube','视频转码与媒体基础设施','Y'),('Netflix','流媒体编码与播放质量','N'),
 ('Figma','多人编辑与实时同步','F'),('Discord','海量消息存储与搜索','D'),('Uber','实验平台、Feature Flags 与发布','U'),
 ('Instagram','多阶段推荐系统与模型服务','I'),('Spotify','个性化与实验系统','S'),('BytePlus Recommend','实时推荐模型与在线训练','B'),
 ('Google Spanner','全球一致的分布式数据库','G'),('Google Infrastructure','文件系统与容错机制','G'),
 ('OpenAI Codex','Agent 编程与工程 Harness','O'),('Anthropic Engineering','AI 编程时代的版本控制','A'),
 ('Facebook','社交图服务与读性能','F'),('Facebook Photos','图片元数据与对象存储','F'),
 ('Meta Data Infrastructure','数据摄入及大规模迁移','M'),('WeChat Mini Programs','小程序运行时与 JSBridge','W'),
 ('GitHub','Agent 规模的 Git 承载','G'),('GitHub API','聚合接口与查询效率','G'),
 ('Stripe Billing','在线无停机迁移','S'),('Stripe Payments','资金流水与数据质量','S'),
 ('Cloudflare Waiting Room','流量准入和排队控制','C')
]
PRODUCT_INFO = {p:{'descr':d,'initial':initial} for p,d,initial in PRODUCTS}
TERMS = json.loads((ROOT / 'terms.json').read_text())
PAPERS = json.loads((ROOT / 'papers.json').read_text())
RELATIONS = json.loads((ROOT / 'relations.json').read_text())
REVIEWED_CASE_TERMS = {case['slug']:[] for case in DATA}
for rel in RELATIONS:
  if rel['case'] in REVIEWED_CASE_TERMS:
    REVIEWED_CASE_TERMS[rel['case']].append(rel['term'])
TERM_MAP = {t['id']:t for t in TERMS}
COMPANIES = sorted(set(c['company'] for c in DATA))

def e(v): return html.escape(str(v), quote=True)
def slug(s): return re.sub(r'[^a-z0-9-]+','-',s.lower()).strip('-')
def md_date(v):
  parts=v.split('-'); return v.replace('-','.') if len(parts)>1 else v

def link(path, depth=0): return '../'*depth + path

def icon(name, size=18):
  paths={
  'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-right':'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  'bookmark':'<path d="M6 4h12v16l-6-4-6 4z"/>',
  'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  'check':'<path d="m4 12 5 5L20 6"/>',
  'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
  'close':'<path d="M5 5l14 14M19 5 5 19"/>',
  'chevron':'<path d="m9 18 6-6-6-6"/>',
  'layers':'<path d="m12 3 9 5-9 5-9-5 9-5zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
  'link':'<path d="M10 13a5 5 0 0 0 7.07 0l2-2A5 5 0 0 0 12 3.93l-1.5 1.5M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.5-1.5"/>',
  'filter':'<path d="M4 7h16M7 12h10m-7 5h4"/>',
  'plus':'<path d="M12 5v14M5 12h14"/>',
  'book':'<path d="M4 4.5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 0-2 2zm0 0v17m0-4.5a2 2 0 0 1 2-2h14"/>',
  'external':'<path d="M13 5h6v6m0-6-9 9"/><path d="M19 13v6H5V5h6"/>',
  'globe':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 5-6 13 0 18m0-18c6 5 6 13 0 18"/>'
  }
  return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">{paths.get(name,paths["arrow-up-right"])}</svg>'

def rich_text(v,depth):
  """Link only curated term phrases inside HTML-escaped, plain editorial prose."""
  aliases = []
  for term in TERMS:
    for a in [term['name']]+term['aliases']:
      if len(a.strip()) >= 3:
        aliases.append((a,term['id']))
  aliases.sort(key=lambda x:-len(x[0]))
  regex=re.compile('|'.join('(?<![A-Za-z0-9])'+re.escape(a)+'(?![A-Za-z0-9])' for a,_ in aliases),re.I)
  ids={a.lower():i for a,i in aliases}
  result=[];start=0; linked=set()
  for m in regex.finditer(str(v)):
    result.append(e(str(v)[start:m.start()]))
    term_id=ids.get(m.group().lower())
    if term_id and term_id not in linked:
      result.append(f'<a class="term-link" href="{link("glossary/"+term_id+"/",depth)}" title="术语：{e(TERM_MAP[term_id]["zh"])}">{e(m.group())}<sup>↗</sup></a>')
      linked.add(term_id)
    else:result.append(e(m.group()))
    start=m.end()
  result.append(e(str(v)[start:]))
  return ''.join(result)

def case_terms(c):
  """Editorially reviewed source-of-truth edges; prose never creates a graph fact."""
  return [TERM_MAP[t] for t in REVIEWED_CASE_TERMS.get(c['slug'],[]) if t in TERM_MAP]

def nav(depth=0, active=''):
  links=[('案例','library/','library'),('产品','products/','products'),('团队','companies/','companies'),('机制','systems/','systems'),('论文','research/','research'),('知识图谱','graph/','graph')]
  items=''.join(f'<a href="{link(p,depth)}" class="nav-link {"active" if key==active else ""}">{text}</a>' for text,p,key in links)
  return f'''<header class="header"><div class="shell header-inner">
  <a class="brand" href="{link('',depth)}" aria-label="Plica — 首页"><span class="brand-symbol" aria-hidden="true"><span></span><span></span><span></span></span><span>Plica<span class="brand-period">.</span></span></a>
  <nav class="nav-main" aria-label="主导航">{items}</nav>
  <div class="nav-tail"><span class="edition">INDEPENDENT SYSTEMS INDEX</span><a class="header-search" href="{link('library/',depth)}" aria-label="搜索案例">{icon('search',19)}</a><button class="mobile-menu" aria-label="打开导航" aria-controls="mobile-nav" aria-expanded="false">{icon('menu',22)}</button></div>
</div><nav class="mobile-nav" id="mobile-nav" aria-label="移动端导航">{items}<a href="{link('about/',depth)}">关于 Plica</a></nav></header>'''

def footer(depth):
  return f'''<footer class="footer"><div class="shell footer-grid"><div><a class="brand footer-brand" href="{link('',depth)}"><span class="brand-symbol" aria-hidden="true"><span></span><span></span><span></span></span><span>Plica<span class="brand-period">.</span></span></a><p>理解软件世界，而不止使用它。</p><small>一线团队公开的真实系统设计，独立策展与导读。<br>非所提及公司的官方站点，所有原文版权归原作者。</small></div><div><b>EXPLORE</b><a href="{link('library/',depth)}">全部案例</a><a href="{link('products/',depth)}">产品索引</a><a href="{link('systems/',depth)}">系统机制</a><a href="{link('companies/',depth)}">团队索引</a><a href="{link('research/',depth)}">研究论文</a><a href="{link('glossary/',depth)}">术语库</a><a href="{link('graph/',depth)}">知识图谱</a><a href="{link('compare/',depth)}">横向比较</a></div><div><b>PLICA</b><a href="{link('about/',depth)}">编辑原则</a><a href="{link('sponsor/',depth)}">合作与赞助</a><a href="{link('library/',depth)}">阅读档案</a><a href="{link('skill/',depth)}">公开 Agent Skill</a></div></div><div class="shell footer-bottom"><span>© 2026 Plica · Independent editorial project</span><span>READ THE SYSTEM, NOT THE HYPE. <span class="asterisk">✳</span></span></div></footer>'''

def page(title, desc, body, depth=0, active='', extra_head=''):
  return f'''<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>{e(title)} — Plica</title><meta name="description" content="{e(desc)}"><meta name="theme-color" content="#f8f7f2"><meta property="og:type" content="website"><meta property="og:title" content="{e(title)} — Plica"><meta property="og:description" content="{e(desc)}"><link rel="stylesheet" href="{link('assets/site.css',depth)}"><link rel="icon" href="{link('assets/favicon.svg',depth)}" type="image/svg+xml">{extra_head}</head><body data-root="{link('',depth)}">{nav(depth,active)}<main id="main">{body}</main>{footer(depth)}<div class="toast" id="toast" role="status" aria-live="polite"></div><script src="{link('assets/site.js',depth)}" defer></script></body></html>'''

def top_label(text, opposite=''):
  return f'<div class="section-line"><span>{text}</span><span>{opposite}</span></div>'

def small_card(c, depth, feature=False, idx=''):
  ca=CATMAP[c['category']]
  company=c['company']
  meta=f'{e(c["company"])} <span class="dot-sep">·</span> {e(md_date(c["date"]))}'
  return f'''<article class="case-card {'feature-card' if feature else ''}" data-category="{e(c['category'])}" data-company="{e(c['company'])}" data-product="{e(c['product'])}" data-search="{e(' '.join([c['title'],c['question'],c['summary'],c['company'],c['product'],ca['label'], ' '.join(c['mechanisms'])]).lower())}">
  <a class="case-click" href="{link('cases/'+c['slug']+'/',depth)}" aria-label="阅读：{e(c['question'])}"></a>
  <div class="case-meta"><span class="case-index">{e(idx or ca['num'])} / {e(ca['english'].upper())}</span><span>{meta}</span></div>
  <div class="case-content"><div class="case-body"><h3>{e(c['question'])}</h3><p>{e(c['summary'])}</p></div><span class="round-arrow">{icon('arrow-up-right',20)}</span></div>
  <div class="case-base"><span>{e(c['signal'])}</span><span>{e(c['title'])}</span></div>
</article>'''

def feature_case(c,depth):
 return f'''<article class="hero-feature"><div class="hero-feature-text"><div class="eyebrow"><span class="eyebrow-square"></span> EDITOR'S FEATURE <span class="small-slash">/</span> {e(c['company'].upper())}</div><h2>{e(c['question'])}</h2><p>{e(c['summary'])}</p><a class="text-link" href="{link('cases/'+c['slug']+'/',depth)}">展开这个系统 {icon('arrow-right',17)}</a><div class="hero-feature-bottom"><span>01 / THE DEEP DIVE</span><span>{e(c['readTime'])} READ</span></div></div><div class="feature-art" aria-hidden="true"><div class="diagram-label">SYSTEM / 001</div><svg viewBox="0 0 480 390" role="presentation"><defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#ffffff" opacity=".17"/></pattern></defs><rect width="480" height="390" fill="url(#dots)"/><path d="M25 214h86M368 214h88M241 44v47M241 296v55" stroke="#e2eee4" stroke-width="1.3" stroke-dasharray="5 7" opacity=".8"/><rect x="114" y="88" width="252" height="214" rx="3" fill="none" stroke="#edf2e5" opacity=".35"/><rect x="138" y="117" width="206" height="165" fill="none" stroke="#edf2e5" opacity=".35"/><circle cx="240" cy="200" r="64" stroke="#d4e0cf" fill="none" stroke-width="1.5"/><circle cx="240" cy="200" r="38" stroke="#d4e0cf" fill="none" stroke-width="1.4" stroke-dasharray="4 5"/><path d="M240 117v166M138 200h206" stroke="#f5f7ed" stroke-width="1" opacity=".55"/><circle cx="240" cy="200" r="10" fill="#cde3cf"/><circle cx="240" cy="136" r="4" fill="#cde3cf"/><circle cx="304" cy="200" r="4" fill="#cde3cf"/><circle cx="240" cy="264" r="4" fill="#cde3cf"/><circle cx="176" cy="200" r="4" fill="#cde3cf"/><path d="M94 66h59M94 66v29M387 318h-51M387 318v-27" stroke="#edf2e5" opacity=".6"/><text x="132" y="75" fill="#f5f7ed" font-size="11" font-family="monospace" letter-spacing="2">DESIGN / DECISION</text><text x="305" y="332" fill="#f5f7ed" font-size="11" font-family="monospace" letter-spacing="2">TRADE-OFF</text></svg><span class="diagram-bottom">LOOK INSIDE THE SYSTEM <span>↗</span></span></div></article>'''

def section_intro(kicker,title,description,view_text=None,view_url=None,depth=0):
 right=f'<a class="section-view" href="{link(view_url,depth)}">{e(view_text)} {icon("arrow-up-right",16)}</a>' if view_text else ''
 return f'<div class="section-intro"><div><div class="section-kicker">{e(kicker)}</div><h2>{title}</h2><p>{description}</p></div>{right}</div>'

def homepage():
 depth=0
 feature=next(x for x in DATA if x['slug']=='netflix-open-connect-popularity')
 front=[next(x for x in DATA if x['slug']==s) for s in ['dropbox-nucleus-sync','spotify-experimentation-platform','stripe-ledger-money-movement','wechat-miniprogram-web-runtime']]
 systems=''.join(f'''<a class="system-tile" href="systems/{k}/"><span class="system-num">{num}</span><strong>{label}</strong><span class="system-tile-en">{en}</span><span class="system-link">{icon('arrow-up-right',18)}</span></a>''' for k,label,en,_,num,_ in CATS)
 companies=''.join(f'<a class="wordmark" href="products/{slug(p)}/" title="查看 {e(p)}">{e(p)}</a>' for p,_,_ in PRODUCTS[:16])
 cards=''.join(small_card(c,depth,idx=f'{i:02d}') for i,c in enumerate(front,2))
 body=f'''<section class="hero shell"><div class="hero-stamp"><span class="pulse-dot"></span> A CURATED ATLAS OF REAL SYSTEMS <span class="stamp-right">ISSUE 001 — 2026</span></div><div class="hero-grid"><div><p class="overline">THE META-ARCHITECTURE OF REAL SYSTEMS</p><h1>How the world’s<br><em>software</em><span class="hero-hanging">works.</span></h1><p class="hero-sub">从产品到团队，从机制到研究。<br>沿着一手资料，理解软件世界的运行原理与架构取舍。</p><div class="hero-actions"><a href="library/" class="button-primary">探索全部案例 {icon('arrow-up-right',17)}</a><a href="research/" class="hero-secondary">探索理论研究 {icon('arrow-right',16)}</a></div></div><div class="hero-side"><span class="vertical-caption">PLICA / THE SYSTEMS INDEX</span><div class="side-figure">P<span>·</span></div><div class="hero-side-copy">BEYOND THE INTERFACE<br>INTO THE DECISIONS</div></div></div><div class="hero-foot"><span>CURATED FROM FIRST-HAND SOURCES</span><span>SCROLL TO EXPLORE ↓</span></div></section>
 <section class="shell feature-section">{top_label('01 / FEATURED CASE STUDY','SELECTED FOR ITS ARCHITECTURAL DEPTH')}{feature_case(feature,depth)}</section>
 <section class="shell browse-section">{section_intro('02 / BROWSE BY DOMAIN','从问题出发，<em>理解设计。</em>','存储、视频、推荐、协作……同样的问题，不同的团队会做出什么选择？','所有机制','systems/',depth)}<div class="system-grid">{systems}</div></section>
 <section class="shell latest-section">{section_intro('03 / READ THE CASES','精选<em>原始案例。</em>','每一篇都包含设计背景、核心机制和代价，而非只有技术名词。','查看完整档案','library/',depth)}<div class="case-grid">{cards}</div></section>
 <section class="shell company-section">{section_intro('04 / THE BUILDERS','谁构建了<em>这些系统？</em>','从具体产品切入，沿着同一个团队公开的技术资料向下探索。','浏览全部产品','products/',depth)}<div class="wordmark-cloud">{companies}</div></section>
 <section class="shell discovery-panel">{section_intro('05 / BUILD THE CONNECTIONS','知识的<em>下一条线索。</em>','从术语进入真实案例，从研究论文理解基础原理。知识不是孤立的文章。')}<div class="discovery-grid"><a href="companies/"><small>ORGANIZATIONS</small><strong>谁设计了这些系统？</strong><span>浏览公司与团队 →</span></a><a href="glossary/"><small>GLOSSARY</small><strong>从一个术语出发。</strong><span>进入可关联的术语库 →</span></a><a href="graph/"><small>KNOWLEDGE GRAPH</small><strong>看见知识之间的关系。</strong><span>探索交互图谱 →</span></a><a href="research/"><small>RESEARCH</small><strong>研究与生产实践分开。</strong><span>阅读 arXiv 论文 →</span></a></div></section>
 <section class="shell editorial-banner"><div><p class="overline">COMPARE DESIGN CHOICES</p><h2>同样的难题，<br><em>不同的答案。</em></h2><p>从 Dropbox 到 Google，从 Uber 到 Spotify。理解不同方案背后的约束，而不是照搬答案。</p><a href="compare/" class="button-ivory">探索横向比较 {icon('arrow-up-right',17)}</a></div><div class="banner-glyph" aria-hidden="true"><div class="glyph-circles"><span></span><span></span><span></span></div><small>EVERY DESIGN<br>IS A TRADE-OFF</small></div></section>
 <section class="shell last-note"><span>AN INDEPENDENT CURATION PROJECT</span><p>我们不复述科技新闻。<br>我们收藏真正解释<strong>“为什么这样设计”</strong>的资料。</p><a href="about/">阅读编辑原则 {icon('arrow-right',16)}</a></section>'''
 return page('探索真实软件系统的内部世界','从 Dropbox、YouTube、Netflix、Figma、Spotify 到 Uber，精选真实团队公开的系统机制、整体架构与设计取舍。',body)

def archive():
 depth=1
 cards=''.join(small_card(c,depth,idx=f'{i:02d}') for i,c in enumerate(DATA,1))
 opts=''.join(f'<option value="{e(k)}">{e(label)}</option>' for k,label,_,_,_,_ in CATS)
 companies=sorted(set(c['company'] for c in DATA))
 co=''.join(f'<option value="{e(name)}">{e(name)}</option>' for name in companies)
 product_options=''.join(f'<option value="{e(name)}">{e(name)}</option>' for name in sorted(set(c['product'] for c in DATA)))
 body=f'''<section class="shell page-top">{top_label('THE ARCHIVE','CURATED / VERIFIED ORIGINAL SOURCES')}<p class="overline">THE KNOWLEDGE INDEX</p><h1>深入每一个<br><em>真实系统。</em></h1><p class="page-lead">不是泛技术快讯，而是关于架构决策的第一手案例。搜索公司、产品、机制或问题。</p></section>
 <section class="shell archive-wrap"><div class="archive-bar"><label class="search-field">{icon('search',19)}<input id="archive-search" type="search" placeholder="试试：Feature Flag、视频转码、Figma、存储…" autocomplete="off" aria-label="搜索案例"><kbd>/</kbd></label><div class="filters"><label>产品 <select id="archive-product" aria-label="选择产品"><option value="all">全部产品</option>{product_options}</select></label><label>机制 <select id="archive-category" aria-label="选择系统领域"><option value="all">全部领域</option>{opts}</select></label><label>公司 / 团队 <select id="archive-company" aria-label="选择公司"><option value="all">全部公司</option>{co}</select></label><button id="clear-filters" class="clear-button" type="button">清除筛选</button></div></div>
 <div class="archive-count"><span>INDEX / <strong id="result-count">{len(DATA)}</strong> CASES</span><span>ALL ARTICLES LINK TO ORIGINAL SOURCES</span></div><div class="case-grid archive-grid" id="archive-results">{cards}</div><div class="empty-state" id="empty-state" hidden><div>⊘</div><h3>没有找到匹配的案例</h3><p>可以换一个关键词，或者清除筛选条件。</p><button type="button" id="empty-clear" class="button-primary">清除筛选 {icon('arrow-right',15)}</button></div></section>'''
 return page('全部案例','搜索和浏览 Plica 精选的一线系统设计案例。',body,depth,'library')

def products_index():
 depth=1
 cards=''.join(f'''<a class="product-card" href="{link('products/'+slug(p)+'/',depth)}"><span class="product-icon">{e(initial)}</span><span class="product-name">{e(p)}</span><span class="product-descr">{e(descr)}</span><span class="product-bottom">{sum(c['product']==p for c in DATA)} CASES <span>{icon('arrow-up-right',18)}</span></span></a>''' for p,descr,initial in PRODUCTS)
 body=f'''<section class="shell page-top">{top_label('PRODUCT INDEX','THE PEOPLE BEHIND THE SYSTEMS')}<p class="overline">EXPLORE BY PRODUCT</p><h1>他们如何<em>构建。</em></h1><p class="page-lead">从一款你熟悉的软件出发。沿着工程团队的公开记录，走进它的基础设施。</p></section><section class="shell page-main">{top_label('ALL PRODUCTS',f'{len(PRODUCTS):02d} PRODUCT RECORDS')}<div class="product-grid">{cards}</div></section>'''
 return page('按产品探索','按产品和公司检索真实软件系统的架构设计案例。',body,depth,'products')

def product_detail(p):
 depth=2
 items=[c for c in DATA if c['product']==p]
 info=PRODUCT_INFO[p]
 body=f'''<section class="shell page-top product-top">{top_label('THE PRODUCT INDEX',f'{len(items):02d} VERIFIED CASES')}<a href="{link('products/',depth)}" class="back-link">← 所有产品</a><div class="product-title-row"><span class="product-mark">{e(info['initial'])}</span><div><p class="overline">PRODUCT PROFILE</p><h1>{e(p)}</h1><p class="page-lead">{e(info['descr'])}</p></div></div></section><section class="shell page-main">{top_label('INSIDE THE SYSTEM',f'{len(items):02d} CASE STUDIES')}<div class="case-grid">{''.join(small_card(c,depth,idx=f'{i:02d}') for i,c in enumerate(items,1))}</div><div class="source-disclaimer">资料由该机构或其研究人员公开，不代表本网站获得其认可或与其合作。</div></section>'''
 return page(p, f'{p} 的系统架构与设计机制公开案例',body,depth,'products')

def systems_index():
 depth=1
 rows=''.join(f'''<a class="domain-row" href="{link('systems/'+k+'/',depth)}"><span class="domain-no">{num}</span><div><h2>{e(label)}</h2><p>{e(descr)}</p></div><span class="domain-en">{e(en.upper())}</span><span class="domain-count">{sum(c['category']==k for c in DATA):02d} CASES</span><span class="domain-arrow">{icon('arrow-up-right',22)}</span></a>''' for k,label,en,_,num,descr in CATS)
 body=f'''<section class="shell page-top">{top_label('SYSTEM INDEX','ORGANIZED BY DESIGN PROBLEMS')}<p class="overline">EXPLORE BY MECHANISM</p><h1>看见界面背后的<br><em>运行法则。</em></h1><p class="page-lead">一次寻找一个工程问题，再观察不同公司如何定义约束、设计机制与权衡。</p></section><section class="shell page-main">{rows}<div class="end-rule">THE MAP IS NEVER FINISHED.</div></section>'''
 return page('按系统机制探索','按照存储、视频、推荐、协作、发布与实验等真实设计问题探索第一手工程资料。',body,depth,'systems')

def system_detail(k):
 depth=2
 cat=CATMAP[k]
 items=[c for c in DATA if c['category']==k]
 body=f'''<section class="shell page-top"><a href="{link('systems/',depth)}" class="back-link">← 所有机制</a><p class="overline">SYSTEM / {cat['num']} / {e(cat['english'].upper())}</p><h1>{e(cat['label'])}<span class="h1-period">.</span></h1><p class="page-lead">{e(cat['descr'])}。比较实际公司遇到的约束以及它们公开的解决路径。</p></section><section class="shell page-main">{top_label('THE CASES',f'{len(items):02d} DOCUMENTED STORIES')}<div class="case-grid">{''.join(small_card(c,depth,idx=f'{i:02d}') for i,c in enumerate(items,1))}</div><div class="topic-cta">还想比较其他领域的方案？ <a href="{link('compare/',depth)}">查看跨团队比较 {icon('arrow-up-right',17)}</a></div></section>'''
 return page(cat['label'],f'{cat["label"]}相关的真实工程与架构案例。',body,depth,'systems')

def case_detail(c):
 depth=2
 cat=CATMAP[c['category']]
 related=[x for x in DATA if x['slug']!=c['slug'] and (x['category']==c['category'] or x['company']==c['company'])][:3]
 why=rich_text(c['why'],depth)
 points=''.join(f'<div class="insight-row"><span class="insight-index">0{i}</span><p>{rich_text(p,depth)}</p></div>' for i,p in enumerate(c['points'],1))
 related_cards=''.join(small_card(x,depth) for x in related)
 tags=''.join(f'<span class="tag">{e(m)}</span>' for m in c['mechanisms'])
 body=f'''<section class="shell case-header">{top_label(f'CASE STUDY / {e(cat["english"].upper())}', 'FIRST-PARTY SOURCE')}
 <div class="breadcrumbs"><a href="{link('library/',depth)}">全部案例</a><span>/</span><a href="{link('systems/'+c['category']+'/',depth)}">{e(cat['label'])}</a><span>/</span><span>{e(c['company'])}</span></div>
 <div class="case-head-grid"><div><p class="overline">{e(c['company'].upper())} <span class="little-diamond">◆</span> {e(c['signal'])}</p><h1>{e(c['question'])}</h1><p class="case-head-summary">{rich_text(c['summary'],depth)}</p><div class="case-actions"><a class="button-primary" href="{e(c['source'])}" target="_blank" rel="noopener noreferrer">阅读原始资料 {icon('arrow-up-right',17)}</a><button class="icon-action" data-copy-link type="button" aria-label="复制这篇案例链接" title="复制链接">{icon('copy',19)}</button><button class="icon-action save-button" data-save="{e(c['slug'])}" type="button" aria-label="收藏这篇案例" aria-pressed="false" title="收藏到此设备">{icon('bookmark',19)}</button></div></div><aside class="case-facts"><div class="facts-heading">SOURCE / FACT SHEET</div><dl><div><dt>ORIGINAL WORK</dt><dd>{e(c['title'])}</dd></div><div><dt>PUBLISHED BY</dt><dd>{e(c['company'])}</dd></div><div><dt>ORIGINAL DATE</dt><dd>{e(md_date(c['date']))}</dd></div><div><dt>FORMAT</dt><dd>{e(c['type'])}</dd></div><div><dt>ESTIMATED READING</dt><dd>{e(c['readTime'])}</dd></div></dl><a href="{e(c['source'])}" target="_blank" rel="noopener noreferrer">VIEW FIRST-HAND SOURCE {icon('arrow-up-right',14)}</a></aside></div></section>
 <section class="shell case-article-grid"><div class="article-toc"><span>ON THIS PAGE</span><a href="#context">01 / 为什么值得读</a><a href="#mechanisms">02 / 三个关键机制</a><a href="#tradeoffs">03 / 设计代价与边界</a><a href="#source">04 / 原始资料</a></div>
 <article class="article-main"><div class="article-section" id="context"><div class="article-number">01 <span>/</span> THE CONTEXT</div><h2>为什么值得读</h2><p class="rich-lead">{why}</p></div><div class="article-section" id="mechanisms"><div class="article-number">02 <span>/</span> THE DESIGN</div><h2>三个关键机制</h2><div class="insights">{points}</div></div><div class="article-section" id="tradeoffs"><div class="article-number">03 <span>/</span> THE TRADE-OFF</div><h2>设计总有代价</h2><p class="rich-lead">{rich_text(c['tradeoff'],depth)}</p><p class="editor-note"><strong>编辑说明</strong>：此处是对原文设计要点的归纳与局限性提示，不等于对相关公司现行内部实现的全面描述。发布日期见右侧来源信息。</p></div><div class="article-section" id="source"><div class="article-number">04 <span>/</span> READ THE ORIGINAL</div><h2>回到原始资料</h2><p class="source-title">{e(c['title'])}</p><div class="tags">{tags}</div><a class="large-outbound" href="{e(c['source'])}" target="_blank" rel="noopener noreferrer">打开 {e(c['company'])} 原文 {icon('arrow-up-right',21)}</a><p class="copyright-notice">Plica 只提供原创导读与索引；全文、图片和原文著作权归原作者或其出版方。</p></div></article></section>
 <section class="shell related-section">{section_intro('KEEP EXPLORING','沿着线索<em>继续阅读。</em>','从同一机制或同一家公司的公开实践，理解另一种设计取舍。','全部案例','library/',depth)}<div class="case-grid">{related_cards}</div></section>'''
 return page(c['question'],c['summary'],body + ai_drawer(c,depth),depth)

def companies_index():
 depth=1
 cards=[]
 for name in COMPANIES:
  count=sum(c['company']==name for c in DATA)
  kinds=', '.join(sorted(set(CATMAP[c['category']]['label'] for c in DATA if c['company']==name)))
  cards.append(f'<a class="product-card" href="{link("companies/"+slug(name)+"/",depth)}"><span class="product-icon">{e(name[:1])}</span><span class="product-name">{e(name)}</span><span class="product-descr">{e(kinds)}</span><span class="product-bottom">{count} FIRST-PARTY CASES <span>{icon("arrow-up-right",18)}</span></span></a>')
 body=f'<section class="shell page-top">{top_label("ORGANIZATION INDEX","TEAMS BEHIND THE SYSTEMS")}<p class="overline">EXPLORE BY COMPANY</p><h1>从团队的视角<br><em>理解系统。</em></h1><p class="page-lead">同一家公司可能运营不同产品，也可能有多个独立技术团队。这里按公开资料中的发布机构整理。</p></section><section class="shell page-main">{top_label("ORGANIZATIONS",str(len(COMPANIES))+" DOCUMENTED GROUPS")}<div class="product-grid">{"".join(cards)}</div></section>'
 return page('按公司与团队探索','按照实际发布团队与组织浏览一手技术案例。',body,depth,'companies')

def company_detail(name):
 depth=2
 cases=[c for c in DATA if c['company']==name]
 products=sorted(set(c['product'] for c in cases))
 links=' '.join(f'<a class="tag" href="{link("products/"+slug(p)+"/",depth)}">{e(p)}</a>' for p in products)
 body=f'<section class="shell page-top">{top_label("ORGANIZATION PROFILE",str(len(cases))+" FIRST-PARTY STORIES")}<a href="{link("companies/",depth)}" class="back-link">← 所有团队</a><p class="overline">PUBLISHING ORGANIZATION</p><h1>{e(name)}<span class="h1-period">.</span></h1><p class="page-lead">这一机构公开的工程与架构资料。产品与机构被分别建模，具体文章的作者/团队以原文为准。</p><div class="tags">{links}</div></section><section class="shell page-main">{top_label("DOCUMENTED WORK",str(len(cases))+" CASE STUDIES")}<div class="case-grid">{"".join(small_card(c,depth) for c in cases)}</div></section>'
 return page(name+' 的公开工程案例',name+' 一手工程文献和架构资料',body,depth,'companies')

def glossary_index():
 depth=1
 rows=[]
 for t in TERMS:
  n=sum(t['id'] in [q['id'] for q in case_terms(c)] for c in DATA)
  rows.append(f'<a href="{link("glossary/"+t["id"]+"/",depth)}" class="glossary-row"><span class="glossary-row-name">{e(t["name"])}</span><span class="glossary-row-def">{e(t["zh"])} · {e(t["definition"])}</span><span class="glossary-row-count">{n} CASES →</span></a>')
 body=f'<section class="shell page-top">{top_label("GLOSSARY","A LANGUAGE FOR SYSTEM DESIGN")}<p class="overline">CONCEPTS / DEFINITIONS / SOURCES</p><h1>理解术语，<br><em>才能理解设计。</em></h1><p class="page-lead">术语不是孤立的解释。每一个概念都能通往相关生产案例或研究论文。</p></section><section class="shell page-main"><label class="glossary-search">{icon("search",18)}<input type="search" id="glossary-search" placeholder="搜索术语、中文释义…" aria-label="搜索术语"></label><div id="glossary-list">{"".join(rows)}</div><p class="source-disclaimer">术语定义为 Plica 原创编辑说明，不代表任何单一原文作者的定义。部分机制仅保留术语条目，不代表已有对应生产案例。</p></section>'
 return page('术语库','系统工程术语释义、关联案例与研究论文',body,depth)

def glossary_detail(term):
 depth=2
 cases=[c for c in DATA if term['id'] in [t['id'] for t in case_terms(c)]]
 papers=[p for p in PAPERS if p['category']==term['category']]
 cites=''.join(small_card(c,depth) for c in cases[:6]) or '<p class="source-disclaimer">当前尚未关联经核实的生产案例。</p>'
 p_links=''.join(f'<a class="paper-tiny" href="{link("research/"+p["id"]+"/",depth)}">{e(p["title"])} {icon("arrow-up-right",15)}</a>' for p in papers)
 body=f'<section class="shell page-top">{top_label("GLOSSARY / TERM",e(CATMAP[term["category"]]["english"].upper()))}<a href="{link("glossary/",depth)}" class="back-link">← 术语库</a><p class="overline">CONCEPT</p><h1>{e(term["name"])}<span class="h1-period">.</span></h1><p class="page-lead">{e(term["zh"])} — {e(term["definition"])}</p></section><section class="shell page-main">{top_label("IN PRODUCTION",str(len(cases))+" RELEVANT CASES")}<div class="case-grid">{cites}</div><div class="glossary-papers"><h2>相关理论研究</h2>{p_links or "<p>暂未建立论文关联。</p>"}<small>这些关联基于相同研究领域，不等于某产品直接采用论文方法。</small></div></section>'
 return page(term['name']+' 术语','术语定义与系统架构案例',body,depth)

def research_index():
 depth=1
 cards=[]
 for p in PAPERS:
  cards.append(f'<a class="research-card" href="{link("research/"+p["id"]+"/",depth)}"><span class="research-meta">RESEARCH · arXiv:{e(p["arxiv"])} · {e(p["year"])}</span><h2>{e(p["question"])}</h2><p>{e(p["summary"])}</p><strong>{e(p["title"])}</strong><span class="research-arrow">{icon("arrow-up-right",23)}</span></a>')
 body=f'<section class="shell page-top">{top_label("RESEARCH PAPERS","A SEPARATE EVIDENCE TRACK")}<p class="overline">THEORY / EVIDENCE / METHODS</p><h1>理论向前。<br><em>实践向深。</em></h1><p class="page-lead">这一分区收录经核实的论文与研究结果。理论证明、实验结论和生产实践保持独立，仅通过有边界的关联互相指引。</p></section><section class="shell page-main"><div class="boundary-note"><strong>Production ≠ Research</strong><span>论文提出一项方法，并不意味着你熟悉的软件已经在线上采用它。</span><a href="{link("library/",depth)}">查看生产案例 {icon("arrow-up-right",15)}</a></div><div class="research-list">{"".join(cards)}</div><p class="source-disclaimer">Thank you to arXiv for use of its open access interoperability. Plica 与 arXiv 无官方关联；论文权利归作者/出版方。</p></section>'
 return page('Research / 论文','独立收录 arXiv 等来源的系统架构研究论文',body,depth,'research')

def research_detail(p):
 depth=2
 rel=next((c for c in DATA if c['slug']==p['related_case']),None)
 relcard=small_card(rel,depth) if rel else ''
 points=''.join(f'<div class="insight-row"><span class="insight-index">0{i}</span><p>{rich_text(a,depth)}</p></div>' for i,a in enumerate(p['takeaways'],1))
 body=f'<section class="shell page-top">{top_label("RESEARCH / ARXIV",e(p["arxiv"]))}<a href="{link("research/",depth)}" class="back-link">← 返回论文目录</a><p class="overline">{e(p["year"])} · {e(p["authors"])}</p><h1>{e(p["question"])}</h1><p class="page-lead">{e(p["summary"])}</p><a class="button-primary" href="https://arxiv.org/abs/{e(p["arxiv"])}" target="_blank" rel="noopener noreferrer">访问 arXiv 原始论文 {icon("arrow-up-right",17)}</a></section><section class="shell case-article-grid"><aside class="article-toc">PAPER / NOT A DEPLOYMENT CLAIM</aside><article class="article-main"><div class="article-section"><div class="article-number">01 / KEY IDEAS</div><h2>研究的核心内容</h2><div class="insights">{points}</div></div><div class="article-section"><div class="article-number">02 / EVIDENCE BOUNDARIES</div><h2>证据与边界</h2><p class="rich-lead">{e(p["status"])}</p><a class="large-outbound" href="https://arxiv.org/abs/{e(p["arxiv"])}" target="_blank" rel="noopener noreferrer">打开 {e(p["title"])} {icon("arrow-up-right",18)}</a></div></article></section><section class="shell related-section">{section_intro("RELATED PRODUCTION","相关的<em>生产实践。</em>","下列仅为主题相近的交叉阅读；不代表某个公司采用了本论文的技术。") }<div class="case-grid">{relcard}</div></section>'
 return page(p['question'],'arXiv:'+p['arxiv']+' / '+p['title'],body,depth,'research')

def graph_page():
 depth=1
 data=[]
 for cat,*_ in CATS:
  cs=[{'slug':c['slug'],'name':c['company'],'title':c['question'],'path':link('cases/'+c['slug']+'/',depth),'kind':'production'} for c in DATA if c['category']==cat] + [{'slug':p['id'],'name':'arXiv','title':p['title'],'path':link('research/'+p['id']+'/',depth),'kind':'research'} for p in PAPERS if p['category']==cat]
  data.append({'id':cat,'label':'机制 · '+CATMAP[cat]['label'],'cases':cs})
 for t in TERMS:
  cs=[{'slug':c['slug'],'name':c['company'],'title':c['question'],'path':link('cases/'+c['slug']+'/',depth),'kind':'production'} for c in DATA if t['id'] in [q['id'] for q in case_terms(c)]]
  if cs: data.append({'id':'term:'+t['id'],'label':'术语 · '+t['name'],'cases':cs,'termLink':link('glossary/'+t['id']+'/',depth)})
 for co in COMPANIES:
  cs=[{'slug':c['slug'],'name':c['product'],'title':c['question'],'path':link('cases/'+c['slug']+'/',depth),'kind':'production'} for c in DATA if c['company']==co]
  if cs:data.append({'id':'company:'+slug(co),'label':'团队 · '+co,'cases':cs,'termLink':link('companies/'+slug(co)+'/',depth)})
 for prod,*_ in PRODUCTS:
  cs=[{'slug':c['slug'],'name':c['company'],'title':c['question'],'path':link('cases/'+c['slug']+'/',depth),'kind':'production'} for c in DATA if c['product']==prod]
  if cs:data.append({'id':'product:'+slug(prod),'label':'产品 · '+prod,'cases':cs,'termLink':link('products/'+slug(prod)+'/',depth)})
 source=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
 body=f'<section class="shell page-top">{top_label("KNOWLEDGE GRAPH","CURATED LINKS / NOT GENERATED CLAIMS")}<p class="overline">EXPLORE CONNECTIONS</p><h1>让知识<br><em>彼此连接。</em></h1><p class="page-lead">从一个设计机制出发，看有哪些团队发表过相关案例。连线来自分类和人工审定的术语关系；论文边仅表示主题关联，不代表该产品采用了论文方案。</p></section><section class="shell page-main"><div class="graph-controls"><label>选择研究领域 <select id="graph-topic">{"".join(f'<option value="{e(d["id"])}">{e(d["label"])}</option>' for d in data)}</select></label><span>可点击外围节点进入相关案例</span></div><div class="graph-panel"><svg id="knowledge-svg" viewBox="0 0 930 510" role="img" aria-label="机制到生产案例的关联图"></svg><div class="graph-details"><strong id="graph-heading">关联案例</strong><div id="graph-list"></div></div></div><p class="source-disclaimer">图谱包括机制、术语、产品、团队与生产案例；论文仅在相关领域展示为理论资料，不能据此认定产品已采用论文方法。术语边记录在 relations.json，移动端使用等效关系列表。</p><script type="application/json" id="graph-data">{source}</script></section>'
 return page('知识图谱','探索技术机制和真实产品架构案例的关系网络',body,depth,'graph')

def skill_landing():
 depth=1
 body=f'<section class="shell page-top">{top_label("OPEN AGENT SKILL","PORTABLE / EVIDENCE-FIRST")}<p class="overline">PLICA ARCHITECTURE</p><h1>让架构建议<br><em>有据可查。</em></h1><p class="page-lead">开放安装的 Agent Skill：先理解你的场景与约束，再从 Plica 收录的一手案例中寻找适用设计，不照抄大厂技术栈。</p><div class="hero-actions"><a class="button-primary" href="{link("skill/plica-architecture/SKILL.md",depth)}" download="SKILL.md">获取 SKILL.md {icon("arrow-up-right",17)}</a><a class="hero-secondary" href="{link("api/v1/index.json",depth)}">公开机器可读索引 →</a></div></section><section class="shell page-main">{top_label("HOW IT WORKS","READ THE EVIDENCE, THEN DESIGN")}<div class="discovery-grid"><div><small>01 / CONSTRAINTS</small><strong>先收集业务上下文</strong><span>规模、SLO、延迟、一致性、成本、团队资源</span></div><div><small>02 / RESEARCH</small><strong>再检索案例与论文</strong><span>每项关键观点都能追溯原始出处</span></div><div><small>03 / TRADE-OFFS</small><strong>提供备选架构</strong><span>列出适用前提、风险、验证方法</span></div><div><small>04 / DELIVERY</small><strong>形成可执行方案</strong><span>ADR、渐进发布、回滚、可观测性与测试</span></div></div><p class="source-disclaimer">这是公开参考知识 Skill，不会自动连接用户私有仓库，不提供云服务或生产安全保证。当前索引以静态形式公开；模型执行能力依赖用户的 Agent 环境。</p></section>'
 return page('Plica Architecture Skill','使用原始工程资料辅助系统设计的开放 Agent Skill',body,depth)

def ai_drawer(c,depth):
 return f"""<button class="selection-hint" id="selection-hint" type="button" hidden>✳ 向 Plica AI 提问 <span>↗</span></button><div class="ai-backdrop" id="ai-backdrop" hidden></div><aside class="ai-drawer" id="ai-drawer" aria-label="Plica AI 阅读辅助" aria-hidden="true"><div class="ai-drawer-head"><strong>✳ Plica AI <small>EARLY PREVIEW</small></strong><button type="button" id="ai-close" aria-label="关闭侧边栏">✕</button></div><div class="ai-drawer-body"><p class="ai-intro">基于你选中的 Plica 导读内容提问。付费 AI 问答正在开发，暂不提供自动回答。</p><label for="ai-selected">SELECTED TEXT</label><blockquote id="ai-selected"></blockquote><label for="ai-question">你的问题</label><textarea id="ai-question" rows="4" placeholder="解释这里的设计取舍，并列出能验证它的来源。"></textarea><button class="button-primary" type="button" id="ai-copy">复制提问内容 {icon('copy',17)}</button><p class="ai-privacy">可复制到你自己的 AI 工具继续研究。Plica 当前不会上传或保存你的选中文字。</p></div></aside>"""

def compare():
 depth=1
 pairs=[
   ('video','视频处理：转码效率与画质', ['youtube-video-infrastructure','netflix-shot-based-encoding'],'一个从专用芯片和数据中心调度切入，一个从镜头级压缩策略切入。'),
   ('storage','存储系统：可靠性与成本', ['dropbox-magic-pocket','google-file-system'],'相似的容错诉求，不同年代与工作负载下的设计假设。'),
   ('release','发布控制：配置与实验', ['uber-flipr','uber-ab-platform','spotify-two-stacks'],'配置分发、实验评估与个性化系统，到底该合并还是分开？'),
   ('recommendation','推荐系统：在线反馈与排序', ['instagram-recommendations-1000','instagram-explore-ranking','bytedance-monolith','spotify-generative-inference'],'多阶段召回、在线学习与生成式推理，各自如何分配计算预算？'),
   ('developer','Agent 时代的代码平台：两种发展路线',['anthropic-source-control','github-git-agent-scale'],'Scion 选择集中式变化集，GitHub 在兼容 Git 的前提下重构基础设施；都是应对 Agent 提交负载的公开架构设计。'),
   ('storage','海量对象：块存储还是容器化小文件',['dropbox-magic-pocket','meta-haystack-photos','meta-tao-social-graph'],'不同数据形态下，内容布局、元数据开销和访问局部性怎样改变系统结构？'),
   ('release','实验平台的职责边界',['uber-ab-platform','spotify-experimentation-platform','spotify-two-stacks'],'从开关到配置属性，从实验指标到个性化服务，比较组织职责与平台边界。'),
   ('video','视频缓存与计算成本',['netflix-open-connect-popularity','youtube-video-infrastructure','netflix-shot-based-encoding'],'编码效率、边缘缓存命中率与基础设施成本之间的不同切入点。')
 ]
 rows=[]
 for k,heading,slugs,desc in pairs:
  cases=[next(x for x in DATA if x['slug']==s) for s in slugs]
  cards=''.join(f'''<a class="compare-cell" href="{link('cases/'+c['slug']+'/',depth)}"><span>{e(c['company'].upper())} / {e(c['signal'])}</span><h3>{e(c['question'])}</h3><p>{e(c['tradeoff'])}</p><strong>READ CASE {icon('arrow-up-right',15)}</strong></a>''' for c in cases)
  rows.append(f'''<section class="compare-group"><div class="compare-head"><span class="comparison-key">{e(CATMAP[k]['english'].upper())}</span><h2>{e(heading)}</h2><p>{e(desc)}</p></div><div class="compare-cells">{cards}</div></section>''')
 body=f'''<section class="shell page-top">{top_label('COMPARE THE TRADE-OFFS','NOT A RANKING OF COMPANIES')}<p class="overline">ONE QUESTION / MANY ANSWERS</p><h1>同样的问题。<br><em>不同的选择。</em></h1><p class="page-lead">真实架构没有唯一标准答案。并排观察设计背后的前提、风险和成本。</p></section><div class="shell compare-wrap">{''.join(rows)}<div class="source-disclaimer">这些比较是 Plica 的编辑归纳，不表示这些公司使用同一代系统或在相同工作负载下直接竞争。</div></div>'''
 return page('系统方案横向比较','对比不同科技公司在视频、存储、推荐和发布架构上的真实设计取舍。',body,depth,'compare')

def about():
 depth=1
 body=f'''<section class="shell page-top">{top_label('ABOUT / OUR EDITORIAL PRINCIPLES','WHAT WE BELIEVE')}<p class="overline">A DIFFERENT KIND OF TECH PUBLICATION</p><h1>不只看产品。<br><em>更要理解它。</em></h1><p class="page-lead">我们每天都在使用极其复杂的软件，却很少知道背后的决定是怎样做出的。Plica 收藏这些值得长期保存的第一手工程资料。</p></section><section class="shell about-grid"><div class="about-numbers">01 <span>—</span> 03</div><div class="about-copy"><h2>我们关注的是<em>元架构。</em></h2><p>不是类图、代码规范或工具清单，而是系统怎样组织自己：问题从哪来、哪些约束无法回避、为什么选这种机制、为了可靠性和成本放弃了什么。</p><div class="values"><div><span>01 / ORIGINAL</span><h3>优先一手资料</h3><p>官方技术博客、原团队演讲、研究论文和事故复盘。二手内容只作为线索，重要事实必须能回到出处。</p></div><div><span>02 / TRADE-OFFS</span><h3>不只讲成功</h3><p>好的架构始终有所取舍。我们尤其关注失败、迁移和复杂性如何在系统中转移。</p></div><div><span>03 / TRANSPARENCY</span><h3>事实与推断分开</h3><p>原文陈述、编辑总结、有限推论明确分开。不假装知道团队从未公开的内部机制。</p></div></div><a href="{link('library/',depth)}" class="button-primary">开始探索 {icon('arrow-up-right',17)}</a></div></section>'''
 return page('关于 Plica','关于 Plica 真实软件系统案例库，以及我们的独立编辑原则。',body,depth)

def sponsor():
 depth=1
 body=f'''<section class="shell page-top">{top_label('SUPPORT THE PROJECT','INDEPENDENT Curation')}<p class="overline">PARTNER WITH PLICA</p><h1>支持值得被<br><em>长期保存的知识。</em></h1><p class="page-lead">Plica 是独立编辑的技术知识项目。我们希望通过少量明确标注的合作支持长期维护，而不是让广告决定收录内容。</p></section><section class="shell sponsor-grid"><div class="sponsor-slot"><span>01 / PARTNERSHIP</span><div class="sponsor-symbol">P<span>·</span></div><strong>Available for sponsorship</strong><p>站点赞助位仍在筹备，当前没有已签约赞助商或可公开披露的流量数据。</p></div><div class="sponsor-copy"><p class="overline">HOW IT WILL WORK</p><h2>克制的展示。<br>清楚的边界。</h2><div class="sponsor-principles"><div><b>01</b><span>广告与编辑精选明确分离</span></div><div><b>02</b><span>不出售文章排名或编辑观点</span></div><div><b>03</b><span>优先考虑有实际价值的开发者产品</span></div></div><p class="sponsor-coming">商业联系渠道尚未开放。网站不收集无处存储的表单资料，也不会伪造订阅或询盘成功提示。</p></div></section>'''
 return page('赞助与合作','Plica 的独立赞助原则和合作计划。',body,depth)

def write(rel, content):
 path=OUT/rel
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(content,encoding='utf-8')

if __name__=='__main__':
 # Generated pages only, assets retained
 for path in OUT.rglob('index.html'):
  path.unlink()
 write('index.html',homepage())
 write('library/index.html',archive())
 write('products/index.html',products_index())
 write('companies/index.html',companies_index())
 write('glossary/index.html',glossary_index())
 write('research/index.html',research_index())
 write('graph/index.html',graph_page())
 write('skill/index.html',skill_landing())
 write('systems/index.html',systems_index())
 write('compare/index.html',compare())
 write('about/index.html',about())
 write('sponsor/index.html',sponsor())
 for p,_,_ in PRODUCTS: write('products/'+slug(p)+'/index.html',product_detail(p))
 for name in COMPANIES: write('companies/'+slug(name)+'/index.html',company_detail(name))
 for t in TERMS: write('glossary/'+t['id']+'/index.html',glossary_detail(t))
 for p in PAPERS: write('research/'+p['id']+'/index.html',research_detail(p))
 for k,*_ in CATS: write('systems/'+k+'/index.html',system_detail(k))
 for c in DATA: write('cases/'+c['slug']+'/index.html',case_detail(c))
 write('api/v1/index.json',json.dumps({'schema_version':'1.0','edition':'2026-10-19-v1.2','relations':RELATIONS,'cases':[{'id':c['slug'],'title':c['title'],'question':c['question'],'source':c['source'],'company':c['company'],'product':c['product'],'category':c['category'],'date':c['date'],'editorial_summary':c['summary'],'mechanisms':c['mechanisms'],'term_ids':REVIEWED_CASE_TERMS.get(c['slug'],[])} for c in DATA], 'papers':[{'id':p['id'],'title':p['title'],'arxiv_id':p['arxiv'],'source':'https://arxiv.org/abs/'+p['arxiv'],'summary':p['summary'],'evidence_limit':p['status']} for p in PAPERS]},ensure_ascii=False,indent=2))
 write('api/v1/terms.json',json.dumps(TERMS,ensure_ascii=False,indent=2))
 source_skill = ROOT/'skills'/'plica-architecture'/'SKILL.md'
 write('skill/plica-architecture/SKILL.md',source_skill.read_text())
 print('Generated',len(list(OUT.rglob('index.html'))),'HTML pages for',len(DATA),'verified original sources')
