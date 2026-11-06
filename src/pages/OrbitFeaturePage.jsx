import { Link, useParams } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import Icon from '../components/Icon.jsx'
import OrbitScreen from '../components/OrbitScreen.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { ORBIT_FEATURE_PAGES, getOrbitFeaturePage } from '../constants/orbitFeaturePages.js'
import { ORBIT_GROUPS } from '../constants/orbit.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'

const CRUMBS = [
  { to: '/services', label: 'サービス' },
  { to: '/services/orbit', label: 'REGOLITH ORBIT' },
]

function NeighborLink({ page, label, dir }) {
  return (
    <Link to={`/services/orbit/${page.slug}`} className={`feature-pager__link feature-pager__link--${dir}`} onClick={scrollToTop}>
      <span className="feature-pager__label">{label}</span>
      <span className="feature-pager__name">
        <span lang="en">{page.code}</span> {page.name}
      </span>
    </Link>
  )
}

// 機能の詳細（内容は cre-comsence.com/upnote/<slug> と同じ。デザインはこのサイトのもの）
export default function OrbitFeaturePage() {
  const { slug } = useParams()
  const page = getOrbitFeaturePage(slug)
  if (!page) return <NotFoundPage />

  const index = ORBIT_FEATURE_PAGES.indexOf(page)
  const total = ORBIT_FEATURE_PAGES.length
  const prev = ORBIT_FEATURE_PAGES[(index - 1 + total) % total]
  const next = ORBIT_FEATURE_PAGES[(index + 1) % total]
  const group = ORBIT_GROUPS.find((g) => g.code === page.code[0])

  return (
    <>
      <DocumentMeta />
      <PageHero title={page.name} eyebrow={`${page.code} / ${group.genre}`} crumbs={CRUMBS} />

      <section className="section" aria-labelledby="feature-intro-title">
        <div className="container">
          <div className="detail-intro">
            <div className="detail-intro__body reveal">
              <ul className="feature-badges">
                <li>{page.priceLabel}</li>
                {page.badge && <li className="is-hot">{page.badge}</li>}
              </ul>
              <h2 id="feature-intro-title" className="detail-intro__title">
                {page.title}
              </h2>
              <p className="detail-intro__lead">{page.lead}</p>
              <div className="btn-row">
                <Link to="/contact" className="btn btn--primary" onClick={scrollToTop}>
                  この機能について相談する
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link to="/services/orbit#features" className="btn btn--ghost">
                  27の機能を一覧で見る
                </Link>
              </div>
            </div>
            <figure className="detail-intro__media detail-intro__media--screen reveal">
              <a href={publicUrl(`/images/orbit/screens/${page.slug}.webp`)} target="_blank" rel="noopener noreferrer" aria-label={`${page.name}の説明画像を元の大きさで開く（新しいタブ）`}>
                <OrbitScreen slug={page.slug} alt={`${page.name}の説明画像`} eager />
              </a>
            </figure>
          </div>
          {page.highlights?.length > 0 && (
            <dl className="feature-highlights stagger">
              {page.highlights.map((h) => (
                <div key={h.label}>
                  <dd>{h.value}</dd>
                  <dt>{h.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="section section--pearl">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="FLOW" title={page.flowTitle} />
          </div>
          <ol className={`flow-steps flow-steps--${page.flow.length} stagger`}>
            {page.flow.map((f, i) => (
              <li className="flow-step" key={f.title}>
                <span className="flow-step__no" lang="en" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="flow-step__title">{f.title}</h3>
                <p className="flow-step__text">{f.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="WHAT YOU CAN DO" title={page.canDoTitle} />
          </div>
          <ul className="check-grid stagger">
            {page.canDo.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--pearl">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="DETAILS" title="もう少しくわしく" />
          </div>
          <div className="feature-details stagger">
            {page.details.map((d) => (
              <article className="feature-detail" key={d.heading}>
                <h3 className="feature-detail__title">{d.heading}</h3>
                {d.body && <p className="feature-detail__text">{d.body}</p>}
                {d.bullets && (
                  <ul className="tick-list">
                    {d.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="feature-notes reveal">
            <h2 className="feature-notes__title">ご利用にあたって</h2>
            <ul className="tick-list">
              {page.pricing.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Link to="/services/orbit#plan" className="text-arrow">
              プランに含まれるものを見る
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--pearl">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="MORE FEATURES" title="REGOLITH ORBIT のほかの機能" lead="27の機能はどれも同じ管理画面の中にあり、追加の契約はいりません。" />
          </div>
          <nav className="feature-pager reveal" aria-label="前後の機能">
            <NeighborLink page={prev} label="← 前の機能" dir="prev" />
            <NeighborLink page={next} label="次の機能 →" dir="next" />
          </nav>
          <div className="feature-index reveal">
            {ORBIT_GROUPS.map((g) => (
              <div key={g.code}>
                <h3 className="feature-index__title">
                  <span lang="en">{g.code}</span> {g.genre}
                </h3>
                <ul>
                  {g.features.map((f) => (
                    <li key={f.slug}>
                      {f.slug === page.slug ? (
                        <span aria-current="page">{f.name}</span>
                      ) : (
                        <Link to={`/services/orbit/${f.slug}`} onClick={scrollToTop}>
                          {f.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
