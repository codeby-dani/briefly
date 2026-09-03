/**
 * Cover frames for the trend cards on the discovery grid.
 *
 * These are real captured frames from short-form posts, supplied for the demo
 * and committed under public/media/covers/. They exist because the generated
 * clip posters — white display type on a flat gradient — all read as the same
 * card at grid scale, and a discovery page whose whole job is "what are people
 * watching" cannot lead with nine tiles that look machine-made.
 *
 * A cover outranks the clip poster on the CARD only. The player still loads
 * `clip.poster`, because that one is the clip's own first frame and lying about
 * it inside the drawer would break the thing the poster is for.
 *
 * Coverage is partial on purpose: only the trends with a frame here get one.
 * Anything without falls back to the clip poster, then to the stock cover in
 * trendThumbs.ts, then to the generated plate — the order TrendThumb documents.
 *
 * Provenance: demo assets, not licensed stock. Unlike trendThumbs.ts, which is
 * filtered to CC0/CC-BY/CC-BY-SA on Openverse, these carry no license grant, so
 * they belong in a demo build and not in anything shipped commercially.
 */

export interface TrendCover {
  trendId: string
  src: string
  /** Read aloud in place of the image, so it describes the frame, not the trend. */
  alt: string
}

export const TREND_COVERS: Record<string, TrendCover> = {
  tr_001: {
    trendId: 'tr_001',
    src: '/media/covers/tr_001.jpg',
    alt: 'Creator facing camera, caption reads “4 Bad Habits that’s ruining your SKIN”',
  },
  tr_002: {
    trendId: 'tr_002',
    src: '/media/covers/tr_002.jpg',
    alt: 'Close-up of a creator pointing at glossy, freshly layered skin, caption “Remember…”',
  },
  tr_003: {
    trendId: 'tr_003',
    src: '/media/covers/tr_003.jpg',
    alt: 'Two clinicians in white coats in a clinic hallway, labelled pharmacist and doctor, caption “REMEMBER”',
  },
  tr_004: {
    trendId: 'tr_004',
    src: '/media/covers/tr_004.jpg',
    alt: 'Creator holding two handwritten notes comparing understanding skincare against merely using it, with two skin close-ups below',
  },
  tr_005: {
    trendId: 'tr_005',
    src: '/media/covers/tr_005.jpg',
    alt: 'Clinician filming in a car, caption about lip balm with hyaluronic acid and peptides three times a day',
  },
  tr_006: {
    trendId: 'tr_006',
    src: '/media/covers/tr_006.jpg',
    alt: 'Milk poured in a thin stream into a dark brew in a stoneware mug, caption “fun fact: did you know that”',
  },
  tr_007: {
    trendId: 'tr_007',
    src: '/media/covers/tr_007.jpg',
    alt: 'Espresso pulling from a double spout into two paper cups on a cafe machine',
  },
  tr_008: {
    trendId: 'tr_008',
    src: '/media/covers/tr_008.jpg',
    alt: 'Espresso running into a branded cup on a chrome machine, caption “It’s not that I NEED coffee”',
  },
  tr_009: {
    trendId: 'tr_009',
    src: '/media/covers/tr_009.jpg',
    alt: 'Creator outside a cafe behind two tall iced drinks, one pale green and one milky',
  },
  tr_018: {
    trendId: 'tr_018',
    src: '/media/covers/tr_018.jpg',
    alt: 'Guest in a plain black knit and glasses speaking into a podcast microphone against a neutral set',
  },
}

export function getTrendCover(trendId: string): TrendCover | undefined {
  return TREND_COVERS[trendId]
}
