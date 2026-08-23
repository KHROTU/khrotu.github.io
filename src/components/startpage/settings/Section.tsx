import type { ReactNode } from 'react';
import { sectionTitle } from './typography';
type Props = { id: string; title: string; openIds: Set<string>; toggle: (id: string) => void; children: ReactNode };
export default function Section({ id, title, openIds, toggle, children }: Props) {
  const open = openIds.has(id);
  return (
    <section className="flex flex-col">
      <button onClick={() => toggle(id)} aria-expanded={open} className="flex items-center justify-between w-full py-1 text-left group">
        <h3 className={`${sectionTitle} group-hover:text-white transition-colors`}>{title}</h3>
        <span className="text-xs font-mono text-[var(--text-muted)] group-hover:text-white transition-colors px-1">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="flex flex-col gap-4 pl-3 border-l border-white/10 ml-1 mt-1 mb-3">{children}</div>}
    </section>
  );
}