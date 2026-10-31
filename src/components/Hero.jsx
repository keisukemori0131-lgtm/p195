import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MoonOrbit from './MoonOrbit.jsx'
import Icon from './Icon.jsx'
import { SITE } from '../constants/site.js'
import { scrollToTop } from '../constants/nav.js'

// トップのファーストビュー（リデザイン 2026-10）
// 濃紺の宇宙 + 左端に名刺の色ブロックの縦帯 + 右に灰色の月と軌道（REGOLITH = 月の砂 / ORBIT = 軌道）
export default function Hero() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 登場アニメ（見出し → サブ → ボタン）。reduced-motion は CSS 側で即時表示
    const t = window.setTimeout(() => setReady(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section className="hero space" aria-labelledby="hero-title">
      <span className="v-strip hero__strip" aria-hidden="true" />
      <div className="container hero__inner">
        <div className={`hero__content${ready ? ' is-ready' : ''}`}>
          <h1 className="hero__title" id="hero-title">
            <span className="hero__line">事業を、</span>
            <span className="hero__line">次の軌道へ。</span>
          </h1>
          <p className="hero__sub">
            <span className="hero__sub-line">採用・集客・健康づくり。</span>
            <span className="hero__sub-line">石狩から、地域の会社と人の推進力をつくります。</span>
          </p>
          <div className="hero__actions">
            <Link to="/services" className="btn btn--light" onClick={scrollToTop}>
              サービスを見る
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link to="/contact" className="btn btn--outline-light" onClick={scrollToTop}>
              相談する
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <p className="hero__tag serif-tag" lang="en">
            {SITE.slogan}
          </p>
          <p className="visually-hidden">{SITE.name}</p>
        </div>
        <MoonOrbit className="hero__moon" eager />
      </div>
      <p className="hero__side" lang="en" aria-hidden="true">
        <span>REGOLITH Inc.</span>
        <span className="hero__side-rule" />
        <span>RECRUIT</span>
        <span>WEB</span>
        <span>HEALTH</span>
        <span>ISHIKARI</span>
      </p>
    </section>
  )
}
