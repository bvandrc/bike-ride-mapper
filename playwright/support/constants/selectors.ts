export const SELECTORS = {
  HEADER: {
    SELF: 'header',
    STATS: 'header-stats',
    NO_DATA: 'header-no-data',
    LOADING: 'header-loading',
  },
  MAP: {
    SELF: 'map',
    // Leaflet renders route paths itself, so there's no testid to hang on
    // them — this is the class it gives every interactive path.
    ROUTE: '.leaflet-interactive',
    // Likewise for the tooltips Leaflet renders for a hovered route.
    ROUTE_TOOLTIP: '.leaflet-tooltip',
  },
} as const
