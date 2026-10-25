export function Brand({ href = '#/', variant = 'default' }: { href?: string; variant?: 'default' | 'hero' }) {
  return <a href={href} className={variant === 'hero' ? 'brand portal-hero-brand' : 'brand'} aria-label={href === '#/landing' ? 'Plica 门户' : 'Plica 首页'}>
    <span className="brand-symbol" aria-hidden>P</span><span>Plica</span><small>软件系统知识库</small>
  </a>;
}
