import { useState } from 'react'
import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { SERVICES, ORBIT_FEATURES } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'

/** 1 事業のブロック（画像の左右を交互に反転） */
function ServiceBlock({ s, reverse, children }) {
  return (
    <section id={s.id} className={`section service-block${reverse ? ' service-block--reverse' : ''}`} aria-labelledby={`${s.id}-title`}>
      <div className="container">
        <div className="service-block__inner">
          <div className="service-block__media reveal">
            <img src={publicUrl(s.cover.src)} alt={s.cover.alt} width={800} height={600} loading="lazy" decoding="async" />
          </div>
          <div className="service-block__body reveal">
            <span className="service-block__no" aria-hidden="true">
              {s.no}
            </span>
            <span className="eyebrow">{s.eyebrow}</span>
            <h2 id={`${s.id}-title`} className="service-block__title">
              {s.name}
              {s.sub && <span className="service-block__sub">{s.sub}</span>}
            </h2>
            <p className="service-block__catch">{s.catch}</p>
            <p className="service-block__summary">{s.summary}</p>
            {s.url && (
              <p className="service-block__link">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-link">
                  {s.name} 公式サイト
                </a>
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

/** R16-6 / design.style: REGOLITH ORBIT 機能一覧（7分類のタブ。各機能に「困りごと → こう変わる」） */
function OrbitFeatures() {
  const [active, setActive] = useState(ORBIT_FEATURES[0].key)
  const current = ORBIT_FEATURES.find((c) => c.key === active) ?? ORBIT_FEATURES[0]

  const onKeyDown = (e) => {
    const i = ORBIT_FEATURES.findIndex((c) => c.key === active)
    let next = null
    if (e.key === 'ArrowRight') next = (i + 1) % ORBIT_FEATURES.length
    if (e.key === 'ArrowLeft') next = (i - 1 + ORBIT_FEATURES.length) % ORBIT_FEATURES.length
    if (next == null) return
    e.preventDefault()
    setActive(ORBIT_FEATURES[next].key)
    document.getElementById(`tab-${ORBIT_FEATURES[next].key}`)?.focus()
  }

  return (
    <div className="feature-tabs reveal">
      <h3 className="feature-tabs__title">REGOLITH ORBIT の機能一覧</h3>
      <div className="feature-tabs__list" role="tablist" aria-label="機能の分類" onKeyDown={onKeyDown}>
        {ORBIT_FEATURES.map((c) => (
          <button
            key={c.key}
            id={`tab-${c.key}`}
            type="button"
            role="tab"
            aria-selected={c.key === active}
            aria-controls={`panel-${c.key}`}
            tabIndex={c.key === active ? 0 : -1}
            className={`feature-tabs__tab${c.key === active ? ' is-active' : ''}`}
            onClick={() => setActive(c.key)}
          >
            <span className="feature-tabs__en">{c.en}</span>
            {c.label}
          </button>
        ))}
      </div>
      {ORBIT_FEATURES.map((c) => (
        <div
          key={c.key}
          id={`panel-${c.key}`}
          role="tabpanel"
          aria-labelledby={`tab-${c.key}`}
          className="feature-tabs__panel"
          hidden={c.key !== current.key}
        >
          <p className="feature-tabs__lead">{c.lead}</p>
          <ul className="change-list change-list--light">
            {c.items.map((f) => (
              <li className="change-card change-card--light" key={f.name}>
                <p className="change-card__name">{f.name}</p>
                <p className="change-card__pain">
                  <span className="change-card__tag">困りごと</span>
                  {f.pain}
                </p>
                <p className="change-card__gain">
                  <span className="change-card__tag change-card__tag--gain">こう変わる</span>
                  {f.gain}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function ServicesPage() {
  const [recruit, orbit, fit] = SERVICES

  return (
    <>
      <DocumentMeta />
      <PageHero title="サービス" image="/images/services/cover.svg" alt="パールの地に月と色ブロックを配したサービスのカバーイメージ" />

      <section className="section section--intro">
        <div className="container">
          <SectionHead
            eyebrow="SERVICES"
            title="採用に困ったら。集客に困ったら。まずはレゴリスへ。"
            lead="求人原稿で応募の入口をつくる。ホームページで見つけてもらい、問い合わせと予約を逃さない。その方法は、自社ジムで確かめたものです。3つの事業がつながっているから、採用と集客をまとめて前に進められます。"
            center
          />
          <nav className="service-index stagger" aria-label="サービス一覧">
            {SERVICES.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="service-index__item">
                <span className="service-index__no">{s.no}</span>
                <span className="service-index__name">{s.name}</span>
                <span className="service-index__catch">{s.catch}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <ServiceBlock s={recruit}>
        <div className="point-grid stagger">
          {recruit.points.map((p) => (
            <div className="point-card" key={p.title}>
              <h3 className="point-card__title">{p.title}</h3>
              <p className="point-card__text">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="side-note reveal">
          <img
            src={publicUrl(recruit.image.src)}
            alt={recruit.image.alt}
            width={recruit.image.w}
            height={recruit.image.h}
            loading="lazy"
            decoding="async"
          />
          <p>
            原稿を整えても、求職者の目に入らなければ応募は来ません。REGOLITH ORBIT の採用ページとGoogleしごと検索への掲載を組み合わせれば、
            求人づくりから掲載までをまとめてご相談いただけます。
          </p>
        </div>
      </ServiceBlock>

      <div className="service-band">
        <ServiceBlock s={orbit} reverse>
          <div className="orbit-shots reveal">
            <figure className="orbit-shots__item">
              {/* 仮画像（ソコスト26698）: 管理画面のスクリーンショット提供後に差し替え */}
              <img
                src={publicUrl(orbit.image.src)}
                alt={orbit.image.alt}
                width={orbit.image.w}
                height={orbit.image.h}
                loading="lazy"
                decoding="async"
              />
              <figcaption>管理画面</figcaption>
            </figure>
            <figure className="orbit-shots__item">
              {/* 仮画像（ソコスト23562）: スマホ画面のスクリーンショット提供後に差し替え */}
              <img
                src={publicUrl('/images/illustrations/reserve.png')}
                alt="スマートフォンで操作する男性のイラスト"
                width={410}
                height={624}
                loading="lazy"
                decoding="async"
              />
              <figcaption>スマホ・LINE</figcaption>
            </figure>
            <figure className="orbit-shots__item">
              {/* 仮画像（ソコスト9780）: 解析画面のスクリーンショット提供後に差し替え */}
              <img
                src={publicUrl('/images/illustrations/analytics.png')}
                alt="グラフを見ながら分析する人のイラスト"
                width={684}
                height={670}
                loading="lazy"
                decoding="async"
              />
              <figcaption>アクセス解析</figcaption>
            </figure>
          </div>
          <OrbitFeatures />
        </ServiceBlock>
      </div>

      <ServiceBlock s={fit}>
        <div className="side-note reveal">
          {/* 仮画像（ソコスト5131）: 101FIT のトレーニング風景の写真提供後に差し替え */}
          <img src={publicUrl(fit.image.src)} alt={fit.image.alt} width={fit.image.w} height={fit.image.h} loading="lazy" decoding="async" />
          <div>
            <p>
              所在地: {fit.address}
              <br />
              ここで試して効果があった集客と採用の方法を、求人コンサルと REGOLITH ORBIT のご提案に生かしています。
            </p>
            <p className="side-note__actions">
              <Link to="/company#access" className="btn btn--ghost">
                アクセスを見る
              </Link>
            </p>
          </div>
        </div>
      </ServiceBlock>

      <section className="section section--tint">
        <div className="container center-text reveal">
          <img
            className="growth-img"
            src={publicUrl('/images/illustrations/growth.png')}
            alt="右肩上がりのグラフと喜ぶビジネスパーソンのイラスト"
            width={916}
            height={704}
            loading="lazy"
            decoding="async"
          />
          <p className="big-text">どのサービスが合うか分からなくても大丈夫です。今の困りごとをそのまま聞かせてください。</p>
          <p>
            <Link to="/contact" className="btn btn--primary" onClick={scrollToTop}>
              困りごとを相談する
            </Link>
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
