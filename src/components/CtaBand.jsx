import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Twinkle from './Twinkle.jsx'
import { PHONE_DISPLAY, PHONE_TEL } from '../constants/site.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'

// 最終 CTA バンド（R12 #4）。濃紺の宇宙 + 左下に大きな月（リデザイン 2026-10）。
// 文言: 悩みに寄り添う見出し → 相談のハードルを下げる一文 → 何が得られるかが分かるボタン
export default function CtaBand() {
  return (
    <section className="cta-band space reveal" aria-labelledby="cta-band-title">
      <Twinkle count={20} seed={37} />
      <img className="cta-band__moon" src={publicUrl('/images/brand/moon.webp')} alt="" aria-hidden="true" width={800} height={800} loading="lazy" decoding="async" />
      <div className="container cta-band__inner">
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
            <Icon name="mail" size={20} />
            フォームで相談する
            <Icon name="arrow-right" size={16} />
          </Link>
          <a href={`tel:${PHONE_TEL}`} className="btn btn--outline-light btn--lg">
            <Icon name="phone" size={20} />
            <span className="cta-band__tel-label">電話で相談する</span>
            <span className="cta-band__tel-num">{PHONE_DISPLAY}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
