import { useEffect, useState } from 'react';
const KEY = 'startpage-widget-weather';
type WeatherData = {
  temp: number;
  code: number;
  high: number;
  low: number;
  wind: number;
  city: string;
};
function describeCode(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 85 && code <= 86) return 'snow showers';
  if (code >= 95) return 'storm';
  return '—';
}
export default function Weather({ width, height, editMode }: { width: number; height: number; editMode: boolean }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'loading' | 'error'>('idle');
  const [cityInput, setCityInput] = useState('');
  const loadWeather = async (lat: number, lon: number, city: string) => {
    setStatus('loading');
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
      );
      const j = await r.json();
      setData({
        temp: Math.round(j.current.temperature_2m),
        code: j.current.weather_code,
        wind: Math.round(j.current.wind_speed_10m),
        high: Math.round(j.daily.temperature_2m_max[0]),
        low: Math.round(j.daily.temperature_2m_min[0]),
        city,
      });
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };
  const locate = () => {
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude, 'here'),
      () => setStatus('error')
    );
  };
  const geocodeCity = async () => {
    const name = cityInput.trim();
    if (!name) return;
    setStatus('loading');
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`);
      const j = await r.json();
      const hit = j.results?.[0];
      if (!hit) return setStatus('error');
      localStorage.setItem(KEY, JSON.stringify({ lat: hit.latitude, lon: hit.longitude, city: hit.name }));
      loadWeather(hit.latitude, hit.longitude, hit.name);
      setCityInput('');
    } catch {
      setStatus('error');
    }
  };
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved?.lat != null) {
        loadWeather(saved.lat, saved.lon, saved.city ?? 'here');
        return;
      }
    } catch {}
    locate();
  }, []);
  const bigFont = Math.min(width / 8, height / 3.5, 42);
  return (
    <div className="w-full h-full flex flex-col justify-center select-none min-h-0">
      {!data && status !== 'error' && <span className="text-sm text-[var(--text-muted)]">{status === 'locating' ? 'locating…' : 'loading…'}</span>}
      {status === 'error' && !data && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--text-muted)]">location unavailable</span>
          {editMode && (
            <div className="flex gap-1">
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && geocodeCity()}
                placeholder="city…"
                className="flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-1 text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
              />
              <button onClick={locate} className="text-xs font-mono text-[var(--text-muted)] hover:text-white px-1">gps</button>
            </div>
          )}
        </div>
      )}
      {data && (
        <>
          <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: bigFont }}>
            {data.temp}°
          </span>
          <span className="text-[var(--text-muted)] text-sm truncate">{describeCode(data.code)}</span>
          {height >= 110 && (
            <span className="text-[var(--text-muted)] text-xs mt-1">
              h {data.high}° · l {data.low}° · {data.wind} km/h
            </span>
          )}
          {editMode && height >= 140 && width >= 200 && (
            <div className="flex items-center gap-2 mt-1">
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && geocodeCity()}
                placeholder={data.city}
                className="w-28 bg-transparent border border-white/15 rounded-sm px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
              />
              <button onClick={() => { localStorage.removeItem(KEY); setData(null); locate(); }} className="text-[10px] font-mono text-[var(--text-muted)] hover:text-white">reset loc</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}