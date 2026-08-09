import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'

interface HoveredRouteStore {
  subscribe: (id: string, onChange: () => void) => () => void
  getIsHovered: (id: string) => boolean
  setHoveredRouteId: (id: string | null) => void
}

const HoveredRouteContext = createContext<HoveredRouteStore | undefined>(
  undefined,
)

export const HoveredRouteProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const hoveredRouteId = useRef<string | null>(null)
  const listeners = useRef(new Map<string, Set<() => void>>())

  const store = useMemo<HoveredRouteStore>(
    () => ({
      subscribe: (id, onChange) => {
        const forId = listeners.current.get(id) ?? new Set<() => void>()
        listeners.current.set(id, forId)
        forId.add(onChange)
        return () => {
          forId.delete(onChange)
          if (forId.size === 0) listeners.current.delete(id)
        }
      },
      getIsHovered: (id) => hoveredRouteId.current === id,
      setHoveredRouteId: (id) => {
        const previousId = hoveredRouteId.current
        if (previousId === id) return
        hoveredRouteId.current = id
        for (const changedId of [previousId, id]) {
          if (changedId === null) continue
          for (const onChange of listeners.current.get(changedId) ?? [])
            onChange()
        }
      },
    }),
    [],
  )

  return (
    <HoveredRouteContext.Provider value={store}>
      {children}
    </HoveredRouteContext.Provider>
  )
}

const useHoveredRouteStore = () => {
  const store = useContext(HoveredRouteContext)
  if (!store)
    throw new Error('useHoveredRoute must be used within HoveredRouteProvider')
  return store
}

/** Re-renders only the routes whose hover state changed, not every route. */
export const useIsRouteHovered = (id: string) => {
  const store = useHoveredRouteStore()
  return useSyncExternalStore(
    useCallback((onChange) => store.subscribe(id, onChange), [store, id]),
    useCallback(() => store.getIsHovered(id), [store, id]),
  )
}

/** Stable across renders, so hover handlers never need re-binding. */
export const useSetHoveredRoute = () => useHoveredRouteStore().setHoveredRouteId
