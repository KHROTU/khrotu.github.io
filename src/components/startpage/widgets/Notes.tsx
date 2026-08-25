import { useEffect, useRef, useState } from 'react';
const KEY = 'startpage-widget-notes';
export default function Notes() {
  const [text, setText] = useState('');
  const loadedRef = useRef(false);
  useEffect(() => {
    const apply = () => setText(localStorage.getItem(KEY) ?? '');
    apply();
    loadedRef.current = true;
    window.addEventListener('sp-widget-config-changed', apply);
    return () => window.removeEventListener('sp-widget-config-changed', apply);
  }, []);
  const onChange = (v: string) => {
    setText(v);
    if (loadedRef.current) {
      try {
        localStorage.setItem(KEY, v);
      } catch {}
    }
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