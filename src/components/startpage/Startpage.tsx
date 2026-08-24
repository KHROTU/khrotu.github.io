import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { Shortcut } from './types';
import { useStartpageConfig } from './storage';
import { recordUse, usageCount } from './usage';
import { useWidgets } from './widgets/useWidgets';
import { getBackground, getCustomCss, type Background } from './settings/prefs';
const SettingsPanel = lazy(() => import('./SettingsPanel'));
const WidgetLayer = lazy(() => import('./widgets/WidgetLayer'));
import ArtBackground from './settings/ArtBackground';
import { isUrlLike, normalizeUrl } from './url';
import { recordTerm, bootAutocomplete, suggestSync } from './autocomplete';
type Command = { name: string; run: () => void };
function hostOf(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
export default function Startpage() {
  const { config, update, ready } = useStartpageConfig();
  const { widgets, add, update: updateWidget, remove: removeWidget, focus: focusWidget, clearAll } = useWidgets();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [widgetEdit, setWidgetEdit] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [bg, setBg] = useState<Background>(() => getBackground());
  useEffect(() => {
    document.body.style.background = bg.mode === 'image' && bg.image
      ? `url(${bg.image}) center/cover no-repeat fixed`
      : bg.color;
    const css = getCustomCss();
    if (css) {
      const style = document.createElement('style');
      style.id = 'custom-widget-css';
      style.textContent = css;
      document.head.appendChild(style);
    }
  }, [bg]);
  useEffect(() => {
    document.getElementById('startpage-shell')?.remove();
  }, []);
  useEffect(() => {
    if (!ready || !('serviceWorker' in navigator)) return;
    const urls = config.shortcuts.flatMap((sc) => {
      if (!sc) return [];
      const out: string[] = [];
      const host = hostOf(sc.url);
      if (host) out.push(`https://www.google.com/s2/favicons?domain=${host}&sz=64`);
      if (sc.icon) out.push(sc.icon);
      return out;
    });
    navigator.serviceWorker.ready.then((reg) => { reg.active?.postMessage({ type: 'cache-icons', urls }); }).catch(() => {});
  }, [ready, config.shortcuts]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [ready]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      if (target.closest('iframe')) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'add-shortcut') {
        update({ shortcuts: [...config.shortcuts, e.data.shortcut] });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [config.shortcuts, update]);
  const engine = useMemo(
    () => config.engines.find((e) => e.id === config.activeEngine) ?? config.engines[0],
    [config.engines, config.activeEngine]
  );
  const commands: Command[] = useMemo(() => {
    const cmds: Command[] = [
      { name: '!settings', run: () => setSettingsOpen(true) },
      { name: '!widgets', run: () => setWidgetEdit((v) => !v) },
      ...config.engines.map((e) => ({
        name: `!${e.name.toLowerCase()}`,
        run: () => update({ activeEngine: e.id }),
      })),
    ];
    return cmds.sort((a, b) => {
      const diff = usageCount(b.name) - usageCount(a.name);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  }, [config.engines, update]);
  const matchedCommands = query.startsWith('!') ? commands.filter((c) => c.name.startsWith(query.toLowerCase())) : [];
  const isCommandMode = query.startsWith('!');
  const [acReady, setAcReady] = useState(false);
  useEffect(() => { bootAutocomplete().then(() => setAcReady(true)); }, []);
  const suggestions = useMemo(() => (isCommandMode || !query.trim() ? [] : suggestSync(query, 6)), [query, isCommandMode, acReady]);
  const urlLike = !isCommandMode && isUrlLike(query);
  const listLen = isCommandMode ? matchedCommands.length : suggestions.length;
  const activeIndex = Math.min(selected, Math.max(0, listLen - 1));
  const cmdGhost = isCommandMode && matchedCommands[activeIndex] && query.length < matchedCommands[activeIndex].name.length ? matchedCommands[activeIndex].name.slice(query.length) : '';
  const suggestGhost = !isCommandMode && suggestions[0] && suggestions[0].term.toLowerCase().startsWith(query.toLowerCase()) ? suggestions[0].term.slice(query.length) : '';
  const ghostCompletion = isCommandMode ? cmdGhost : suggestGhost;
  const runCommand = (cmd: Command | undefined) => {
    if (!cmd) return;
    setQuery('');
    setSelected(0);
    recordUse(cmd.name);
    cmd.run();
  };
  const navigateSearch = (q: string) => {
    if (!engine) return;
    const kind = isUrlLike(q) ? 'url' as const : 'search' as const;
    recordTerm(q, kind);
    if (kind === 'url') { window.location.href = normalizeUrl(q); return; }
    window.location.href = engine.url.includes('%s') ? engine.url.replace('%s', encodeURIComponent(q)) : engine.url + encodeURIComponent(q);
  };
  const submit = () => {
    const q = query.trim();
    if (!q) return;
    if (isCommandMode) { runCommand(matchedCommands[activeIndex]); return; }
    if (urlLike) { navigateSearch(q); return; }
    if (suggestions.length > 0 && activeIndex < suggestions.length) {
      const picked = suggestions[activeIndex];
      if (picked) { navigateSearch(picked.term); return; }
    }
    navigateSearch(q);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowDown' && listLen > 0) {
      e.preventDefault();
      setSelected((i) => Math.min(i + 1, listLen - 1));
    } else if (e.key === 'ArrowUp' && listLen > 0) {
      e.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Tab' && ghostCompletion) {
      e.preventDefault();
      if (isCommandMode) setQuery(matchedCommands[activeIndex].name);
      else if (suggestGhost) setQuery(suggestions[0].term);
    } else if (e.key === 'Escape') {
      setQuery('');
      setSelected(0);
    }
  };
  const onShortcutClick = (sc: Shortcut) => {
    if (sc.url) {
      window.location.href = sc.url;
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      {bg.mode === 'art' && <ArtBackground mouseEffects={bg.mouseEffects} />}
      {widgets.length > 0 && (
        <Suspense fallback={null}>
          <WidgetLayer widgets={widgets} editMode={widgetEdit} onUpdate={updateWidget} onRemove={removeWidget} onFocus={focusWidget} onAdd={add} />
        </Suspense>
      )}
      {widgetEdit && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-2 bg-[#040404] border border-white/25 rounded-sm text-sm">
          <span className="font-mono text-xs text-[var(--text-muted)]">editing widgets</span>
          <button onClick={() => setWidgetEdit(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">done</button>
        </div>
      )}
      <div className="flex flex-col items-center gap-5 w-full" style={{ maxWidth: config.searchWidth }}>
        {config.logo.enabled && (
          <button
            onClick={() => setSettingsOpen(true)}
            title="open settings"
            className="flex items-center self-start hover:opacity-80 transition-opacity cursor-pointer"
            style={{ gap: config.logo.gap }}
          >
            {config.logo.src && (
              <img src={config.logo.src} alt="" width={config.logo.size} height={config.logo.size} className="rounded-sm" />
            )}
            {config.logo.text && (
              <span
                className="text-[var(--text-main)] font-medium tracking-tight leading-none"
                style={{ fontSize: config.logo.size }}
              >
                {config.logo.text}
              </span>
            )}
          </button>
        )}
        <div className="w-full flex flex-col relative" style={{ maxWidth: config.searchWidth }}>
          <div className="relative w-full">
            <div
              className="w-full flex items-center bg-transparent border border-[var(--border-bezel)]/40 rounded-sm focus-within:border-[var(--border-bezel)] transition-colors"
              style={{ height: config.searchHeight }}
            >
              <div className="relative flex-1 h-full">
                {ghostCompletion && (
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-4 flex items-center pointer-events-none select-none"
                    style={{ fontSize: config.searchFontSize }}
                  >
                    <span className="invisible whitespace-pre">{query}</span>
                    <span className="text-[var(--text-muted)]/50 whitespace-pre">{ghostCompletion}</span>
                  </div>
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={engine ? `Search ${engine.name}...` : 'Search...'}
                  aria-label="search"
                  className="absolute inset-0 w-full h-full bg-transparent outline-none px-4 text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                  style={{ fontSize: config.searchFontSize }}
                />
              </div>
            </div>
          </div>
          {isCommandMode && matchedCommands.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-[var(--border-bezel)]/40 rounded-sm bg-[#040404] z-20 overflow-hidden">
              {matchedCommands.map((cmd, i) => (
                <div
                  key={cmd.name}
                  onMouseDown={(e) => { e.preventDefault(); runCommand(cmd); }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    i === activeIndex ? 'bg-white/5 text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {cmd.name}
                </div>
              ))}
            </div>
          )}
          {!isCommandMode && query.trim() && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-[var(--border-bezel)]/40 rounded-sm bg-[#040404] z-20 overflow-hidden">
              {suggestions.map((s, i) => {
                const idx = i;
                return (
                  <div
                    key={s.term}
                    onMouseDown={(e) => { e.preventDefault(); navigateSearch(s.term); }}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors ${idx === activeIndex ? 'bg-white/5 text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
                  >
                    <span className="truncate">{s.term}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div
          className={
            config.shortcutOverflow === 'wrap'
              ? 'flex flex-wrap justify-start items-center'
              : config.shortcutOverflow === 'scroll'
                ? 'flex justify-start items-center overflow-x-auto hide-scrollbar'
                : 'flex justify-start items-center'
          }
          style={{
            gap: config.shortcutGap,
            maxWidth: config.shortcutOverflow !== 'none' ? `${config.shortcutOverflowAfter * (config.shortcutSize + config.shortcutGap) - config.shortcutGap}px` : undefined,
          }}
        >
          {config.shortcuts.map((sc) =>
            sc ? (
              <a
                key={sc.id}
                href={sc.url}
                onClick={(e) => {
                  e.preventDefault();
                  onShortcutClick(sc);
                }}
                title={sc.name}
                className="flex flex-col items-center justify-center rounded-sm border border-transparent hover:border-[var(--border-bezel)]/40 transition-colors"
                style={{ width: config.shortcutSize, height: config.shortcutSize }}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${hostOf(sc.url)}&sz=64`}
                  onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                  alt=""
                  width={config.shortcutIconSize}
                  height={config.shortcutIconSize}
                />
                <span className="text-xs text-[var(--text-muted)] mt-2 truncate max-w-full px-1 whitespace-nowrap">{sc.name}</span>
              </a>
            ) : null
          )}
        </div>
        {config.showBackLink && (
          <a href="/" className="fixed bottom-6 right-6 text-xs font-mono text-[var(--text-muted)]/50 hover:text-[var(--text-muted)] transition-colors">
            back to khrotu.org
          </a>
        )}
      </div>
      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsPanel
            open
            onClose={() => setSettingsOpen(false)}
            config={config}
            update={update}
            onAddWidget={(type) => { add(type); setWidgetEdit(true); }}
            widgets={widgets}
            onRemoveWidget={removeWidget}
            onEnterWidgetEdit={() => setWidgetEdit(true)}
            onClearWidgets={clearAll}
            onBackgroundChange={setBg}
          />
        </Suspense>
      )}
    </div>
  );
}