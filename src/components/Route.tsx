import { useEffect, useMemo, useRef } from 'react'
import { round } from 'es-toolkit'
import {
  type GeoJSON as GeoJSONType,
  Symbol as LeafletSymbol,
  type PathOptions,
  type Polyline,
  polylineDecorator,
} from 'leaflet'
import type { DateTime } from 'luxon'
import { GeoJSON, type GeoJSONProps, Tooltip, useMap } from 'react-leaflet'

import { METERS_TO_FEET, METERS_TO_MILES } from '@/constants'
import type { Route as RouteType } from '@/types/map-my-ride'
import { useHoveredRoute } from './HoveredRouteProvider'

/** Invisible wide line that widens the pointer target for the thin route. */
const HOVER_TARGET_STYLE: PathOptions = { weight: 30, opacity: 0 }

const isPathFeature: GeoJSONProps['filter'] = (feature) =>
  feature.geometry.type !== 'Point'

export interface RouteProps extends Pick<GeoJSONProps, 'data'> {
  id: string
  date: DateTime
  route: Pick<RouteType, 'distance' | 'total_ascent'>
  color: string
  hoverColor: string
}

export const Route = ({
  id,
  data,
  date,
  route,
  color,
  hoverColor,
}: RouteProps) => {
  const map = useMap()
  const { isHovered, setHoveredRouteId } = useHoveredRoute(id)
  const lineRef = useRef<GeoJSONType>(null)
  const hoverLineRef = useRef<GeoJSONType>(null)

  const style = useMemo<PathOptions>(
    () =>
      isHovered
        ? { color: hoverColor, weight: 5, opacity: 0.6 }
        : { color, weight: 3, opacity: 0.45 },
    [isHovered, color, hoverColor]
  )

  const eventHandlers = useMemo(
    () => ({
      mouseover: () => setHoveredRouteId(id),
      mouseout: () => setHoveredRouteId(null),
    }),
    [setHoveredRouteId, id]
  )

  // Direction arrows only exist while hovered; no react-leaflet component
  // covers the decorator, so it's added and torn down imperatively.
  useEffect(() => {
    if (!isHovered) return

    const lineLayer = lineRef.current?.getLayers()[0]
    if (!lineLayer) return

    const decorator = polylineDecorator(lineLayer as Polyline, {
      patterns: [
        {
          repeat: 60,
          symbol: LeafletSymbol.arrowHead({
            pixelSize: 13,
            pathOptions: {
              fillOpacity: style.opacity,
              color: style.color,
              weight: 0,
            },
          }),
        },
      ],
    }).addTo(map)

    lineRef.current?.bringToFront()
    hoverLineRef.current?.bringToFront()

    return () => {
      decorator.remove()
    }
  }, [isHovered, map, style])

  return (
    <>
      <GeoJSON ref={lineRef} data={data} style={style} filter={isPathFeature} />
      <GeoJSON
        ref={hoverLineRef}
        data={data}
        style={HOVER_TARGET_STYLE}
        filter={isPathFeature}
        eventHandlers={eventHandlers}>
        {/* Bound unconditionally: Leaflet opens a tooltip from the `mouseover`
            it was already bound for, so mounting this on hover is too late. */}
        <Tooltip
          className="text-xs m-0 px-2 py-0"
          direction="top"
          sticky={true}>
          <b>{date.toFormat('EEE. MMMM d, yyyy h:mma')}</b>
          <br />
          <i>
            <b>Distance: {round(route.distance * METERS_TO_MILES, 1)}mi</b>
          </i>
          <br />
          <i>Total Ascent: {round(route.total_ascent * METERS_TO_FEET, 0)}ft</i>
        </Tooltip>
      </GeoJSON>
    </>
  )
}
