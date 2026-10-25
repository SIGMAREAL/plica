const sets={};
const plus=C('Plus',16,16);plus.fills=[];plus.appendChild(icon(source.icons.plus));page.appendChild(plus);plus.x=2520;plus.y=100;
const searchIcon=C('Search',18,18);searchIcon.fills=[];searchIcon.appendChild(icon(source.icons.search,18));page.appendChild(searchIcon);searchIcon.x=2570;searchIcon.y=100;
const labels=[],optionalIcons=[];
function makeButton(variant,state='Default',size='base'){
 const dims={xs:[60,20,12,4],sm:[64,26,12,6],base:[80,36,14,8],lg:[88,40,14,8]},[w,h,fs,r]=dims[size];
 const loading=state==='Loading',n=C('Variant='+variant+', State='+state,w+(loading?18:0),h);n.cornerRadius=r;
 const emph=variant==='primary'||variant==='destructive',info=source.light.buttons.find(b=>b.variant===variant);
 n.fills=emph?[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0,color:{...rgb(info.gradientStart),a:1}},{position:1,color:{...rgb(info.gradientEnd),a:1}}]}]:variant==='ghost'||variant==='outline'?[]:[paint(state==='Hover'?'tint':'surface')];
 if(variant!=='ghost'){n.strokes=[paint(state==='Focus'?'focus':'line')];n.strokeWeight=state==='Focus'?2:1;}
 if(state==='Disabled'||loading)n.opacity=emph?.5:.5;
 const color=emph?'white':variant==='secondary-destructive'?'danger':'text';
 if(loading){const spin=track(figma.createNodeFromSvg('<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M7 1a6 6 0 1 0 6 6" fill="none" stroke="'+(emph?'white':'#646464')+'" stroke-width="1.5" stroke-linecap="round"/></svg>'));spin.findAll(()=>true).forEach(c=>ids.push(c.id));n.appendChild(spin);}else{const ic=track(plus.createInstance());n.appendChild(ic);ic.visible=false;optionalIcons.push(ic);}
 const text=T(loading?'加载中':'探索案例',fs,color,0,true);n.appendChild(text);if(!loading)labels.push(text);
 return n;
}
title('02  按钮 / Button',100,850);
const buttonStates=['Default','Hover','Focus','Disabled','Loading'];const buttons=[];
for(const variant of source.light.buttons.map(b=>b.variant))for(const state of buttonStates)buttons.push(makeButton(variant,state));
sets.button=family('Button',buttons,100,900,5,170,92);labelProperty(sets.button,labels);
const show=sets.button.addComponentProperty('Show icon','BOOLEAN',false),swap=sets.button.addComponentProperty('Icon','INSTANCE_SWAP',plus.id);
for(const ic of optionalIcons)ic.componentPropertyReferences={visible:show,mainComponent:swap};
const sizes=['xs','sm','base','lg'].map(size=>{const n=makeButton('secondary','Default',size);n.name='Size='+size;return n;});sets.buttonSize=family('Button size',sizes,1080,900,1,220,92);
title('03  输入与选择 / Fields',100,1610);
const inputs=[];
for(const state of ['Empty','Filled','Focus','Error','Disabled']){
 const n=C('State='+state,280,104,'VERTICAL');n.primaryAxisAlignItems='MIN';n.counterAxisAlignItems='MIN';n.itemSpacing=8;n.fills=[];n.cornerRadius=0;
 n.appendChild(T(state==='Error'?'通知邮箱':'阅读列表名称',14,'text',0,true));
 const field=pad(F('Input',280,'HORIZONTAL',0,'surface'),0);field.paddingLeft=12;field.paddingRight=12;field.resize(280,36);field.primaryAxisSizingMode='FIXED';field.counterAxisSizingMode='FIXED';field.counterAxisAlignItems='CENTER';field.cornerRadius=8;field.setBoundVariable('cornerRadius',vars['ui/radius/8']);field.strokes=[paint(state==='Error'?'danger':state==='Focus'?'focus':'line')];field.strokeWeight=state==='Focus'?2:1;
 field.appendChild(T(state==='Filled'?'分布式系统':state==='Error'?'reader@':'例如：分布式系统',14,state==='Filled'?'text':'muted'));n.appendChild(field);n.appendChild(T(state==='Error'?'请输入有效的邮箱地址':'帮助你整理感兴趣的案例。',12,state==='Error'?'danger':'muted',280));if(state==='Disabled')n.opacity=.5;inputs.push(n);
}
sets.input=family('Input',inputs,100,1660,3,320,150);
const searches=[];for(const state of ['Empty','Filled']){const n=C('State='+state,320,36);n.primaryAxisAlignItems='MIN';n.paddingLeft=12;n.itemSpacing=8;n.strokes=[paint('line')];const ic=track(searchIcon.createInstance());n.appendChild(ic);n.appendChild(T(state==='Filled'?'Dropbox':'搜索案例、机构或机制',14,state==='Filled'?'text':'muted'));if(state==='Filled')n.appendChild(T('×',16,'muted'));searches.push(n);}sets.search=family('SearchField',searches,1180,1660,1,360,80);
const selects=[];for(const state of ['Default','Selected','Disabled']){const n=C('State='+state,155,36);n.primaryAxisAlignItems='SPACE_BETWEEN';n.paddingLeft=n.paddingRight=12;n.strokes=[paint('line')];n.appendChild(T(state==='Selected'?'存储与数据':'全部机制',14,'text'));n.appendChild(T('⌄',14,'muted'));if(state==='Disabled')n.opacity=.5;selects.push(n);}sets.select=family('Select',selects,1630,1660,1,200,80);
title('04  选择、导航与反馈 / Selection',100,2120);
const checks=[];for(const state of ['Unchecked','Checked','Indeterminate','Disabled']){const n=C('State='+state,160,32);n.fills=[];n.primaryAxisAlignItems='MIN';n.itemSpacing=10;const box=F('Checkbox control',16,'HORIZONTAL',0,state==='Checked'||state==='Indeterminate'?'accent':'surface');box.resize(16,16);box.primaryAxisSizingMode=box.counterAxisSizingMode='FIXED';box.primaryAxisAlignItems=box.counterAxisAlignItems='CENTER';box.cornerRadius=4;box.setBoundVariable('cornerRadius',vars['ui/radius/4']);box.strokes=[paint('line')];if(state==='Checked'||state==='Indeterminate')box.appendChild(T(state==='Checked'?'✓':'−',12,'white'));n.appendChild(box);n.appendChild(T('只看原始资料',14,'text'));if(state==='Disabled')n.opacity=.5;checks.push(n);}sets.checkbox=family('Checkbox',checks,100,2170,2,220,70);
const switches=[];for(const state of ['Off','On','Disabled off','Disabled on']){const n=C('State='+state,170,32);n.fills=[];n.primaryAxisAlignItems='MIN';n.itemSpacing=10;const on=state==='On'||state==='Disabled on';const trackFrame=F('Switch control',36,'HORIZONTAL',0,on?'accent':'line');trackFrame.resize(36,20);trackFrame.primaryAxisSizingMode=trackFrame.counterAxisSizingMode='FIXED';trackFrame.counterAxisAlignItems='CENTER';trackFrame.primaryAxisAlignItems=on?'MAX':'MIN';trackFrame.paddingLeft=trackFrame.paddingRight=2;trackFrame.cornerRadius=6;const thumb=rect(16,16,'surface',4);trackFrame.appendChild(thumb);n.appendChild(trackFrame);n.appendChild(T('显示阅读进度',14,'text'));if(state.startsWith('Disabled'))n.opacity=.5;switches.push(n);}sets.switch=family('Switch',switches,690,2170,2,220,70);
const tabs=[];for(const variant of ['Segmented','Underline']){const n=C('Variant='+variant,265,36);n.fills=variant==='Segmented'?[paint('tint')]:[];n.itemSpacing=4;for(const [i,label] of ['全部','已收藏','已读'].entries()){const cell=F('Tab / '+label,83,'VERTICAL',0,i===0&&variant==='Segmented'?'surface':null);cell.resize(83,32);cell.primaryAxisSizingMode=cell.counterAxisSizingMode='FIXED';cell.primaryAxisAlignItems=cell.counterAxisAlignItems='CENTER';cell.cornerRadius=6;cell.appendChild(T(label,14,i===0?'text':'muted'));if(i===0&&variant==='Underline'){cell.strokes=[paint('text')];cell.strokeBottomWeight=2;cell.strokeTopWeight=cell.strokeLeftWeight=cell.strokeRightWeight=0;}n.appendChild(cell);}tabs.push(n);}sets.tabs=family('Tabs',tabs,1280,2170,1,320,70);
const badges=[];for(const [variant,label] of [['secondary','存储与数据'],['success','已收录'],['warning','待补充'],['error','加载失败'],['info','研究论文']]){const n=C('Variant='+variant,104,24);n.cornerRadius=6;n.fills=[paint('tint')];const t=T(label,12,variant==='error'?'danger':variant==='info'?'accent':'text');n.appendChild(t);badges.push(n);}sets.badge=family('Badge',badges,100,2500,5,160,60);
return await done({sets:Object.fromEntries(Object.entries(sets).map(([k,n])=>[k,{id:n.id,name:n.name,variants:n.children.length}])),icons:{plus:plus.id,search:searchIcon.id}});
