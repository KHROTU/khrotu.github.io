import { useEffect, useRef, useState } from 'react';
const KEY = 'startpage-widget-textutils';
export default function TextUtils() {
  const [text, setText] = useState('');
  const loadedRef = useRef(false);
  useEffect(() => {
    setText(localStorage.getItem(KEY) ?? '');
    loadedRef.current = true;
  }, []);
  const onChange = (v: string) => {
    setText(v);
    if (loadedRef.current) {
      try {
        localStorage.setItem(KEY, v);
      } catch {}
    }
  };
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text ? text.split('\n').length : 0;
  const transforms: { label: string; fn: (s: string) => string }[] = [
    { label: 'UPPER', fn: (s) => s.toUpperCase() },
    { label: 'lower', fn: (s) => s.toLowerCase() },
    { label: 'Title', fn: (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
    { label: 'Sentence', fn: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()) },
    { label: 'trim', fn: (s) => s.split('\n').map((l) => l.trim()).join('\n') },
    { label: 'sort', fn: (s) => s.split('\n').sort().join('\n') },
    { label: 'unique', fn: (s) => Array.from(new Set(s.split('\n'))).join('\n') },
    { label: 'shuffle', fn: (s) => s.split('\n').map((v) => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(([, v]) => v).join('\n') },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="paste text…"
        className="flex-1 min-h-0 w-full resize-none bg-transparent border border-white/15 rounded-sm p-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
      />
      <div className="flex gap-3 text-[10px] font-mono text-[var(--text-muted)]">
        <span>{words} words</span>
        <span>{chars} chars</span>
        <span>{lines} lines</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {transforms.map(({ label, fn }) => (
          <button key={label} onClick={() => onChange(fn(text))} className="text-[10px] font-mono border border-white/15 rounded-sm px-1.5 py-0.5 text-[var(--text-muted)] hover:text-white hover:border-white/40 transition-colors">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}