import { useRef } from 'react';
import Section from './Section';
import { hintText, linkBtn, rowLabel } from './typography';
type Props = { openIds: Set<string>; toggle: (id: string) => void };
const KEYS = [
  'startpage-config-v2',
  'startpage-widgets-v1',
  'startpage-widget-notes',
  'startpage-widget-todo',
  'startpage-widget-pomodoro',
  'startpage-widget-kanban',
  'startpage-widget-inbox',
  'startpage-widget-goals',
  'startpage-widget-matrix',
  'startpage-widget-countdown',
  'startpage-widget-wheel',
  'startpage-widget-weather',
  'startpage-widget-location',
  'startpage-widget-github',
  'startpage-widget-currency',
  'startpage-widget-dice',
  'startpage-widget-textutils',
  'startpage-widget-custom',
  'startpage-command-usage-v1',
];
export default function AboutSection({ openIds, toggle }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const exportAll = () => {
    const dump: Record<string, unknown> = {};
    for (const key of KEYS) {
      const value = localStorage.getItem(key);
      if (value === null) continue;
      try { dump[key] = JSON.parse(value); } catch { dump[key] = value; }
    }
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: dump }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `startpage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importAll = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed.data) return;
      for (const [key, value] of Object.entries(parsed.data)) localStorage.setItem(key, JSON.stringify(value));
      window.location.reload();
    } catch {}
  };
  return (
    <Section id="about" title="about" openIds={openIds} toggle={toggle}>
      <div className="flex flex-col gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
        <span className={rowLabel}>commands</span>
        {[
          ['!settings', 'open this panel'],
          ['!widgets', 'toggle widget edit mode'],
          ['!<engine>', 'switch search engine (e.g. !google)'],
          ['tab', 'accept the ghost suggestion'],
          ['↑ ↓', 'move through command suggestions'],
          ['shift + drag', 'snap a widget to others/edges'],
          ['esc', 'clear the search / close this panel'],
        ].map(([command, description]) => (
          <div key={command} className="flex justify-between gap-3">
            <span className="font-mono">{command}</span>
            <span className="text-right">{description}</span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
        <p className={hintText}>saves everything to a json file.</p>
        <div className="flex gap-2">
          <button onClick={exportAll} className={linkBtn}>↓ export</button>
          <button onClick={() => fileRef.current?.click()} className={linkBtn}>↑ import</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) importAll(file); event.target.value = ''; }} />
        </div>
      </div>
      <p className="pt-2 border-t border-white/10 text-xs text-[var(--text-muted)] leading-relaxed">khrotu's Startpage · v0.1.2 · last updated: 8/25/2026</p>
    </Section>
  );
}