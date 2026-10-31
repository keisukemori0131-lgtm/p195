import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MoonOrbit from './MoonOrbit.jsx'
import Icon from './Icon.jsx'
import Twinkle from './Twinkle.jsx'
import { SITE } from '../constants/site.js'
import { scrollToTop } from '../constants/nav.js'

// トップのファーストビュー（リデザイン 2026-10）
// 濃紺の宇宙 + 左端に名刺の色ブロックの縦帯 + 右に灰色の月と軌道（REGOLITH = 月の砂 / ORBIT = 軌道）
const TITLE_LINES = ['事業を、', '次の軌道へ。']

/** 見出しを 1 文字ずつ下から浮かび上がらせる（読み上げは h1 の aria-label で 1 回だけ） */
function SplitLine({ text, offset }) {
  return (
    <span className="hero__line" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span className="hero__char" key={i} style={{ '--i': offset + i }}>
          {ch}
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const [ready, setReady] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    // 登場アニメ（見出し → サブ → ボタン）。reduced-motion は CSS 側で即時表示
    const t = window.setTimeout(() => setReady(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  // マウスの位置に合わせて、月と星をわずかに逆方向へずらす（奥行き）。
  // マウスのある端末だけ・動きを減らす設定では無効。transform だけを変えるので再レイアウトは起きない
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fine = window.matchMedia?.('(pointer: fine)').matches
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return
    let frame = 0
    const onMove = (e) => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const r = el.getBoundingClientRect()
        el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
        el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="hero space" aria-labelledby="hero-title" ref={ref}>
      <Twinkle count={34} seed={11} shooting />
      <span className="v-strip hero__strip" aria-hidden="true" />
      <div className="container hero__inner">
        <div className={`hero__content${ready ? ' is-ready' : ''}`}>
          <h1 className="hero__title" id="hero-title" aria-label={TITLE_LINES.join('')}>
            <SplitLine text={TITLE_LINES[0]} offset={0} />
            <SplitLine text={TITLE_LINES[1]} offset={TITLE_LINES[0].length} />
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
