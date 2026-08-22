import { useEffect, useRef, useState } from 'react';
type Note = { id: string; text: string; urgent: boolean; important: boolean };
const KEY = 'startpage-widget-matrix';
export default function Matrix() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverQuad, setHoverQuad] = useState<string | null>(null);
  const loadedRef = useRef(false);
  useEffect(() => {
    try {
      setNotes(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
    } catch {}
    loadedRef.current = true;
  }, []);
  const persist = (list: Note[]) => {
    setNotes(list);
    if (loadedRef.current) {
      try {
        localStorage.setItem(KEY, JSON.stringify(list));
      } catch {}
    }
  };
  const addNote = (urgent: boolean, important: boolean) => {
    const t = draft.trim();
    if (!t) return;
    persist([...notes, { id: `n-${Date.now()}`, text: t, urgent, important }]);
    setDraft('');
  };
  const moveNote = (urgent: boolean, important: boolean) => {
    if (!dragId) return;
    persist(notes.map((n) => (n.id === dragId ? { ...n, urgent, important } : n)));
    setDragId(null);
    setHoverQuad(null);
  };
  const removeNote = (id: string) => persist(notes.filter((n) => n.id !== id));
  const quads: { label: string; urgent: boolean; important: boolean }[] = [
    { label: 'do now', urgent: true, important: true },
    { label: 'schedule', urgent: false, important: true },
    { label: 'delegate', urgent: true, important: false },
    { label: 'drop', urgent: false, important: false },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-1.5 min-h-0">
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 flex-1 min-h-0">
        {quads.map((q) => (
          <div
            key={q.label}
            onDragOver={(e) => {
              e.preventDefault();
              setHoverQuad(q.label);
            }}
            onDragLeave={() => setHoverQuad((h) => (h === q.label ? null : h))}
            onDrop={(e) => {
              e.preventDefault();
              moveNote(q.urgent, q.important);
            }}
            className={`rounded-sm border p-1 overflow-y-auto hide-scrollbar transition-colors ${
              hoverQuad === q.label && dragId ? 'border-white/40 bg-white/[0.03]' : 'border-white/10'
            }`}
          >
            <span className="block text-[9px] font-mono tracking-wide text-[var(--text-muted)]/70 mb-1">{q.label}</span>
            {notes
              .filter((n) => n.urgent === q.urgent && n.important === q.important)
              .map((n) => (
                <div
                  key={n.id}
                  draggable
                  onDragStart={() => setDragId(n.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`group flex items-start justify-between gap-1 px-1 py-0.5 cursor-grab active:cursor-grabbing rounded-sm hover:bg-white/5 ${dragId === n.id ? 'opacity-40' : ''}`}
                >
                  <span className="text-[11px] leading-snug break-words">{n.text}</span>
                  <button onClick={() => removeNote(n.id)} aria-label="remove" className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-white text-xs leading-none shrink-0">×</button>
                </div>
              ))}
          </div>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addNote(true, true)}
        placeholder="add to do now…"
        className="bg-transparent border border-white/15 rounded-sm px-2 py-1 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
      />
    </div>
  );
}