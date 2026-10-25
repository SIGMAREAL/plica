import { useSyncExternalStore } from 'react';
import { legacyLocation, routeWithLegacyFilters } from './legacy-routes';

const legacy=legacyLocation(location.pathname,location.search,location.hash);
if(legacy)history.replaceState(null,'',legacy);

const subscribe = (notify: () => void) => { window.addEventListener('hashchange', notify); return () => window.removeEventListener('hashchange', notify); };
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  return routeWithLegacyFilters(hash.startsWith('#figmacapture=') ? '#/' : hash);
}
export function go(url: string, replace = false) {
  if (replace) { history.replaceState(null, '', url); window.dispatchEvent(new HashChangeEvent('hashchange')); }
  else location.hash = url.replace(/^#/, '');
}
