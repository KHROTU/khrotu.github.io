import { useEffect, useState } from 'react';
type Props = { value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string };
export default function Slider({ value, min, max, step, onChange, unit }: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  const commit = () => {
    const n = Number(draft);
    if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setEditing(false);
  };
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="relative flex-1 h-5 flex items-center group">
        <div className="absolute inset-x-0 h-px bg-white/20" />
        <div className="absolute h-px bg-[var(--border-bezel)]" style={{ width: `${pct}%` }} />
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-[var(--border-bezel)] -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-125"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="w-14 bg-transparent border border-white/30 rounded-sm px-1 py-0.5 text-xs font-mono text-[var(--text-main)] text-right outline-none focus:border-[var(--border-bezel)]"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          title="click to edit"
          className="w-14 px-1 py-0.5 text-xs font-mono text-[var(--text-muted)] text-right hover:text-white border border-transparent hover:border-white/20 rounded-sm transition-colors"
        >
          {value}
          {unit ?? ''}
        </button>
      )}
    </div>
  );
}