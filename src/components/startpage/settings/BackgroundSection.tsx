import { useState } from 'react';
import { fieldLabel, microHint, linkBtn } from './typography';
const KEY = 'startpage-widget-bg';
export type BackgroundMode = 'colour' | 'image' | 'art';
export type Background = { mode: BackgroundMode; image: string | null; color: string; mouseEffects: boolean };
export function getBackground(): Background {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (parsed?.mode) return { mouseEffects: true, ...parsed } as Background;
    if (parsed?.image) return { mode: 'image', image: parsed.image, color: parsed.color ?? '#040404', mouseEffects: true };
  } catch {}
  return { mode: 'colour', image: null, color: '#040404', mouseEffects: true };
}
export function setBackground(bg: Background) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bg));
  } catch {}
}
type Props = {
  onChange?: (bg: Background) => void;
};
export default function BackgroundSection({ onChange }: Props) {
  const [bg, setBg] = useState(getBackground);
  const apply = (next: Background) => {
    setBg(next);
    setBackground(next);
    onChange?.(next);
  };
  const modes: { value: BackgroundMode; label: string }[] = [
    { value: 'colour', label: 'colour' },
    { value: 'image', label: 'image' },
    { value: 'art', label: 'generative art' },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className={fieldLabel}>background</span>
        <div className="flex items-center gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => apply({ ...bg, mode: m.value })}
              className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${
                bg.mode === m.value ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {bg.mode === 'colour' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bg.color}
            onChange={(e) => apply({ ...bg, color: e.target.value })}
            className="w-8 h-8 rounded-sm cursor-pointer bg-transparent border border-white/15"
          />
          <span className={fieldLabel}>background colour ({bg.color})</span>
        </div>
      )}
      {bg.mode === 'image' && (
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>image url</span>
          <div className="flex gap-1.5">
            <input
              defaultValue={bg.image ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value.trim();
                  apply({ ...bg, image: v || null });
                }
              }}
              placeholder="https://… or /path.jpg"
              className="flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-1 text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
            />
            {bg.image && (
              <button onClick={() => apply({ ...bg, image: null })} className={linkBtn}>clear</button>
            )}
          </div>
          <span className={microHint}>press enter to apply</span>
        </div>
      )}
      {bg.mode === 'art' && (
        <div className="flex items-center justify-between gap-3">
          <span className={fieldLabel}>mouse effects</span>
          <button
            onClick={() => apply({ ...bg, mouseEffects: !bg.mouseEffects })}
            aria-pressed={bg.mouseEffects}
            className={`w-9 h-5 rounded-full border transition-colors relative shrink-0 ${bg.mouseEffects ? 'bg-white/90 border-white' : 'bg-transparent border-white/25'}`}
          >
            <span className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${bg.mouseEffects ? 'left-[calc(100%-14px)] w-3 h-3 bg-black' : 'left-0.5 w-3 h-3 bg-white/50'}`} />
          </button>
        </div>
      )}
    </div>
  );
}