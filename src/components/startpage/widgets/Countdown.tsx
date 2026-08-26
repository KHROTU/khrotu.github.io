import { useEffect, useRef, useState } from 'react';
type Target = { label: string; date: string };
const KEY = 'startpage-widget-countdown';
export default function Countdown({ height }: { height: number }) {
  const [target, setTarget] = useState<Target | null>(null);
  const [label, setLabel] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const loadedRef = useRef(false);
  const readTarget = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved?.date) setTarget(saved);
    } catch {}
  };
  useEffect(() => {
    readTarget();
    loadedRef.current = true;
  }, []);
  useEffect(() => {
    const onCfg = (e: Event) => {
      if ((e as CustomEvent).detail?.type === 'countdown') readTarget();
    };
    window.addEventListener('sp-widget-config-changed', onCfg);
    return () => window.removeEventListener('sp-widget-config-changed', onCfg);
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
  const targetMs = target ? new Date(target.date + 'T00:00:00').getTime() : null;
  const nd = new Date(now);
  const todayMs = new Date(nd.getFullYear(), nd.getMonth(), nd.getDate()).getTime();
  const dayDiff = targetMs !== null ? Math.round((targetMs - todayMs) / 86400000) : 0;
  const remaining = targetMs !== null ? (targetMs - now) / 86400000 : 0;
  const overdue = dayDiff < 0;
  const isToday = dayDiff === 0;
  const soon = !isToday && !overdue && remaining <= 1;
  const hoursLeft = Math.max(1, Math.ceil(remaining * 24));
  const daysLeft = Math.ceil(Math.max(remaining, 1 / 24));
  const compact = height < 120;
  let value: string;
  let caption: string | null;
  if (isToday) {
    value = 'today';
    caption = null;
  } else if (overdue) {
    const n = Math.abs(dayDiff);
    value = String(n);
    caption = n === 1 ? 'day overdue' : 'days overdue';
  } else if (soon) {
    value = String(hoursLeft);
    caption = hoursLeft === 1 ? 'hour left' : 'hours left';
  } else {
    value = String(daysLeft);
    caption = daysLeft === 1 ? 'day left' : 'days left';
  }
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 select-none min-h-0">
      {target && targetMs !== null ? (
        <>
          <span className="text-xs font-mono text-[var(--text-muted)] truncate">{target.label}</span>
          {compact ? (
            <span className="text-sm font-medium text-[var(--text-main)] tabular-nums truncate">
              {caption ? `${value} ${caption}` : value}
            </span>
          ) : (
            <>
              <span
                className="text-[var(--text-main)] font-medium leading-none"
                style={{ fontSize: Math.min(value.length > 4 ? 34 : 48, height / 3) }}
              >
                {value}
              </span>
              {caption && <span className="text-xs text-[var(--text-muted)]">{caption}</span>}
            </>
          )}
          {(isToday || overdue) && (
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