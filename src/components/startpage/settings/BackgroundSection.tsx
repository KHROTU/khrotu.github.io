import { useState } from 'react';
import { fieldLabel, microHint, linkBtn } from './typography';
const KEY = 'startpage-widget-bg';
export function getBackground(): { image: string | null; color: string } {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? { image: null, color: '#040404' };
  } catch {
    return { image: null, color: '#040404' };
  }
}
export function setBackground(bg: { image: string | null; color: string }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bg));
  } catch {}
}
export default function BackgroundSection() {
  const [bg, setBg] = useState(getBackground);
  const apply = (next: { image: string | null; color: string }) => {
    setBg(next);
    setBackground(next);
    document.body.style.background = next.image
      ? `url(${next.image}) center/cover no-repeat fixed`
      : next.color;
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className={fieldLabel}>background image url</span>
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
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={bg.color}
          onChange={(e) => apply({ ...bg, color: e.target.value })}
          className="w-8 h-8 rounded-sm cursor-pointer bg-transparent border border-white/15"
        />
        <span className={fieldLabel}>fallback color ({bg.color})</span>
      </div>
    </div>
  );
}