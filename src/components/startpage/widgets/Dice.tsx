import { useEffect, useRef, useState } from 'react';
const KEY = 'startpage-widget-dice';
export default function Dice({ height }: { height: number }) {
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[] | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved) {
        setCount(saved.count ?? 1);
        setSides(saved.sides ?? 6);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ count, sides }));
    } catch {}
  }, [count, sides]);
  const roll = () => {
    if (spinning) return;
    setSpinning(true);
    let ticks = 0;
    timerRef.current = setInterval(() => {
      setRolls(Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides)));
      ticks++;
      if (ticks >= 8) {
        clearInterval(timerRef.current!);
        setSpinning(false);
      }
    }, 70);
  };
  const total = rolls?.reduce((a, b) => a + b, 0) ?? null;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none min-h-0">
      {height >= 110 && (
        <div className="flex gap-3 text-xs font-mono text-[var(--text-muted)]">
          <span>{count}d{sides}</span>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-1.5 min-h-0 overflow-y-auto hide-scrollbar">
        {rolls?.map((r, i) => (
          <span
            key={i}
            className={`flex items-center justify-center border border-white/25 rounded-sm text-[var(--text-main)] tabular-nums ${spinning ? 'opacity-60' : ''}`}
            style={{ width: Math.min(34, height / 3.2), height: Math.min(34, height / 3.2), fontSize: Math.min(16, height / 7) }}
          >
            {r}
          </span>
        ))}
      </div>
      {!spinning && total !== null && count > 1 && <span className="text-sm text-[var(--text-muted)]">= {total}</span>}
      {height >= 140 && (
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            dice
            <button onClick={() => setCount(Math.max(1, count - 1))} className="px-1 hover:text-white">−</button>
            {count}
            <button onClick={() => setCount(Math.min(8, count + 1))} className="px-1 hover:text-white">+</button>
          </span>
          <span className="flex items-center gap-1">
            sides
            <input
              type="number"
              min={2}
              max={1000}
              value={sides}
              onChange={(e) => setSides(Math.max(2, Math.min(1000, parseInt(e.target.value) || 2)))}
              className="w-14 bg-transparent border border-white/15 rounded-sm px-1 py-0.5 text-xs font-mono text-[var(--text-main)] tabular-nums outline-none focus:border-[var(--border-bezel)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </span>
        </div>
      )}
      <button onClick={roll} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">{spinning ? '…' : 'roll'}</button>
    </div>
  );
}