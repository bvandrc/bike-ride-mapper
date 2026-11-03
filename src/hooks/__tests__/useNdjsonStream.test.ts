import { renderHook, waitFor } from '@testing-library/react'

import type { NdJsonMeta } from '@/types'
import { useNdjsonStream } from '../useNdjsonStream'

/** A row of the streamed file; the hook takes any shape, so the test keeps it minimal. */
type Row = { id: number }

/**
 * Stubs `fetch` with a body the test pushes rows into and closes.
 *
 * Lets a case observe the hook mid-stream, which is the state batching exists
 * for and which a body delivered in one chunk never stays in long enough to see.
 */
const mockOpenFetch = ({ ok = true, status = 200 } = {}) => {
  let controller: ReadableStreamDefaultController<Uint8Array>
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
    },
  })

  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, status, statusText: 'Not Found', body }))
  )

  return {
    push: (rows: (Row | NdJsonMeta)[]) =>
      controller.enqueue(
        new TextEncoder().encode(
          `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`
        )
      ),
    close: () => controller.close(),
  }
}

/** Stubs `fetch` to serve the rows as a complete NDJSON body, the way the static file is fetched. */
const mockFetch = (
  rows: (Row | NdJsonMeta)[],
  { ok = true, status = 200 } = {}
) => {
  const stream = mockOpenFetch({ ok, status })
  stream.push(rows)
  stream.close()
}

const buildRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, id) => ({ id }))

describe('useNdjsonStream', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('collects every row, in the order the file lists them', async () => {
    const ROWS = buildRows(5)
    mockFetch(ROWS)

    const { result } = renderHook(() => useNdjsonStream<Row>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(ROWS)
  })

  it("reads the total off the file's `_meta` row rather than counting", async () => {
    const ROWS = buildRows(2)
    // The row is the file's own claim about its length, so the UI can show
    // progress before the rest of it has streamed in.
    mockFetch([{ _meta: { total: 900 } }, ...ROWS])

    const { result } = renderHook(() => useNdjsonStream<Row>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current).toMatchObject({ total: 900, data: ROWS })
  })

  it('leaves the total unset when the file carries no meta row', async () => {
    mockFetch(buildRows(3))

    const { result } = renderHook(() => useNdjsonStream<Row>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.total).toBeNull()
  })

  it('paints the first batch before the whole file has been read', async () => {
    const stream = mockOpenFetch()

    const { result } = renderHook(() =>
      useNdjsonStream<Row>('/w.ndjson', { batchSize: 10 })
    )

    stream.push(buildRows(10))
    await waitFor(() => expect(result.current.data).toHaveLength(10))

    // The point of batching: rows reach the map while loading is still true.
    expect(result.current.isLoading).toBe(true)

    stream.push([{ id: 10 }])
    stream.close()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // The tail short of a full batch is flushed rather than dropped.
    expect(result.current.data).toHaveLength(11)
  })

  it('reports a failed request instead of an empty map', async () => {
    mockFetch([], { ok: false, status: 404 })

    const { result } = renderHook(() => useNdjsonStream<Row>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toMatchObject({
      message: 'Failed to load data: 404 Not Found',
    })
  })

  it('starts over when the url changes', async () => {
    mockFetch(buildRows(2))

    const { result, rerender } = renderHook(
      ({ url }) => useNdjsonStream<Row>(url),
      { initialProps: { url: '/a.ndjson' } }
    )
    await waitFor(() => expect(result.current.data).toHaveLength(2))

    mockFetch(buildRows(1))
    rerender({ url: '/b.ndjson' })

    // Not appended to what the first url gave: the second file replaces it.
    await waitFor(() => expect(result.current.data).toHaveLength(1))
  })
})
