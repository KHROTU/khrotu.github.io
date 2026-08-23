import { useEffect, useRef, useState } from 'react';
import type { Shortcut, SearchEngine } from './types';
import { DEFAULT_CONFIG } from './types';
import type { WidgetType, WidgetInstance } from './widgets/types';
import { ghostBtn } from './settings/typography';
import AutocompleteSection from './settings/AutocompleteSection';
import AboutSection from './settings/AboutSection';
import CustomizeSection from './settings/CustomizeSection';
import EngineSection from './settings/EngineSection';
import ShortcutsSection from './settings/ShortcutsSection';
import WidgetsSection from './settings/WidgetsSection';
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
  onBackgroundChange?: (bg: import('./settings/CustomizeSection').Background) => void;
};
const btnGhost = ghostBtn;
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
export default function SettingsPanel({ open, onClose, config, update, onAddWidget, widgets, onRemoveWidget, onEnterWidgetEdit, onClearWidgets, onBackgroundChange }: Props) {
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
  const removeShortcut = (index: number) => commitShortcuts(shortcutsDraft.filter((_, current) => current !== index));
  const updateShortcutName = (index: number, name: string) => {
    const list = [...shortcutsDraft];
    if (!list[index]) return;
    list[index] = { ...list[index]!, name };
    commitShortcuts(list);
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
      <aside className="relative h-full w-1/2 min-w-[480px] bg-[#040404] border-l border-white/15 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col gap-6 p-8 pb-24">
          <div className="flex items-center justify-between sticky top-0 bg-[#040404] py-4 -mt-2 z-10 border-b border-white/10">
            <h2 className="text-lg font-medium text-[var(--text-main)]">settings</h2>
            <div className="flex items-center gap-3">
              <button onClick={resetAll} className={btnGhost}>reset all</button>
              <button onClick={onClose} aria-label="close" className="text-[var(--text-muted)] hover:text-white transition-colors text-xl leading-none px-1">×</button>
            </div>
          </div>
          <CustomizeSection config={config} logoText={logoText} logoSrc={logoSrc} update={update} openIds={openSections} toggle={toggleSection} onLogoTextChange={setLogoText} onLogoSrcChange={setLogoSrc} onCommitLogo={commitLogo} onBackgroundChange={onBackgroundChange} />
          <EngineSection openIds={openSections} toggle={toggleSection} engines={engines} activeEngineId={activeEngineId} onSetActive={setActive} onRemove={removeEngine} newName={newEngineName} newUrl={newEngineUrl} onNameChange={setNewEngineName} onUrlChange={setNewEngineUrl} onAdd={addEngine} />
          <ShortcutsSection config={config} openIds={openSections} toggle={toggleSection} update={update} shortcutsDraft={shortcutsDraft} fetchingIds={fetchingIds} onRemoveShortcut={removeShortcut} onNameChange={updateShortcutName} onUrlInput={onShortcutUrlInput} onUrlEnter={onShortcutUrlEnter} newName={newScName} newUrl={newScUrl} onNewNameChange={setNewScName} onNewUrlChange={setNewScUrl} onAddShortcut={addShortcut} />
          <WidgetsSection openIds={openSections} toggle={toggleSection} onAddWidget={onAddWidget} widgets={widgets} onRemoveWidget={onRemoveWidget} onEnterWidgetEdit={onEnterWidgetEdit} onClose={onClose} onClearWidgets={onClearWidgets} />
          <AutocompleteSection openIds={openSections} toggle={toggleSection} />
          <AboutSection openIds={openSections} toggle={toggleSection} />
        </div>
      </aside>
    </div>
  );
}