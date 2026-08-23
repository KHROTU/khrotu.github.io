import type { ReactNode } from 'react';
import { rowLabel } from './typography';
type Props = { label: string; children: ReactNode };
export default function Row({ label, children }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={rowLabel}>{label}</span>
      {children}
    </div>
  );
}