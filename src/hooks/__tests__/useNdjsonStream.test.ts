// @vitest-environment happy-dom
import { renderHook, waitFor } from '@testing-library/react'

import type { NdJsonMeta } from '@/types'
import { useNdjsonStream } from '../useNdjsonStream'

interface Row {
  id: number
}

const ROWS: Row[] = [{ id: 1 }, { id: 2 }, { id: 3 }]

const buildNdjson = (rows: Row[]) =>
  [{ _meta: { total: rows.length } } satisfies NdJsonMeta, ...rows]
    .map((line) => JSON.stringify(line))
    .join('\n')

/** Stands in for `fetch`, answering each URL with its body or never answering. */
const mockFetch = (bodies: Record<string, string | null>) => {
  const fetchMock = vi.fn(
    (url: string, { signal }: RequestInit = {}) =>
      new Promise<Response>((resolve, reject) => {
        // Rejects on abort the way the real `fetch` does.
        signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        )
        const body = bodies[url]
        if (body != null) resolve(new Response(body))
      })
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('useNdjsonStream', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('streams the rows and the total from the meta line', async () => {
    mockFetch({ '/rows.ndjson': buildNdjson(ROWS) })

    const { result } = renderHook(() =>
      useNdjsonStream<Row>('/rows.ndjson', { batchSize: 2 })
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current).toMatchObject({
      data: ROWS,
      total: ROWS.length,
      error: null,
    })
  })

  it('stays loading when a changed url aborts the request before it', async () => {
    const fetchMock = mockFetch({
      '/first.ndjson': null,
      '/second.ndjson': null,
    })

    const { result, rerender } = renderHook(
      ({ url }) => useNdjsonStream<Row>(url),
      { initialProps: { url: '/first.ndjson' } }
    )
    rerender({ url: '/second.ndjson' })

    // The first request has been aborted, and its settling has run.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await new Promise((resolve) => {
      setTimeout(resolve)
    })

    // The second request is still pending.
    expect(result.current.isLoading).toBe(true)
  })
})
