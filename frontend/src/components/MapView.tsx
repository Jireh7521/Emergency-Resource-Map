import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Resource } from '../types/resource'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types/resource'
import { CategoryBadge } from './CategoryBadge'

// Build a small colored circle marker per category instead of relying on
// Leaflet's default marker images (whose asset paths don't resolve
// correctly under Vite without extra config).
function markerIcon(category: Resource['category']) {
  const color = CATEGORY_COLORS[category]
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px; height: 18px; border-radius: 9999px;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  })
}

/** Recenters the map whenever `center` changes (e.g. selecting a resource from the list). */
function MapRecenter({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.6 })
    }
  }, [center, zoom, map])
  return null
}

interface MapViewProps {
  resources: Resource[]
  selectedId: string | null
  onSelect: (resource: Resource) => void
  flyToCenter: [number, number] | null
  userLocation: [number, number] | null
}

const DEFAULT_CENTER: [number, number] = [9.082, 8.6753] // Nigeria, roughly centered

export function MapView({ resources, selectedId, onSelect, flyToCenter, userLocation }: MapViewProps) {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={6} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter center={flyToCenter} zoom={14} />

      {userLocation && (
        <Marker
          position={userLocation}
          icon={L.divIcon({
            className: '',
            html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {resources.map((resource) => (
        <Marker
          key={resource.id}
          position={[resource.latitude, resource.longitude]}
          icon={markerIcon(resource.category)}
          eventHandlers={{ click: () => onSelect(resource) }}
          opacity={selectedId === resource.id ? 1 : 0.85}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1.5">
              <p className="font-semibold text-slate-900">{resource.name}</p>
              <CategoryBadge category={resource.category} />
              {resource.address && <p className="text-sm text-slate-600">{resource.address}</p>}
              {resource.phone && <p className="text-sm text-slate-600">{resource.phone}</p>}
              <p className="text-xs text-slate-400">{CATEGORY_LABELS[resource.category]}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
