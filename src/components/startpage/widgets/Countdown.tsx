import { useEffect, useRef, useState } from 'react';
type Target = { label: string; date: string };
const KEY = 'startpage-widget-countdown';
export default function Countdown({ height }: { height: number }) {
  const [target, setTarget] = useState<Target | null>(null);
  const [label, setLabel] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const loadedRef = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved?.date) setTarget(saved);
    } catch {}
    loadedRef.current = true;
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 60);
    return () => clearInterval(t);
  }, []);
  const save = () => {
    if (!dateInput) return;
    const t: Target = { label: label.trim() || 'countdown', date: dateInput };
    setTarget(t);
    if (loadedRef.current) {
      try {
        localStorage.setItem(KEY, JSON.stringify(t));
      } catch {}
    }
    setLabel('');
    setDateInput('');
  };
  const clear = () => {
    setTarget(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };
  const daysLeft = target ? Math.ceil((new Date(target.date + 'T00:00:00').getTime() - now) / 86400000) : null;
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 select-none min-h-0">
      {target && daysLeft !== null ? (
        <>
          <span className="text-xs font-mono text-[var(--text-muted)] truncate">{target.label}</span>
          <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: Math.min(48, height / 3) }}>
            {daysLeft > 0 ? daysLeft : 0}
          </span>
          <span className="text-xs text-[var(--text-muted)]">days {daysLeft <= 0 ? '— it\'s today or past' : 'remaining'}</span>
          {daysLeft <= 0 && (
            <button onClick={clear} className="w-fit text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors">clear</button>
          )}
        </>
      ) : (
        <>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="what…"
            className="bg-transparent border border-white/15 rounded-sm px-2 py-1 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
          />
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="bg-transparent border border-white/15 rounded-sm px-2 py-1 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors [color-scheme:dark]"
          />
          <button onClick={save} disabled={!dateInput} className="w-fit text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-30">set</button>
        </>
      )}
    </div>
  );
}