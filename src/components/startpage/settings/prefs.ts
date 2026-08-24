export type BackgroundMode = 'colour' | 'image' | 'art';
export type Background = { mode: BackgroundMode; image: string | null; color: string; mouseEffects: boolean };
const BACKGROUND_KEY = 'startpage-widget-bg';
const CSS_KEY = 'startpage-widget-css';
export function getBackground(): Background {
  try {
    const parsed = JSON.parse(localStorage.getItem(BACKGROUND_KEY) ?? 'null');
    if (parsed?.mode) return { mouseEffects: true, ...parsed } as Background;
    if (parsed?.image) return { mode: 'image', image: parsed.image, color: parsed.color ?? '#040404', mouseEffects: true };
  } catch {}
  return { mode: 'colour', image: null, color: '#040404', mouseEffects: true };
}
export function saveBackground(bg: Background) {
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
export function saveCustomCss(css: string) {
  try {
    localStorage.setItem(CSS_KEY, JSON.stringify(css));
  } catch {}
}
export function removeCustomCss() {
  try {
    localStorage.removeItem(CSS_KEY);
  } catch {}
}