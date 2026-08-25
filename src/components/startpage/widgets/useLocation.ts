import { useEffect, useState } from 'react';
const KEY = 'startpage-widget-location';
export type Loc = { lat: number; lon: number; city: string };
export function useLocation() {
  const [loc, setLoc] = useState<Loc | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    const apply = () => {
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
    };
    apply();
    window.addEventListener('sp-location-changed', apply);
    return () => window.removeEventListener('sp-location-changed', apply);
  }, []);
  return { loc, status };
}