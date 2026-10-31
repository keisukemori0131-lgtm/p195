import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContentList } from '../lib/useUpNote.js'
import {
  getContentTitle,
  getContentLead,
  getContentBody,
  getContentThumb,
  getContentTags,
  formatContentDate,
} from '../lib/upnoteContent.js'
import Pager from './Pager.jsx'
import ErrorMsg from './ErrorMsg.jsx'

const LIMIT = 10 // R14-1: 一覧は 10 件ずつページャ取得

const stripHtml = (html) => String(html).replace(/<[^>]*>/g, '').trim()

/** カードのリード文（lead / summary が無いタイプは本文の先頭を要約として使う） */
export function cardLead(item) {
  const lead = getContentLead(item)
  if (lead) return lead
  const body = stripHtml(getContentBody(item))
  return body ? body.slice(0, 120) : ''
}

export function CardMeta({ item }) {
  const tags = getContentTags(item)
  const date = formatContentDate(item)
  return (
    <span className="content-card__meta">
      {date && <span className="content-card__date">{date}</span>}
      {tags.slice(0, 2).map((t) => (
        <span key={t} className="tag-chip">
          {t}
        </span>
      ))}
    </span>
  )
}

/** サムネイル枠。R5-Safari の absolute 塗りつぶしは index.css 側（.content-card__media img） */
export function CardMedia({ item, title }) {
  const thumb = getContentThumb(item)
  if (thumb) {
    return (
      <span className="content-card__media">
        <img src={thumb} alt={title || '記事画像'} loading="lazy" decoding="async" />
      </span>
    )
  }
  return (
    <span className="content-card__media content-card__media--empty" aria-hidden="true">
      <span>REGOLITH</span>
    </span>
  )
}

// R14-3: カードは概要のみ。押下で個別詳細ページ（/news/:id 等）へ遷移する（モーダル禁止）
export function ContentCard({ item, basePath, showLead = true }) {
  const title = getContentTitle(item)
  const lead = showLead ? cardLead(item) : ''
  return (
    <Link to={`${basePath}/${item.id}`} className="content-card">
      <CardMedia item={item} title={title} />
      <span className="content-card__body">
        <CardMeta item={item} />
        <span className="content-card__title">{title}</span>
        {lead && <span className="content-card__lead">{lead}</span>}
        <span className="content-card__more" aria-hidden="true">
          詳しく見る →
        </span>
      </span>
    </Link>
  )
}

function SkeletonGrid() {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="skeleton-card" key={i} />
      ))}
    </div>
  )
}

/**
 * UpNote 一覧ボード（R14）。カードは概要のみ、押下で個別詳細ページへ。
 * @param {string} slug         contentTypeSlug
 * @param {string} basePath     詳細ページのベースパス（例 '/news'）
 * @param {string} emptyMessage 0 件時のメッセージ
 * @param {(items: Array) => void} [onItems] 取得結果を親へ渡す（ItemList 構造化データ用）
 */
export default function ContentBoard({ slug, basePath, emptyMessage, onItems }) {
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useContentList(slug, { page, limit: LIMIT })

  useEffect(() => {
    if (onItems && data?.items) onItems(data.items)
  }, [data, onItems])

  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const changePage = (p) => {
    setPage(p)
    // R14-1: ページ変更時はリスト先頭へ自動スクロール
    const el = document.getElementById('content-board')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div id="content-board" className="content-board">
      {loading && !data && <SkeletonGrid />}
      {/* エラーは取得済みデータが無いときだけ（R14-5 データ優先） */}
      {!loading && error && !data && <ErrorMsg onRetry={reload} />}
      {data && items.length === 0 && <p className="state-msg">{emptyMessage}</p>}
      {data && items.length > 0 && (
        <>
          <div className="content-grid stagger">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} basePath={basePath} />
            ))}
          </div>
          <Pager current={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}
    </div>
  )
}
