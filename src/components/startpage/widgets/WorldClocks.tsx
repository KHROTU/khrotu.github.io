import { useEffect, useState } from 'react';
export default function WorldClocks({ width, height }: { width: number; height: number }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const zones = [
    { label: 'local', tz: undefined as string | undefined },
    { label: 'utc', tz: 'UTC' },
    { label: 'new york', tz: 'America/New_York' },
    { label: 'london', tz: 'Europe/London' },
    { label: 'tokyo', tz: 'Asia/Tokyo' },
    { label: 'sydney', tz: 'Australia/Sydney' },
    { label: 'dubai', tz: 'Asia/Dubai' },
    { label: 'la', tz: 'America/Los_Angeles' },
  ];
  const fmt = (tz?: string) =>
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz });
  const dayDiff = (tz?: string) => {
    const here = new Date(now.toLocaleString('en-US'));
    const there = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    return Math.round((there.getTime() - here.getTime()) / 3600000);
  };
  const show = height >= 150 ? zones : zones.slice(0, 4);
  const compact = width < 220;
  return (
    <div className="w-full h-full flex flex-col justify-center gap-1 select-none overflow-y-auto hide-scrollbar">
      {show.map(({ label, tz }) => (
        <div key={label} className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-[var(--text-muted)] truncate">
            {label}
            {!compact && tz && Math.abs(dayDiff(tz)) > 0 && (
              <span className="opacity-50"> {dayDiff(tz) > 0 ? '+' : ''}{dayDiff(tz)}h</span>
            )}
          </span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{fmt(tz)}</span>
        </div>
      ))}
    </div>
  );
}