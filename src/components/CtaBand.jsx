import { Link } from 'react-router-dom'
import { PHONE_DISPLAY, PHONE_TEL } from '../constants/site.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'

// 最終 CTA バンド（R12 #4）。タイトル + 1 文 + フォーム / 電話への明確なボタン
export default function CtaBand() {
  return (
    <section className="cta-band reveal" aria-labelledby="cta-band-title">
      <img
        className="cta-band__deco"
        src={publicUrl('/images/nav/contact.svg')}
        alt=""
        aria-hidden="true"
        width={1600}
        height={600}
        loading="lazy"
        decoding="async"
      />
      <div className="container cta-band__inner">
        <span className="eyebrow eyebrow--light">CONTACT</span>
        <h2 id="cta-band-title" className="cta-band__title">
          採用・集客の「次の一手」を、いっしょに。
        </h2>
        <p className="cta-band__text">求人のこと、ホームページのこと、まだ考えがまとまっていない段階でもご相談ください。</p>
        <div className="cta-band__actions">
          <Link to="/contact" className="btn btn--primary btn--lg" onClick={scrollToTop}>
            フォームで問い合わせる
          </Link>
          <a href={`tel:${PHONE_TEL}`} className="btn btn--outline-light btn--lg">
            電話する {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  )
}
