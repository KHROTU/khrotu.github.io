'use client'
import { useDragScroll } from '@/lib/use-drag-scroll'
export default function DraggableRow({ children }: { children: React.ReactNode }) {
  const ref = useDragScroll()
  return (
    <div
      ref={ref}
      className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar cursor-grab"
    >
      {children}
    </div>
  )
}