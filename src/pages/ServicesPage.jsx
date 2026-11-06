import { useState } from 'react'
import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import Icon from '../components/Icon.jsx'
import { SERVICES, ORBIT_FEATURES, SERVICE_ICONS, FEATURE_ICONS } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'

// 求人情報コンサルの 3 項目に添えるアイコン（points と同じ順）
const POINT_ICONS = ['file', 'refresh', 'users']
// 機能カードのアイコンの色（分類ごと）
const FEATURE_TONES = ['green', 'blue', 'yellow', 'red', 'navy', 'green', 'blue']

/** 1 事業のブロック（大きな番号 + 名前 → キャッチ → 説明 / 画像。左右は交互） */
function ServiceBlock({ s, reverse, tint, body, children }) {
  return (
    <section
      id={s.id}
      className={`section service-block${reverse ? ' service-block--reverse' : ''}${tint ? ' section--pearl' : ''}`}
      aria-labelledby={`${s.id}-title`}
    >
      <div className="container">
        <div className="service-block__inner">
          <div className="service-block__body reveal">
            <span className="eyebrow" lang="en">
              {s.eyebrow}
            </span>
            <div className="service-block__head">
              <span className="service-block__no" aria-hidden="true">
                {s.no}
              </span>
              <h2 id={`${s.id}-title`} className="service-block__title">
                {s.name}
                {s.sub && <span className="service-block__sub">{s.sub}</span>}
              </h2>
            </div>
            <p className="service-block__catch">{s.catch}</p>
            <p className="service-block__summary">{s.summary}</p>
            {body}
          </div>
          <div className="service-block__media reveal">
            <img src={publicUrl(s.cover.src)} alt={s.cover.alt} width={800} height={600} loading="lazy" decoding="async" />
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
            {c.label}
          </button>
        ))}
      </div>
      {ORBIT_FEATURES.map((c, i) => (
        <div
          key={c.key}
          id={`panel-${c.key}`}
          role="tabpanel"
          aria-labelledby={`tab-${c.key}`}
          className="feature-tabs__panel"
          hidden={c.key !== current.key}
        >
          <p className="feature-tabs__lead">{c.lead}</p>
          <ul className="change-list">
            {c.items.map((f) => (
              <li className="change-card" key={f.name}>
                <p className="change-card__name">
                  <span className={`icon-badge icon-badge--${FEATURE_TONES[i]}`}>
                    <Icon name={FEATURE_ICONS[c.key]} size={17} />
                  </span>
                  <Link to={`/services/orbit/${f.slug}`} onClick={scrollToTop}>
                    {f.name}
                  </Link>
                </p>
                <p className="change-card__pain">
                  <span className="visually-hidden">困りごと：</span>
                  {f.pain}
                </p>
                <Icon name="arrow-down" size={18} className="change-card__arrow" />
                <p className="change-card__gain">
                  <span className="visually-hidden">こう変わる：</span>
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
      <PageHero title="サービス" eyebrow="SERVICES" />

      <section className="section section--pearl section--intro">
        <div className="container">
          <SectionHead
            eyebrow="SERVICES"
            title={
              <>
                採用に困ったら。集客に困ったら。
                <br />
                まずはレゴリスへ。
              </>
            }
            lead="求人原稿で応募の入口をつくる。ホームページで見つけてもらい、問い合わせと予約を逃さない。その方法は、自社ジムで確かめたものです。3つの事業がつながっているから、採用と集客をまとめて前に進められます。"
          />
          <nav className="service-index stagger" aria-label="サービス一覧">
            {SERVICES.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="service-index__item accent-card">
                <span className="usp-card__top service-index__top">
                  <span className="usp-card__no" lang="en">
                    {s.no}
                  </span>
                  <Icon name={SERVICE_ICONS[s.id]} size={38} strokeWidth={1.4} />
                </span>
                <span className="service-index__name">{s.name}</span>
                <span className="service-index__catch">{s.catch}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <ServiceBlock
        s={recruit}
        body={
          <Link to="/services/recruit" className="btn btn--navy" onClick={scrollToTop}>
            求人情報コンサルの詳細を見る
            <Icon name="arrow-right" size={16} />
          </Link>
        }
      >
        <div className="point-grid stagger">
          {recruit.points.map((p, i) => (
            <div className="point-card accent-card" key={p.title}>
              <Icon name={POINT_ICONS[i]} size={28} strokeWidth={1.5} />
              <div>
                <h3 className="point-card__title">{p.title}</h3>
                <p className="point-card__text">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="service-note reveal">
          原稿を整えても、求職者の目に入らなければ応募は来ません。REGOLITH ORBIT の採用ページとGoogleしごと検索への掲載を組み合わせれば、
          求人づくりから掲載までをまとめてご相談いただけます。
        </p>
      </ServiceBlock>

      <ServiceBlock
        s={orbit}
        reverse
        tint
        body={
          <div className="btn-row">
            <Link to="/services/orbit" className="btn btn--navy" onClick={scrollToTop}>
              {orbit.name} の詳細を見る
              <Icon name="arrow-right" size={16} />
            </Link>
            <a href={orbit.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              公式サイト
              <Icon name="arrow-right" size={16} />
            </a>
          </div>
        }
      >
        <OrbitFeatures />
      </ServiceBlock>

      <ServiceBlock
        s={fit}
        body={
          <>
            <p className="service-block__summary">ここで試して効果があった集客と採用の方法を、求人コンサルと REGOLITH ORBIT のご提案に生かしています。</p>
            <p className="service-block__address">
              <Icon name="pin" size={18} />
              所在地: {fit.address}
            </p>
            <div className="btn-row">
              <Link to="/services/fit" className="btn btn--navy" onClick={scrollToTop}>
                {fit.name} の詳細を見る
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link to="/company#access" className="btn btn--ghost">
                アクセスを見る
              </Link>
              <a href={fit.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                {fit.name} 公式サイト
                <Icon name="arrow-right" size={16} />
              </a>
            </div>
          </>
        }
      />

      <section className="section section--pearl section--tight">
        <div className="container center-text reveal">
          <p className="big-text">
            どのサービスが合うか分からなくても大丈夫です。
            <br />
            今の困りごとをそのまま聞かせてください。
          </p>
          <Link to="/contact" className="btn btn--primary" onClick={scrollToTop}>
            困りごとを相談する
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
