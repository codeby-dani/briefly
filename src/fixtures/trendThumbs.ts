// GENERATED FILE — do not edit by hand.
// Regenerate: node scripts/fetch-trend-thumbs.mjs --force
//
// Cover images for the trends that ship without a clip, fetched once from
// Openverse and committed under public/media/thumbs/. Every entry is
// CC0/CC-BY/CC-BY-SA — the search is filtered to `license_type=commercial` —
// and the attribution below is rendered in the trend drawer. Nothing here is
// hotlinked and nothing was taken off a platform's CDN.

export interface TrendThumb {
  trendId: string
  src: string
  title: string
  creator: string
  license: string
  sourceUrl: string
  provider: string
}

export const TREND_THUMBS: Record<string, TrendThumb> = {
  tr_005: {
    "trendId": "tr_005",
    "src": "/media/thumbs/tr_005.jpg",
    "title": "Beauty Skincare",
    "creator": "Authentic Stock",
    "license": "CC0 1.0",
    "sourceUrl": "https://stocksnap.io/photo/beauty-skincare-0Q23V7QFR8",
    "provider": "stocksnap"
  },
  tr_009: {
    "trendId": "tr_009",
    "src": "/media/thumbs/tr_009.jpg",
    "title": "Matcha Latte - Matcha Green Tea Latte and Green Tea Ice Cream Set - Cocoro Cafe, QVM AUD8 set",
    "creator": "avlxyz",
    "license": "BY-SA 2.0",
    "sourceUrl": "https://www.flickr.com/photos/10559879@N00/3122544172",
    "provider": "flickr"
  },
  tr_013: {
    "trendId": "tr_013",
    "src": "/media/thumbs/tr_013.jpg",
    "title": "trail run // the little red house",
    "creator": "the little red house",
    "license": "BY 2.0",
    "sourceUrl": "https://www.flickr.com/photos/25965042@N03/14158675279",
    "provider": "flickr"
  },
  tr_016: {
    "trendId": "tr_016",
    "src": "/media/thumbs/tr_016.jpg",
    "title": "Sony eBook Readers",
    "creator": "Wesley Fryer",
    "license": "BY-SA 2.0",
    "sourceUrl": "https://www.flickr.com/photos/31442459@N00/4242886468",
    "provider": "flickr"
  },
  tr_017: {
    "trendId": "tr_017",
    "src": "/media/thumbs/tr_017.jpg",
    "title": "USB Cable",
    "creator": "wwarby",
    "license": "BY 2.0",
    "sourceUrl": "https://www.flickr.com/photos/26782864@N00/11728892063",
    "provider": "flickr"
  },
  tr_018: {
    "trendId": "tr_018",
    "src": "/media/thumbs/tr_018.jpg",
    "title": "Minimalist fashion editorial of a girl",
    "creator": "Journyes",
    "license": "BY-SA 4.0",
    "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=196770487",
    "provider": "wikimedia"
  },
  tr_019: {
    "trendId": "tr_019",
    "src": "/media/thumbs/tr_019.jpg",
    "title": "Resale/Thrift Stores: Make Safety Your Business",
    "creator": "USCPSC",
    "license": "BY 2.0",
    "sourceUrl": "https://www.flickr.com/photos/39259750@N02/14007279103",
    "provider": "flickr"
  },
  tr_020: {
    "trendId": "tr_020",
    "src": "/media/thumbs/tr_020.jpg",
    "title": "From image verso 'Chronocyclegraph of two hands folding cloth.'",
    "creator": "Kheel Center, Cornell University Library",
    "license": "BY 2.0",
    "sourceUrl": "https://www.flickr.com/photos/38445726@N04/5279234271",
    "provider": "flickr"
  },
  tr_021: {
    "trendId": "tr_021",
    "src": "/media/thumbs/tr_021.jpg",
    "title": "men's cargo pants 6511",
    "creator": "May Lee213",
    "license": "BY-SA 2.0",
    "sourceUrl": "https://www.flickr.com/photos/69356336@N02/7260347166",
    "provider": "flickr"
  },
  tr_022: {
    "trendId": "tr_022",
    "src": "/media/thumbs/tr_022.jpg",
    "title": "Coin jar",
    "creator": "bradhoc",
    "license": "BY 2.0",
    "sourceUrl": "https://www.flickr.com/photos/58719682@N07/11037249193",
    "provider": "flickr"
  },
  tr_023: {
    "trendId": "tr_023",
    "src": "/media/thumbs/tr_023.jpg",
    "title": "Baby Shower Theme Decoration 09891478880",
    "creator": "videek",
    "license": "PDM 1.0",
    "sourceUrl": "https://www.flickr.com/photos/193845755@N03/52081975711",
    "provider": "flickr"
  },
  tr_024: {
    "trendId": "tr_024",
    "src": "/media/thumbs/tr_024.jpg",
    "title": "Stocking Chart",
    "creator": "Balexander5060",
    "license": "BY-SA 4.0",
    "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=126316649",
    "provider": "wikimedia"
  },
}

export function getTrendThumb(trendId: string): TrendThumb | undefined {
  return TREND_THUMBS[trendId]
}
