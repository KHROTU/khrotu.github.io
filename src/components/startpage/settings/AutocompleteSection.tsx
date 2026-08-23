import { useEffect, useState } from 'react';
import { clearAll as clearAutocomplete, getAllTerms, removeTerm, type Entry } from '../autocomplete';
import Section from './Section';
import { ghostBtn, hintText, linkBtn, rowLabel } from './typography';
type Props = { openIds: Set<string>; toggle: (id: string) => void };
export default function AutocompleteSection({ openIds, toggle }: Props) {
  const [terms, setTerms] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) getAllTerms().then(setTerms); }, [open]);
  return (
    <Section id="autocomplete" title="autocomplete" openIds={openIds} toggle={toggle}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={rowLabel}>local history</span>
          <button onClick={() => setOpen((value) => !value)} className={ghostBtn}>{open ? 'hide' : 'manage'}</button>
        </div>
        <p className={hintText}>stores your past search terms locally in idb for prefix suggestions.</p>
        {open && (
          <div className="flex flex-col gap-2 max-h-56 overflow-auto border border-white/10 rounded-sm p-2">
            {terms.length === 0 && <span className={hintText}>no history yet</span>}
            {terms.map((term) => (
              <div key={term.term} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[var(--text-muted)]">{term.term}</span>
                <button onClick={async () => { await removeTerm(term.term); setTerms((current) => current.filter((item) => item.term !== term.term)); }} className={linkBtn}>remove</button>
              </div>
            ))}
            {terms.length > 0 && <button onClick={async () => { await clearAutocomplete(); setTerms([]); }} className={ghostBtn + ' w-fit'}>clear all</button>}
          </div>
        )}
      </div>
    </Section>
  );
}