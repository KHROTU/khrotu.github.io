import { useState } from 'react';
export default function Calendar() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const today = new Date();
  const first = new Date(cursor.year, cursor.month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString([], { month: 'long', year: 'numeric' });
  const move = (delta: number) => {
    const m = cursor.month + delta;
    setCursor({ year: cursor.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isToday = (day: number) =>
    day === today.getDate() && cursor.month === today.getMonth() && cursor.year === today.getFullYear();
  return (
    <div className="w-full h-full flex flex-col select-none min-h-0">
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => move(-1)} aria-label="previous month" className="text-[var(--text-muted)] hover:text-white px-1 text-sm leading-none">‹</button>
        <span className="text-xs font-mono text-[var(--text-muted)]">{monthLabel.toLowerCase()}</span>
        <button onClick={() => move(1)} aria-label="next month" className="text-[var(--text-muted)] hover:text-white px-1 text-sm leading-none">›</button>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center flex-1 min-h-0">
        {['s', 'm', 't', 'w', 't', 'f', 's'].map((d, i) => (
          <span key={i} className="text-[9px] font-mono text-[var(--text-muted)]/50">{d}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`text-[11px] leading-5 rounded-sm ${
              day === null ? '' : isToday(day) ? 'bg-white/90 text-black font-medium' : 'text-[var(--text-main)]'
            }`}
          >
            {day ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}