import { renderHook, waitFor } from '@testing-library/react'

import { useNdjsonStream } from '../useNdjsonStream'

type Workout = { id: number }

/** Serves the rows as an NDJSON body, the way the static file is fetched. */
const serve = (rows: unknown[], { ok = true, status = 200 } = {}) => {
  const stream = servePushable({ ok, status })
  stream.push(rows)
  stream.close()
}

/**
 * The same, with the body left open until the test closes it.
 *
 * Lets a case observe the hook mid-stream, which is the state batching exists
 * for and which a body delivered in one chunk never stays in long enough to see.
 */
const servePushable = ({ ok = true, status = 200 } = {}) => {
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
    push: (rows: unknown[]) =>
      controller.enqueue(
        new TextEncoder().encode(
          `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`
        )
      ),
    close: () => controller.close(),
  }
}

const workouts = (count: number): Workout[] =>
  Array.from({ length: count }, (_, id) => ({ id }))

describe('useNdjsonStream', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('collects every row, in the order the file lists them', async () => {
    serve(workouts(5))

    const { result } = renderHook(() => useNdjsonStream<Workout>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(workouts(5))
  })

  it("reads the total off the file's `_meta` row rather than counting", async () => {
    // The row is the file's own claim about its length, so the UI can show
    // progress before the rest of it has streamed in.
    serve([{ _meta: { total: 900 } }, ...workouts(2)])

    const { result } = renderHook(() => useNdjsonStream<Workout>('/w.ndjson'))

    await waitFor(() => expect(result.current.total).toBe(900))
    expect(result.current.data).toEqual(workouts(2))
  })

  it('keeps the meta row out of the data it hands back', async () => {
    serve([{ _meta: { total: 1 } }, { id: 0 }])

    const { result } = renderHook(() => useNdjsonStream<Workout>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([{ id: 0 }])
  })

  it('leaves the total unset when the file carries no meta row', async () => {
    serve(workouts(3))

    const { result } = renderHook(() => useNdjsonStream<Workout>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.total).toBeNull()
  })

  it('paints the first batch before the whole file has been read', async () => {
    const stream = servePushable()

    const { result } = renderHook(() =>
      useNdjsonStream<Workout>('/w.ndjson', { batchSize: 10 })
    )

    stream.push(workouts(10))
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
    serve([], { ok: false, status: 404 })

    const { result } = renderHook(() => useNdjsonStream<Workout>('/w.ndjson'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toMatchObject({
      message: 'Failed to load data: 404 Not Found',
    })
  })

  it('starts over when the url changes', async () => {
    serve(workouts(2))

    const { result, rerender } = renderHook(
      ({ url }) => useNdjsonStream<Workout>(url),
      { initialProps: { url: '/a.ndjson' } }
    )
    await waitFor(() => expect(result.current.data).toHaveLength(2))

    serve(workouts(1))
    rerender({ url: '/b.ndjson' })

    // Not appended to what the first url gave: the second file replaces it.
    await waitFor(() => expect(result.current.data).toHaveLength(1))
  })
})
