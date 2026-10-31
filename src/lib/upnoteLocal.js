// R15: ローカル開発用デモ JSON ローダー
// npm run dev では公開 API を叩かず public/upnote-local/{slug}.json → {slug}.sample.json を読む
import { publicUrl } from './publicUrl.js'
import { ENABLED_CONTENT_TYPES } from '../config/upnoteContentTypes.js'

// R15-0: Vite dev サーバーは存在しないパスに SPA フォールバック(HTML)を返すことがある。
// Content-Type が JSON でなければ「無いもの」として次の候補へ進む。例外は必ず null に落とす。
async function tryFetch(url) {
  let res
  try {
    res = await fetch(url, { cache: 'no-store' })
  } catch {
    return null
  }
  if (!res.ok) return null
  const ct = res.headers.get('content-type') || ''
  if (!/json/i.test(ct)) return null
  try {
    return await res.json()
  } catch {
    return null
  }
}

async function loadLocalData(slug) {
  const candidates = [
    publicUrl(`/upnote-local/${slug}.json`),
    publicUrl(`/upnote-local/${slug}.sample.json`),
  ]
  for (const url of candidates) {
    const json = await tryFetch(url)
    if (json) return json
  }
  console.warn(`[upnote-local] ${slug} のローカル JSON が見つかりません (public/upnote-local/)`)
  const err = new Error(`LOCAL_NOT_FOUND: ${slug}`)
  err.errorCode = 'LOCAL_NOT_FOUND'
  throw err
}

/**
 * 一覧取得（ローカル）。page/limit を適用し API と同じ形を返す。
 */
export async function fetchLocalContents(slug, options = {}) {
  const data = await loadLocalData(slug)
  const all = Array.isArray(data.items) ? data.items : []
  const limit = options.limit ?? 10
  const page = options.page ?? 1
  const start = (page - 1) * limit
  return {
    items: all.slice(start, start + limit),
    page,
    limit,
    totalCount: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / limit)),
  }
}

/**
 * 詳細取得（ローカル）。有効な contentType を横断して id 一致を探す。
 */
export async function fetchLocalContentById(id) {
  for (const slug of ENABLED_CONTENT_TYPES) {
    let data
    try {
      data = await loadLocalData(slug)
    } catch {
      continue
    }
    const found = (data.items ?? []).find((it) => String(it.id) === String(id))
    if (found) return found
  }
  const err = new Error('NOT_FOUND: content not found (local)')
  err.errorCode = 'NOT_FOUND'
  err.status = 404
  throw err
}
