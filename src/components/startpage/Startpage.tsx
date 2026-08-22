import { useEffect, useMemo, useRef, useState } from 'react';
import type { Shortcut } from './types';
import { useStartpageConfig } from './storage';
import { recordUse, usageCount } from './usage';
import SettingsPanel from './SettingsPanel';
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [ready]);
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
  const activeIndex = Math.min(selected, Math.max(0, matchedCommands.length - 1));
  const ghostCompletion = isCommandMode && matchedCommands[activeIndex] && query.length < matchedCommands[activeIndex].name.length
    ? matchedCommands[activeIndex].name.slice(query.length)
    : '';
  const runCommand = (cmd: Command | undefined) => {
    if (!cmd) return;
    setQuery('');
    setSelected(0);
    recordUse(cmd.name);
    cmd.run();
  };
  const submit = () => {
    const q = query.trim();
    if (!q) return;
    if (isCommandMode) {
      runCommand(matchedCommands[activeIndex]);
      return;
    }
    if (!engine) return;
    window.location.href = engine.url.includes('%s') ? engine.url.replace('%s', encodeURIComponent(q)) : engine.url + encodeURIComponent(q);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowDown' && isCommandMode && matchedCommands.length > 0) {
      e.preventDefault();
      setSelected((i) => Math.min(i + 1, matchedCommands.length - 1));
    } else if (e.key === 'ArrowUp' && isCommandMode && matchedCommands.length > 0) {
      e.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Tab' && ghostCompletion) {
      e.preventDefault();
      setQuery(matchedCommands[activeIndex].name);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
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
                  className={`px-4 py-2 text-sm cursor-default transition-colors ${
                    i === activeIndex ? 'bg-white/5 text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {cmd.name}
                </div>
              ))}
            </div>
          )
          }
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
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} config={config} update={update} />
    </div>
  );
}