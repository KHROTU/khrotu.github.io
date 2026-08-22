import { useEffect, useRef, useState } from 'react';
export default function Timer({ width, height }: { width: number; height: number }) {
  const [minutes, setMinutes] = useState(5);
  const [left, setLeft] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev > 1) return prev - 1;
        setRunning(false);
        setDone(true);
        return 0;
      });
    }, 1000);
    return () => clearInterval(tickRef.current!);
  }, [running]);
  const setMinutesValue = (m: number) => {
    const clamped = Math.max(0, Math.min(999, m));
    setMinutes(clamped);
    if (!running) {
      setLeft(clamped * 60);
      setDone(false);
    }
  };
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const reset = () => {
    setRunning(false);
    setDone(false);
    setLeft(minutes * 60);
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none">
      <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: Math.min(width / 4.5, 40, height / 3) }}>
        {mm}:{ss}
      </span>
      {done && <span className="text-xs font-mono text-[var(--text-main)]">done.</span>}
      {!running && height >= 120 && (
        <div className="flex items-center gap-1">
          <button onClick={() => setMinutesValue(minutes - 1)} className="text-[var(--text-muted)] hover:text-white transition-colors px-1">−</button>
          <span className="text-xs font-mono text-[var(--text-muted)] w-14 text-center">{minutes} min</span>
          <button onClick={() => setMinutesValue(minutes + 1)} className="text-[var(--text-muted)] hover:text-white transition-colors px-1">+</button>
        </div>
      )}
      {height >= 90 && (
        <div className="flex gap-3 text-sm">
          <button onClick={() => { setDone(false); setRunning(!running); }} disabled={left === 0} className="text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-30">{running ? 'pause' : 'start'}</button>
          <button onClick={reset} className="text-[var(--text-muted)] hover:text-white transition-colors">reset</button>
        </div>
      )}
    </div>
  );
}