import type { Shortcut, StartpageConfig } from '../types';
import Row from './Row';
import Section from './Section';
import Slider from './Slider';
import { fieldLabel, ghostBtn, inputField, linkBtn } from './typography';
type Props = { config: StartpageConfig; openIds: Set<string>; toggle: (id: string) => void; update: (patch: Partial<StartpageConfig>) => void; shortcutsDraft: (Shortcut | null)[]; fetchingIds: Set<string>; onRemoveShortcut: (index: number) => void; onNameChange: (index: number, value: string) => void; onUrlInput: (index: number, value: string) => void; onUrlEnter: (index: number) => void; newName: string; newUrl: string; onNewNameChange: (value: string) => void; onNewUrlChange: (value: string) => void; onAddShortcut: () => void };
export default function ShortcutsSection({ config, openIds, toggle, update, shortcutsDraft, fetchingIds, onRemoveShortcut, onNameChange, onUrlInput, onUrlEnter, newName, newUrl, onNewNameChange, onNewUrlChange, onAddShortcut }: Props) {
  return (
    <Section id="shortcuts" title="shortcuts" openIds={openIds} toggle={toggle}>
      <Row label="tile size">
        <Slider value={config.shortcutSize} min={40} max={128} step={4} onChange={(value) => update({ shortcutSize: value })} unit="px" />
      </Row>
      <Row label="icon size">
        <Slider value={config.shortcutIconSize} min={12} max={64} step={2} onChange={(value) => update({ shortcutIconSize: value })} unit="px" />
      </Row>
      <Row label="tile gap">
        <Slider value={config.shortcutGap} min={4} max={48} step={2} onChange={(value) => update({ shortcutGap: value })} unit="px" />
      </Row>
      <Row label="overflow after">
        <Slider value={config.shortcutOverflowAfter} min={3} max={32} step={1} onChange={(value) => update({ shortcutOverflowAfter: value })} />
      </Row>
      <Row label="overflow">
        <div className="flex items-center gap-2">
          {(['none', 'scroll', 'wrap'] as const).map((mode) => (
            <button key={mode} onClick={() => update({ shortcutOverflow: mode })} className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${config.shortcutOverflow === mode ? 'border-white/70 text-[var(--text-main)]' : 'border-white/15 text-[var(--text-muted)] hover:border-white/40'}`}>{mode}</button>
          ))}
        </div>
      </Row>
      <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
        {shortcutsDraft.map((shortcut, index) => shortcut ? (
          <div key={index} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">{index + 1}</span>
              <button onClick={() => onRemoveShortcut(index)} aria-label={`remove shortcut ${index + 1}`} className={linkBtn}>remove</button>
            </div>
            <input value={fetchingIds.has(shortcut.id) ? 'fetching...' : shortcut.name ?? ''} placeholder="title" disabled={fetchingIds.has(shortcut.id)} onChange={(event) => onNameChange(index, event.target.value)} className={`${inputField}${fetchingIds.has(shortcut.id) ? ' opacity-50' : ''}`} />
            <input value={shortcut.url ?? ''} placeholder="https://…" onChange={(event) => onUrlInput(index, event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { onUrlEnter(index); event.currentTarget.blur(); } }} className={inputField} />
          </div>
        ) : null)}
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <span className={fieldLabel}>add shortcut</span>
        <input value={newName} onChange={(event) => onNewNameChange(event.target.value)} placeholder="title (blank = auto from page title)" className={inputField} />
        <input value={newUrl} onChange={(event) => onNewUrlChange(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onAddShortcut()} placeholder="https://…" className={inputField} />
        <button onClick={onAddShortcut} className={ghostBtn + ' w-fit'}>add shortcut</button>
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">title and favicon are fetched from the url the first time you type it. press enter in a url field to refetch them.</p>
    </Section>
  );
}