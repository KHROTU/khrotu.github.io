import type { SearchEngine } from '../types';
import { fieldLabel, ghostBtn, inputField } from './typography';
import Section from './Section';
type Props = { openIds: Set<string>; toggle: (id: string) => void; engines: SearchEngine[]; activeEngineId: string; onSetActive: (id: string) => void; onRemove: (id: string) => void; newName: string; newUrl: string; onNameChange: (value: string) => void; onUrlChange: (value: string) => void; onAdd: () => void };
export default function EngineSection({ openIds, toggle, engines, activeEngineId, onSetActive, onRemove, newName, newUrl, onNameChange, onUrlChange, onAdd }: Props) {
  return (
    <Section id="engine" title="search engine" openIds={openIds} toggle={toggle}>
      <div className="flex flex-col gap-2">
        {engines.map((engine) => (
          <div key={engine.id} className="flex items-center gap-2">
            <button onClick={() => onSetActive(engine.id)} className={`flex-1 flex items-center justify-between gap-2 border rounded-sm px-3 py-2 text-sm transition-colors ${activeEngineId === engine.id ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'}`}>
              <span>{engine.name}</span>
              {activeEngineId === engine.id && <span className="font-mono text-xs">active</span>}
            </button>
            <button onClick={() => onRemove(engine.id)} disabled={engines.length <= 1} aria-label={`remove ${engine.name}`} className={`${ghostBtn} disabled:opacity-30`}>del</button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <span className={fieldLabel}>add custom engine</span>
        <input value={newName} onChange={(event) => onNameChange(event.target.value)} placeholder="name" className={inputField} />
        <input value={newUrl} onChange={(event) => onUrlChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onAdd()} placeholder="https://example.com/search?q=%s" className={inputField} />
        <button onClick={onAdd} className={ghostBtn + ' w-fit'}>add engine</button>
      </div>
    </Section>
  );
}