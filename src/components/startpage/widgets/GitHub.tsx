import { useEffect, useState } from 'react';
import { timedFetch } from '../net';
const KEY = 'startpage-widget-github';
export default function GitHub() {
  const [repo, setRepo] = useState('facebook/react');
  const [data, setData] = useState<{ stars: number; issues: number; forks: number } | null>(null);
  const [error, setError] = useState<'offline' | 'missing' | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setRepo(saved);
    } catch {}
    const onCfg = () => {
      const saved = localStorage.getItem(KEY);
      if (saved) setRepo(saved);
    };
    window.addEventListener('sp-widget-config-changed', onCfg);
    return () => window.removeEventListener('sp-widget-config-changed', onCfg);
  }, []);
  useEffect(() => {
    setData(null);
    setError(null);
    timedFetch(`https://api.github.com/repos/${repo}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => setData({ stars: j.stargazers_count, issues: j.open_issues_count, forks: j.forks_count }))
      .catch((e) => setError(!navigator.onLine || e instanceof TypeError || (e instanceof DOMException && e.name === 'AbortError') ? 'offline' : 'missing'));
  }, [repo]);
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  return (
    <div className="w-full h-full flex flex-col justify-center gap-1 select-none min-h-0 overflow-y-auto hide-scrollbar">
      <span className="text-xs font-mono text-[var(--text-muted)] truncate">{repo}</span>
      {error === 'offline' && <span className="text-sm text-[var(--text-muted)]">no connection</span>}
      {error === 'missing' && <span className="text-sm text-[var(--text-muted)]">repo not found</span>}
      {!error && !data && <span className="text-sm text-[var(--text-muted)]">loading…</span>}
      {data && (
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">stars</span>
            <span className="tabular-nums text-[var(--text-main)]">{fmt(data.stars)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">issues</span>
            <span className="tabular-nums text-[var(--text-main)]">{fmt(data.issues)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">forks</span>
            <span className="tabular-nums text-[var(--text-main)]">{fmt(data.forks)}</span>
          </div>
        </div>
      )}
    </div>
  );
}