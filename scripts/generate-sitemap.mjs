#!/usr/bin/env node
/**
 * generate-sitemap.mjs — postbuild で dist/sitemap.xml・robots.txt・llms.txt を生成する
 *
 * - ルート一覧の単一ソース: src/constants/site-routes.json
 * - 会社の事実情報の単一ソース: src/constants/site-data.json
 * - VITE_SITE_URL: 本番オリジン（未設定なら sitemap.xml はスキップ）
 * - VITE_SITE_PUBLIC=1 のときのみ robots.txt を Allow（誤公開防止）
 * - UpNote の Build 変数（VITE_UPNOTE_API_BASE_URL + VITE_UPNOTE_PUBLIC_API_KEY）があれば
 *   news / columns の記事詳細 URL を sitemap に含め（R14-3）、llms.txt に記事の要約を書き出す（AIO）
 * - lastmod: 記事は updatedAt、静的ページは省略（ビルド時刻を入れない・IndexNow 差分検知のため）
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SERVICES, ORBIT_FEATURES } from '../src/constants/services.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')

// .env.production の簡易読込（Cloudflare Build では process.env が優先）
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

const site = JSON.parse(readFileSync(join(root, 'src', 'constants', 'site-data.json'), 'utf8'))
const routes = JSON.parse(readFileSync(join(root, 'src', 'constants', 'site-routes.json'), 'utf8'))

const SITE_URL = (env('VITE_SITE_URL') || site.domain || '').replace(/\/$/, '')
const SITE_PUBLIC = env('VITE_SITE_PUBLIC') === '1'
const UPNOTE_BASE = env('VITE_UPNOTE_API_BASE_URL').replace(/\/$/, '')
const UPNOTE_KEY = env('VITE_UPNOTE_PUBLIC_API_KEY')
const UPNOTE_HEADER = env('VITE_UPNOTE_API_KEY_HEADER') || 'X-API-Key'

if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })

/* ───────────── robots.txt ─────────────
   VITE_SITE_PUBLIC=1 でないときは全面 Disallow（ドラフト誤公開の防止）。
   ★ Cloudflare の「managed robots.txt」が有効だと AI クローラーの Disallow が先頭に追記される（HANDOFF 参照） */
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended']

const robots = SITE_PUBLIC
  ? [
      'User-agent: *',
      'Allow: /',
      '',
      '# AI 検索・生成エンジンからの参照を許可する（AIO）',
      ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
      ...(SITE_URL ? [`Sitemap: ${SITE_URL}/sitemap.xml`, ''] : []),
    ].join('\n')
  : 'User-agent: *\nDisallow: /\n'
writeFileSync(join(distDir, 'robots.txt'), robots)
console.log(`[sitemap] robots.txt を生成 (${SITE_PUBLIC ? 'Allow' : 'Disallow'})`)

/* ───────────── UpNote 公開コンテンツの取得（sitemap と llms.txt で共用） ───────────── */

// PRERENDER_SAMPLE=1 のローカル検証時だけ、デモ JSON を使う（本番ビルドでは使用禁止）
const USE_SAMPLE = process.env.PRERENDER_SAMPLE === '1'

function loadSample(slug) {
  const p = join(root, 'public', 'upnote-local', `${slug}.sample.json`)
  if (!existsSync(p)) return []
  try {
    return JSON.parse(readFileSync(p, 'utf8')).items ?? []
  } catch {
    return []
  }
}

async function fetchAll(slug) {
  if (USE_SAMPLE) return loadSample(slug)
  if (!UPNOTE_BASE || !UPNOTE_KEY) return []
  const items = []
  try {
    let page = 1
    let totalPages = 1
    do {
      const res = await fetch(`${UPNOTE_BASE}/api/v1/contents?contentTypeSlug=${encodeURIComponent(slug)}&page=${page}&limit=50`, {
        headers: { Accept: 'application/json', [UPNOTE_HEADER]: UPNOTE_KEY },
      })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.errorCode ?? res.status)
      items.push(...(json.data.items ?? []))
      totalPages = json.data.totalPages ?? 1
      page++
    } while (page <= Math.min(totalPages, 10))
  } catch (err) {
    console.warn(`[sitemap] ${slug} の取得に失敗:`, err?.message || err)
  }
  return items
}

const [newsItems, columnItems, caseItems] = await Promise.all([fetchAll('news'), fetchAll('columns'), fetchAll('case_studies')])

/* ───────────── llms.txt（AI クローラー向けのサイト要約・AIO） ───────────── */

const plain = (v, max = 400) =>
  String(v ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

const llms = [
  `# ${site.label}`,
  '',
  `> ${routes.find((r) => r.path === '/').description}`,
  '',
  '## 基本情報',
  '',
  `- 商号: ${site.name}（${site.nameRoman}）`,
  `- 代表者: ${site.representative.title} ${site.representative.name}（${site.representative.nameRoman}）`,
  `- 本社: 〒${site.address.postal} ${site.address.full}`,
  `- オフィス: 〒${site.office.postal} ${site.office.full}`,
  `- 電話: ${site.phone} / FAX: ${site.fax}`,
  `- 法人番号: ${site.corporateNumber}`,
  `- 対応エリア: ${site.serviceArea}`,
  `- キャッチコピー: ${site.tagline} ${site.subcopy}`,
  `- 連絡方法: お問い合わせフォーム（${SITE_URL || ''}/contact）または電話`,
  '',
  '## 主要ページ',
  '',
  ...routes.map((r) => `- [${r.label}](${SITE_URL || ''}${r.path}): ${r.description}`),
  '',
  '## 事業',
  '',
  ...SERVICES.map((s) => `- ${s.name}${s.sub ? `（${s.sub}）` : ''}: ${s.summary}${s.url ? ` ${s.url}` : ''}`),
  '',
  '## REGOLITH ORBIT の機能',
  '',
  ...ORBIT_FEATURES.flatMap((c) => [`### ${c.label}`, '', ...c.items.map((f) => `- ${f.name}: ${f.gain}`), '']),
]

const pushArticles = (heading, items, dateKey, basePath) => {
  if (!items.length) return
  llms.push(`## ${heading}`, '')
  for (const item of items.slice(0, 20)) {
    const d = item?.data ?? {}
    const title = plain(d.article_title || d.case_title, 120)
    if (!title) continue
    const date = d[dateKey] ? `（${d[dateKey]}）` : ''
    llms.push(`- ${title}${date}${SITE_URL ? `: ${SITE_URL}${basePath}/${item.id}` : ''}`, `  ${plain(d.subtitle || d.summary_one_line || d.body || d.body_result, 200)}`)
  }
  llms.push('')
}
pushArticles('コラム', columnItems, 'published_date', '/column')
pushArticles('お知らせ', newsItems, 'notice_date', '/news')
pushArticles('実績・事例', caseItems, 'date', '/works')

writeFileSync(join(distDir, 'llms.txt'), llms.join('\n'))
console.log(`[sitemap] llms.txt を生成 (コラム ${columnItems.length} / お知らせ ${newsItems.length} / 実績・事例 ${caseItems.length})`)

/* ───────────── sitemap.xml ───────────── */

if (!SITE_URL) {
  console.log('[sitemap] VITE_SITE_URL 未設定のため sitemap.xml はスキップ')
  process.exit(0)
}

// 静的ページは lastmod を省略（ビルド時刻を入れると毎回「更新」扱いになる）
const urls = routes.map((r) => ({ loc: `${SITE_URL}${r.path === '/' ? '/' : r.path}`, priority: r.priority }))

// 記事詳細 URL（/news/:id, /column/:id）— lastmod は記事の updatedAt（R14-5 #9）
const articleUrls = [
  ...newsItems.map((item) => ({ item, basePath: '/news' })),
  ...columnItems.map((item) => ({ item, basePath: '/column' })),
  ...caseItems.map((item) => ({ item, basePath: '/works' })),
].map(({ item, basePath }) => ({
  loc: `${SITE_URL}${basePath}/${item.id}`,
  priority: '0.6',
  lastmod: (item.updatedAt || '').slice(0, 10),
}))

if (!USE_SAMPLE && (!UPNOTE_BASE || !UPNOTE_KEY)) {
  console.log('[sitemap] UpNote Build 変数未設定のため記事詳細 URL はスキップ')
}

const all = [...urls, ...articleUrls]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(distDir, 'sitemap.xml'), xml)
console.log(`[sitemap] sitemap.xml を生成 (${all.length} URL)`)
