import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

type SortableItemProps = {
  children: ReactNode
  id: string
}

export function SortableItem({ children, id }: SortableItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div className="flex gap-2" ref={setNodeRef} style={style}>
      <button
        aria-label="ドラッグハンドル"
        className="drag-handle flex-shrink-0 cursor-grab active:cursor-grabbing"
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
      >
        <svg
          className="h-6 w-6 text-gray-400 hover:text-gray-600"
          fill="none"
          role="img"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <title>ドラッグハンドル</title>
          <path
            d="M9 5h2M9 12h2M9 19h2M15 5h2M15 12h2M15 19h2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {children}
    </div>
  )
}
