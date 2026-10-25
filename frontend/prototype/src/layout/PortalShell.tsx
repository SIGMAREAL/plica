import type { ReactNode } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { Brand } from '../ui/Brand';
import { SiteHeader } from './SiteHeader';

export function PortalShell({ children, theme, onThemeChange, onSearch }: { children: ReactNode; theme: 'light'|'dark'; onThemeChange: () => void; onSearch: () => void }) {
  return <div className="portal-page">
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>跳到内容</a>
    <SiteHeader theme={theme} onThemeChange={onThemeChange} onSearch={onSearch} portal/>
    <main id="main" tabIndex={-1} className="portal-main">{children}</main>
    <footer className="portal-footer portal-container"><div><Brand href="#/landing"/><p>从原始资料，理解真实系统。</p></div><nav aria-label="门户资源"><a href="#/about">编辑原则</a><a href="#/skill">Agent Skill</a><a href="#/sponsor">合作与赞助</a><a href="https://github.com/SIGMAREAL/plica" target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={12}/></a></nav><div className="portal-copyright"><span>© 2026 Plica</span><span>原始资料版权归其作者所有</span></div></footer>
  </div>;
}
