import { useEffect, useState } from 'react';
import type { WidgetInstance, WidgetType } from './types';
const KEY = 'startpage-widgets-v1';
const MARGIN = 24;
export const WIDGET_DEFAULTS: Record<WidgetType, { width: number; height: number; label: string }> = {
  clock: { width: 220, height: 120, label: 'clock' },
  notes: { width: 280, height: 220, label: 'notes' },
  todo: { width: 260, height: 300, label: 'to-do' },
  pomodoro: { width: 200, height: 200, label: 'pomodoro' },
  timer: { width: 240, height: 160, label: 'timer' },
  kanban: { width: 420, height: 260, label: 'kanban' },
  weather: { width: 220, height: 160, label: 'weather' },
  ambient: { width: 240, height: 140, label: 'ambient sounds' },
  custom: { width: 300, height: 220, label: 'custom code' },
};
export function loadWidgets(): WidgetInstance[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function saveWidgets(widgets: WidgetInstance[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(widgets));
  } catch {}
}
let zCounter = 10;
function nextZ(): number {
  zCounter += 1;
  return zCounter;
}
function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
  return (
    a.x < b.x + b.width + MARGIN &&
    a.x + a.width + MARGIN > b.x &&
    a.y < b.y + b.height + MARGIN &&
    a.y + a.height + MARGIN > b.y
  );
}
function findFreeSpot(type: WidgetType, existing: WidgetInstance[]): { x: number; y: number } {
  const d = WIDGET_DEFAULTS[type];
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const step = 32;
  for (let y = 24; y < vh - d.height - 24; y += step) {
    for (let x = 24; x < vw - d.width - 24; x += step) {
      const candidate = { x, y, width: d.width, height: d.height };
      if (!existing.some((w) => overlaps(candidate, w))) {
        return { x, y };
      }
    }
  }
  return { x: 40, y: 40 };
}
export function useWidgets() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setWidgets(loadWidgets());
    setReady(true);
  }, []);
  const persist = (list: WidgetInstance[]) => {
    setWidgets(list);
    saveWidgets(list);
  };
  const add = (type: WidgetType) => {
    const d = WIDGET_DEFAULTS[type];
    const pos = findFreeSpot(type, widgets);
    const w: WidgetInstance = {
      id: `w-${Date.now()}`,
      type,
      x: pos.x,
      y: pos.y,
      width: d.width,
      height: d.height,
      z: nextZ(),
    };
    persist([...widgets, w]);
    return w;
  };
  const update = (id: string, patch: Partial<Omit<WidgetInstance, 'id' | 'type'>>) => {
    persist(widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };
  const remove = (id: string) => {
    persist(widgets.filter((w) => w.id !== id));
  };
  const focus = (id: string) => {
    const w = widgets.find((x) => x.id === id);
    if (!w || w.z === zCounter) return;
    update(id, { z: nextZ() });
  };
  const clearAll = () => persist([]);
  return { widgets, add, update, remove, focus, ready, clearAll };
}