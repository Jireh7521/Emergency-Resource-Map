export type ResourceCategory =
  | 'hospital'
  | 'clinic'
  | 'police'
  | 'fire_service'
  | 'shelter'
  | 'emergency_office'
  | 'ambulance'
  | 'idp_camp'
  | 'rescue_centre'
  | 'other'

export type VerificationStatus = 'verified' | 'unverified' | 'needs_update'

export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  description: string | null
  address: string | null
  phone: string | null
  latitude: number
  longitude: number
  verification_status: VerificationStatus
  created_at: string
  updated_at: string
}

export interface ResourceWithDistance extends Resource {
  distance_km: number
}

export interface ResourceInput {
  name: string
  category: ResourceCategory
  description?: string | null
  address?: string | null
  phone?: string | null
  latitude: number
  longitude: number
}

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  police: 'Police Station',
  fire_service: 'Fire Service',
  shelter: 'Shelter',
  emergency_office: 'Emergency Office',
  ambulance: 'Ambulance',
  idp_camp: 'IDP Camp',
  rescue_centre: 'Rescue Centre',
  other: 'Other',
}

// One color per category, used for map markers and category badges.
export const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  hospital: '#dc2626',
  clinic: '#f97316',
  police: '#2563eb',
  fire_service: '#ea580c',
  shelter: '#16a34a',
  emergency_office: '#7c3aed',
  ambulance: '#db2777',
  idp_camp: '#0891b2',
  rescue_centre: '#65a30d',
  other: '#57534e',
}
