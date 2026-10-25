import { useEffect, useMemo, useRef, useState } from 'react';
import { CaretDown, MagnifyingGlass, SidebarSimple, X } from '@phosphor-icons/react';
import { Button, Dialog, Input } from '../ui';
import type { Catalog } from '../model';
import { useReadingList } from '../reading-list';
import { contextNavigation, sectionHref, type ContextGroup, type ContextRoute } from './context-navigation';
import { usePageOutline } from './use-page-outline';
import './context-sidebar.css';

function SidebarGroup({ group, query, onNavigate }: { group: ContextGroup; query: string; onNavigate: () => void }) {
  const [open, setOpen] = useState(group.open !== false);
  useEffect(() => setOpen(group.open !== false), [group.open]);
  useEffect(() => { if (query.trim()) setOpen(true); }, [query]);
  const items = group.items.filter(item => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  if (query && !items.length) return null;
  return <details className="context-group" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary><span>{group.label}</span><span className="context-group-meta">{group.items.length}<CaretDown size={12}/></span></summary>
    <div className="context-links">{items.map(item => <a key={item.id} href={item.href} aria-current={item.current ? (group.id === 'outline' ? 'location' : 'page') : undefined}
      data-depth={item.depth || undefined} onClick={onNavigate} title={item.label}>
      <span>{item.label}</span>{item.count !== undefined && <small>{item.count}</small>}
    </a>)}</div>
  </details>;
}

export function ContextSidebar({ catalog, route, collapsed, onToggle }: { catalog: Catalog; route: ContextRoute; collapsed: boolean; onToggle: () => void }) {
  const [query, setQuery] = useState('');
  const sidebar = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { saved } = useReadingList();
  const navigation = useMemo(() => contextNavigation(catalog, route), [catalog, route.page, route.id, route.query.toString()]);
  const outline = usePageOutline(route.page + '/' + route.id, !!navigation.outline);
  const groups: ContextGroup[] = [
    ...(outline.items.length ? [{ id: 'outline', label: '本页内容', items: outline.items.map(item => ({ ...item, href: sectionHref(route, item.id), current: outline.active === item.id })) }] : []),
    ...navigation.groups,
  ];
  const readingList: ContextGroup = { id: 'reading-list', label: '阅读列表', open: false, items: catalog.cases.filter(c => saved.includes(c.slug)).map(c => ({ id: c.slug, label: c.question, href: '#/case/' + c.slug, current: route.page === 'case' && route.id === c.slug })) };
  useEffect(() => { setMobileOpen(false); }, [route.page, route.id, route.query.toString()]);
  useEffect(() => {
    if (collapsed) return;
    const scroller = sidebar.current?.querySelector<HTMLElement>('.context-sidebar-scroll');
    const selected = scroller?.querySelector<HTMLElement>('a[aria-current=page],a[aria-current=location]');
    if (!scroller) return;
    if (!selected) { if (!query) scroller.scrollTop = 0; return; }
    if (!selected.getClientRects().length) return;
    const bounds = scroller.getBoundingClientRect(), item = selected.getBoundingClientRect();
    if (item.top < bounds.top) scroller.scrollTop -= bounds.top - item.top;
    else if (item.bottom > bounds.bottom) scroller.scrollTop += item.bottom - bounds.bottom;
  }, [route.page, route.id, route.query.toString(), collapsed, query, outline.active]);
  const search = navigation.search && <div className="context-search"><MagnifyingGlass size={15} aria-hidden/><Input aria-label={navigation.search} placeholder={navigation.search} value={query} onChange={event => setQuery(event.target.value)}/>{query && <Button variant="ghost" size="xs" shape="square" icon={X} aria-label="清空目录搜索" onClick={event => { setQuery(''); event.currentTarget.parentElement?.querySelector('input')?.focus(); }}/>}</div>;
  const content = <>
    <nav className="context-navigation" aria-label={navigation.title}>{groups.map(group => <SidebarGroup key={group.id} group={group} query={query} onNavigate={() => setMobileOpen(false)}/>)}</nav>
    {query && !groups.some(g => g.items.some(item => item.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))) && <p className="context-empty" role="status">没有找到匹配项</p>}
  </>;
  const footer = <div className="context-reading-list">{readingList.items.length ? <SidebarGroup group={readingList} query="" onNavigate={() => setMobileOpen(false)}/> : <div className="context-reading-empty"><span>阅读列表</span><span>0</span></div>}</div>;
  return <>
    <aside ref={sidebar} className="app-sidebar" aria-label="当前栏目" data-collapsed={collapsed}>
      <div className="context-sidebar-heading">{!collapsed && <span>{navigation.title}</span>}<Button variant="ghost" shape="square" size="sm" icon={SidebarSimple} aria-label={collapsed ? '展开侧栏' : '收起侧栏'} aria-expanded={!collapsed} onClick={onToggle}/></div>
      {!collapsed && <>{search}<div className="context-sidebar-scroll">{content}</div>{footer}</>}
    </aside>
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="context-mobile-bar"><Dialog.Trigger render={<Button variant="ghost" icon={SidebarSimple} aria-label={'打开' + navigation.title}>{navigation.title}<CaretDown size={12}/></Button>}/></div>
      <Dialog className="site-mobile-dialog context-mobile-dialog">
        <div className="context-mobile-heading"><Dialog.Title>{navigation.title}</Dialog.Title><Dialog.Close render={<Button variant="ghost" shape="square" icon={X} aria-label="关闭栏目导航"/>}/></div>
        <Dialog.Description className="sr-only">浏览当前栏目中的条目或跳转到本页章节。</Dialog.Description>
        {search}<div className="context-sidebar-scroll">{content}</div>{footer}
      </Dialog>
    </Dialog.Root>
  </>;
}
