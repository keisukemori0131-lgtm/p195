// UpNote コンテンツ表示ヘルパー（R14-3a）。
// 一覧ページ・詳細ページ・トップ抜粋すべてここから読む（直 item.data.X 参照は禁止）。
//
// フィールド名の正: 共通資料/設計書/UpNote_公開API_レスポンス例まとめ.md 付録B
//   news   : notice_date / tag_name / article_title / subtitle / body / thumbnail / attachment_*
//   faq    : category / question / answer / tag_name
//   columns: article_title / subtitle / category / tag_name / author_name / body / published_date / attachment_*
//   case_studies: case_title / summary_one_line / client_display_name / industry / location_region /
//            body_challenge / body_approach / body_result / testimonial_quote など（cre-comsence.com と同じ項目）
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
  item?.data?.article_title || item?.data?.case_title || item?.data?.event_title || item?.data?.question || item?.title || ''
export const getContentSubtitle = (item) => item?.data?.subtitle || ''
export const getContentLead = (item) =>
  item?.data?.lead || item?.data?.summary || item?.data?.summary_one_line || item?.data?.excerpt || ''
export const getContentBody = (item) =>
  item?.data?.body ||
  item?.data?.body_html ||
  item?.data?.details ||
  item?.data?.description ||
  item?.data?.answer ||
  item?.data?.body_result ||
  item?.data?.body_approach ||
  item?.data?.body_challenge ||
  ''

export const getContentCategory = (item) => item?.data?.category || ''

/** 記事の説明文（meta description・カードの要約）。meta_description → summary/lead → 本文の先頭 */
export function getContentDescription(item, max = 120) {
  const d = item?.data || {}
  const text = d.meta_description || getContentLead(item) || d.subtitle || getContentBody(item)
  return String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/^[■・●▪]\s*/gmu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/** 著者（columns の author_name / author_title / author_affiliation / author_profile） */
export function getContentAuthor(item) {
  const d = item?.data || {}
  const name = typeof d.author_name === 'string' ? d.author_name.trim() : ''
  if (!name) return null
  return {
    name,
    title: d.author_title?.trim?.() || '',
    affiliation: d.author_affiliation?.trim?.() || '',
    profile: d.author_profile?.trim?.() || '',
  }
}

/** 一覧の並び順用（新しい順） */
export function contentTime(item) {
  const t = new Date(getContentDateRaw(item)).getTime()
  return Number.isNaN(t) ? 0 : t
}

export function getContentDateRaw(item) {
  // 公開 API に publishedAt は無い（createdAt / updatedAt のみ）
  return item?.data?.notice_date || item?.data?.published_date || item?.data?.date || item?.createdAt || ''
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
  const t = item?.data?.tag_name || item?.data?.tags
  if (!t) return []
  if (Array.isArray(t)) return t.map((s) => String(s).trim()).filter(Boolean)
  return String(t)
    .split(/[,、\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function getContentImageUrls(item) {
  const urls = []
  // 同じ画像がデータ項目（thumbnail / attachment_*）と mediaFiles の両方に入ってくるため、
  // ファイルの場所（署名付き URL のクエリを除いた部分）で重複を除く
  const seen = new Set()
  const add = (raw) => {
    if (!isImageUrl(raw)) return
    const url = resolveMediaUrl(raw)
    const key = String(url).split(/[?#]/)[0]
    if (seen.has(key)) return
    seen.add(key)
    urls.push(url)
  }
  const d = item?.data || {}
  for (const key of ['thumbnail', 'image', 'attachment_1', 'attachment_2', 'attachment_3', 'attachment_4']) add(d[key])
  if (Array.isArray(item?.mediaFiles)) {
    for (const m of item.mediaFiles) add(m?.fileUrl || m?.url)
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
  // 記事の見出し帯・要約・FAQ・著者カードで描画済み（cre-comsence 方式の詳細ページ）
  'category',
  'faq',
  'meta_description',
  'author_name',
  'author_title',
  'author_affiliation',
  'author_profile',
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

/* ───────────── 実績・事例（case_studies） ───────────── */

const text = (v) => (typeof v === 'string' ? v.trim() : '')

/** 見出し帯の下に並べる基本情報 */
export function getCaseFacts(item) {
  const d = item?.data || {}
  const start = text(d.service_start_date) && formatAnyDate(text(d.service_start_date))
  const end = text(d.service_end_date) && formatAnyDate(text(d.service_end_date))
  const period = text(d.project_period_label) || (start || end ? `${start} 〜 ${end}`.trim() : '')
  return [
    { label: 'お客様', value: text(d.client_display_name) || text(d.client) || text(d.client_name) },
    { label: '業種', value: text(d.industry) },
    { label: '地域', value: text(d.location_region) },
    { label: '期間', value: period },
    { label: '規模', value: text(d.project_scale) },
    { label: '使用ツール', value: text(d.tools_and_stack) },
  ].filter((f) => f.value)
}

/** 課題 → 取り組み → 成果 などの本文（空の項目は出さない） */
export function getCaseStory(item) {
  const d = item?.data || {}
  return [
    { title: '課題', body: text(d.body_challenge) || text(d.challenge) },
    { title: '取り組み', body: text(d.body_approach) || text(d.approach) },
    { title: '成果', body: text(d.body_result) || text(d.outcome) },
    { title: '納品物・成果物', body: text(d.deliverables_summary) },
    { title: '体制', body: text(d.stakeholders_roles) },
    { title: '振り返り', body: text(d.lessons_learned) },
  ].filter((s) => s.body)
}

export function getCaseTestimonial(item) {
  const d = item?.data || {}
  const quote = text(d.testimonial_quote) || text(d.testimonial)
  if (!quote) return null
  const name = text(d.testimonial_author_name)
  const title = text(d.testimonial_author_title)
  return { quote, author: [title, name].filter(Boolean).join(' ') }
}

export function getCaseLinks(item) {
  const d = item?.data || {}
  return [
    { label: '関連するサービスを見る', url: text(d.related_service_url) },
    { label: '関連する記事を読む', url: text(d.external_article_url) },
  ].filter((l) => l.url)
}

/** 実績・事例: 上の関数で描画済みの項目は「詳細情報」グリッドから除く */
export const CASE_SKIP_KEYS = [
  ...DEFAULT_MODAL_SKIP_KEYS,
  'case_title',
  'summary_one_line',
  'excerpt',
  'image',
  'attachment_4',
  'tags',
  'date',
  'featured',
  'client',
  'client_name',
  'client_display_name',
  'industry',
  'location_region',
  'project_period_label',
  'service_start_date',
  'service_end_date',
  'project_scale',
  'tools_and_stack',
  'body_challenge',
  'body_approach',
  'body_result',
  'deliverables_summary',
  'stakeholders_roles',
  'lessons_learned',
  'testimonial_quote',
  'testimonial_author_name',
  'testimonial_author_title',
  'related_service_url',
  'external_article_url',
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
