import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import MoonOrbit from '../components/MoonOrbit.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { NOT_FOUND_SEO } from '../constants/seo.js'
import { scrollToTop } from '../constants/nav.js'

// 404（R7・納品チェック【3】）。大きな「404」と月・軌道
export default function NotFoundPage() {
  return (
    <>
      <DocumentMeta title={NOT_FOUND_SEO.title} description={NOT_FOUND_SEO.description} noindex />
      <section className="section section--notfound notfound">
        <div className="container center-text">
          <div className="notfound__visual" aria-hidden="true">
            <p className="notfound__code">404</p>
            <MoonOrbit className="notfound__moon" tone="light" eager />
          </div>
          <h1 className="notfound__title">ページが見つかりません</h1>
          <p className="notfound__text">
            お探しのページは移動または削除された可能性があります。
            <br />
            URLをご確認ください。
          </p>
          <div className="btn-row">
            <Link to="/" className="btn btn--primary" onClick={scrollToTop}>
              トップページへ
            </Link>
            <Link to="/contact" className="btn btn--ghost" onClick={scrollToTop}>
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
