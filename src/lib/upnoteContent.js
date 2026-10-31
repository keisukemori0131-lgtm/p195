// UpNote コンテンツ表示ヘルパー（R14-3a）。
// 一覧ページ・詳細ページ・トップ抜粋すべてここから読む（直 item.data.X 参照は禁止）。
//
// フィールド名の正: 共通資料/設計書/UpNote_公開API_レスポンス例まとめ.md 付録B
//   news   : notice_date / tag_name / article_title / subtitle / body / thumbnail / attachment_*
//   faq    : category / question / answer / tag_name
//   columns: article_title / subtitle / category / tag_name / author_name / body / published_date / attachment_*
//   events : event_title / subtitle / category / tag_name / event_date / start_time / end_time /
//            venue_name / address / entry_fee / capacity / application_deadline / organizer /
//            contact_info / details / application_url / attachment_*
import { formatDateJST, formatDate } from './upnote.js'
import { publicUrl } from './publicUrl.js'
import { labelForField } from '../constants/upnoteFieldLabels.js'

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i

/** サイト内パスは base 付与、署名付き/絶対URLはそのまま */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url) || /^data:/.test(url)) return url
  return publicUrl(url)
}

export function isImageUrl(v) {
  return typeof v === 'string' && (IMAGE_EXT.test(v) || /^data:image\//.test(v))
}
export function isExternalUrl(v) {
  return typeof v === 'string' && /^https?:\/\//i.test(v)
}
export function isHtml(v) {
  return typeof v === 'string' && /<[a-z][\s\S]*>/i.test(v)
}
export function isIsoDate(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T|$)/.test(v)
}

export const getContentTitle = (item) =>
  item?.data?.article_title || item?.data?.event_title || item?.data?.question || item?.title || ''
export const getContentSubtitle = (item) => item?.data?.subtitle || ''
export const getContentLead = (item) => item?.data?.lead || item?.data?.summary || ''
export const getContentBody = (item) =>
  item?.data?.body ||
  item?.data?.body_html ||
  item?.data?.details ||
  item?.data?.description ||
  item?.data?.answer ||
  ''

export function getContentDateRaw(item) {
  // 公開 API に publishedAt は無い（createdAt / updatedAt のみ）
  return item?.data?.notice_date || item?.data?.published_date || item?.createdAt || ''
}

function formatAnyDate(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return formatDate(raw) // DATE 型
  return formatDateJST(raw) // DATETIME / ISO 型
}

export function formatContentDate(item) {
  return formatAnyDate(getContentDateRaw(item))
}

/** イベントの開催日（events タイプのみ。カード・詳細のメタ行に「開催日」として出す） */
export function formatEventDate(item) {
  return formatAnyDate(item?.data?.event_date || '')
}

/** イベントの開催時間（例「10:00〜16:00」）。片方しか無ければその分だけ返す */
export function getEventTimeRange(item) {
  const s = item?.data?.start_time || ''
  const e = item?.data?.end_time || ''
  if (s && e) return `${s}〜${e}`
  if (s) return `${s}〜`
  if (e) return `〜${e}`
  return ''
}

export function getContentTags(item) {
  const t = item?.data?.tag_name
  if (!t) return []
  return String(t)
    .split(/[,、]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function getContentImageUrls(item) {
  const urls = []
  const d = item?.data || {}
  for (const key of ['thumbnail', 'attachment_1', 'attachment_2', 'attachment_3']) {
    if (isImageUrl(d[key])) urls.push(resolveMediaUrl(d[key]))
  }
  if (Array.isArray(item?.mediaFiles)) {
    for (const m of item.mediaFiles) {
      const u = m?.fileUrl || m?.url
      if (isImageUrl(u)) urls.push(resolveMediaUrl(u))
    }
  }
  return urls
}
export function getContentThumb(item) {
  const d = item?.data || {}
  if (isImageUrl(d.thumbnail)) return resolveMediaUrl(d.thumbnail)
  return getContentImageUrls(item)[0] || ''
}

// 上段スロットで描画済みのキー（「詳細情報」グリッドで重複させない）
export const DEFAULT_MODAL_SKIP_KEYS = [
  'article_title',
  'subtitle',
  'lead',
  'summary',
  'body',
  'body_html',
  'description',
  'answer',
  'thumbnail',
  'attachment_1',
  'attachment_2',
  'attachment_3',
  'tag_name',
  'notice_date',
  'challenge',
  'approach',
  'outcome',
  'testimonial',
  'question',
  'published_date',
  // events: タイトル・本文として上段スロットで描画済み
  'event_title',
  'details',
  // 掲載期間は運用メタのため画面に一切出さない（R14-3a）
  'posted_period_start',
  'posted_period_end',
  // 予約の運用フラグ（members・R19 §7）。来訪者向け情報ではないため出さない
  'reservable',
  'work_days',
]

/** events 用: 開催日・開催時間はメタ行で描画済みなので「開催概要」グリッドから除く */
export const EVENT_SKIP_KEYS = [...DEFAULT_MODAL_SKIP_KEYS, 'event_date', 'start_time', 'end_time']

function isEmptyValue(v) {
  return v == null || v === '' || (Array.isArray(v) && v.length === 0)
}

/** 上段で描画しなかった非空フィールドを全部返す（カスタムフィールドも自動で出る） */
export function getContentFieldEntries(item, skipKeys = DEFAULT_MODAL_SKIP_KEYS) {
  const d = item?.data || {}
  const skip = new Set(skipKeys)
  return Object.entries(d)
    .filter(([k, v]) => !skip.has(k) && !isEmptyValue(v))
    .map(([key, value]) => ({ key, label: labelForField(key), value }))
}
