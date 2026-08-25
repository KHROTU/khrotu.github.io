import { useEffect, useRef, useState } from 'react';
type Card = { id: string; text: string };
type Board = Record<'todo' | 'doing' | 'done', Card[]>;
const KEY = 'startpage-widget-kanban';
const EMPTY: Board = { todo: [], doing: [], done: [] };
const COLUMNS: { key: keyof Board; label: string }[] = [
  { key: 'todo', label: 'todo' },
  { key: 'doing', label: 'doing' },
  { key: 'done', label: 'done' },
];
export default function Kanban() {
  const [board, setBoard] = useState<Board>(EMPTY);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const loadedRef = useRef(false);
  useEffect(() => {
    try {
      setBoard({ ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') });
    } catch {}
    loadedRef.current = true;
  }, []);
  const persist = (b: Board) => {
    setBoard(b);
    if (loadedRef.current) {
      try {
        localStorage.setItem(KEY, JSON.stringify(b));
      } catch {}
    }
  };
  const addCard = (col: keyof Board) => {
    const text = (drafts[col] ?? '').trim();
    if (!text) return;
    persist({ ...board, [col]: [...board[col], { id: `c-${Date.now()}`, text }] });
    setDrafts((d) => ({ ...d, [col]: '' }));
  };
  const removeCard = (col: keyof Board, id: string) =>
    persist({ ...board, [col]: board[col].filter((c) => c.id !== id) });
  const commitEdit = () => {
    if (!editingId) return;
    const text = editDraft.trim();
    if (text) {
      const next = { ...board };
      for (const { key } of COLUMNS) next[key] = next[key].map((c) => (c.id === editingId ? { ...c, text } : c));
      persist(next);
    }
    setEditingId(null);
  };
  const moveCard = (to: keyof Board) => {
    if (!draggingId) return;
    const id = draggingId;
    let card: Card | undefined;
    const next: Board = { todo: [], doing: [], done: [] };
    for (const col of COLUMNS.map((c) => c.key)) {
      for (const c of board[col]) {
        if (c.id === id) card = c;
        else next[col].push(c);
      }
    }
    if (card) next[to].push(card);
    persist(next);
    setDraggingId(null);
    setHoverCol(null);
  };
  return (
    <div className="w-full h-full flex gap-2 min-h-0">
      {COLUMNS.map(({ key, label }) => (
        <div
          key={key}
          className={`flex-1 min-w-0 flex flex-col rounded-sm border transition-colors ${
            hoverCol === key && draggingId ? 'border-white/40 bg-white/[0.03]' : 'border-transparent'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setHoverCol(key);
          }}
          onDragLeave={(e) => {
            if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setHoverCol(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            moveCard(key);
          }}
        >
          <span className="text-[10px] font-mono tracking-wide text-[var(--text-muted)] mb-1">
            {label} ({board[key].length})
          </span>
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 min-h-0">
            {board[key].map((card) => {
              const editing = editingId === card.id;
              return (
                <div
                  key={card.id}
                  draggable={!editing}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', card.id);
                    setDraggingId(card.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onDoubleClick={() => {
                    if (editing) return;
                    setEditingId(card.id);
                    setEditDraft(card.text);
                  }}
                  className={`group flex items-start justify-between gap-1 border rounded-sm px-1.5 py-1 cursor-grab active:cursor-grabbing hover:border-white/30 transition-colors ${
                    draggingId === card.id ? 'opacity-40 border-white/30' : 'border-white/10'
                  }`}
                >
                  {editing ? (
                    <input
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        else if (e.key === 'Escape') setEditingId(null);
                      }}
                      onFocus={(e) => e.currentTarget.select()}
                      className="flex-1 min-w-0 bg-transparent outline-none border-b border-white/25 focus:border-white/60 transition-colors text-xs text-[var(--text-main)] leading-snug"
                    />
                  ) : (
                    <span className="text-xs text-[var(--text-main)] break-words leading-snug">{card.text}</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); removeCard(key, card.id); }} onDoubleClick={(e) => e.stopPropagation()} aria-label="remove card" className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-white text-xs leading-none shrink-0">×</button>
                </div>
              );
            })}
          </div>
          <input
            value={drafts[key] ?? ''}
            onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addCard(key)}
            placeholder="+"
            className="mt-1 w-full bg-transparent border border-white/15 rounded-sm px-1.5 py-0.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
          />
        </div>
      ))}
    </div>
  );
}