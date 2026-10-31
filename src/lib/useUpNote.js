import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchContents, fetchContentById } from './upnote.js'
import { getPreloadedList, getPreloadedItem } from './preload.js'

const SIGNED_URL_REFRESH_MS = 30 * 60 * 1000 // 30分 (署名付きURLは1時間で失効)

// R9-retry: 失敗状態からの自動復帰イベント（タブ復帰・BFCache 復帰・オンライン復帰）
const RECOVERY_EVENTS = ['visibilitychange', 'pageshow', 'online']

function useRecoveryRefetch(hasError, reload) {
  useEffect(() => {
    if (!hasError || typeof window === 'undefined') return
    const onRecover = () => {
      if (document.visibilityState === 'hidden') return
      reload()
    }
    for (const ev of RECOVERY_EVENTS) window.addEventListener(ev, onRecover)
    return () => {
      for (const ev of RECOVERY_EVENTS) window.removeEventListener(ev, onRecover)
    }
  }, [hasError, reload])
}

/**
 * コンテンツ一覧フック
 * SSG の preload データがあればそれを初期値にする（SSR とハイドレーションを一致させる）。
 * マウント後は従来どおり API から取得し直す（署名付きURLの鮮度も担保）。
 * 取得済みデータがある間は、再取得の失敗を無視して表示を続ける（R14-5 データ優先）。
 * @param {string} contentTypeSlug
 * @param {{page?: number, limit?: number, q?: string, refreshIntervalMs?: number}} [options]
 */
export function useContentList(contentTypeSlug, options = {}) {
  const { page, limit, q, refreshIntervalMs = SIGNED_URL_REFRESH_MS } = options
  const [data, setData] = useState(() => getPreloadedList(contentTypeSlug, page ?? 1))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(data == null)
  const aliveRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const res = await fetchContents(contentTypeSlug, { page, limit, q })
      if (!aliveRef.current) return
      setData(res)
      setError(null)
    } catch (e) {
      if (aliveRef.current) setError(e)
    } finally {
      if (aliveRef.current) setLoading(false)
    }
  }, [contentTypeSlug, page, limit, q])

  useEffect(() => {
    aliveRef.current = true

    // preload がある場合も最新化のため取得する（loading 表示はしない）
    setLoading(getPreloadedList(contentTypeSlug, page ?? 1) == null)
    load()
    const timer = setInterval(load, refreshIntervalMs)

    return () => {
      aliveRef.current = false
      clearInterval(timer)
    }
  }, [contentTypeSlug, page, limit, q, refreshIntervalMs, load])

  useRecoveryRefetch(Boolean(error), load)

  return { data, error, loading, reload: load }
}

/**
 * コンテンツ詳細フック
 * @param {number|string|null|undefined} id null/undefined のときは fetch しない
 */
export function useContentById(id, options = {}) {
  const { refreshIntervalMs = SIGNED_URL_REFRESH_MS } = options
  const [data, setData] = useState(() => (id != null ? getPreloadedItem(id) : null))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(id != null && data == null)
  const aliveRef = useRef(true)

  const load = useCallback(async () => {
    if (id == null) return
    try {
      const res = await fetchContentById(id)
      if (!aliveRef.current) return
      setData(res)
      setError(null)
    } catch (e) {
      if (aliveRef.current) setError(e)
    } finally {
      if (aliveRef.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    aliveRef.current = true
    if (id == null) {
      setLoading(false)
      return
    }

    setLoading(getPreloadedItem(id) == null)
    load()
    const timer = setInterval(load, refreshIntervalMs)

    return () => {
      aliveRef.current = false
      clearInterval(timer)
    }
  }, [id, refreshIntervalMs, load])

  useRecoveryRefetch(Boolean(error), load)

  return { data, error, loading, reload: load }
}
