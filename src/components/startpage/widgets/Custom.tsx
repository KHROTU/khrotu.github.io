import { useEffect, useRef, useState } from 'react';
type CustomDef = { html: string };
const KEY = 'startpage-widget-custom';
export default function Custom({ id, editMode }: { id: string; editMode: boolean }) {
  const [code, setCode] = useState('');
  const [editing, setEditing] = useState(false);
  const [ran, setRan] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      if (all[id]?.html) {
        setCode(all[id].html);
        setRan((r) => r + 1);
      } else {
        setEditing(true);
      }
    } catch {
      setEditing(true);
    }
  }, [id]);
  const save = () => {
    try {
      const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      all[id] = { html: code } satisfies CustomDef;
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {}
    setEditing(false);
    setRan((r) => r + 1);
  };
  useEffect(() => {
    if (editing || !frameRef.current || !code) return;
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
  }, [code, editing, ran]);
  if (editing) {
    return (
      <div className="w-full h-full flex flex-col gap-1.5 min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="<b>hello</b>, write html here…"
          className="flex-1 min-h-0 w-full resize-none bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
        />
        <div className="flex gap-2 text-xs">
          <button onClick={save} className="text-[var(--text-muted)] hover:text-white transition-colors">save &amp; run</button>
          <button onClick={() => setEditing(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div ref={frameRef} className="w-full h-full min-h-0" />
      {editMode && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setEditing(true)}
          className="shrink-0 w-fit text-[10px] font-mono text-[var(--text-muted)] hover:text-white transition-colors"
        >
          edit code
        </button>
      )}
    </div>
  );
}