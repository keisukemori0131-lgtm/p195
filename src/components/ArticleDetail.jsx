import { Link } from 'react-router-dom'
import { useContentById } from '../lib/useUpNote.js'
import {
  getContentTitle,
  getContentSubtitle,
  getContentLead,
  getContentBody,
  getContentTags,
  getContentCategory,
  getContentAuthor,
  getContentDescription,
  getContentImageUrls,
  getContentFieldEntries,
  getContentDateRaw,
  formatContentDate,
} from '../lib/upnoteContent.js'
import { parseFaqText, stripEmbeddedFaqSection, stripLeadingSummary } from '../lib/articleContent.js'
import { buildArticleJsonLd } from '../lib/structuredData.js'
import UpnoteFieldValue from './UpnoteFieldValue.jsx'
import DocumentMeta from './DocumentMeta.jsx'
import ErrorMsg from './ErrorMsg.jsx'
import ArticleRichBody from './ArticleRichBody.jsx'
import ArticleFaq from './ArticleFaq.jsx'
import ArticleAuthorCard, { authorPhoto } from './ArticleAuthorCard.jsx'
import MoonOrbit from './MoonOrbit.jsx'
import ArticleCta from './ArticleCta.jsx'
import { SITE, SITE_LABEL, SITE_URL } from '../constants/site.js'

/** 読み込み中・見つからないときの表示枠 */
function StatusBox({ children }) {
  return (
    <section className="section section--article-status">
      <div className="container article-status">{children}</div>
    </section>
  )
}

/**
 * 記事詳細ページの共通実装（R14-3 / R14-3a）。表示方法は cre-comsence.com に合わせる:
 *   01 見出し帯: パンくず → 日付・カテゴリ・タグ → タイトル → サブタイトル → 著者
 *   02 紙面: 画像（切り抜かず全体を表示）→ 要約 → 本文（■見出し・箇条書き・番号付きを構造化）
 *            → 詳細情報（上記以外の全フィールド）→ 一覧へ戻る・日付
 *      紙面の下: よくある質問 → 著者（コラムのみ）
 *   03 導線: コラムのみ、記事の内容に合わせた案内（ArticleCta）
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
        <StatusBox>
          <p className="state-msg">記事を読み込んでいます…</p>
        </StatusBox>
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
        <StatusBox>
          <nav className="breadcrumb" aria-label="パンくず">
            <Link to="/">ホーム</Link>
            <span aria-hidden="true">›</span>
            <Link to={basePath}>{listLabel}</Link>
          </nav>
          <h1 className="article-status__title">記事が見つかりませんでした</h1>
          {notFound ? (
            <p className="state-msg">公開が終了したか、URL が変更された可能性があります。</p>
          ) : (
            <ErrorMsg onRetry={reload} />
          )}
          <p className="article-sheet__back">
            <Link to={basePath} className="btn btn--ghost">
              ← {listLabel}の一覧へ戻る
            </Link>
          </p>
        </StatusBox>
      </>
    )
  }

  const title = getContentTitle(item)
  const subtitle = getContentSubtitle(item)
  const summary = getContentLead(item)
  const faqText = item.data?.faq
  const faqItems = parseFaqText(faqText)
  const rawBody = getContentBody(item)
  const body = stripLeadingSummary(faqText ? stripEmbeddedFaqSection(rawBody) : rawBody, summary)
  const tags = getContentTags(item)
  const category = getContentCategory(item)
  const author = getContentAuthor(item)
  const date = formatContentDate(item)
  const dateRaw = getContentDateRaw(item)
  const images = getContentImageUrls(item)
  const entries = getContentFieldEntries(item)

  const pagePath = `${basePath}/${item.id}`
  const canonical = SITE_URL ? `${SITE_URL}${pagePath}` : null
  const description = getContentDescription(item)

  const articleLd = buildArticleJsonLd({ item, type: jsonLdType, title, image: images[0], canonical, site: SITE })
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL ? `${SITE_URL}/` : undefined },
      { '@type': 'ListItem', position: 2, name: listLabel, item: SITE_URL ? `${SITE_URL}${basePath}` : undefined },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  }
  const faqLd = faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }
    : null

  return (
    <>
      <DocumentMeta
        title={`${title}｜${listLabel}｜${SITE_LABEL}`}
        description={description || `${SITE_LABEL}の${listLabel}です。`}
        ogType="article"
        jsonLd={[articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])]}
      />

      <article className="article">
        {/* 01 見出し帯 */}
        <header className="article-hero space">
          <span className="v-strip article-hero__strip" aria-hidden="true" />
          <MoonOrbit className="article-hero__moon" eager />
          <div className="container article-hero__inner">
            <nav className="breadcrumb breadcrumb--dark" aria-label="パンくず">
              <Link to="/">ホーム</Link>
              <span aria-hidden="true">›</span>
              <Link to={basePath}>{listLabel}</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{title}</span>
            </nav>
            <div className="article-hero__meta">
              {date && <time dateTime={dateRaw}>{date}</time>}
              {category && <span className="tag-chip tag-chip--dark">{category}</span>}
              {tags
                .filter((t) => t !== category)
                .map((t) => (
                  <span key={t} className="tag-chip tag-chip--dark">
                    {t}
                  </span>
                ))}
            </div>
            <h1 className="article-hero__title">{title}</h1>
            {subtitle && <p className="article-hero__subtitle">{subtitle}</p>}
            {author && (
              <p className="article-hero__author">
                {authorPhoto(author) && (
                  <img className="article-hero__avatar" src={authorPhoto(author)} alt="" width={40} height={40} />
                )}
                {author.name}
                {author.title && `（${author.title}）`}
                {author.affiliation && ` / ${author.affiliation}`}
              </p>
            )}
          </div>
        </header>

        {/* 02 紙面 */}
        <section className="section article-body">
          <div className="container">
            <div className="article-sheet">
              {images.length > 0 && (
                <div className="article-sheet__images">
                  {images.map((src, i) => (
                    <figure key={src} className="article-sheet__figure">
                      {/* 全文表示の画像はクロップしない（R5-Safari） */}
                      <img src={src} alt={i === 0 ? title : `${title} の画像 ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
                    </figure>
                  ))}
                </div>
              )}

              {summary && (
                <div className="article-sheet__summary">
                  <span className="article-sheet__summary-label">この記事の要約</span>
                  <p>{summary}</p>
                </div>
              )}

              <ArticleRichBody body={body} />

              {entries.length > 0 && (
                <section className="article-sheet__extra" aria-labelledby="article-extra-title">
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

              <div className="article-sheet__foot">
                <Link to={basePath} className="article-sheet__back-link">
                  <span aria-hidden="true">←</span> {listLabel}の一覧へ戻る
                </Link>
                {date && <time dateTime={dateRaw}>{date}</time>}
              </div>
            </div>
            {faqItems.length > 0 && (
              <div className="article-after">
                <ArticleFaq items={faqItems} />
              </div>
            )}
          </div>
        </section>

        {jsonLdType === 'BlogPosting' && author && (
          <section className="section section--tight article-author-section">
            <div className="container">
              <div className="article-after">
                <ArticleAuthorCard author={author} />
              </div>
            </div>
          </section>
        )}

        {/* 03 導線（コラムのみ・内容に合わせて振り分け） */}
        {jsonLdType === 'BlogPosting' && <ArticleCta item={item} />}
      </article>
    </>
  )
}
