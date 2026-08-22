import { useEffect, useRef, useState } from 'react';
const KEY = 'startpage-widget-wheel';
export default function Wheel() {
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved) setRaw(saved);
    } catch {}
  }, []);
  const options = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  const save = (v: string) => {
    setRaw(v);
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
  };
  const spin = () => {
    if (spinning || options.length < 2) return;
    setResult(null);
    setSpinning(true);
    let ticks = 0;
    const maxTicks = 14 + Math.floor(Math.random() * 8);
    timerRef.current = setInterval(() => {
      setResult(options[Math.floor(Math.random() * options.length)]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(timerRef.current!);
        setSpinning(false);
      }
    }, 90 + ticks * 12);
  };
  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0">
      {options.length >= 2 ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-lg font-medium truncate ${spinning ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>{result ?? '—'}</span>
            <button onClick={spin} disabled={spinning} className="shrink-0 text-sm text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-40">{spinning ? '…' : 'spin'}</button>
          </div>
          <textarea
            value={raw}
            onChange={(e) => save(e.target.value)}
            className="flex-1 min-h-0 w-full resize-none bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-muted)] outline-none focus:border-[var(--border-bezel)] transition-colors"
            spellCheck={false}
          />
        </>
      ) : (
        <textarea
          value={raw}
          onChange={(e) => save(e.target.value)}
          placeholder={'one option per line…\npizza\nsushi\ntacos'}
          className="flex-1 min-h-0 w-full resize-none bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
        />
      )}
    </div>
  );
}