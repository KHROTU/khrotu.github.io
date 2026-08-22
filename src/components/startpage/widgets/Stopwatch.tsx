import { useEffect, useRef, useState } from 'react';
type Lap = { n: number; at: number };
export default function Stopwatch({ width, height }: { width: number; height: number }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed;
    tickRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 50);
    return () => clearInterval(tickRef.current!);
  }, [running]);
  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const lap = () => setLaps([{ n: laps.length + 1, at: elapsed }, ...laps]);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none min-h-0">
      <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: Math.min(width / 7.5, height / 4, 36) }}>
        {fmt(elapsed)}
      </span>
      <div className="flex gap-3 text-sm">
        <button onClick={() => setRunning(!running)} className="text-[var(--text-muted)] hover:text-white transition-colors">{running ? 'stop' : 'start'}</button>
        {running && <button onClick={lap} className="text-[var(--text-muted)] hover:text-white transition-colors">lap</button>}
        <button onClick={reset} className="text-[var(--text-muted)] hover:text-white transition-colors">reset</button>
      </div>
      {height >= 150 && laps.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar w-full text-xs">
          {laps.map((l) => (
            <div key={l.n} className="flex justify-between px-2 py-0.5 border-b border-white/5">
              <span className="font-mono text-[var(--text-muted)]">{l.n}</span>
              <span className="tabular-nums text-[var(--text-main)]">{fmt(l.at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}