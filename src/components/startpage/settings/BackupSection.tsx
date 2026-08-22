import { useRef } from 'react';
import { hintText, linkBtn } from './typography';
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
export default function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const exportAll = () => {
    const dump: Record<string, unknown> = {};
    for (const key of KEYS) {
      const v = localStorage.getItem(key);
      if (v === null) continue;
      try {
        dump[key] = JSON.parse(v);
      } catch {
        dump[key] = v;
      }
    }
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data: dump }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `startpage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importAll = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data) return;
      for (const [key, value] of Object.entries(parsed.data)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      window.location.reload();
    } catch {}
  };
  return (
    <div className="flex flex-col gap-2 items-start">
      <p className={hintText}>
        saves everything to a json file.
      </p>
      <div className="flex gap-2">
        <button onClick={exportAll} className={linkBtn}>↓ export</button>
        <button onClick={() => fileRef.current?.click()} className={linkBtn}>↑ import</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importAll(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}