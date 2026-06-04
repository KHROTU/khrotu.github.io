import { type ReactNode } from 'react';
import { useDragScroll } from '../hooks/useDragScroll';
export default function DraggableRow({ children }: { children: ReactNode }) {
  const ref = useDragScroll();
  return (
    <div
      ref={ref}
      className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar cursor-grab"
    >
      {children}
    </div>
  );
}