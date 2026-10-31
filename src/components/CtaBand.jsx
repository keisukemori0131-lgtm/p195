import { Link } from 'react-router-dom'
import { SITE, PHONE_DISPLAY, PHONE_TEL } from '../constants/site.js'
import { scrollToTop } from '../constants/nav.js'

// 最終 CTA バンド（R12 #4）。名刺裏面の構成（黒地・透かし社名・欧文セリフ）に合わせる。
// 文言: 悩みに寄り添う見出し → 相談のハードルを下げる一文 → 何が得られるかが分かるボタン
export default function CtaBand() {
  return (
    <section className="cta-band reveal" aria-labelledby="cta-band-title">
      <span className="color-strip" aria-hidden="true" />
      <span className="ghost-word ghost-word--tl" aria-hidden="true">
        REGOLITH
      </span>
      <div className="container cta-band__inner">
        <p className="cta-band__tag serif-tag" lang="en">
          {SITE.slogan}
        </p>
        <h2 id="cta-band-title" className="cta-band__title">
          人が来ない、問い合わせが来ない。
          <br />
          その悩みから、話しましょう。
        </h2>
        <p className="cta-band__text">
          まだ考えがまとまっていなくても大丈夫です。今の状況をお聞きして、最初の一手を一緒に考えます。
        </p>
        <div className="cta-band__actions">
          <Link to="/contact" className="btn btn--light btn--lg" onClick={scrollToTop}>
            フォームで相談する
          </Link>
          <a href={`tel:${PHONE_TEL}`} className="btn btn--outline-light btn--lg">
            電話で相談する {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  )
}
