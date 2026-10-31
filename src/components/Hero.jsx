import { useEffect, useState } from 'react'
import { publicUrl } from '../lib/publicUrl.js'
import { SITE } from '../constants/site.js'

// R16-2: トップのフルブリード・ヒーロー（生成 SVG のスライドショー + 中央大見出し）
// 名刺のデザイン: パール地・灰色の月・両端の色ブロック（色ブロックはスマホで切れないよう CSS で固定）
const SLIDES = [
  { src: '/images/hero/slide-1.svg', alt: 'パールの地に灰色の月が浮かぶグラフィック' },
  { src: '/images/hero/slide-2.svg', alt: '白い板張りの壁に赤・黄・緑・青の色ブロックを並べたグラフィック' },
  { src: '/images/hero/slide-3.svg', alt: '黒い縦帯と REGOLITH・101FIT の透かし文字を配したグラフィック' },
]
const INTERVAL_MS = 6000

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 登場アニメ（1 行目 → 2 行目 → 区切り線 → サブ）。reduced-motion は CSS 側で即時表示
    const t = window.setTimeout(() => setReady(true), 80)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const timer = reduced ? null : window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS)
    return () => {
      window.clearTimeout(t)
      if (timer) window.clearInterval(timer)
    }
  }, [])

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__slides">
        {SLIDES.map((s, i) => (
          <img
            key={s.src}
            className={`hero__scrim-slide${i === index ? ' is-active' : ''}`}
            src={publicUrl(s.src)}
            alt={i === 0 ? s.alt : ''}
            aria-hidden={i === 0 ? undefined : 'true'}
            width={1600}
            height={900}
            decoding="async"
            loading="eager"
            fetchpriority={i === 0 ? 'high' : 'low'}
          />
        ))}
        <span className="hero__shade" aria-hidden="true" />
      </div>
      <span className="hero__edge hero__edge--l" aria-hidden="true" />
      <span className="hero__edge hero__edge--r" aria-hidden="true" />

      <div className="hero__inner">
        <div className={`hero__content${ready ? ' is-ready' : ''}`}>
          <h1 className="hero__title" id="hero-title">
            <span className="hero__line hero__line--lead">事業を、</span>
            <span className="hero__line hero__line--main">次の軌道へ。</span>
          </h1>
          <span className="hero__divider" aria-hidden="true" />
          <p className="hero__sub">
            <span className="hero__sub-line">採用・集客・健康づくり。</span>
            <span className="hero__sub-line">石狩から、地域の会社と人の推進力をつくります。</span>
          </p>
          <p className="hero__tag serif-tag" lang="en">
            {SITE.slogan}
          </p>
          <p className="visually-hidden">{SITE.name}</p>
        </div>
      </div>

      <span className="hero__scroll" aria-hidden="true">
        SCROLL
      </span>
    </section>
  )
}
