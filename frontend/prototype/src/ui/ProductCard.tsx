import { ArrowUpRight } from '@phosphor-icons/react';
import type { ExplorationGroup } from '../exploration';
import { hasProductAppIcon, productIconUrl } from './product-icons';
import './product-card.css';

export function ProductCard({ product }: { product: ExplorationGroup }) {
  const icon = productIconUrl(product.id);
  const isApp = hasProductAppIcon(product.id);
  return <a className={`surface product-card ${isApp ? 'product-card-app' : 'product-card-service'}`} href={product.href}>
    <div className="product-card-art" aria-hidden="true">
      {icon ? <img src={icon} alt="" width="176" height="176" decoding="async"/>
        : <span className="product-card-placeholder">{product.name.slice(0, 1)}</span>}
    </div>
    <div className="product-card-body">
      <h2>{product.name}<ArrowUpRight size={18} aria-hidden="true"/></h2>
      <p>{product.description}</p>
      <span className="product-card-count">{product.cases.length ? `${product.cases.length} 个公开案例` : '案例待收录'}</span>
    </div>
  </a>;
}
