import type { Resource, ResourceWithDistance } from '../types/resource'
import { CategoryBadge } from './CategoryBadge'

interface ResourceListProps {
  resources: (Resource | ResourceWithDistance)[]
  selectedId: string | null
  onSelect: (resource: Resource) => void
  loading: boolean
  isAdmin: boolean
  onEdit: (resource: Resource) => void
  onDelete: (resource: Resource) => void
}

function hasDistance(r: Resource | ResourceWithDistance): r is ResourceWithDistance {
  return 'distance_km' in r
}

const STATUS_LABELS: Record<Resource['verification_status'], string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  needs_update: 'Needs update',
}

const STATUS_STYLES: Record<Resource['verification_status'], string> = {
  verified: 'text-emerald-700 bg-emerald-50',
  unverified: 'text-slate-500 bg-slate-100',
  needs_update: 'text-amber-700 bg-amber-50',
}

export function ResourceList({
  resources,
  selectedId,
  onSelect,
  loading,
  isAdmin,
  onEdit,
  onDelete,
}: ResourceListProps) {
  if (loading) {
    return <p className="p-4 text-sm text-slate-500">Loading resources…</p>
  }

  if (resources.length === 0) {
    return <p className="p-4 text-sm text-slate-500">No resources match your search.</p>
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-y-auto">
      {resources.map((resource) => (
        <li
          key={resource.id}
          onClick={() => onSelect(resource)}
          className={`cursor-pointer p-4 transition hover:bg-slate-50 ${
            selectedId === resource.id ? 'bg-slate-50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-slate-900">{resource.name}</p>
            {hasDistance(resource) && (
              <span className="shrink-0 text-xs font-medium text-slate-400">
                {resource.distance_km.toFixed(1)} km
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={resource.category} />
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[resource.verification_status]}`}>
              {STATUS_LABELS[resource.verification_status]}
            </span>
          </div>
          {resource.address && <p className="mt-1.5 text-sm text-slate-500">{resource.address}</p>}
          {resource.phone && <p className="text-sm text-slate-500">{resource.phone}</p>}

          {isAdmin && (
            <div className="mt-2 flex gap-3 text-xs font-medium">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(resource)
                }}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(resource)
                }}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
