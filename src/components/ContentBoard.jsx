import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContentList } from '../lib/useUpNote.js'
import {
  getContentTitle,
  getContentLead,
  getContentBody,
  getContentThumb,
  getContentTags,
  getContentSubtitle,
  formatContentDate,
  contentTime,
} from '../lib/upnoteContent.js'
import Pager from './Pager.jsx'
import ErrorMsg from './ErrorMsg.jsx'

const LIMIT = 10 // R14-1: 一覧は 10 件ずつページャ取得

const stripHtml = (html) => String(html).replace(/<[^>]*>/g, '').trim()

/** カードのリード文（summary → subtitle → 本文の先頭。cre-comsence.com の newsExcerpt と同じ順） */
export function cardLead(item) {
  const lead = getContentLead(item) || getContentSubtitle(item)
  if (lead) return lead
  const body = stripHtml(getContentBody(item)).replace(/^[■・●▪]\s*/gmu, '').replace(/\s+/g, ' ')
  return body ? body.slice(0, 120) : ''
}

/** 一覧の先頭に大きく出す最新記事（cre-comsence.com の featured カード） */
export function FeaturedCard({ item, basePath }) {
  const title = getContentTitle(item)
  const lead = cardLead(item)
  const hasThumb = Boolean(getContentThumb(item))
  return (
    <Link to={`${basePath}/${item.id}`} className={`featured-card${hasThumb ? '' : ' featured-card--text'}`}>
      {hasThumb && <CardMedia item={item} title={title} />}
      <span className="featured-card__body">
        <span className="content-card__meta">
          <span className="featured-card__latest" lang="en">
            LATEST
          </span>
          <span className="content-card__date">{formatContentDate(item)}</span>
          {getContentTags(item)
            .slice(0, 2)
            .map((t) => (
              <span key={t} className="tag-chip">
                {t}
              </span>
            ))}
        </span>
        <span className="featured-card__title">{title}</span>
        {lead && <span className="featured-card__lead">{lead}</span>}
        <span className="content-card__more" aria-hidden="true">
          続きを読む →
        </span>
      </span>
    </Link>
  )
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
 * 表示方法は cre-comsence.com に合わせる: 件数表示 → 1 ページ目は最新 1 件を大きく →
 * 「過去の○○」として残りをカードで並べる → ページャ
 * @param {string} slug         contentTypeSlug
 * @param {string} basePath     詳細ページのベースパス（例 '/news'）
 * @param {string} listLabel    一覧の名称（例 'お知らせ'）
 * @param {string} emptyMessage 0 件時のメッセージ
 * @param {(items: Array) => void} [onItems] 取得結果を親へ渡す（ItemList 構造化データ用）
 */
export default function ContentBoard({ slug, basePath, listLabel, emptyMessage, onItems }) {
  const [page, setPage] = useState(1)
  const { data, loading, error, reload } = useContentList(slug, { page, limit: LIMIT })

  useEffect(() => {
    if (onItems && data?.items) onItems(data.items)
  }, [data, onItems])

  // ページ内は新しい順に並べる（UpNote の sortOrder が未設定でも日付順になるように）
  const items = [...(data?.items ?? [])].sort((a, b) => contentTime(b) - contentTime(a))
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? items.length
  const isFirstPage = page === 1
  const latest = isFirstPage ? items[0] : null
  const rest = isFirstPage ? items.slice(1) : items

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
          <p className="board-count">
            全<strong>{totalCount}</strong>件
            <span aria-hidden="true" className="board-count__sep" />
            {items.length}件を表示・{page}/{totalPages}ページ
          </p>
          {latest && <FeaturedCard item={latest} basePath={basePath} />}
          {rest.length > 0 && (
            <>
              <h2 className="board-heading">
                {isFirstPage ? `過去の${listLabel}` : `${listLabel}一覧`}
              </h2>
              <div className="content-grid stagger">
                {rest.map((item) => (
                  <ContentCard key={item.id} item={item} basePath={basePath} />
                ))}
              </div>
            </>
          )}
          <Pager current={page} totalPages={totalPages} onChange={changePage} />
        </>
      )}
    </div>
  )
}
