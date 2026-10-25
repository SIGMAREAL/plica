import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, CaretDown, List, MagnifyingGlass, Moon, Sun, X } from '@phosphor-icons/react';
import { Button, Dialog, LinkButton } from '../ui';
import { Brand } from '../ui/Brand';
import { headerDirectLinks, headerNavigation } from './header-navigation';
import './shell.css';

type MenuId = typeof headerNavigation[number]['id'];
type Menu = typeof headerNavigation[number];

function MenuLinks({ menu, current, onNavigate }: { menu: Menu; current?: string; onNavigate: () => void }) {
  return <div className="site-menu-columns">{menu.groups.map(group => <section className={group.featured ? 'site-menu-featured' : ''} key={group.label}>
    <h2>{group.label}</h2>
    <ul>{group.links.map(link => {
      const external = link.href.startsWith('https:');
      return <li key={link.page}><a href={link.href} aria-current={current === link.page ? 'page' : undefined} onClick={onNavigate} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <span>{link.label}{external && <ArrowUpRight size={18}/>}</span><small>{link.description}</small>
      </a></li>;
    })}</ul>
  </section>)}</div>;
}

export function SiteHeader({ theme, onThemeChange, onSearch, current, portal = false }: {
  theme: 'light' | 'dark'; onThemeChange: () => void; onSearch: () => void; current?: string; portal?: boolean;
}) {
  const [active, setActive] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuId | null>(null);
  const header = useRef<HTMLElement>(null);
  const triggers = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clickedMenu = useRef<MenuId | null>(null);
  const menu = headerNavigation.find(item => item.id === active);
  const cancelPendingMenu = () => clearTimeout(menuTimer.current);
  const close = () => { cancelPendingMenu(); setActive(null); setMobileOpen(false); };
  useEffect(() => {
    const closeOnRoute = () => { clearTimeout(menuTimer.current); setActive(null); setMobileOpen(false); };
    addEventListener('hashchange', closeOnRoute);
    return () => removeEventListener('hashchange', closeOnRoute);
  }, []);
  useEffect(() => { clearTimeout(menuTimer.current); setActive(null); setMobileOpen(false); }, [current, portal]);
  useEffect(() => {
    const desktop = matchMedia('(min-width: 861px)');
    const resize = () => { clearTimeout(menuTimer.current); setActive(null); setMobileOpen(false); };
    desktop.addEventListener('change', resize);
    return () => { desktop.removeEventListener('change', resize); clearTimeout(menuTimer.current); };
  }, []);
  useEffect(() => {
    if (!active) return;
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); clearTimeout(menuTimer.current); setActive(null); triggers.current[active]?.focus(); }
    };
    addEventListener('keydown', escape);
    return () => removeEventListener('keydown', escape);
  }, [active]);
  const focusMenu = (id: MenuId) => {
    cancelPendingMenu(); setActive(id);
    requestAnimationFrame(() => header.current?.querySelector<HTMLAnchorElement>('#site-desktop-menu a')?.focus());
  };
  const triggerKey = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const submenu = headerNavigation[index - headerDirectLinks.length];
    if (event.key === 'ArrowDown' && submenu) { event.preventDefault(); focusMenu(submenu.id); }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const items = header.current?.querySelectorAll<HTMLElement>('.site-navigation>a,.site-navigation>button');
      if (!items) return;
      const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus(); if (active) setActive(headerNavigation[next - headerDirectLinks.length]?.id ?? null);
    }
  };
  const themeButton = <Button className="site-theme-action" variant="ghost" icon={theme === 'light' ? Moon : Sun} aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'} onClick={onThemeChange}>{theme === 'light' ? '深色外观' : '浅色外观'}</Button>;
  return <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
    {active && <button className="site-menu-backdrop" tabIndex={-1} aria-label="关闭导航菜单" onClick={() => setActive(null)}/>}
    <header ref={header} className="site-header" data-menu-open={!!active} onPointerEnter={cancelPendingMenu}
      onPointerLeave={event => { if (event.pointerType === 'mouse') menuTimer.current = setTimeout(() => setActive(null), 140); }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { cancelPendingMenu(); setActive(null); } }}>
      <Brand href="#/landing"/>
      <nav className="site-navigation" aria-label="全站导航">
        {headerDirectLinks.map((item, index) => <a key={item.page} href={item.href} aria-current={current === item.page ? 'page' : undefined}
          onPointerEnter={() => { cancelPendingMenu(); setActive(null); }} onClick={close}
          onKeyDown={event => triggerKey(event, index)}>{item.label}</a>)}
        {headerNavigation.map((item, index) => <button key={item.id} ref={node => { triggers.current[item.id] = node; }}
          type="button" aria-expanded={active === item.id} aria-controls="site-desktop-menu"
          data-current={item.groups.some(group => group.links.some(link => link.page === current)) || undefined}
          onPointerEnter={event => { if (event.pointerType === 'mouse') { clickedMenu.current = null; cancelPendingMenu(); menuTimer.current = setTimeout(() => setActive(item.id), 120); } }}
          onPointerLeave={cancelPendingMenu}
          onClick={event => {
            cancelPendingMenu();
            const shouldClose = active === item.id && (event.detail === 0 || clickedMenu.current === item.id);
            clickedMenu.current = shouldClose ? null : item.id;
            setActive(shouldClose ? null : item.id);
          }}
          onKeyDown={event => triggerKey(event, index + headerDirectLinks.length)}>{item.label}<CaretDown size={12}/></button>)}
      </nav>
      <div className="site-header-actions">
        <Button className="site-search" variant="ghost" shape="square" icon={MagnifyingGlass} aria-label="搜索案例" onClick={() => { close(); onSearch(); }}/>
        <LinkButton className="site-skill" href="#/skill" size="sm" variant="ghost" onClick={close}>获取 Skill<ArrowUpRight size={14}/></LinkButton>
        <Dialog.Trigger render={<Button ref={mobileTrigger} className="site-menu-toggle" variant="ghost" shape="square" icon={List} aria-label="打开导航" onClick={() => setActive(null)}/>}/>
      </div>
      {menu && <div id="site-desktop-menu" className="site-desktop-menu" role="region" aria-label={menu.label + '菜单'}>
        <MenuLinks menu={menu} current={current} onNavigate={close}/>
        {active === 'about' && <div className="site-menu-appearance">{themeButton}</div>}
      </div>}
    </header>
    <Dialog className="site-mobile-dialog">
        <Dialog.Title className="sr-only">Plica 全站导航</Dialog.Title>
        <Dialog.Description className="sr-only">探索案例、浏览知识和了解 Plica。</Dialog.Description>
        <div className="site-mobile-top"><Brand href="#/landing"/><Dialog.Close render={<Button variant="ghost" shape="square" icon={X} aria-label="关闭导航"/>}/></div>
        <nav className="site-mobile-navigation" aria-label="移动端全站导航">
          {headerDirectLinks.map(item => <a className="site-mobile-direct" key={item.page} href={item.href} aria-current={current === item.page ? 'page' : undefined} onClick={close}>{item.label}</a>)}
          {headerNavigation.map(item => <section key={item.id}>
          <button type="button" aria-expanded={mobileSection === item.id} aria-controls={'mobile-' + item.id} onClick={() => setMobileSection(mobileSection === item.id ? null : item.id)}>{item.label}<CaretDown size={20}/></button>
          {mobileSection === item.id && <div id={'mobile-' + item.id}><MenuLinks menu={item} current={current} onNavigate={close}/></div>}
        </section>)}</nav>
        <div className="site-mobile-bottom">{themeButton}<LinkButton className="site-skill" href="#/skill" onClick={close}>获取 Skill<ArrowUpRight size={16}/></LinkButton></div>
    </Dialog>
  </Dialog.Root>;
}
