import { useEffect, useRef, useState } from 'react'

/** Debounces a value so typing in a search box does not fire a request per key. */
export function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export interface Loadable<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Runs the loader when deps change and keeps only the latest result. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): Loadable<T> {
  const [state, setState] = useState<Loadable<T>>({ data: null, loading: true, error: null })
  const run = useRef(0)
  useEffect(() => {
    const id = ++run.current
    setState((prev) => ({ ...prev, loading: true, error: null }))
    load()
      .then((data) => {
        if (run.current === id) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (run.current === id) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Request failed',
          })
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}
