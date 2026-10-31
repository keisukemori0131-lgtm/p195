import { Link } from 'react-router-dom'
import { useContentById } from '../lib/useUpNote.js'
import {
  getContentTitle,
  getContentSubtitle,
  getContentLead,
  getContentBody,
  getContentTags,
  getContentThumb,
  getContentImageUrls,
  getContentFieldEntries,
  formatContentDate,
  isHtml,
} from '../lib/upnoteContent.js'
import { buildArticleJsonLd } from '../lib/structuredData.js'
import UpnoteFieldValue from './UpnoteFieldValue.jsx'
import DocumentMeta from './DocumentMeta.jsx'
import ErrorMsg from './ErrorMsg.jsx'
import { SITE, SITE_LABEL, SITE_URL } from '../constants/site.js'

const stripHtml = (html) => String(html).replace(/<[^>]*>/g, '').trim()

/** TEXT 型（改行 \n のプレーンテキスト）を段落に組み直す。HTML ならそのまま整形表示 */
function Body({ body }) {
  if (!body) return null
  if (isHtml(body)) {
    // UpNote 管理画面で入力された HTML（信頼済みソース）を整形表示する
    return <div className="article-detail__body" dangerouslySetInnerHTML={{ __html: body }} />
  }
  return (
    <div className="article-detail__body">
      {String(body)
        .split(/\n{2,}/)
        .map((para, i) => (
          <p key={i}>
            {para.split('\n').map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
    </div>
  )
}

/**
 * 記事詳細ページの共通実装（R14-3 / R14-3a）。
 * 構成順: パンくず → メタ（日付・タグ）→ タイトル → サブタイトル → ヒーロー画像 → 本文
 *        → ギャラリー → 「詳細情報」カードグリッド → 一覧へ戻る
 * @param {string|number} id   記事 ID（useParams 由来）
 * @param {string} basePath    一覧のパス（例 '/news'）
 * @param {string} listLabel   一覧の名称（例 'お知らせ'）
 * @param {string} jsonLdType  'NewsArticle' | 'BlogPosting'
 */
export default function ArticleDetail({ id, basePath, listLabel, jsonLdType = 'NewsArticle' }) {
  const { data: item, error, loading, reload } = useContentById(id)

  const notFound = error && (error.errorCode === 'NOT_FOUND' || error.status === 404)

  if (loading && !item) {
    return (
      <>
        <DocumentMeta title={`${listLabel}｜${SITE_LABEL}`} description={`${SITE_LABEL}の${listLabel}`} noindex />
        <section className="section section--article">
          <div className="container">
            <p className="state-msg">読み込み中…</p>
          </div>
        </section>
      </>
    )
  }

  if (!item) {
    return (
      <>
        <DocumentMeta
          title={`記事が見つかりませんでした｜${SITE_LABEL}`}
          description="お探しの記事は公開が終了したか、URL が変更された可能性があります。"
          noindex
        />
        <section className="section section--article">
          <div className="container article-detail">
            <nav className="breadcrumb" aria-label="パンくず">
              <Link to="/">ホーム</Link>
              <span aria-hidden="true">›</span>
              <Link to={basePath}>{listLabel}</Link>
            </nav>
            <h1 className="article-detail__title">記事が見つかりませんでした</h1>
            {notFound ? (
              <p className="state-msg">公開が終了したか、URL が変更された可能性があります。</p>
            ) : (
              <ErrorMsg onRetry={reload} />
            )}
            <p className="article-detail__back">
              <Link to={basePath} className="btn btn--ghost">
                ← {listLabel}一覧へ戻る
              </Link>
            </p>
          </div>
        </section>
      </>
    )
  }

  const title = getContentTitle(item)
  const subtitle = getContentSubtitle(item)
  const lead = getContentLead(item)
  const body = getContentBody(item)
  const tags = getContentTags(item)
  const date = formatContentDate(item)
  const hero = getContentThumb(item)
  const gallery = getContentImageUrls(item).filter((u) => u !== hero)
  const entries = getContentFieldEntries(item)

  const pagePath = `${basePath}/${item.id}`
  const canonical = SITE_URL ? `${SITE_URL}${pagePath}` : null
  const description = (lead || stripHtml(body)).slice(0, 120)

  const articleLd = buildArticleJsonLd({ item, type: jsonLdType, title, image: hero, canonical, site: SITE })
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL ? `${SITE_URL}/` : undefined },
      { '@type': 'ListItem', position: 2, name: listLabel, item: SITE_URL ? `${SITE_URL}${basePath}` : undefined },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  }

  return (
    <>
      <DocumentMeta
        title={`${title}｜${listLabel}｜${SITE_LABEL}`}
        description={description || `${SITE_LABEL}の${listLabel}です。`}
        ogType="article"
        jsonLd={[articleLd, breadcrumbLd]}
      />

      <article className="section section--article">
        <div className="container article-detail">
          <nav className="breadcrumb" aria-label="パンくず">
            <Link to="/">ホーム</Link>
            <span aria-hidden="true">›</span>
            <Link to={basePath}>{listLabel}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{title}</span>
          </nav>

          <header className="article-detail__header">
            <p className="article-detail__kicker">{listLabel}</p>
            <div className="article-detail__meta">
              {date && <span className="article-detail__date">{date}</span>}
              {tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="article-detail__title">{title}</h1>
            {subtitle && <p className="article-detail__subtitle">{subtitle}</p>}
          </header>

          {hero && (
            <div className="article-detail__hero">
              <img src={hero} alt={title} loading="eager" decoding="async" />
            </div>
          )}

          {lead && <p className="article-detail__lead">{lead}</p>}
          <Body body={body} />

          {gallery.length > 0 && (
            <div className="article-detail__gallery">
              {gallery.map((src) => (
                <img key={src} src={src} alt={`${title} の添付画像`} loading="lazy" decoding="async" />
              ))}
            </div>
          )}

          {entries.length > 0 && (
            <section className="article-detail__extra" aria-labelledby="article-extra-title">
              <h2 id="article-extra-title">詳細情報</h2>
              <div className="detail-grid">
                {entries.map(({ key, label, value }) => (
                  <div className="detail-item" key={key}>
                    <p className="detail-item__label">{label}</p>
                    <div className="detail-item__value">
                      <UpnoteFieldValue value={value} label={label} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="article-detail__back">
            <Link to={basePath} className="btn btn--ghost">
              ← {listLabel}一覧へ戻る
            </Link>
          </p>
        </div>
      </article>
    </>
  )
}
