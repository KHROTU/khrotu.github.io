import { useEffect, useRef, useState } from 'react';
const KEY = 'startpage-widget-notes-v2';
const LEGACY_KEY = 'startpage-widget-notes';
export default function Notes({ id }: { id: string }) {
  const [text, setText] = useState('');
  const loadedRef = useRef(false);
  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      let v: string | undefined = map[id];
      if (v === undefined) {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy !== null && Object.keys(map).length === 0) {
          v = legacy;
          map[id] = v;
          localStorage.setItem(KEY, JSON.stringify(map));
        } else v = '';
      }
      setText(v ?? '');
    } catch {
      setText('');
    }
    loadedRef.current = true;
  }, [id]);
  const onChange = (v: string) => {
    setText(v);
    if (!loadedRef.current) return;
    try {
      const map = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      map[id] = v;
      localStorage.setItem(KEY, JSON.stringify(map));
    } catch {}
  };
  return (
    <textarea
      value={text}
      onChange={(e) => onChange(e.target.value)}
      placeholder="scratch pad…"
      className="w-full h-full resize-none bg-transparent outline-none text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 leading-relaxed"
    />
  );
}