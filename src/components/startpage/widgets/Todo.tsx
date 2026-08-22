import { useEffect, useRef, useState } from 'react';
type Item = { id: string; text: string; done: boolean };
const KEY = 'startpage-widget-todo';
export default function Todo() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState('');
  const loadedRef = useRef(false);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
    } catch {}
    loadedRef.current = true;
  }, []);
  const persist = (list: Item[]) => {
    setItems(list);
    if (loadedRef.current) {
      try {
        localStorage.setItem(KEY, JSON.stringify(list));
      } catch {}
    }
  };
  const addItem = () => {
    const t = draft.trim();
    if (!t) return;
    persist([...items, { id: `t-${Date.now()}`, text: t, done: false }]);
    setDraft('');
  };
  const toggle = (id: string) => persist(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const removeItem = (id: string) => persist(items.filter((i) => i.id !== id));
  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0">
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="add item…"
          className="flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-1 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
        />
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 min-h-0">
        {items.map((item) => (
          <div key={item.id} className="group flex items-center gap-2 py-0.5">
            <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} className="accent-white shrink-0" />
            <span className={`flex-1 text-sm truncate ${item.done ? 'line-through opacity-40' : 'text-[var(--text-main)]'}`}>{item.text}</span>
            <button onClick={() => removeItem(item.id)} aria-label="remove" className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-white text-xs px-1">×</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-[var(--text-muted)]/60 mt-1">nothing yet.</p>}
      </div>
    </div>
  );
}