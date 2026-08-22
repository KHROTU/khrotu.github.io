import { useEffect, useState } from 'react';
type BatteryLike = {
  level: number;
  charging: boolean;
  addEventListener: (t: string, fn: () => void) => void;
  removeEventListener: (t: string, fn: () => void) => void;
};
type Stats = {
  battery: number | null;
  charging: boolean | null;
  hasBattery: boolean;
  cores: string;
  memory: number | null;
  screen: string;
  online: boolean;
};
export default function Stats({ height }: { height: number }) {
  const [stats, setStats] = useState<Stats>({
    battery: null,
    charging: null,
    hasBattery: true,
    cores: '…',
    memory: null,
    screen: `${window.screen.width}×${window.screen.height}`,
    online: navigator.onLine,
  });
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike>; deviceMemory?: number };
    let battery: BatteryLike | null = null;
    const update = () => {
      if (!battery) return;
      setStats((s) => ({ ...s, battery: Math.round(battery!.level * 100), charging: battery!.charging }));
    };
    if (nav.getBattery) {
      nav.getBattery().then((b) => {
        battery = b;
        update();
        b.addEventListener('levelchange', update);
        b.addEventListener('chargingchange', update);
      }).catch(() => setStats((s) => ({ ...s, hasBattery: false })));
    } else {
      setStats((s) => ({ ...s, hasBattery: false }));
    }
    setStats((s) => ({
      ...s,
      cores: String(nav.hardwareConcurrency || '?'),
      memory: nav.deviceMemory ?? null,
      screen: `${Math.round(window.screen.width * window.devicePixelRatio)}×${Math.round(window.screen.height * window.devicePixelRatio)}`,
    }));
    const on = () => setStats((s) => ({ ...s, online: true }));
    const off = () => setStats((s) => ({ ...s, online: false }));
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      if (battery) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    };
  }, []);
  const rows = [
    { label: 'battery', value: stats.hasBattery ? (stats.battery != null ? `${stats.battery}%${stats.charging ? ' ⚡' : ''}` : '…') : 'ac power' },
    { label: 'cpu threads', value: stats.cores },
    ...(stats.memory != null ? [{ label: 'memory', value: `~${stats.memory} gb` }] : []),
    { label: 'display', value: stats.screen },
    { label: 'network', value: stats.online ? 'online' : 'offline' },
  ];
  return (
    <div className={`w-full h-full flex flex-col justify-center gap-1 select-none ${height >= 150 ? '' : 'overflow-y-auto hide-scrollbar'}`}>
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">{label}</span>
          <span className="tabular-nums text-[var(--text-main)]">{value}</span>
        </div>
      ))}
    </div>
  );
}