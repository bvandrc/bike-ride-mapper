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
    ROUTE: testId('map-route'),
  },
} as const
