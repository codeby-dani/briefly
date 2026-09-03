import type { BusinessOffering, BusinessProfile } from '../types'
import { BUSINESS_PROFILE } from '../fixtures/businessProfile'
import { createStore } from './createStore'
import { ensureSchemaVersion, KEYS } from './persist'

ensureSchemaVersion()

export const businessProfileStore = createStore<BusinessProfile>(KEYS.businessProfile, () => BUSINESS_PROFILE)

export type BusinessProfilePatch = Partial<Pick<BusinessProfile, 'name' | 'description' | 'industry' | 'targetAudiences' | 'brandVoices' | 'contentGoals' | 'approvedClaims' | 'prohibitedClaims'>>
export type BusinessOfferingDraft = Omit<BusinessOffering, 'id'>
export type BusinessOfferingPatch = Partial<BusinessOfferingDraft>

export function readBusinessProfile(): BusinessProfile {
  return businessProfileStore.read()
}

function changed<T extends object>(current: T, patch: Partial<T>): boolean {
  return Object.entries(patch).some(([field, value]) => {
    const existing = current[field as keyof T]
    return Array.isArray(existing) && Array.isArray(value)
      ? existing.length !== value.length || existing.some((item, index) => item !== value[index])
      : existing !== value
  })
}

export function updateBusinessProfile(patch: BusinessProfilePatch): BusinessProfile {
  let result = readBusinessProfile()
  businessProfileStore.set((profile) => {
    if (!changed(profile, patch)) return profile
    result = { ...profile, ...patch, updatedAt: new Date().toISOString() }
    return result
  })
  return result
}

function offeringId(): string {
  return `off_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function addBusinessOffering(draft: BusinessOfferingDraft): BusinessOffering {
  const offering = { id: offeringId(), ...draft }
  businessProfileStore.set((profile) => ({ ...profile, offerings: [...profile.offerings, offering], updatedAt: new Date().toISOString() }))
  return offering
}

export function updateBusinessOffering(offeringId: string, patch: BusinessOfferingPatch): BusinessOffering | undefined {
  let result: BusinessOffering | undefined
  businessProfileStore.set((profile) => {
    const offerings = profile.offerings.map((offering) => {
      if (offering.id !== offeringId) return offering
      if (!changed(offering, patch)) { result = offering; return offering }
      result = { ...offering, ...patch }
      return result
    })
    return result ? { ...profile, offerings, updatedAt: new Date().toISOString() } : profile
  })
  return result
}

export function removeBusinessOffering(offeringId: string): boolean {
  const profile = readBusinessProfile()
  if (!profile.offerings.some((offering) => offering.id === offeringId)) return false
  businessProfileStore.set({ ...profile, offerings: profile.offerings.filter((offering) => offering.id !== offeringId), updatedAt: new Date().toISOString() })
  return true
}
