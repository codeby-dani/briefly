/**
 * Shared fixture vocabulary.
 *
 * Phase 0 needs only the two enumerations the clip corpus is typed against.
 * The Trend / Product / Brief / Analytics shapes in 02-data-model.md land in
 * Phase 1 with the stores that own them.
 */

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'x'

export type Category = 'beauty' | 'food' | 'fashion' | 'tech' | 'fitness' | 'finance'

export const CATEGORIES: Category[] = [
  'beauty',
  'food',
  'fashion',
  'tech',
  'fitness',
  'finance',
]

export const PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube', 'x']
