export function parseReadingList(value: string | null): string[] {
  try {
    const list: unknown = JSON.parse(value || '[]');
    return Array.isArray(list) ? [...new Set(list.filter((id): id is string => typeof id === 'string'))] : [];
  } catch { return []; }
}

// Migrate once per browser. Keep the legacy value intact for the retained static UI.
export function readSavedCases(storage: Pick<Storage,'getItem'|'setItem'>): string[] {
  const current=parseReadingList(storage.getItem('plica-reading-list'));
  if(storage.getItem('plica-reading-list-migrated')==='1')return current;
  const merged=[...new Set([...current,...parseReadingList(storage.getItem('plica:saved'))])];
  try {
    storage.setItem('plica-reading-list',JSON.stringify(merged));
    storage.setItem('plica-reading-list-migrated','1');
  } catch { /* Readable legacy saves remain visible even when persistence is blocked. */ }
  return merged;
}
