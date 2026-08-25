import type { WidgetInstance } from './types';
export type Values = Record<string, string | number>;
type FieldDef = {
  key: string;
  label: string;
  kind: 'text' | 'textarea' | 'select' | 'slider' | 'geocity';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
};
type EditorDef = { title: string; fields: FieldDef[]; load: () => Values; save: (values: Values) => void | Promise<void> };
const LOCATION_KEY = 'startpage-widget-location';
const readJson = (key: string): any => {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
};
const writeJson = (key: string, v: unknown) => localStorage.setItem(key, JSON.stringify(v));
const editors: Partial<Record<WidgetInstance['type'], (w: WidgetInstance) => EditorDef>> = {
  image: (w) => ({
    title: 'image',
    fields: [
      { key: 'src', label: 'image url', kind: 'text', placeholder: 'https://… or data:image/…' },
      { key: 'link', label: 'click link (optional)', kind: 'text', placeholder: 'https://…' },
      { key: 'fit', label: 'fit', kind: 'select', options: ['cover', 'contain', 'fill'] },
      { key: 'radius', label: 'corner radius', kind: 'slider', min: 0, max: 24, step: 1, unit: 'px' },
    ],
    load: () => {
      const d = readJson('startpage-widget-image')?.[w.id];
      return { src: d?.src ?? '', link: d?.link ?? '', fit: d?.fit ?? 'cover', radius: d?.radius ?? 6 };
    },
    save: (v) => {
      const all = readJson('startpage-widget-image') ?? {};
      all[w.id] = { src: String(v.src ?? '').trim(), fit: ['cover', 'contain', 'fill'].includes(String(v.fit)) ? v.fit : 'cover', link: String(v.link ?? '').trim(), radius: Number(v.radius ?? 6) };
      writeJson('startpage-widget-image', all);
    },
  }),
  github: () => ({
    title: 'github repo',
    fields: [{ key: 'repo', label: 'repository', kind: 'text', placeholder: 'owner/repo' }],
    load: () => ({ repo: localStorage.getItem('startpage-widget-github') ?? 'facebook/react' }),
    save: (v) => {
      const repo = String(v.repo ?? '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      if (!repo || !repo.includes('/')) throw new Error('use owner/repo format');
      localStorage.setItem('startpage-widget-github', repo);
    },
  }),
  custom: (w) => ({
    title: 'custom code',
    fields: [{ key: 'html', label: 'html', kind: 'textarea', placeholder: '<b>hello</b>, write html here…' }],
    load: () => ({ html: readJson('startpage-widget-custom')?.[w.id]?.html ?? '' }),
    save: (v) => {
      const all = readJson('startpage-widget-custom') ?? {};
      all[w.id] = { html: String(v.html ?? '') };
      writeJson('startpage-widget-custom', all);
    },
  }),
  weather: () => ({
    title: 'weather location',
    fields: [{ key: 'city', label: 'city (blank = gps)', kind: 'geocity', placeholder: 'city name…' }],
    load: () => ({ city: readJson(LOCATION_KEY)?.city === 'here' ? '' : readJson(LOCATION_KEY)?.city ?? '' }),
    save: async (v) => {
      const name = String(v.city ?? '').trim();
      if (!name) {
        localStorage.removeItem(LOCATION_KEY);
        window.dispatchEvent(new Event('sp-location-changed'));
        return;
      }
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`);
      const j = await r.json();
      const hit = j.results?.[0];
      if (!hit) throw new Error('city not found');
      localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat: hit.latitude, lon: hit.longitude, city: hit.name }));
      window.dispatchEvent(new Event('sp-location-changed'));
    },
  }),
};
export function getEditor(w: WidgetInstance): EditorDef | null {
  return editors[w.type]?.(w) ?? null;
}