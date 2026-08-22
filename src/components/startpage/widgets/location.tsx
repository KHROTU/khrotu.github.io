import { useEffect, useState } from 'react';
const KEY = 'startpage-widget-location';
export function useLocation() {
  const [loc, setLoc] = useState<{ lat: number; lon: number; city: string } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [cityInput, setCityInput] = useState('');
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved?.lat != null) {
        setLoc(saved);
        setStatus('ready');
        return;
      }
    } catch {}
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const l = { lat: pos.coords.latitude, lon: pos.coords.longitude, city: 'here' };
        setLoc(l);
        setStatus('ready');
        try {
          localStorage.setItem(KEY, JSON.stringify(l));
        } catch {}
      },
      () => setStatus('error')
    );
  }, []);
  const geocode = async (): Promise<boolean> => {
    const name = cityInput.trim();
    if (!name) return false;
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`);
      const j = await r.json();
      const hit = j.results?.[0];
      if (!hit) return false;
      const l = { lat: hit.latitude, lon: hit.longitude, city: hit.name };
      localStorage.setItem(KEY, JSON.stringify(l));
      setLoc(l);
      setCityInput('');
      setStatus('ready');
      return true;
    } catch {
      return false;
    }
  };
  const resetLocation = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setLoc(null);
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const l = { lat: pos.coords.latitude, lon: pos.coords.longitude, city: 'here' };
        setLoc(l);
        setStatus('ready');
        try {
          localStorage.setItem(KEY, JSON.stringify(l));
        } catch {}
      },
      () => setStatus('error')
    );
  };
  return { loc, status, cityInput, setCityInput, geocode, resetLocation };
}
type Props = {
  loc: { lat: number; lon: number; city: string } | null;
  status: 'loading' | 'ready' | 'error';
  cityInput: string;
  setCityInput: (v: string) => void;
  geocode: () => Promise<boolean>;
  resetLocation: () => void;
};
export function LocationControls({ loc, status, cityInput, setCityInput, geocode, resetLocation }: Props) {
  if (status === 'loading') return <span className="text-xs text-[var(--text-muted)]">locating…</span>;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        <input
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') await geocode();
          }}
          placeholder={loc ? `city (${loc.city})` : 'city…'}
          className="flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-0.5 text-[10px] font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
        />
        <button onClick={() => geocode()} className="text-[10px] font-mono text-[var(--text-muted)] hover:text-white">set</button>
      </div>
      <button onClick={resetLocation} className="w-fit text-[10px] font-mono text-[var(--text-muted)] hover:text-white">reset to gps</button>
    </div>
  );
}