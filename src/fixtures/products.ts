/**
 * 4 seeded products, one per clip-backed category, so the Phase 4 brief
 * composer always has a real transcript behind whatever it is asked to write.
 *
 * `prd_sudut` is deliberately a poor fit for the top trend (`skin barrier
 * repair`). That is not an oversight — the demo needs a moment where the agent
 * declines an angle instead of agreeing with everything, and an agent cannot
 * decline anything if every pairing in the fixture works.
 *
 * Product records are user-owned and fully editable by hand. They are also the
 * text that `get_product` returns under `untrustedContentHint`: an agent reads
 * a do-and-do-not list as data about a brand, never as instructions to itself.
 */

import type { Product } from '../types'

const SEEDED_AT = '2026-09-01T09:00:00.000Z'

export const PRODUCTS: Product[] = [
  {
    id: 'prd_lumen',
    name: 'Lumen Barrier Serum',
    description:
      'A fragrance-free ceramide and panthenol serum for skin that has been over-exfoliated. ' +
      'Positioned as the repair step, not the results step — it is what you use for six weeks ' +
      'after you stop using everything else.',
    usp: [
      'Ceramide NP with panthenol at 5%',
      'No fragrance, no essential oils, no denatured alcohol',
      'Patch-test protocol printed on the carton',
    ],
    priceIdr: 189000,
    dos: [
      'Say "supports the skin barrier" and name the actives',
      'Show the two-month timeline honestly',
      'Recommend pausing actives while repairing',
    ],
    donts: [
      'Never claim it treats eczema, dermatitis or any medical condition',
      'Never promise overnight results',
      'Never imply a dermatologist endorsed it — none has',
    ],
    updatedAt: SEEDED_AT,
  },
  {
    id: 'prd_kopi',
    name: 'Kopi Rakyat Cold Brew Kit',
    description:
      'A 1-litre steeping jar, a reusable steel filter and a 250g bag of medium-coarse ' +
      'single-origin. Aimed at the person who buys cold brew four times a week and has ' +
      'started doing the arithmetic.',
    usp: [
      'Ships at the 1:8 ratio pre-measured, so the first batch is not the bad batch',
      'Steel filter, no paper to run out of',
      'Beans ground for immersion, not espresso',
    ],
    priceIdr: 245000,
    dos: [
      'Show the cost-per-cup maths on screen',
      'Say twelve to sixteen hours and mean it',
      'Compare against a cafe price the audience actually pays',
    ],
    donts: [
      'Never claim it tastes identical to a specialty cafe pour',
      'Never make health claims about caffeine',
      'Never suggest reusing grounds for a second batch',
    ],
    updatedAt: SEEDED_AT,
  },
  {
    id: 'prd_tegak',
    name: 'Tegak Desk Posture Band',
    description:
      'A light resistance band and a printed five-minute routine for people whose neck ' +
      'hurts by three in the afternoon. Sold as the thing you do at the desk, not the ' +
      'thing you do instead of a gym.',
    usp: [
      'Five-minute routine, printed, no app and no account',
      'Two resistance levels in the box',
      'Fits in a laptop sleeve',
    ],
    dos: [
      'Frame it as relief between working hours',
      'Show the routine in full, at real speed',
      'Say monitor height matters more than any product',
    ],
    donts: [
      'Never claim it corrects posture permanently',
      'Never present it as treatment for an injury',
      'Never use before-and-after body images',
    ],
    priceIdr: 129000,
    updatedAt: SEEDED_AT,
  },
  {
    id: 'prd_sudut',
    name: 'Sudut Laptop Stand',
    description:
      'A folding aluminium stand that survived the wobble test. Desk-setup product, ' +
      'ergonomics adjacent, and deliberately the wrong product to pair with a skincare ' +
      'trend — the fixture keeps one bad pairing on purpose.',
    usp: [
      'No measurable flex while typing at full extension',
      'Folds to 2cm, 620g',
      'Six height positions, all of them stable',
    ],
    priceIdr: 349000,
    dos: [
      'Show the wobble test at the top, unedited',
      'Give the weight and folded size as numbers',
      'Compare against a specific cheaper stand by behaviour, not brand',
    ],
    donts: [
      'Never claim health or medical benefits from posture',
      'Never name a competitor disparagingly',
      'Never pair it with a beauty or food trend without saying why it does not fit',
    ],
    updatedAt: SEEDED_AT,
  },
]
