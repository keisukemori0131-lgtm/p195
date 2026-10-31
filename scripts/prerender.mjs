#!/usr/bin/env node
/**
 * prerender.mjs — ビルド時プリレンダリング（SSG・crecomsence方式 / R14-5）
 *
 * `vite build` の後に実行する。Vite の ssrLoadModule で src/entry-server.jsx を
 * Node 上で読み込み、静的ルート + 記事詳細（/news/:id, /column/:id）を本文込みで
 * renderToString し、dist/<route>/index.html に書き出す。
 *
 * 各 HTML には:
 *   - ルート固有の title / description / canonical / OGP / robots
 *   - JSON-LD（WebSite / LocalBusiness / BreadcrumbList / NewsArticle / BlogPosting / ItemList）
 *   - <script id="preload-data" type="application/json">（src/lib/preload.js 参照）
 * を含める。404.html（noindex）も出力する。
 *
 * 記事のプリレンダにはビルド時に VITE_UPNOTE_API_BASE_URL / VITE_UPNOTE_PUBLIC_API_KEY
 * が必要（未設定なら静的ルートのみ・警告して続行）。
 * ローカル検証は `PRERENDER_SAMPLE=1 npm run build`（本番ビルドで使用禁止）。
 *
 * ポイント（crecomsence-homepage の知見）:
 *   - 2回目の `vite build --ssr` は行わない（Cloudflare Workers Builds で壊れる）
 *   - `configFile: false` で環境が注入するプラグインの影響を分離
 *   - 失敗してもデプロイを止めない（常に exit 0。最悪でも SPA として配信される）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { buildPageJsonLd, buildArticleJsonLd } from '../src/lib/structuredData.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const distDir = resolve(root, 'dist')

function loadEnvFile(file) {
  const p = join(root, file)
  if (!existsSync(p)) return {}
  const out = {}
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#')) out[m[1]] = m[2]
  }
  return out
}

const envFile = loadEnvFile('.env.production')
const env = (key) => process.env[key] ?? envFile[key] ?? ''

const SITE = JSON.parse(readFileSync(join(root, 'src', 'constants', 'site-data.json'), 'utf8'))
const SITE_URL = (env('VITE_SITE_URL') || SITE.domain || '').replace(/\/$/, '')
const SITE_PUBLIC = env('VITE_SITE_PUBLIC') === '1'
const OG_IMAGE = env('VITE_OG_IMAGE_URL') || '/og-image.png'
const GSC = env('VITE_GOOGLE_SITE_VERIFICATION')
const SITE_LABEL = SITE.label

/** OGP 画像の URL（中身のハッシュ ?v= 付き）と幅・高さ */
function readPngSize(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  return null
}
function resolveOgImage() {
  if (OG_IMAGE.startsWith('http')) return { url: OG_IMAGE }
  const path = OG_IMAGE.split('?')[0]
  const file = join(root, 'public', path)
  const base = SITE_URL ? `${SITE_URL}${path}` : path
  if (!existsSync(file)) return { url: base }
  const buf = readFileSync(file)
  return { url: `${base}?v=${createHash('md5').update(buf).digest('hex').slice(0, 8)}`, type: 'image/png', ...readPngSize(buf) }
}
const OG = resolveOgImage()

const LIST_PAGE_SIZE = 10 // 一覧ページの1ページあたり件数（ContentBoard の LIMIT と揃える）
const HOME_EXCERPT = 3 // トップの抜粋（R14-2）

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/** JSON 内の "</script>" で HTML が壊れないようにエスケープして埋め込む */
function preloadScriptTag(preload) {
  const json = JSON.stringify(preload).replace(/</g, '\\u003c')
  return `<script id="preload-data" type="application/json">${json}</script>`
}

function abs(path) {
  return SITE_URL ? `${SITE_URL}${path === '/' ? '/' : path}` : null
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i

function buildHeadExtras(meta, preload) {
  const { path, label, article, noindex } = meta
  const canonical = noindex ? null : abs(path)
  const robots = noindex || !SITE_PUBLIC ? 'noindex, nofollow' : 'index, follow'

  // WebSite / LocalBusiness / ページ / パンくずの @graph（DocumentMeta.jsx と同じ関数）
  const jsonLd = noindex
    ? []
    : [buildPageJsonLd({ path: article ? null : path, title: meta.title, description: meta.description, label, siteUrl: SITE_URL, site: SITE })]

  if (article) {
    const { item, listLabel, basePath, jsonLdType } = article
    const title = item?.data?.article_title || ''
    const heroRaw = item?.data?.thumbnail || item?.data?.attachment_1 || ''
    const hero = IMAGE_EXT.test(heroRaw) ? (heroRaw.startsWith('http') ? heroRaw : abs(heroRaw) || heroRaw) : ''
    jsonLd.push(buildArticleJsonLd({ item, type: jsonLdType, title, image: hero, canonical, site: SITE }))
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: abs('/') || undefined },
        { '@type': 'ListItem', position: 2, name: listLabel, item: abs(basePath) || undefined },
        { '@type': 'ListItem', position: 3, name: title },
      ],
    })
  }

  // 一覧の ItemList（src/lib/jsonld.js と同内容）
  const lists = preload?.lists ?? {}
  const listSpec = { '/news': ['news', '/news', 'お知らせ一覧'], '/column': ['columns', '/column', 'コラム一覧'] }
  if (listSpec[path]) {
    const [slug, base, name] = listSpec[path]
    const items = lists[slug]?.items ?? []
    if (items.length) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item?.data?.article_title || '',
          ...(abs(`${base}/${item.id}`) ? { url: abs(`${base}/${item.id}`) } : {}),
        })),
      })
    }
  }

  const lines = [
    `<meta name="robots" content="${robots}" />`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}" />` : '',
    canonical ? `<meta property="og:url" content="${esc(canonical)}" />` : '',
    `<meta property="og:site_name" content="${esc(SITE_LABEL)}" />`,
    `<meta property="og:locale" content="ja_JP" />`,
    article?.item?.createdAt ? `<meta property="article:published_time" content="${esc(article.item.createdAt)}" />` : '',
    article?.item?.updatedAt ? `<meta property="article:modified_time" content="${esc(article.item.updatedAt)}" />` : '',
    OG.type ? `<meta property="og:image:type" content="${OG.type}" />` : '',
    OG.width ? `<meta property="og:image:width" content="${OG.width}" />` : '',
    OG.height ? `<meta property="og:image:height" content="${OG.height}" />` : '',
    `<meta property="og:image:alt" content="${esc(`${SITE_LABEL}｜${SITE.tagline}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${esc(OG.url)}" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    GSC ? `<meta name="google-site-verification" content="${esc(GSC)}" />` : '',
    ...jsonLd.map(
      (obj) => `<script type="application/ld+json" data-doc-meta-jsonld="1">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`,
    ),
  ].filter(Boolean)
  return lines.map((l) => `    ${l}`).join('\n')
}

function buildHtml(template, meta, appHtml, preload) {
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(meta.description)}" />`)
  html = html.replace(/<meta\s+property="og:type"[\s\S]*?\/>/, `<meta property="og:type" content="${meta.article ? 'article' : 'website'}" />`)
  html = html.replace(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(meta.title)}" />`)
  html = html.replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(meta.description)}" />`)
  html = html.replace(/<meta\s+property="og:image"[\s\S]*?\/>/, `<meta property="og:image" content="${esc(OG.url)}" />`)
  html = html.replace('</head>', `${buildHeadExtras(meta, preload)}\n  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  html = html.replace('</body>', `${preloadScriptTag(preload)}</body>`)
  return html
}

function outPathFor(routePath) {
  if (routePath === '/') return resolve(distDir, 'index.html')
  if (routePath === '/404') return resolve(distDir, '404.html')
  return resolve(distDir, routePath.replace(/^\//, ''), 'index.html')
}

/** 一覧 preload（全件から1ページ目を切り出し、API と同じ形にする） */
function firstPage(all, limit) {
  if (!all) return null
  return {
    items: all.items.slice(0, limit),
    page: 1,
    limit,
    totalCount: all.totalCount,
    totalPages: Math.max(1, Math.ceil(all.totalCount / limit)),
  }
}

async function main() {
  const template = readFileSync(resolve(distDir, 'index.html'), 'utf8')

  const vite = await createServer({
    root,
    configFile: false,
    logLevel: 'error',
    plugins: [react()],
    appType: 'custom',
    envPrefix: ['VITE_', 'UPNOTE_'],
    server: { middlewareMode: true },
  })

  let mod
  try {
    mod = await vite.ssrLoadModule('/src/entry-server.jsx')
  } catch (err) {
    await vite.close()
    console.warn('[prerender] スキップ（SSRモジュール読込失敗）:', err?.message || err)
    return
  }

  const { render, seo, ROUTES, articleSeo, loadPrerenderContent } = mod

  // 記事コンテンツを先に取得（静的ルートの一覧 preload にも使う）
  const content = (await loadPrerenderContent?.()) ?? null

  function staticPreloadFor(routePath) {
    const preload = { path: routePath }
    if (!content) return preload
    const lists = {}
    if (routePath === '/') {
      if (content.news) lists.news = firstPage(content.news, HOME_EXCERPT)
      if (content.columns) lists.columns = firstPage(content.columns, HOME_EXCERPT)
    }
    if (routePath === '/news' && content.news) lists.news = firstPage(content.news, LIST_PAGE_SIZE)
    if (routePath === '/column' && content.columns) lists.columns = firstPage(content.columns, LIST_PAGE_SIZE)
    if (Object.keys(lists).length) preload.lists = lists
    return preload
  }

  const articleJobs = content
    ? [
        ...(content.news?.items ?? []).map((item) => ({ seo: articleSeo.news(item), preload: { path: `/news/${item.id}`, item } })),
        ...(content.columns?.items ?? []).map((item) => ({ seo: articleSeo.column(item), preload: { path: `/column/${item.id}`, item } })),
      ]
    : []

  const notFoundJob = {
    seo: {
      path: '/404',
      title: `ページが見つかりません｜${SITE_LABEL}`,
      description: 'お探しのページは見つかりませんでした。URLをご確認いただくか、トップページからお進みください。',
      noindex: true,
    },
    preload: { path: '/404' },
  }

  const jobs = [...ROUTES.map((routePath) => ({ seo: seo(routePath), preload: staticPreloadFor(routePath) })), ...articleJobs, notFoundJob]

  let count = 0
  for (const job of jobs) {
    const routePath = job.preload.path
    try {
      const appHtml = render(routePath, job.preload)
      const html = buildHtml(template, job.seo, appHtml, job.preload)
      const outPath = outPathFor(routePath)
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, html, 'utf8')
      count++
    } catch (err) {
      console.warn(`[prerender] 失敗 ${routePath}:`, err?.message || err)
    }
  }

  await vite.close()
  console.log(`[prerender] ${count}/${jobs.length} ルートをプリレンダリング（本文込みSSG）`)
  if (!content) {
    console.warn('[prerender] UpNote API 未設定/取得失敗のため記事詳細はプリレンダリングしていません')
  }
}

// プリレンダリングの失敗でデプロイを止めない（常に exit 0）
main().catch((err) => {
  console.warn('[prerender] エラーが発生しましたがデプロイは継続します:', err?.message || err)
})
