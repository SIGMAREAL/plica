import { useId, type Ref } from 'react';
import { ArrowUpRight, BookmarkSimple, Check, MagnifyingGlass, X } from '@phosphor-icons/react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Badge } from '@cloudflare/kumo/components/badge';

export function SearchField({ value, onChange, label = '搜索案例', inputRef }: { value: string; onChange: (value: string) => void; label?: string; inputRef?: Ref<HTMLInputElement> }) {
  const id = useId();
  return <div className="plica-search"><label htmlFor={id} className="sr-only">{label}</label><MagnifyingGlass aria-hidden size={18}/><Input ref={inputRef} id={id} value={value} onChange={e => onChange(e.target.value)} placeholder="搜索案例、机构或机制" className="w-full pl-9 pr-10"/>{value && <Button variant="ghost" size="sm" shape="square" aria-label="清空搜索" icon={X} onClick={() => { onChange(''); document.getElementById(id)?.focus(); }}/>}</div>;
}
export function PublicationMeta({ publisher, date, readTime }: { publisher: string; date: string; readTime: string }) {
  return <div className="plica-meta"><span>{publisher}</span><span aria-hidden>·</span><time dateTime={date}>{date.replaceAll('-', '.')}</time><span aria-hidden>·</span><span>{readTime}</span></div>;
}
export function CaseListItem({ title, summary, publisher, date, readTime, category, href, saved, onSave }: { title: string; summary: string; publisher: string; date: string; readTime: string; category: string; href: string; saved: boolean; onSave: () => void }) {
  return <article className="plica-case"><div className="plica-case-main"><PublicationMeta publisher={publisher} date={date} readTime={readTime}/><a href={href} className="plica-case-title">{title}<ArrowUpRight aria-hidden size={18}/></a><p>{summary}</p><Badge variant="secondary">{category}</Badge></div><Button variant="ghost" shape="square" aria-label={saved ? '取消收藏案例' : '收藏案例'} aria-pressed={saved} icon={saved ? Check : BookmarkSimple} onClick={onSave}/></article>;
}
export function SourceLink({ href, title, publisher }: { href: string; title: string; publisher: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="plica-source"><span><small>{publisher} · 原始资料</small><strong>{title}</strong></span><ArrowUpRight aria-hidden size={20}/></a>;
}
export function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="plica-empty"><MagnifyingGlass size={24} aria-hidden/><h3>没有找到相关案例</h3><p>试试其他关键词，或清空筛选条件。</p><Button onClick={onReset}>清空筛选</Button></div>;
}
export function CaseSkeleton() {
  return <div className="plica-skeleton" role="status" aria-label="正在加载案例"><span className="sr-only">正在加载案例</span><div/><div/><div/></div>;
}
