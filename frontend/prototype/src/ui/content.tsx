import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { Badge, Button, CaseListItem, LinkButton } from './index';
import { useReadingList } from '../reading-list';
import { caseUrl, type Case, type Catalog } from '../model';

export function PageHeader({ title, description, action, breadcrumb }: { title: string; description?: ReactNode; action?: ReactNode; breadcrumb?: ReactNode }) {
  return <header className="page-header" data-enter>{breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}<div className="page-title-row"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div></header>;
}
export function SectionHeading({ title, description, href, more = '查看全部' }: { title: string; description?: string; href?: string; more?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{href && <LinkButton href={href} variant="ghost" size="sm">{more}<ArrowRight size={14}/></LinkButton>}</div>;
}
export function CaseRows({ cases, catalog }: { cases: Case[]; catalog: Catalog }) {
  const { saved, toggle } = useReadingList();
  return <div className="case-list">{cases.map(c => <CaseListItem key={c.slug} title={c.question} summary={c.summary} publisher={c.company} date={c.date} readTime={c.readTime} category={catalog.mechanisms.find(m => m.id === c.category)?.label || c.category} href={caseUrl(c)} saved={saved.includes(c.slug)} onSave={() => toggle(c.slug)}/>)}</div>;
}
export function EvidenceNote({ children, research = false }: { children: ReactNode; research?: boolean }) {
  return <div className="evidence-note"><Badge variant={research?'info':'secondary'}>{research?'研究边界':'编辑说明'}</Badge><p>{children}</p></div>;
}
export function NotFound() {
  return <div className="route-empty"><Badge variant="secondary">404</Badge><h1>这一页暂未收录</h1><p>回到案例库，继续探索真实系统的设计。</p><LinkButton variant="primary" href="#/library">浏览案例库<ArrowRight size={16}/></LinkButton></div>;
}
export function ResetEmpty({ onReset }: { onReset: () => void }) {
  return <div className="route-empty"><h2>暂时没有匹配的案例</h2><p>换一个关键词，或重置筛选条件。</p><Button onClick={onReset}>重置筛选</Button></div>;
}
export function SourceAction({ href, children }: { href: string; children: ReactNode }) {
  return <LinkButton variant="primary" href={href} external>{children}<ArrowUpRight size={16}/></LinkButton>;
}
