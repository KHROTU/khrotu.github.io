import { useEffect, useRef, useState } from 'react';
import type { Shortcut, SearchEngine } from './types';
import { DEFAULT_CONFIG } from './types';
import type { WidgetType, WidgetInstance } from './widgets/types';
import { WIDGET_DEFAULTS } from './widgets/useWidgets';
type Props = {
  open: boolean;
  onClose: () => void;
  config: import('./types').StartpageConfig;
  update: (patch: Partial<import('./types').StartpageConfig>) => void;
  onAddWidget?: (type: WidgetType) => void;
  widgets?: WidgetInstance[];
  onRemoveWidget?: (id: string) => void;
  onEnterWidgetEdit?: () => void;
  onClearWidgets?: () => void;
};
const field = 'w-full bg-transparent border border-white/15 rounded-sm px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--border-bezel)] transition-colors';
const btnGhost = 'px-3 py-1.5 text-xs font-mono text-[var(--text-muted)] border border-white/15 rounded-sm hover:text-white hover:border-white/40 transition-colors';
function Section({ id, title, openIds, toggle, children }: { id: string; title: string; openIds: Set<string>; toggle: (id: string) => void; children: React.ReactNode }) {
  const open = openIds.has(id);
  return (
    <section className="flex flex-col">
      <button
        onClick={() => toggle(id)}
        aria-expanded={open}
        className="flex items-center justify-between w-full py-2 text-left group"
      >
        <h3 className="text-sm font-medium text-[var(--text-main)] group-hover:text-white transition-colors">{title}</h3>
        <span className="text-xs font-mono text-[var(--text-muted)] group-hover:text-white transition-colors px-1">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="flex flex-col gap-4 pl-3 border-l border-white/10 ml-1 mb-2">{children}</div>}
    </section>
  );
}
function Slider({ value, min, max, step, onChange, unit }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  const commit = () => {
    const n = Number(draft);
    if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setEditing(false);
  };
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="relative flex-1 h-5 flex items-center group">
        <div className="absolute inset-x-0 h-px bg-white/20" />
        <div className="absolute h-px bg-[var(--border-bezel)]" style={{ width: `${pct}%` }} />
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-[var(--border-bezel)] -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-125"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="w-14 bg-transparent border border-white/30 rounded-sm px-1 py-0.5 text-xs font-mono text-[var(--text-main)] text-right outline-none focus:border-[var(--border-bezel)]"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          title="click to edit"
          className="w-14 px-1 py-0.5 text-xs font-mono text-[var(--text-muted)] text-right hover:text-white border border-transparent hover:border-white/20 rounded-sm transition-colors"
        >
          {value}
          {unit ?? ''}
        </button>
      )}
    </div>
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`w-9 h-5 rounded-full border transition-colors relative ${checked ? 'bg-white/90 border-white' : 'bg-transparent border-white/25'}`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${checked ? 'left-[calc(100%-14px)] w-3 h-3 bg-black' : 'left-0.5 w-3 h-3 bg-white/50'}`}
      />
    </button>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--text-main)]">{label}</span>
      {children}
    </div>
  );
}
async function fetchPageTitle(url: string): Promise<string | null> {
  const endpoints = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    `https://r.jina.ai/${url}`,
  ];
  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const r = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timer);
      if (!r.ok) continue;
      let text: string | null = null;
      if (endpoint.includes('/get?url=')) {
        const json = await r.json();
        text = json?.contents ?? null;
      } else {
        text = await r.text();
      }
      if (!text) continue;
      const m = text.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (m?.[1].trim()) return m[1].trim().replace(/\s+/g, ' ');
    } catch {}
  }
  return null;
}
function deriveName(url: string): Promise<string | null> {
  return fetchPageTitle(url);
}
export default function SettingsPanel({ open, onClose, config, update, onAddWidget, widgets, onRemoveWidget, onEnterWidgetEdit, onClearWidgets }: Props) {
  const [logoText, setLogoText] = useState(config.logo.text);
  const [logoSrc, setLogoSrc] = useState(config.logo.src ?? '');
  const [engines, setEngines] = useState<SearchEngine[]>(config.engines);
  const [newEngineName, setNewEngineName] = useState('');
  const [newEngineUrl, setNewEngineUrl] = useState('');
  const [shortcutsDraft, setShortcutsDraft] = useState<(Shortcut | null)[]>(config.shortcuts);
  const [newScName, setNewScName] = useState('');
  const [newScUrl, setNewScUrl] = useState('');
  const [fetchingIds, setFetchingIds] = useState<Set<string>>(new Set());
  const openSections = new Set(config.openSections);
  const toggleSection = (id: string) => {
    const next = new Set(openSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ openSections: [...next] });
  };
  const urlTouchedRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);
  useEffect(() => {
    if (open && !initializedRef.current) {
      setLogoText(config.logo.text);
      setLogoSrc(config.logo.src ?? '');
      setEngines(config.engines);
      setShortcutsDraft(config.shortcuts);
      urlTouchedRef.current = new Set();
      initializedRef.current = true;
    }
    if (!open) initializedRef.current = false;
  }, [open, config]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const commitLogo = () =>
    update({
      logo: { ...config.logo, text: logoText.trim(), src: logoSrc.trim() === '' ? null : logoSrc.trim() },
    });
  const commitEngineList = (list: SearchEngine[]) => {
    setEngines(list);
    update({ engines: list });
  };
  const activeEngineId = engines.some((e) => e.id === config.activeEngine)
    ? config.activeEngine
    : engines[0]?.id ?? '';
  const setActive = (id: string) => update({ activeEngine: id });
  const addEngine = () => {
    const name = newEngineName.trim();
    let url = newEngineUrl.trim();
    if (!name || !url) return;
    if (!url.includes('%s')) url = url + '%s';
    commitEngineList([...engines, { id: `custom-${Date.now()}`, name, url }]);
    setNewEngineName('');
    setNewEngineUrl('');
  };
  const removeEngine = (id: string) => {
    if (engines.length <= 1) return;
    const list = engines.filter((e) => e.id !== id);
    const patch: Partial<import('./types').StartpageConfig> = { engines: list };
    if (config.activeEngine === id) patch.activeEngine = list[0].id;
    update(patch);
  };
  const commitShortcuts = (list: (Shortcut | null)[]) => {
    setShortcutsDraft(list);
    update({ shortcuts: list });
  };
  const addShortcut = () => {
    const url = newScUrl.trim();
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    let host = '';
    try {
      host = new URL(fullUrl).hostname;
    } catch {}
    const name = newScName.trim();
    const id = `sc-${Date.now()}`;
    commitShortcuts([...shortcutsDraft, { id, name: name || '', url: fullUrl, icon: host ? `https://icons.duckduckgo.com/ip3/${host}.ico` : undefined }]);
    setNewScName('');
    setNewScUrl('');
    if (!name) {
      setFetchingIds((prev) => new Set(prev).add(id));
      fetchPageTitle(fullUrl).then((title) => {
        setFetchingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        const finalName = title ?? (host || url);
        setShortcutsDraft((prev) => {
          const idx = prev.findIndex((s) => s?.id === id);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx]!, name: finalName };
          update({ shortcuts: next });
          return next;
        });
      });
    }
  };
  const autofillShortcut = async (index: number, url: string): Promise<Partial<Shortcut>> => {
    const patch: Partial<Shortcut> = {};
    try {
      const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      patch.icon = `https://icons.duckduckgo.com/ip3/${host}.ico`;
    } catch {}
    const cur = shortcutsDraft[index];
    if (!cur?.name && /^https?:\/\/|^www\./.test(url)) {
      const title = await deriveName(url.startsWith('http') ? url : `https://${url}`);
      if (title) patch.name = title;
    }
    return patch;
  };
  const onShortcutUrlInput = (index: number, url: string) => {
    const list = [...shortcutsDraft];
    if (!list[index]) return;
    let patch: Partial<Shortcut> = { url };
    if (!urlTouchedRef.current.has(index)) {
      urlTouchedRef.current.add(index);
      list[index] = { ...list[index]!, ...patch };
      commitShortcuts(list);
      autofillShortcut(index, url).then((extra) => {
        if (Object.keys(extra).length === 0) return;
        setShortcutsDraft((prev) => {
          if (!prev[index]) return prev;
          const next = [...prev];
          next[index] = { ...next[index]!, ...extra };
          update({ shortcuts: next });
          return next;
        });
      });
      return;
    }
    list[index] = { ...list[index]!, ...patch };
    commitShortcuts(list);
  };
  const onShortcutUrlEnter = (index: number) => {
    const sc = shortcutsDraft[index];
    if (!sc?.url) return;
    autofillShortcut(index, sc.url).then((patch) => {
      setShortcutsDraft((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        next[index] = { ...next[index]!, ...patch };
        update({ shortcuts: next });
        return next;
      });
    });
    urlTouchedRef.current.delete(index);
  };
  const resetAll = () => {
    update(structuredClone(DEFAULT_CONFIG));
    setLogoText(DEFAULT_CONFIG.logo.text);
    setLogoSrc(DEFAULT_CONFIG.logo.src ?? '');
    setEngines(DEFAULT_CONFIG.engines);
    setShortcutsDraft(DEFAULT_CONFIG.shortcuts);
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close settings" onClick={onClose} className="absolute inset-0 bg-black/60 cursor-default" />
      <aside className="relative h-full w-1/2 min-w-[480px] bg-[#040404] border-l border-white/15 overflow-y-auto">
        <div className="flex flex-col gap-6 p-8 pb-24">
          <div className="flex items-center justify-between sticky top-0 bg-[#040404] py-4 -mt-2 z-10 border-b border-white/10">
            <h2 className="text-lg font-medium text-[var(--text-main)]">settings</h2>
            <div className="flex items-center gap-3">
              <button onClick={resetAll} className={btnGhost}>reset all</button>
              <button onClick={onClose} aria-label="close" className="text-[var(--text-muted)] hover:text-white transition-colors text-xl leading-none px-1">×</button>
            </div>
          </div>
          <Section id="logo" title="logo & title" openIds={openSections} toggle={toggleSection}>
            <Row label="enabled">
              <Toggle checked={config.logo.enabled} onChange={(v) => update({ logo: { ...config.logo, enabled: v } })} />
            </Row>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[var(--text-muted)]">image url (blank for none)</span>
              <input value={logoSrc} onChange={(e) => setLogoSrc(e.target.value)} onBlur={commitLogo} onKeyDown={(e) => e.key === 'Enter' && commitLogo()} placeholder="/favicon.svg or https://…" className={field} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[var(--text-muted)]">title text</span>
              <input value={logoText} onChange={(e) => setLogoText(e.target.value)} onBlur={commitLogo} onKeyDown={(e) => e.key === 'Enter' && commitLogo()} placeholder="Startpage" className={field} />
            </div>
            <Row label="icon size">
              <Slider value={config.logo.size} min={12} max={160} step={2} onChange={(v) => update({ logo: { ...config.logo, size: v } })} unit="px" />
            </Row>
            <Row label="gap">
              <Slider value={config.logo.gap} min={0} max={64} step={2} onChange={(v) => update({ logo: { ...config.logo, gap: v } })} unit="px" />
            </Row>
            <Row label="show back link">
              <Toggle checked={config.showBackLink} onChange={(v) => update({ showBackLink: v })} />
            </Row>
          </Section>
          <Section id="engine" title="search engine" openIds={openSections} toggle={toggleSection}>
            <div className="flex flex-col gap-2">
              {engines.map((engine) => (
                <div key={engine.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setActive(engine.id)}
                    className={`flex-1 flex items-center justify-between gap-2 border rounded-sm px-3 py-2 text-sm transition-colors ${
                      activeEngineId === engine.id ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'
                    }`}
                  >
                    <span>{engine.name}</span>
                    {activeEngineId === engine.id && <span className="font-mono text-xs">active</span>}
                  </button>
                  <button onClick={() => removeEngine(engine.id)} disabled={engines.length <= 1} aria-label={`remove ${engine.name}`} className={`${btnGhost} disabled:opacity-30`}>del</button>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-sm text-[var(--text-muted)]">add custom engine</span>
              <input value={newEngineName} onChange={(e) => setNewEngineName(e.target.value)} placeholder="name" className={field} />
              <input
                value={newEngineUrl}
                onChange={(e) => setNewEngineUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEngine()}
                placeholder="https://example.com/search?q=%s"
                className={field}
              />
              <button onClick={addEngine} className={btnGhost + ' w-fit'}>add engine</button>
            </div>
          </Section>
          <Section id="shortcuts" title="shortcuts" openIds={openSections} toggle={toggleSection}>
            <Row label="tile size">
              <Slider value={config.shortcutSize} min={40} max={128} step={4} onChange={(v) => update({ shortcutSize: v })} unit="px" />
            </Row>
            <Row label="icon size">
              <Slider value={config.shortcutIconSize} min={12} max={64} step={2} onChange={(v) => update({ shortcutIconSize: v })} unit="px" />
            </Row>
            <Row label="tile gap">
              <Slider value={config.shortcutGap} min={4} max={48} step={2} onChange={(v) => update({ shortcutGap: v })} unit="px" />
            </Row>
            <Row label="overflow after">
              <Slider value={config.shortcutOverflowAfter} min={3} max={32} step={1} onChange={(v) => update({ shortcutOverflowAfter: v })} />
            </Row>
            <Row label="overflow">
              <div className="flex items-center gap-2">
                {(['none', 'scroll', 'wrap'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => update({ shortcutOverflow: mode })}
                    className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${
                      config.shortcutOverflow === mode ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </Row>
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              {shortcutsDraft.map((sc, i) =>
                sc ? (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[var(--text-muted)]">{i + 1}</span>
                      <button
                        onClick={() => commitShortcuts(shortcutsDraft.filter((_, j) => j !== i))}
                        aria-label={`remove shortcut ${i + 1}`}
                        className="text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors"
                      >
                        remove
                      </button>
                    </div>
                    <input
                      value={fetchingIds.has(sc.id) ? 'fetching...' : sc.name ?? ''}
                      placeholder="title"
                      disabled={fetchingIds.has(sc.id)}
                      onChange={(e) => {
                        const list = [...shortcutsDraft];
                        list[i] = { ...sc, name: e.target.value };
                        commitShortcuts(list);
                      }}
                      className={`${field}${fetchingIds.has(sc.id) ? ' opacity-50' : ''}`}
                    />
                    <input
                      value={sc.url ?? ''}
                      placeholder="https://…"
                      onChange={(e) => onShortcutUrlInput(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onShortcutUrlEnter(i);
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className={field}
                    />
                  </div>
                ) : null
              )}
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-sm text-[var(--text-muted)]">add shortcut</span>
              <input value={newScName} onChange={(e) => setNewScName(e.target.value)} placeholder="title (blank = auto from page title)" className={field} />
              <input
                value={newScUrl}
                onChange={(e) => setNewScUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addShortcut()}
                placeholder="https://…"
                className={field}
              />
              <button onClick={addShortcut} className={btnGhost + ' w-fit'}>add shortcut</button>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              title and favicon are filled from the url the first time you type it. press enter in a url field to re-derive them.
            </p>
          </Section>
          <Section id="widgets" title="widgets" openIds={openSections} toggle={toggleSection}>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WIDGET_DEFAULTS) as WidgetType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { onAddWidget?.(type); onEnterWidgetEdit?.(); }}
                  className={btnGhost}
                >
                  {WIDGET_DEFAULTS[type].label}
                </button>
              ))}
            </div>
            {(widgets?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <span className="text-sm text-[var(--text-muted)]">placed ({widgets!.length})</span>
                {widgets!.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[var(--text-main)]">{WIDGET_DEFAULTS[w.type]?.label ?? w.type}</span>
                    <button onClick={() => onRemoveWidget?.(w.id)} aria-label={`remove ${w.type}`} className={`${btnGhost} hover:border-white/40`}>remove</button>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => { onClose(); onEnterWidgetEdit?.(); }} className={btnGhost}>edit</button>
                  <button onClick={onClearWidgets} className={btnGhost}>remove all</button>
                </div>
              </div>
            )}
          </Section>
        </div>
      </aside>
    </div>
  );
}