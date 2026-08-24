import { useEffect, useState } from 'react';
import EditOverlay from './EditOverlay';
const KEY = 'startpage-widget-github';
export default function GitHub({ editMode }: { editMode: boolean }) {
  const [repo, setRepo] = useState('facebook/react');
  const [input, setInput] = useState('');
  const [data, setData] = useState<{ stars: number; issues: number; forks: number } | null>(null);
  const [error, setError] = useState<'offline' | 'missing' | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setRepo(saved);
    } catch {}
  }, []);
  useEffect(() => {
    setData(null);
    setError(null);
    if (!navigator.onLine) { setError('offline'); return; }
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => setData({ stars: j.stargazers_count, issues: j.open_issues_count, forks: j.forks_count }))
      .catch((e) => setError(!navigator.onLine || e instanceof TypeError ? 'offline' : 'missing'));
  }, [repo]);
  const save = () => {
    const v = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!v || !v.includes('/')) return;
    setRepo(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setInput('');
  };
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
  return (
    <div className="w-full h-full flex flex-col justify-center gap-1 select-none min-h-0 overflow-y-auto hide-scrollbar">
      <span className="text-xs font-mono text-[var(--text-muted)] truncate">{repo}</span>
      {error === 'offline' && <span className="text-sm text-[var(--text-muted)]">no connection</span>}
      {error === 'missing' && <span className="text-sm text-[var(--text-muted)]">repo not found</span>}
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
      {editMode && (
        <EditOverlay>
          <div className="flex gap-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="owner/repo"
              className="flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-0.5 text-[10px] font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
            />
            <button onClick={save} className="text-[10px] font-mono text-[var(--text-muted)] hover:text-white">set</button>
          </div>
        </EditOverlay>
      )}
    </div>
  );
}