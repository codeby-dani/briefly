import type { BusinessProfile } from '../types'

/** A single coherent demo business, intended to be edited by its owner. */
export const BUSINESS_PROFILE: BusinessProfile = {
  name: 'Lumen Skin',
  description:
    'Lumen Skin makes straightforward barrier-care routines for people navigating sensitive, reactive skin. We translate skincare science into calm, practical habits—not miracle promises.',
  industry: 'Skincare',
  targetAudiences: ['Sensitive-skin adults', 'Routine beginners', 'Ingredient-conscious shoppers'],
  brandVoices: ['Calm and reassuring', 'Clear-eyed', 'Science made simple'],
  contentGoals: ['Build trust', 'Teach routines', 'Drive product discovery'],
  approvedClaims: ['Explain ingredients in plain language', 'Encourage patch testing', 'Set realistic routine expectations'],
  prohibitedClaims: ['Guarantee results', 'Diagnose skin conditions', 'Promise overnight transformations'],
  offerings: [
    {
      id: 'off_barrier-serum',
      name: 'Barrier Reset Serum',
      positioning: 'A lightweight nightly serum that supports a simple, consistent barrier-care routine.',
      priceIdr: 189000,
      usp: ['Fragrance-free formula', 'Layers under moisturizer', 'Designed for gradual routine building'],
      approvedClaims: ['Describe it as supportive barrier care', 'Recommend introducing it gradually'],
      prohibitedClaims: ['Claim it treats eczema or acne', 'Promise visible results overnight'],
    },
    {
      id: 'off_daily-spf',
      name: 'Daily Cloud SPF 50',
      positioning: 'An everyday SPF 50 made to feel comfortable in a minimal morning routine.',
      priceIdr: 159000,
      usp: ['No-white-cast finish', 'Comfortable under makeup', 'Broad-spectrum SPF 50'],
      approvedClaims: ['Position it as the final morning routine step'],
      prohibitedClaims: ['Say sunscreen replaces all other sun protection'],
    },
  ],
  updatedAt: '2026-09-04T00:00:00.000Z',
}
