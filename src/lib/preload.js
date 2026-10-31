/**
 * ビルド時プリレンダリング（SSG）で取得したデータをページへ渡す仕組み（crecomsence方式）。
 *
 * - SSR（scripts/prerender.mjs → src/entry-server.jsx）: 各ルートのレンダリング前に
 *   setPreloadData() でセットされる。
 * - クライアント: プリレンダリング済み HTML に埋め込まれた
 *   <script id="preload-data" type="application/json"> を初回参照時に読む。
 *
 * 両者が同じデータで初回レンダリングするため、ハイドレーションが一致し、
 * かつ記事本文が静的 HTML に含まれる（SEO/AIO 対応）。データはあくまで初期表示用で、
 * 各フック（useUpNote.js）はマウント後に UpNote API から最新を取得し直す
 * （署名付き画像 URL の失効対策も兼ねる）。
 *
 * データ形状:
 *   {
 *     path: '/news',                     // このデータが対象とするパス
 *     lists: { news: {items,page,limit,totalCount,totalPages}, ... },  // 一覧（slug別）
 *     item: {...},                       // 記事詳細（/news/:id 等）
 *   }
 */

export const PRELOAD_SCRIPT_ID = 'preload-data'

let store

/** SSR（プリレンダリング）専用。各ルートのレンダリング前に呼ぶ */
export function setPreloadData(data) {
  store = data ?? null
}

function readStore() {
  if (store === undefined) {
    if (typeof document === 'undefined') {
      store = null
    } else {
      try {
        const el = document.getElementById(PRELOAD_SCRIPT_ID)
        store = el?.textContent ? JSON.parse(el.textContent) : null
      } catch {
        store = null
      }
    }
  }
  return store
}

/** 一覧の初期データ（slug 一致・1ページ目のみ）。無ければ null */
export function getPreloadedList(slug, page = 1) {
  if (page !== 1) return null
  return readStore()?.lists?.[slug] ?? null
}

/** 記事詳細の初期データ（id 一致）。一覧の preload からも探す */
export function getPreloadedItem(id) {
  const data = readStore()
  if (!data) return null
  if (data.item && String(data.item.id) === String(id)) return data.item
  for (const list of Object.values(data.lists ?? {})) {
    const found = list?.items?.find((it) => String(it.id) === String(id))
    if (found) return found
  }
  return null
}
