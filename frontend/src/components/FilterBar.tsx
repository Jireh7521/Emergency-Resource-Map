import type { ResourceCategory } from '../types/resource'
import { CATEGORY_LABELS } from '../types/resource'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  category: ResourceCategory | ''
  onCategoryChange: (value: ResourceCategory | '') => void
  onFindNearMe: () => void
  findingNearMe: boolean
  nearMeActive: boolean
  onClearNearMe: () => void
}

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onFindNearMe,
  findingNearMe,
  nearMeActive,
  onClearNearMe,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 p-3 sm:flex-row sm:items-center">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name or address…"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as ResourceCategory | '')}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">All categories</option>
        {(Object.keys(CATEGORY_LABELS) as ResourceCategory[]).map((cat) => (
          <option key={cat} value={cat}>
            {CATEGORY_LABELS[cat]}
          </option>
        ))}
      </select>
      {nearMeActive ? (
        <button
          onClick={onClearNearMe}
          className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Clear "near me"
        </button>
      ) : (
        <button
          onClick={onFindNearMe}
          disabled={findingNearMe}
          className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {findingNearMe ? 'Locating…' : 'Find near me'}
        </button>
      )}
    </div>
  )
}
