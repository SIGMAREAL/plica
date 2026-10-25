/** Presentation assets only; catalog identity and editorial content come from the API. */
const productIcons: Record<string, string> = {
  dropbox: 'dropbox', youtube: 'youtube', netflix: 'netflix', figma: 'figma',
  discord: 'discord', uber: 'uber', instagram: 'instagram', spotify: 'spotify',
  'byteplus-recommend': 'byteplus', 'google-spanner': 'spanner',
  'google-infrastructure': 'google-cloud', 'openai-codex': 'codex',
  'anthropic-engineering': 'anthropic', facebook: 'facebook',
  'facebook-photos': 'facebook', 'meta-data-infrastructure': 'meta',
  'wechat-mini-programs': 'wechat', github: 'github', 'github-api': 'github',
  'stripe-billing': 'stripe', 'stripe-payments': 'stripe',
  'cloudflare-waiting-room': 'cloudflare',
  telegram: 'telegram', arc: 'arc', dia: 'dia', 'netease-cloud-music': 'netease-cloud-music',
  zen: 'zen', zed: 'zed', threads: 'threads', 'x-twitter': 'x-twitter',
};
const appIcons = new Set(['dropbox', 'youtube', 'netflix', 'figma', 'discord', 'uber',
  'instagram', 'spotify', 'facebook', 'wechat', 'github', 'codex',
  'telegram', 'arc', 'dia', 'netease-cloud-music', 'zen', 'zed', 'threads', 'x-twitter']);

export function hasProductAppIcon(id: string): boolean {
  return appIcons.has(productIcons[id]);
}
export function productIconUrl(id: string): string | undefined {
  const icon = productIcons[id];
  if (!icon) return undefined;
  const file = hasProductAppIcon(id) ? `${icon}-app.webp` : `${icon}.svg`;
  return `${import.meta.env.BASE_URL}product-icons/${file}`;
}
