import { useState, type FormEvent } from 'react'
import type { Resource, ResourceCategory, VerificationStatus } from '../types/resource'
import { CATEGORY_LABELS } from '../types/resource'
import { ApiError } from '../api/client'

interface ResourceFormProps {
  initial: Resource | null // null = creating a new resource
  onSave: (data: {
    name: string
    category: ResourceCategory
    description: string
    address: string
    phone: string
    latitude: number
    longitude: number
    verification_status?: VerificationStatus
  }) => Promise<void>
  onClose: () => void
}

export function ResourceForm({ initial, onSave, onClose }: ResourceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<ResourceCategory>(initial?.category ?? 'hospital')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [latitude, setLatitude] = useState(initial ? String(initial.latitude) : '')
  const [longitude, setLongitude] = useState(initial ? String(initial.longitude) : '')
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    initial?.verification_status ?? 'unverified',
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a number between -90 and 90.')
      return
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be a number between -180 and 180.')
      return
    }
    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    setSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        category,
        description,
        address,
        phone,
        latitude: lat,
        longitude: lon,
        ...(initial ? { verification_status: verificationStatus } : {}),
      })
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          {initial ? 'Edit resource' : 'Add resource'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {(Object.keys(CATEGORY_LABELS) as ResourceCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Latitude</label>
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 6.5244"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Longitude</label>
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 3.3792"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-400">
            Tip: right-click a spot on Google Maps to copy its coordinates.
          </p>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {initial && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Verification status</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
                <option value="needs_update">Needs update</option>
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
