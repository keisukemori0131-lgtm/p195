import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import { NOT_FOUND_SEO } from '../constants/seo.js'
import { scrollToTop } from '../constants/nav.js'

// 404（R7・納品チェック【3】）。ヘッダーは透過しない（R16-1）
export default function NotFoundPage() {
  return (
    <>
      <DocumentMeta title={NOT_FOUND_SEO.title} description={NOT_FOUND_SEO.description} noindex />
      <section className="section section--notfound">
        <div className="container center-text">
          <p className="notfound__code" aria-hidden="true">
            404
          </p>
          <h1 className="sec-head__title">ページが見つかりません</h1>
          <p>お探しのページは移動または削除された可能性があります。URLをご確認ください。</p>
          <p className="section-actions">
            <Link to="/" className="btn btn--primary" onClick={scrollToTop}>
              トップページへ
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
