// UpNote 公開API クライアント — 標準: パターン B 直叩き・crecomsence 互換セット 1
// 仕様: 共通資料/設計書/公開API設計書_v1.2.md (§7.3 / §13) に準拠
// ベースは 共通テンプレート/upnote/src/lib/upnote.js。R15（ローカルデモJSON）と
// R9-retry（自動リトライ・12秒タイムアウト）対応を統合。
//
// 環境変数 (Vite) — 解決優先度の順:
//
//   # ★ 新規案件はこれだけ使う（パターン B 直叩き・セット 1）
//   VITE_UPNOTE_API_BASE_URL=https://api.upnote.jp        ← /api/v1 を含めない（コードが付与）
//   VITE_UPNOTE_PUBLIC_API_KEY=up_xxxxxxxxxxxxxxxxxxxxx
//   VITE_UPNOTE_API_KEY_HEADER=X-API-Key                  ← 任意（既定 X-API-Key）
//
//   npm run dev   → 既定はローカル JSON (public/upnote-local/*.sample.json)
//   npm run build → .env.production / Cloudflare Build 環境変数（公開APIのみ）

import { fetchLocalContents, fetchLocalContentById } from './upnoteLocal.js'

const DEFAULT_KEY_HEADER = 'X-API-Key'
const PROXY_PREFIX = '/api/upnote/v1'
const REQUEST_TIMEOUT_MS = 12000 // Safari の長時間ハング対策（R9-retry）
const RETRY_DELAYS_MS = [400, 1200] // GET の自動リトライ（初回 + 2 回）

const RAW_BASE_URL = import.meta.env.VITE_UPNOTE_API_BASE_URL?.trim() || ''
const RAW_BASE = import.meta.env.VITE_UPNOTE_API_BASE?.trim() || ''
const RAW_KEY =
  import.meta.env.VITE_UPNOTE_PUBLIC_API_KEY?.trim() ||
  import.meta.env.VITE_UPNOTE_API_KEY?.trim() ||
  import.meta.env.UPNOTE_API_KEY?.trim() || // セット 2 (P002) 互換: envPrefix 経由で公開
  ''
const KEY_HEADER = import.meta.env.VITE_UPNOTE_API_KEY_HEADER?.trim() || DEFAULT_KEY_HEADER

// R15: npm run dev かつ API 設定なし → 公開APIを叩かずローカル JSON を読む
const USE_LOCAL_DATA = import.meta.env.DEV && !RAW_KEY && !RAW_BASE_URL && !RAW_BASE

// ベース URL の解決優先度:
//   1. VITE_UPNOTE_API_BASE_URL（セット 1・新規標準）   → 例 https://api.upnote.jp (/api/v1 を付与)
//   2. VITE_UPNOTE_API_BASE（セット 2 or パターン A）→ 例 https://api.upnote.jp/api/v1 もしくは /api/upnote/v1
//   3. デフォルト proxy パス /api/upnote/v1
const RESOLVED_BASE = (RAW_BASE_URL || RAW_BASE || PROXY_PREFIX).replace(/\/$/, '')

// proxy 経由なら同一オリジンの相対パス、それ以外は直叩き
const VIA_PROXY = RESOLVED_BASE.startsWith('/')

function endpoint(path) {
  if (VIA_PROXY) return `${RESOLVED_BASE}${path}` // /api/upnote/v1/contents...
  if (/\/api\/v\d+$/.test(RESOLVED_BASE)) return `${RESOLVED_BASE}${path}` // セット 2
  return `${RESOLVED_BASE}/api/v1${path}` // セット 1
}

if (!USE_LOCAL_DATA && !VIA_PROXY && !RAW_KEY) {
  console.error(
    '[upnote] 直叩きモードでは VITE_UPNOTE_PUBLIC_API_KEY が必須です。Cloudflare Build に追加してください。',
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function requestOnce(path, init = {}) {
  const headers = { Accept: 'application/json', ...(init.headers ?? {}) }
  // キーはキー中継型 proxy（エラー④対策）でも送る
  if (RAW_KEY) headers[KEY_HEADER] = RAW_KEY

  // AbortSignal.timeout() は Safari 16 未満に無いため AbortController + setTimeout で組む
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null

  let res
  try {
    res = await fetch(endpoint(path), {
      ...init,
      headers,
      cache: 'no-store',
      ...(controller ? { signal: controller.signal } : {}),
    })
  } catch {
    const err = new Error('NETWORK: ネットワークエラー（許可オリジン未登録などを確認）')
    err.errorCode = 'NETWORK'
    throw err
  } finally {
    if (timer) clearTimeout(timer)
  }

  let json
  try {
    json = await res.json()
  } catch {
    const err = new Error(`HTTP_${res.status}: ${res.statusText}`)
    err.status = res.status
    throw err
  }

  if (!res.ok || json.success === false) {
    const err = new Error(`${json.errorCode ?? `HTTP_${res.status}`}: ${json.message ?? res.statusText}`)
    err.errorCode = json.errorCode
    err.status = res.status
    throw err
  }
  return json.data
}

/**
 * GET リクエスト（R9-retry: 自動リトライ付き）。
 * 4xx は待っても直らないためリトライしない。POST（問い合わせ）はこの関数を使わない（二重送信防止）。
 */
async function requestGet(path) {
  let lastErr
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1])
    try {
      return await requestOnce(path)
    } catch (err) {
      lastErr = err
      if (err.status && err.status >= 400 && err.status < 500) throw err
    }
  }
  throw lastErr
}

/**
 * コンテンツ一覧取得 (PUBLISHED かつ掲載期間内のみ・sortOrder昇順)
 */
export async function fetchContents(contentTypeSlug, options = {}) {
  if (USE_LOCAL_DATA) return fetchLocalContents(contentTypeSlug, options)
  const params = new URLSearchParams({ contentTypeSlug })
  if (options.page) params.set('page', String(options.page))
  if (options.limit) params.set('limit', String(options.limit))
  if (options.q) params.set('q', options.q)
  return requestGet(`/contents?${params.toString()}`)
}

/**
 * コンテンツ詳細取得。下書き・掲載期間外は 404 (NOT_FOUND) を投げる。
 */
export async function fetchContentById(id) {
  if (USE_LOCAL_DATA) return fetchLocalContentById(id)
  return requestGet(`/contents/${id}`)
}

/* ───────────── 問い合わせ送信（R6-upnote） ───────────── */

// submitInquiry の formKey 定数（文字列直書き禁止）
export const FORM_KEYS = {
  contact: 'contact', // 通常のお問い合わせ
  recruit: 'recruit', // 求人への応募（受信箱に「応募」バッジ）
  brochure: 'brochure', // 会社案内の資料請求（PDF案内が自動返信）
}

/**
 * 問い合わせ送信 (POST /api/v1/inquiries・設計書 v1.2 §7.3)
 *
 * その企業の UpNote ログイン用メールアドレスへ通知メールが送られ、
 * 同時に UpNote の受信箱（inquiries）へ保存される（2026-08 受信箱導入）。
 * 連携済みなら LINE にも通知が飛ぶ。
 *
 * ローカルモード（dev かつ API 未設定）では API に送信せず成功をシミュレートする（R15）。
 * POST はリトライしない（二重送信防止・R9-retry）。
 *
 * 失敗時は errorCode 付き Error を投げる:
 *   VALIDATION_ERROR (400) — 必須欠落・文字数超過・メール形式不正
 *   MAIL_SEND_FAILED (500) — メール送信失敗。入力値を保持したまま再送を促すこと
 *
 * @param {{ name: string, email: string, subject?: string, message: string, formKey?: string }} inquiry
 */
export async function submitInquiry(inquiry) {
  if (USE_LOCAL_DATA) {
    console.warn('[upnote] 問い合わせ送信(シミュレート): API 未設定のため送信していません', inquiry)
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { simulated: true }
  }
  await requestOnce('/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiry),
  })
  return { simulated: false }
}

/* ───────────── 表示ヘルパー ───────────── */

export function formatDateJST(utcString, options) {
  if (!utcString) return ''
  return new Date(utcString).toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(options ?? {}),
  })
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

export const fallback = (v, alt) => (v == null || v === '' ? alt : v)

export const EMPTY_MESSAGES = {
  news: 'お知らせは現在登録されていません。',
  columns: 'コラムは現在登録されていません。',
  faq: 'よくあるご質問は現在登録されていません。',
}

