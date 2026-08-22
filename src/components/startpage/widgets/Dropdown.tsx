import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
type Option = { value: string; label: string };
type Props = {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  className?: string;
};
export default function Dropdown({ value, options, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnClickRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (btnClickRef.current) return;
      if (e.target instanceof Node && menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener('pointerdown', close, true);
    window.addEventListener('wheel', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('pointerdown', close, true);
      window.removeEventListener('wheel', close);
      window.removeEventListener('resize', close);
    };
  }, [open]);
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect();
      const menuH = menuRef.current?.offsetHeight ?? Math.min(options.length * 24 + 4, 192);
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;
      const openUp = spaceBelow < menuH + 8 && spaceAbove > spaceBelow;
      let left = r.left;
      const menuW = menuRef.current?.offsetWidth ?? r.width;
      if (left + menuW > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - menuW);
      setPos({ top: openUp ? r.top - menuH - 4 : r.bottom + 4, left });
    };
    place();
    requestAnimationFrame(place);
  }, [open, options.length]);
  const current = options.find((o) => o.value === value);
  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation();
          btnClickRef.current = true;
          setTimeout(() => (btnClickRef.current = false), 0);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`w-full flex items-center justify-between gap-1.5 bg-transparent border border-white/15 rounded-sm px-2 py-0.5 text-xs text-[var(--text-main)] hover:border-white/40 transition-colors ${open ? 'border-[var(--border-bezel)]' : ''}`}
      >
        <span className="truncate">{current?.label ?? value}</span>
        <span className="text-[var(--text-muted)] text-[9px] shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: btnRef.current?.offsetWidth }}
            onPointerDown={(e) => e.stopPropagation()}
            className="z-[10000] max-h-48 overflow-y-auto hide-scrollbar bg-[#040404] border border-white/25 rounded-sm py-0.5 shadow-lg shadow-black/60"
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1 text-xs transition-colors ${
                  o.value === value ? 'bg-white/5 text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}