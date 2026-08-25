import { useEffect, useMemo, useState } from 'react';
import type { WidgetInstance } from './types';
import { getEditor, type Values } from './configEditors';
import Slider from '../settings/Slider';
export default function WidgetSettingsModal({ widget, onClose }: { widget: WidgetInstance; onClose: () => void }) {
  const editor = useMemo(() => getEditor(widget), [widget]);
  const [values, setValues] = useState<Values>(() => editor?.load() ?? {});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!editor) return null;
  const set = (key: string, v: string | number) => setValues((p) => ({ ...p, [key]: v }));
  const commit = async () => {
    setBusy(true);
    setErr('');
    try {
      await editor.save(values);
      window.dispatchEvent(new CustomEvent('sp-widget-config-changed', { detail: { id: widget.id, type: widget.type } }));
      onClose();
    } catch (e) {
      setErr(String((e as Error)?.message ?? e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onPointerDown={(e) => e.stopPropagation()} onClick={onClose}>
      <div
        className="w-full max-w-sm bg-[#0a0a0a] border border-white/25 rounded-sm shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <span className="font-mono text-xs text-[var(--text-muted)] tracking-wide">edit</span>
          <button onClick={onClose} aria-label="close" className="text-[var(--text-muted)] hover:text-white text-sm leading-none">×</button>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto hide-scrollbar">
          {editor.fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)]/70">{f.label}</span>
              {f.kind === 'textarea' && (
                <textarea
                  value={str(values[f.key])}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={7}
                  spellCheck={false}
                  className="w-full resize-y bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
                />
              )}
              {(f.kind === 'text' || f.kind === 'geocity') && (
                <input
                  value={str(values[f.key])}
                  onChange={(e) => set(f.key, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
                  placeholder={f.placeholder}
                  className="w-full bg-transparent border border-white/15 rounded-sm px-2 py-1.5 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
                />
              )}
              {f.kind === 'select' && (
                <div className="flex gap-1">
                  {(f.options ?? []).map((o) => (
                    <button
                      key={o}
                      onClick={() => set(f.key, o)}
                      className={`px-2 py-1 text-[10px] font-mono border rounded-sm transition-colors ${values[f.key] === o ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
              {f.kind === 'slider' && (
                <Slider value={num(values[f.key], f.min ?? 0)} min={f.min ?? 0} max={f.max ?? 100} step={f.step ?? 1} onChange={(v) => set(f.key, v)} unit={f.unit} />
              )}
            </div>
          ))}
          {err && <span className="text-[10px] font-mono text-red-300/80">{err}</span>}
        </div>
        <div className="flex justify-end gap-3 px-4 py-3 border-t border-white/10 shrink-0">
          <button onClick={onClose} disabled={busy} className="text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors">cancel</button>
          <button onClick={commit} disabled={busy} className="text-xs font-mono px-3 py-1 border border-white/30 rounded-sm text-[var(--text-main)] hover:border-white/60 hover:bg-white/5 transition-colors disabled:opacity-50">{busy ? 'saving…' : 'save'}</button>
        </div>
      </div>
    </div>
  );
}
const num = (v: unknown, fb: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');