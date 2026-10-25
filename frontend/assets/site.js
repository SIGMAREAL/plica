(()=>{'use strict';
  const menu=document.querySelector('.mobile-menu');
  const mobile=document.querySelector('.mobile-nav');
  if(menu&&mobile){const close=()=>{mobile.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','打开导航')};menu.addEventListener('click',()=>{const open=!mobile.classList.contains('is-open');mobile.classList.toggle('is-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭导航':'打开导航')});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',close))}
  const search=document.getElementById('archive-search');
  const category=document.getElementById('archive-category');
  const company=document.getElementById('archive-company');
  const product=document.getElementById('archive-product');
  const clear=document.getElementById('clear-filters');
  const emptyClear=document.getElementById('empty-clear');
  const count=document.getElementById('result-count');
  const empty=document.getElementById('empty-state');
  if(search&&category&&company&&product){
    const cards=[...document.querySelectorAll('#archive-results .case-card')];
    const params=new URLSearchParams(location.search);
    if(params.has('q'))search.value=params.get('q')||'';
    if(params.has('system')&&[...category.options].some(o=>o.value===params.get('system')))category.value=params.get('system');
    if(params.has('company')&&[...company.options].some(o=>o.value===params.get('company')))company.value=params.get('company');
    if(params.has('product')&&[...product.options].some(o=>o.value===params.get('product')))product.value=params.get('product');
    function update(push=false){const query=search.value.trim().toLocaleLowerCase();const cat=category.value;const co=company.value;const pr=product.value;let visible=0;
      cards.forEach(card=>{const show=(!query||card.dataset.search.includes(query))&&(cat==='all'||card.dataset.category===cat)&&(co==='all'||card.dataset.company===co)&&(pr==='all'||card.dataset.product===pr);card.hidden=!show;card.style.display=show?'':'none';if(show)visible++});
      if(count)count.textContent=String(visible).padStart(2,'0');if(empty)empty.hidden=visible>0;
      if(push){const p=new URLSearchParams();if(query)p.set('q',search.value.trim());if(cat!=='all')p.set('system',cat);if(co!=='all')p.set('company',co);if(pr!=='all')p.set('product',pr);history.replaceState({},'',location.pathname+(p.toString()?'?'+p.toString():''))}
    }
    function reset(){search.value='';category.value='all';company.value='all';product.value='all';update(true);search.focus()}
    search.addEventListener('input',()=>update(true));category.addEventListener('change',()=>update(true));company.addEventListener('change',()=>update(true));product.addEventListener('change',()=>update(true));clear?.addEventListener('click',reset);emptyClear?.addEventListener('click',reset);update();
    document.addEventListener('keydown',event=>{if(event.key==='/'&&document.activeElement!==search&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();search.focus()}if(event.key==='Escape'&&document.activeElement===search){search.blur()}})
  }
  const toast=document.getElementById('toast');let toastTimer;const notify=message=>{if(!toast)return;toast.textContent=message;toast.classList.add('is-on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('is-on'),2600)};
  document.querySelectorAll('[data-copy-link]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);notify('链接已复制')}catch{notify('无法自动复制，请从地址栏复制链接')}}));
  let saved=[];try{saved=JSON.parse(localStorage.getItem('plica:saved')||'[]');if(!Array.isArray(saved))saved=[]}catch{saved=[]}
  document.querySelectorAll('[data-save]').forEach(button=>{const id=button.dataset.save;const sync=()=>{const has=saved.includes(id);button.classList.toggle('is-saved',has);button.setAttribute('aria-pressed',String(has));button.setAttribute('title',has?'取消收藏':'收藏到此设备')};sync();button.addEventListener('click',()=>{if(saved.includes(id)){saved=saved.filter(s=>s!==id);notify('已取消收藏')}else{saved.push(id);notify('已保存到此浏览器')}try{localStorage.setItem('plica:saved',JSON.stringify(saved))}catch{notify('此浏览器不支持持久收藏')}sync()})})
})();
(()=>{'use strict';
  const termSearch=document.getElementById('glossary-search');
  if(termSearch){const list=document.getElementById('glossary-list');termSearch.addEventListener('input',()=>{const q=termSearch.value.trim().toLocaleLowerCase();list.querySelectorAll('.glossary-row').forEach(row=>{row.hidden=!!q&&!row.textContent.toLocaleLowerCase().includes(q);row.style.display=row.hidden?'none':''})})}
  const dataEl=document.getElementById('graph-data');
  if(dataEl){const data=JSON.parse(dataEl.textContent);const select=document.getElementById('graph-topic'),svg=document.getElementById('knowledge-svg'),list=document.getElementById('graph-list'),heading=document.getElementById('graph-heading');const ns='http://www.w3.org/2000/svg';
    const node=(name,attrs,txt)=>{const el=document.createElementNS(ns,name);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));if(txt!=null)el.textContent=txt;return el};
    const render=()=>{const d=data.find(x=>x.id===select.value)||data[0];while(svg.firstChild)svg.removeChild(svg.firstChild);heading.textContent=`${d.label} · ${d.cases.length} 项资料`;list.textContent='';const shown=d.cases.slice(0,12);const cx=440,cy=250;shown.forEach((c,i)=>{const a=-Math.PI/2+i*Math.PI*2/shown.length;const x=cx+305*Math.cos(a),y=cy+175*Math.sin(a);svg.appendChild(node('line',{x1:cx,y1:cy,x2:x,y2:y}));const group=node('a',{href:c.path,class:'g-node'+(c.kind==='research'?' g-research':''),'aria-label':`阅读 ${c.name}：${c.title}`});group.appendChild(node('rect',{x:x-60,y:y-18,width:120,height:36,rx:18}));group.appendChild(node('text',{x,y:y+5,'text-anchor':'middle'},c.name.length>16?c.name.slice(0,14)+'…':c.name));svg.appendChild(group);const link=document.createElement('a');link.href=c.path;link.textContent=c.title;const small=document.createElement('span');small.textContent=(c.kind==='research'?'研究论文 · ':'生产实践 · ')+c.name;link.appendChild(small);list.appendChild(link)});const center=node('g',{class:'g-center'});center.appendChild(node('rect',{x:cx-96,y:cy-31,width:192,height:62,rx:8}));center.appendChild(node('text',{x:cx,y:cy+6,'text-anchor':'middle'},d.label));svg.appendChild(center)};select.addEventListener('change',render);render()}
  const hint=document.getElementById('selection-hint'),drawer=document.getElementById('ai-drawer'),backdrop=document.getElementById('ai-backdrop'),close=document.getElementById('ai-close'),quote=document.getElementById('ai-selected'),question=document.getElementById('ai-question');
  if(hint&&drawer){let selected='';const onSelection=()=>{const selection=window.getSelection(),text=selection?.toString().trim()||'';const node=selection?.anchorNode;const inside=node&&document.querySelector('.article-main')?.contains(node);if(text.length>=3&&inside){selected=text.slice(0,1200);hint.hidden=false}else if(!drawer.classList.contains('is-open'))hint.hidden=true};document.addEventListener('mouseup',onSelection);document.addEventListener('keyup',onSelection);
    const dismiss=()=>{drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');backdrop.hidden=true;hint.hidden=true};hint.addEventListener('click',()=>{quote.textContent=selected;drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');backdrop.hidden=false;hint.hidden=true;question.focus()});close.addEventListener('click',dismiss);backdrop.addEventListener('click',dismiss);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('is-open'))dismiss()});
    document.getElementById('ai-copy')?.addEventListener('click',async()=>{const msg=`阅读 Plica 的工程案例时，我选中了：\n“${selected}”\n\n我的问题：${question.value.trim()||'请解释这段话在整体架构中的意义，并区分一手事实与推论。'}\n\n出处：${location.href}\n\n请给出来源、背景、约束、设计权衡和证据不足的部分。`;try{await navigator.clipboard.writeText(msg);const b=document.getElementById('ai-copy');b.textContent='已复制到剪贴板';setTimeout(()=>b.textContent='复制提问内容 ↗',2500)}catch{const b=document.getElementById('ai-copy');b.textContent='请检查浏览器剪贴板权限'}})}
})();
