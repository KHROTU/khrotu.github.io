import { useEffect, useState } from 'react';
export default function Clock({ width, height }: { width: number; height: number }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const showSeconds = width >= 300 || height >= 160;
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...(showSeconds ? { second: '2-digit' } : {}) });
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="w-full h-full flex flex-col items-start justify-center pl-1 select-none">
      <span className="text-[var(--text-main)] font-medium leading-none tabular-nums" style={{ fontSize: Math.min(width / 5, height / 2.4) }}>
        {time}
      </span>
      {height >= 90 && <span className="text-[var(--text-muted)] mt-2 text-sm">{date}</span>}
    </div>
  );
}