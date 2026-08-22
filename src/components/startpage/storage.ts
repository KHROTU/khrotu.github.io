import { useEffect, useState } from 'react';
import type { StartpageConfig } from './types';
import { DEFAULT_CONFIG } from './types';
const KEY = 'startpage-config-v2';
function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (typeof base === 'object' && typeof override === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const k of Object.keys(base as Record<string, unknown>)) {
      out[k] = deepMerge((base as Record<string, unknown>)[k], (override as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return (typeof override === typeof base ? override : base) as T;
}
export function loadConfig(): StartpageConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_CONFIG);
    return deepMerge(structuredClone(DEFAULT_CONFIG), JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}
export function saveConfig(config: StartpageConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(config));
  } catch {}
}
export function useStartpageConfig() {
  const [config, setConfig] = useState<StartpageConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setConfig(loadConfig());
    setReady(true);
  }, []);
  const update = (patch: Partial<StartpageConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      saveConfig(next);
      return next;
    });
  };
  return { config, update, ready };
}