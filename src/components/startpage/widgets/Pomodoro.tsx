import { useEffect, useRef, useState } from 'react';
const KEY = 'startpage-widget-pomodoro';
const WORK = 25 * 60;
const BREAK = 5 * 60;
export default function Pomodoro({ width, height }: { width: number; height: number }) {
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [left, setLeft] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (typeof s.cycles === 'number') setCycles(s.cycles);
    } catch {}
  }, []);
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev > 1) return prev - 1;
        const nextPhase = phase === 'work' ? 'break' : 'work';
        setPhase(nextPhase);
        if (phase === 'work') {
          setCycles((c) => {
            const nc = c + 1;
            try {
              localStorage.setItem(KEY, JSON.stringify({ cycles: nc }));
            } catch {}
            return nc;
          });
        }
        return nextPhase === 'work' ? WORK : BREAK;
      });
    }, 1000);
    return () => clearInterval(tickRef.current!);
  }, [running, phase]);
  const total = phase === 'work' ? WORK : BREAK;
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const reset = () => {
    setRunning(false);
    setPhase('work');
    setLeft(WORK);
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none">
      {height >= 140 && <span className="text-xs font-mono text-[var(--text-muted)]">{phase === 'work' ? 'focus' : 'break'}{cycles > 0 ? ` · ${cycles}` : ''}</span>}
      <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: Math.min(width / 4.5, 40, height / 3) }}>
        {mm}:{ss}
      </span>
      {height >= 110 && (
        <div className="h-px w-3/4 bg-white/15 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-[var(--border-bezel)] transition-all duration-1000" style={{ width: `${(1 - left / total) * 100}%` }} />
        </div>
      )}
      {height >= 90 && (
        <div className="flex gap-3 text-sm">
          <button onClick={() => setRunning(!running)} className="text-[var(--text-muted)] hover:text-white transition-colors">{running ? 'pause' : 'start'}</button>
          <button onClick={reset} className="text-[var(--text-muted)] hover:text-white transition-colors">reset</button>
        </div>
      )}
    </div>
  );
}