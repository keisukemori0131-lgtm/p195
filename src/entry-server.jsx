/* ビルド時プリレンダリング（SSG）専用エントリ（crecomsence方式・P180 移植版）。
   scripts/prerender.mjs から vite.ssrLoadModule() で読み込まれる。HMR対象外 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import CompanyPage from './pages/CompanyPage.jsx'
import NewsPage from './pages/NewsPage.jsx'
import NewsDetailPage from './pages/NewsDetailPage.jsx'
import ColumnPage from './pages/ColumnPage.jsx'
import ColumnDetailPage from './pages/ColumnDetailPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ROUTES_JSON from './constants/site-routes.json'
import SITE_DATA from './constants/site-data.json'
import { setPreloadData } from './lib/preload.js'
import { getContentTitle, getContentDescription } from './lib/upnoteContent.js'
import { ENABLED_CONTENT_TYPES } from './config/upnoteContentTypes.js'

/**
 * サーバー用ルート表。クライアント（App.jsx）は React.lazy でコード分割するが、
 * renderToString は lazy を扱えないため、ここでは即時 import でミラーする。
 * ルートを追加・変更したら App.jsx と両方更新すること。
 * （/access はクライアント側の Navigate のみ。静的には _redirects で 301）
 */
function ServerApp() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="company" element={<CompanyPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:id" element={<NewsDetailPage />} />
        <Route path="column" element={<ColumnPage />} />
        <Route path="column/:id" element={<ColumnDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

/** 1ルート分の HTML（#root の中身）を文字列で返す */
export function render(url, preload = null) {
  setPreloadData(preload)
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <ServerApp />
      </StaticRouter>
    </StrictMode>,
  )
}

/** 静的ルート一覧と、ルートごとの SEO 情報（site-routes.json が単一ソース） */
export const ROUTES = ROUTES_JSON.map((r) => r.path)

export function seo(path) {
  const r = ROUTES_JSON.find((route) => route.path === path)
  return { path, title: r.title, description: r.description, label: r.label }
}

/* ───────────── 記事詳細の SSG（R14-5） ───────────── */

const SITE_LABEL = SITE_DATA.label

function articleMeta(item, basePath, listLabel, jsonLdType) {
  const title = getContentTitle(item)
  // ArticleDetail.jsx と同じ説明文（meta_description → summary → 本文の先頭）
  const description = getContentDescription(item)
  return {
    path: `${basePath}/${item.id}`,
    title: `${title}｜${listLabel}｜${SITE_LABEL}`,
    description: description || `${SITE_LABEL}の${listLabel}です。`,
    label: listLabel,
    article: { item, listLabel, basePath, jsonLdType },
  }
}

export const articleSeo = {
  news: (item) => articleMeta(item, '/news', 'お知らせ', 'NewsArticle'),
  column: (item) => articleMeta(item, '/column', 'コラム', 'BlogPosting'),
}

/* ── ビルド時コンテンツ取得（記事詳細・一覧 preload 用） ──
   - Cloudflare Build では VITE_UPNOTE_API_BASE_URL / VITE_UPNOTE_PUBLIC_API_KEY を使い公開APIから取得
   - PRERENDER_SAMPLE=1 のローカル検証時のみ public/upnote-local/*.sample.json を読む（本番ビルドで使用禁止）
   - どちらも無ければ null（静的ルートのみプリレンダ） */

const FETCH_LIMIT = 50
const FETCH_MAX_PAGES = 10

async function fetchAllFromApi(slug) {
  const base = (import.meta.env.VITE_UPNOTE_API_BASE_URL || '').trim().replace(/\/$/, '')
  const key = (import.meta.env.VITE_UPNOTE_PUBLIC_API_KEY || '').trim()
  const header = (import.meta.env.VITE_UPNOTE_API_KEY_HEADER || 'X-API-Key').trim()
  if (!base || !key) return null

  const getPage = async (page) => {
    const res = await fetch(
      `${base}/api/v1/contents?contentTypeSlug=${encodeURIComponent(slug)}&page=${page}&limit=${FETCH_LIMIT}`,
      { headers: { Accept: 'application/json', [header]: key } },
    )
    const json = await res.json()
    if (!res.ok || json.success === false) {
      throw new Error(`${json.errorCode ?? res.status}: ${json.message ?? res.statusText}`)
    }
    return json.data
  }

  const first = await getPage(1)
  const items = [...(first.items ?? [])]
  const totalPages = first.totalPages ?? 1
  for (let page = 2; page <= Math.min(totalPages, FETCH_MAX_PAGES); page++) {
    items.push(...((await getPage(page)).items ?? []))
  }
  return { items, page: 1, limit: FETCH_LIMIT, totalCount: first.totalCount ?? items.length, totalPages }
}

async function loadSampleJson(slug) {
  const { readFileSync, existsSync } = await import('node:fs')
  const { resolve } = await import('node:path')
  const p = resolve(process.cwd(), 'public', 'upnote-local', `${slug}.sample.json`)
  if (!existsSync(p)) return null
  const data = JSON.parse(readFileSync(p, 'utf8'))
  const items = data.items ?? []
  return { items, page: 1, limit: items.length, totalCount: items.length, totalPages: 1 }
}

/**
 * 記事詳細・一覧 preload 用の全公開コンテンツを取得する。
 * upnote.コンテンツ に含まれない slug は取得しない（R9）。
 * 失敗・未設定時は null（呼び出し側は静的ルートのみプリレンダ）。
 * @returns {Promise<{news, columns} | null>}
 */
export async function loadPrerenderContent() {
  const useSample = typeof process !== 'undefined' && process.env.PRERENDER_SAMPLE === '1'
  try {
    const loader = useSample ? loadSampleJson : fetchAllFromApi
    // 1 タイプの取得失敗で全体を諦めない（そのタイプだけスキップ）
    const safe = (slug) =>
      ENABLED_CONTENT_TYPES.includes(slug)
        ? loader(slug).catch((err) => {
            console.warn(`[prerender] ${slug} の取得に失敗（このタイプはスキップ）:`, err?.message || err)
            return null
          })
        : Promise.resolve(null)
    const [news, columns] = await Promise.all([safe('news'), safe('columns')])
    if (!news && !columns) return null
    if (useSample) {
      console.warn('[prerender] PRERENDER_SAMPLE=1: sample JSON を記事としてプリレンダ（本番ビルド使用禁止）')
    }
    return { news, columns }
  } catch (err) {
    console.warn('[prerender] UpNote コンテンツ取得に失敗（記事詳細はスキップ）:', err?.message || err)
    return null
  }
}
