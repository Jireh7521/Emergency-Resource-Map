import type { ResourceCategory } from '../types/resource'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types/resource'

export function CategoryBadge({ category }: { category: ResourceCategory }) {
  const color = CATEGORY_COLORS[category]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {CATEGORY_LABELS[category]}
    </span>
  )
}
