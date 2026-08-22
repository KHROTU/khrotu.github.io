import { useState } from 'react';
import { fieldLabel, linkBtn } from './typography';
const KEY = 'startpage-widget-css';
const CSS_TEMPLATE = `body {
  /* font-family: 'Comic Sans MS', cursive; */
  /* letter-spacing: 0.02em; */
}

/* text */
:root {
  /* --text-main: rgba(255, 255, 255, 0.95); */
  /* --text-muted: rgba(255, 255, 255, 0.55); */
  /* --border-bezel: rgba(255, 255, 255, 0.94); */
}

/* search bar */
input[aria-label="search"] {
  /* letter-spacing: 0.05em; */
}

/* logo / title */
button[title="open settings"] span {
  /* text-transform: lowercase; */
}

/* shortcut tiles */
a[title] span {
  /* font-size: 13px; */
}
`;
export function getCustomCss(): string {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '""');
  } catch {
    return '';
  }
}
export default function CssEditorSection() {
  const [css, setCss] = useState(() => getCustomCss() || CSS_TEMPLATE);
  const [applied, setApplied] = useState(false);
  const apply = () => {
    document.getElementById('custom-widget-css')?.remove();
    const style = document.createElement('style');
    style.id = 'custom-widget-css';
    style.textContent = css;
    document.head.appendChild(style);
    try {
      localStorage.setItem(KEY, JSON.stringify(css));
    } catch {}
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };
  return (
    <div className="flex flex-col gap-2">
      <span className={fieldLabel}>custom css</span>
      <textarea
        value={css}
        onChange={(e) => setCss(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') apply();
        }}
        placeholder={'body {\n  letter-spacing: 0.02em;\n}'}
        rows={6}
        spellCheck={false}
        className="w-full resize-y bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60"
      />
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={apply} className={linkBtn}>
          {applied ? 'applied!' : 'apply'}
        </button>
        {getCustomCss() && (
          <button
            onClick={() => {
              document.getElementById('custom-widget-css')?.remove();
              localStorage.removeItem(KEY);
              setCss('');
            }}
            className={linkBtn}
          >
            reset
          </button>
        )}
      </div>
    </div>
  );
}