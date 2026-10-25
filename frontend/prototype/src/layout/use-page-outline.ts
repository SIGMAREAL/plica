import { useLayoutEffect, useState } from 'react';

export interface OutlineItem { id: string; label: string; depth: number }

export function usePageOutline(pageKey: string, enabled: boolean) {
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [active, setActive] = useState('');
  useLayoutEffect(() => {
    if (!enabled) { setItems([]); setActive(''); return; }
    const seen = new Set<string>();
    const headings = Array.from(document.querySelectorAll<HTMLElement>('.app-main h2,.app-main h3'));
    const outline = headings.flatMap((heading, index) => {
      const section = heading.closest<HTMLElement>('section[id]');
      const target = section || heading;
      if (!target.id) target.id = 'page-outline-' + index;
      if (seen.has(target.id)) return [];
      seen.add(target.id);
      return [{ id: target.id, label: heading.textContent?.trim() || '', depth: heading.tagName === 'H3' ? 1 : 0 }];
    }).filter(item => item.label);
    setItems(outline);
    let frame = 0;
    const update = () => {
      const offset = matchMedia('(max-width: 860px)').matches ? 148 : 120;
      let id = outline[0]?.id || '';
      for (const item of outline) {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= offset) id = item.id;
      }
      setActive(id);
    };
    const scroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', scroll, { passive: true }); addEventListener('resize', scroll);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', scroll); removeEventListener('resize', scroll); };
  }, [pageKey, enabled]);
  return { items, active };
}
