import type { Term } from '../model';

// Word matching only renders links for existing reviewed edges; it creates no relationships.
export function LinkedTerms({ text, terms }: { text: string; terms: Term[] }) {
  const names=terms.flatMap(t=>[t.name,...t.aliases].filter(name=>name.trim().length>=3).map(name=>({name,id:t.id}))).sort((a,b)=>b.name.length-a.name.length);
  if(!names.length)return <>{text}</>;
  const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp('((?<![A-Za-z0-9])(?:'+names.map(t=>escape(t.name)).join('|')+')(?![A-Za-z0-9]))','gi');
  return <>{text.split(pattern).map((part,i)=>{const term=names.find(t=>t.name.toLowerCase()===part.toLowerCase());return term?<a className="inline-term" href={'#/term/'+term.id} key={i}>{part}</a>:part;})}</>;
}
