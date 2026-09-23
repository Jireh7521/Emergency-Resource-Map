import { useEffect, useState, useCallback } from 'react'
import { MapView } from './components/MapView'
import { ResourceList } from './components/ResourceList'
import { FilterBar } from './components/FilterBar'
import { LoginModal } from './components/LoginModal'
import { ResourceForm } from './components/ResourceForm'
import { useAuth, ApiError } from './hooks/useAuth'
import {
  listResources,
  getNearbyResources,
  createResource,
  updateResource,
  deleteResource,
} from './api/client'
import type { Resource, ResourceCategory, ResourceWithDistance, VerificationStatus } from './types/resource'

type NearMeState = { latitude: number; longitude: number; radiusKm: number } | null

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export default function App() {
  const { token, isAdmin, login, logout } = useAuth()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [category, setCategory] = useState<ResourceCategory | ''>('')
  const [nearMe, setNearMe] = useState<NearMeState>(null)
  const [findingNearMe, setFindingNearMe] = useState(false)

  const [resources, setResources] = useState<(Resource | ResourceWithDistance)[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Resource | null>(null)
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null)

  const [showLogin, setShowLogin] = useState(false)
  const [formTarget, setFormTarget] = useState<Resource | null | 'new'>(null) // null = closed
  const [banner, setBanner] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      if (nearMe) {
        const results = await getNearbyResources(nearMe.latitude, nearMe.longitude, nearMe.radiusKm, category)
        setResources(results)
      } else {
        const results = await listResources({ search: debouncedSearch, category })
        setResources(results)
      }
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load resources. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, nearMe])

  useEffect(() => {
    refresh()
  }, [refresh])

  function handleSelect(resource: Resource) {
    setSelected(resource)
    setFlyToCenter([resource.latitude, resource.longitude])
  }

  function handleFindNearMe() {
    if (!navigator.geolocation) {
      setBanner('Your browser does not support geolocation.')
      return
    }
    setFindingNearMe(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearMe({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radiusKm: 15,
        })
        setFlyToCenter([position.coords.latitude, position.coords.longitude])
        setFindingNearMe(false)
      },
      () => {
        setBanner('Could not get your location. Check your browser location permission.')
        setFindingNearMe(false)
      },
    )
  }

  function handleClearNearMe() {
    setNearMe(null)
  }

  async function handleSave(data: {
    name: string
    category: ResourceCategory
    description: string
    address: string
    phone: string
    latitude: number
    longitude: number
    verification_status?: VerificationStatus
  }) {
    if (!token) return
    const payload = {
      name: data.name,
      category: data.category,
      description: data.description || null,
      address: data.address || null,
      phone: data.phone || null,
      latitude: data.latitude,
      longitude: data.longitude,
    }
    if (formTarget && formTarget !== 'new') {
      await updateResource(
        formTarget.id,
        { ...payload, verification_status: data.verification_status },
        token,
      )
      setBanner('Resource updated.')
    } else {
      await createResource(payload, token)
      setBanner('Resource created.')
    }
    setFormTarget(null)
    await refresh()
  }

  async function handleDelete(resource: Resource) {
    if (!token) return
    if (!window.confirm(`Delete "${resource.name}"? This cannot be undone.`)) return
    try {
      await deleteResource(resource.id, token)
      setBanner('Resource deleted.')
      if (selected?.id === resource.id) setSelected(null)
      await refresh()
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Could not delete resource.')
    }
  }

  useEffect(() => {
    if (!banner) return
    const timer = setTimeout(() => setBanner(null), 4000)
    return () => clearTimeout(timer)
  }, [banner])

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Emergency Resource Map</h1>
          <p className="text-xs text-slate-500">Find hospitals, police, shelters and other emergency services nearby</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setFormTarget('new')}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add resource
              </button>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Admin sign in
            </button>
          )}
        </div>
      </header>

      {banner && (
        <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-800">{banner}</div>
      )}
      {loadError && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
      )}
      {nearMe && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Showing resources within {nearMe.radiusKm} km of your location, nearest first.
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        onFindNearMe={handleFindNearMe}
        findingNearMe={findingNearMe}
        nearMeActive={nearMe !== null}
        onClearNearMe={handleClearNearMe}
      />

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <aside className="flex min-h-[280px] w-full flex-col border-b border-slate-200 sm:h-full sm:w-96 sm:border-b-0 sm:border-r">
          <ResourceList
            resources={resources}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            loading={loading}
            isAdmin={isAdmin}
            onEdit={(r) => setFormTarget(r)}
            onDelete={handleDelete}
          />
        </aside>
        <main className="min-h-[320px] flex-1">
          <MapView
            resources={resources}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            flyToCenter={flyToCenter}
            userLocation={nearMe ? [nearMe.latitude, nearMe.longitude] : null}
          />
        </main>
      </div>

      {showLogin && <LoginModal onLogin={login} onClose={() => setShowLogin(false)} />}

      {formTarget && (
        <ResourceForm
          initial={formTarget === 'new' ? null : formTarget}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
        />
      )}
    </div>
  )
}
