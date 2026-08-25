import { useEffect, useState } from 'react';
import { useLocation } from './useLocation';
import { timedFetch } from '../net';
type Tab = 'weather' | 'sun' | 'air';
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
export default function Weather({ width, height }: { width: number; height: number }) {
  const { loc, status } = useLocation();
  const [tab, setTab] = useState<Tab>('weather');
  const [data, setData] = useState<WeatherData | null>(null);
  const [solar, setSolar] = useState<{ sunrise: string; sunset: string; remaining: string } | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if (!loc) return;
    let cancelled = false;
    const load = async () => {
      try {
        const r = await timedFetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1`
        );
        if (!r.ok) throw new Error();
        const j = await r.json();
        if (!cancelled) {
          setData({
            temp: Math.round(j.current.temperature_2m),
            code: j.current.weather_code,
            wind: Math.round(j.current.wind_speed_10m),
            high: Math.round(j.daily.temperature_2m_max[0]),
            low: Math.round(j.daily.temperature_2m_min[0]),
            city: loc.city,
          });
          const snap = { code: j.current.weather_code, temp: Math.round(j.current.temperature_2m), wind: Math.round(j.current.wind_speed_10m), at: Date.now() };
          try { localStorage.setItem('startpage-widget-weather-data', JSON.stringify(snap)); } catch {}
          window.dispatchEvent(new CustomEvent('sp-weather-data', { detail: snap }));
          const sunrise = new Date(j.daily.sunrise[0]);
          const sunset = new Date(j.daily.sunset[0]);
          const now = new Date();
          const remainingMs = Math.max(0, sunset.getTime() - now.getTime());
          const h = Math.floor(remainingMs / 3600000);
          const m = Math.floor((remainingMs % 3600000) / 60000);
          setSolar({
            sunrise: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            remaining: now > sunset ? 'sun has set' : `${h}h ${m}m of light left`,
          });
        }
      } catch {
        if (!cancelled) setOffline(true);
      }
      if (!navigator.onLine) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const r2 = await timedFetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lon}&current=european_aqi&timezone=auto`
        );
        if (!r2.ok) throw new Error();
        const j2 = await r2.json();
        if (!cancelled) setAqi(Math.round(j2.current.european_aqi));
      } catch {
        if (!cancelled) setOffline(true);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    const onRefresh = () => { load(); };
    window.addEventListener('sp-weather-refresh', onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener('sp-weather-refresh', onRefresh);
    };
  }, [loc]);
  const aqiLabel = aqi == null ? '' : aqi <= 20 ? 'good' : aqi <= 40 ? 'fair' : aqi <= 60 ? 'moderate' : aqi <= 80 ? 'poor' : 'very poor';
  const bigFont = Math.min(width / 7, height / 4.5, 42);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'weather', label: 'now' },
    { key: 'sun', label: 'sun' },
    { key: 'air', label: 'air' },
  ];
  return (
    <div className="w-full h-full flex flex-col select-none min-h-0">
      <div className="flex gap-1 shrink-0 mb-1.5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm transition-colors ${
              tab === key ? 'border border-white/50 text-[var(--text-main)]' : 'border border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col justify-center">
        {offline && ((tab === 'weather' && !data) || (tab === 'sun' && !solar) || (tab === 'air' && aqi == null)) && (
          <span className="text-sm text-[var(--text-muted)]">no connection</span>
        )}
        {(status === 'loading' || loading) && !data && !offline && <span className="text-sm text-[var(--text-muted)]">loading…</span>}
        {tab === 'weather' && data && (
          <>
            <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: bigFont }}>
              {data.temp}°
            </span>
            <span className="text-[var(--text-muted)] text-sm truncate">{describeCode(data.code)}</span>
            {height >= 130 && (
              <span className="text-[var(--text-muted)] text-xs mt-1">
                h {data.high}° · l {data.low}° · {data.wind} km/h
              </span>
            )}
          </>
        )}
        {tab === 'sun' && solar && (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[var(--text-muted)]">↑</span>
              <span className="text-sm text-[var(--text-main)] tabular-nums">{solar.sunrise}</span>
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xs text-[var(--text-muted)]">↓</span>
              <span className="text-sm text-[var(--text-main)] tabular-nums">{solar.sunset}</span>
            </div>
            {height >= 150 && <span className="text-xs text-[var(--text-main)] mt-1">{solar.remaining}</span>}
          </>
        )}
        {tab === 'air' && aqi != null && (
          <>
            <span className="text-[var(--text-main)] font-medium tabular-nums leading-none" style={{ fontSize: bigFont }}>
              {aqi}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{aqiLabel} · eu aqi</span>
          </>
        )}
      </div>
    </div>
  );
}