import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseReadingList, readSavedCases } from './reading-list-data';

const ReadingList = createContext<{ saved: string[]; toggle: (id: string) => void; error: string }>({ saved: [], toggle: () => {}, error: '' });
export function ReadingListProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>(() => { try { return readSavedCases(localStorage); } catch { return []; } });
  const [error, setError] = useState('');
  useEffect(() => {
    const update = (event: StorageEvent) => { if (event.storageArea === localStorage && (event.key === 'plica-reading-list' || event.key === null)) setSaved(parseReadingList(event.newValue)); };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  const toggle = (id: string) => {
    try {
      const current = readSavedCases(localStorage);
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      localStorage.setItem('plica-reading-list', JSON.stringify(next)); setSaved(next); setError('');
    }
    catch { setError('浏览器未允许保存收藏。'); }
  };
  return <ReadingList.Provider value={{ saved, toggle, error }}>{children}</ReadingList.Provider>;
}
export const useReadingList = () => useContext(ReadingList);
