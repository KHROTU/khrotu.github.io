import { useState } from 'react';
import type { StartpageConfig } from '../types';
import Row from './Row';
import Section from './Section';
import Slider from './Slider';
import Toggle from './Toggle';
import { fieldLabel, inputField, linkBtn, microHint } from './typography';
export type BackgroundMode = 'colour' | 'image' | 'art';
export type Background = { mode: BackgroundMode; image: string | null; color: string; mouseEffects: boolean };
const BACKGROUND_KEY = 'startpage-widget-bg';
const CSS_KEY = 'startpage-widget-css';
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
export function getBackground(): Background {
  try {
    const parsed = JSON.parse(localStorage.getItem(BACKGROUND_KEY) ?? 'null');
    if (parsed?.mode) return { mouseEffects: true, ...parsed } as Background;
    if (parsed?.image) return { mode: 'image', image: parsed.image, color: parsed.color ?? '#040404', mouseEffects: true };
  } catch {}
  return { mode: 'colour', image: null, color: '#040404', mouseEffects: true };
}
function saveBackground(bg: Background) {
  try {
    localStorage.setItem(BACKGROUND_KEY, JSON.stringify(bg));
  } catch {}
}
export function getCustomCss(): string {
  try {
    return JSON.parse(localStorage.getItem(CSS_KEY) ?? '""');
  } catch {
    return '';
  }
}
type Props = { config: StartpageConfig; logoText: string; logoSrc: string; openIds: Set<string>; toggle: (id: string) => void; update: (patch: Partial<StartpageConfig>) => void; onLogoTextChange: (value: string) => void; onLogoSrcChange: (value: string) => void; onCommitLogo: () => void; onBackgroundChange?: (bg: Background) => void };
export default function CustomizeSection({ config, logoText, logoSrc, openIds, toggle, update, onLogoTextChange, onLogoSrcChange, onCommitLogo, onBackgroundChange }: Props) {
  const [bg, setBg] = useState(getBackground);
  const [css, setCss] = useState(() => getCustomCss() || CSS_TEMPLATE);
  const [applied, setApplied] = useState(false);
  const applyBackground = (next: Background) => {
    setBg(next);
    saveBackground(next);
    onBackgroundChange?.(next);
  };
  const applyCss = () => {
    document.getElementById('custom-widget-css')?.remove();
    const style = document.createElement('style');
    style.id = 'custom-widget-css';
    style.textContent = css;
    document.head.appendChild(style);
    try {
      localStorage.setItem(CSS_KEY, JSON.stringify(css));
    } catch {}
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };
  return (
    <Section id="customize" title="customize" openIds={openIds} toggle={toggle}>
      <Row label="logo enabled">
        <Toggle checked={config.logo.enabled} onChange={(value) => update({ logo: { ...config.logo, enabled: value } })} />
      </Row>
      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>logo image url (blank for none)</span>
        <input value={logoSrc} onChange={(event) => onLogoSrcChange(event.target.value)} onBlur={onCommitLogo} onKeyDown={(event) => event.key === 'Enter' && onCommitLogo()} placeholder="/favicon.svg or https://…" className={inputField} />
      </div>
      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>title text</span>
        <input value={logoText} onChange={(event) => onLogoTextChange(event.target.value)} onBlur={onCommitLogo} onKeyDown={(event) => event.key === 'Enter' && onCommitLogo()} placeholder="Startpage" className={inputField} />
      </div>
      <Row label="icon size">
        <Slider value={config.logo.size} min={12} max={160} step={2} onChange={(value) => update({ logo: { ...config.logo, size: value } })} unit="px" />
      </Row>
      <Row label="gap">
        <Slider value={config.logo.gap} min={0} max={64} step={2} onChange={(value) => update({ logo: { ...config.logo, gap: value } })} unit="px" />
      </Row>
      <Row label="show back link">
        <Toggle checked={config.showBackLink} onChange={(value) => update({ showBackLink: value })} />
      </Row>
      <div className="pt-2 border-t border-white/10 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className={fieldLabel}>background</span>
            <div className="flex items-center gap-2">
              {(['colour', 'image', 'art'] as const).map((mode) => (
                <button key={mode} onClick={() => applyBackground({ ...bg, mode })} className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${bg.mode === mode ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'}`}>{mode === 'art' ? 'generative art' : mode}</button>
              ))}
            </div>
          </div>
          {bg.mode === 'colour' && (
            <div className="flex items-center gap-2">
              <input type="color" value={bg.color} onChange={(event) => applyBackground({ ...bg, color: event.target.value })} className="w-8 h-8 rounded-sm cursor-pointer bg-transparent border border-white/15" />
              <span className={fieldLabel}>background colour ({bg.color})</span>
            </div>
          )}
          {bg.mode === 'image' && (
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>image url</span>
              <div className="flex gap-1.5">
                <input defaultValue={bg.image ?? ''} onKeyDown={(event) => { if (event.key === 'Enter') { const value = event.currentTarget.value.trim(); applyBackground({ ...bg, image: value || null }); } }} placeholder="https://… or /path.jpg" className="flex-1 min-w-0 bg-transparent border border-white/15 rounded-sm px-2 py-1 text-xs text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60" />
                {bg.image && <button onClick={() => applyBackground({ ...bg, image: null })} className={linkBtn}>clear</button>}
              </div>
              <span className={microHint}>press enter to apply</span>
            </div>
          )}
          {bg.mode === 'art' && (
            <div className="flex items-center justify-between gap-3">
              <span className={fieldLabel}>mouse effects</span>
              <Toggle checked={bg.mouseEffects} onChange={(value) => applyBackground({ ...bg, mouseEffects: value })} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>custom css</span>
          <textarea value={css} onChange={(event) => setCss(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') applyCss(); }} placeholder={'body {\n  letter-spacing: 0.02em;\n}'} rows={6} spellCheck={false} className="w-full resize-y bg-transparent border border-white/15 rounded-sm p-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors placeholder:text-[var(--text-muted)]/60" />
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={applyCss} className={linkBtn}>{applied ? 'applied!' : 'apply'}</button>
            {getCustomCss() && <button onClick={() => { document.getElementById('custom-widget-css')?.remove(); localStorage.removeItem(CSS_KEY); setCss(''); }} className={linkBtn}>reset</button>}
          </div>
        </div>
      </div>
    </Section>
  );
}