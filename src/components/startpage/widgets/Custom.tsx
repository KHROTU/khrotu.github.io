import { useEffect, useRef, useState } from 'react';
type CustomDef = { html: string };
const KEY = 'startpage-widget-custom';
export default function Custom({ id }: { id: string }) {
  const [code, setCode] = useState('');
  const [ran, setRan] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (all[id]?.html) {
        setCode(all[id].html);
        setRan((r) => r + 1);
      }
    } catch {}
    const onCfg = () => {
      try {
        const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
        setCode(all[id]?.html ?? '');
        setRan((r) => r + 1);
      } catch {}
    };
    window.addEventListener('sp-widget-config-changed', onCfg);
    return () => window.removeEventListener('sp-widget-config-changed', onCfg);
  }, [id]);
  useEffect(() => {
    if (!frameRef.current || !code) return;
    const frame = frameRef.current;
    frame.innerHTML = '';
    const doc = document.createElement('iframe');
    doc.sandbox.add('allow-scripts');
    doc.style.cssText = 'width:100%;height:100%;border:none;background:transparent;color-scheme:dark;';
    frame.appendChild(doc);
    doc.srcdoc = `<!doctype html><html><head><style>body{margin:0;background:transparent;font-family:'Hyperlegible Sans',sans-serif;color:rgba(255,255,255,.87);overflow:hidden}a{color:inherit}</style></head><body>${code}</body></html>`;
    return () => {
      doc.remove();
    };
  }, [code, ran]);
  if (!code) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 text-xs font-mono text-[var(--text-muted)] border border-dashed border-white/15 rounded-sm">
        no content; edit via pencil
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col min-h-0 relative">
      <div ref={frameRef} className="w-full h-full min-h-0" />
    </div>
  );
}