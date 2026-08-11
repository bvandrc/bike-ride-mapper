const testId = <S extends string>(testid: S) =>
  `[data-testid="${testid}"]` as const

export const SELECTORS = {
  HEADER: {
    SELF: testId('header'),
    STATS: testId('header-stats'),
    NO_DATA: testId('header-no-data'),
    LOADING: testId('header-loading'),
  },
  MAP: {
    SELF: testId('map'),
    // Leaflet renders route paths itself, so there's no testid to hang on
    // them — this is the class it gives every interactive path.
    ROUTE: '.leaflet-interactive',
  },
} as const
