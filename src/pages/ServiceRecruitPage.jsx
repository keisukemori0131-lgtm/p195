import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import Icon from '../components/Icon.jsx'
import ArticleFaq from '../components/ArticleFaq.jsx'
import ServiceLinks from '../components/ServiceLinks.jsx'
import { SERVICES } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import { publicUrl } from '../lib/publicUrl.js'
import {
  RECRUIT_PAINS,
  RECRUIT_CAUSES,
  RECRUIT_MENU,
  RECRUIT_EXAMPLE,
  RECRUIT_FLOW,
  RECRUIT_REASONS,
  RECRUIT_FAQ,
} from '../constants/recruitDetail.js'

const CRUMBS = [{ to: '/services', label: 'サービス' }]

// 求人情報コンサルの詳細（★ 文言は仮。src/constants/recruitDetail.js）
export default function ServiceRecruitPage() {
  const s = SERVICES.find((x) => x.id === 'recruit')

  return (
    <>
      <DocumentMeta />
      <PageHero title={s.name} eyebrow="RECRUIT CONSULTING" crumbs={CRUMBS} />

      <section className="section" aria-labelledby="recruit-intro-title">
        <div className="container">
          <div className="detail-intro">
            <div className="detail-intro__body reveal">
              <span className="eyebrow" lang="en">
                {s.eyebrow}
              </span>
              <h2 id="recruit-intro-title" className="detail-intro__title">
                {s.catch}
              </h2>
              <p className="detail-intro__lead">{s.summary}</p>
              <div className="btn-row">
                <Link to="/contact" className="btn btn--primary" onClick={scrollToTop}>
                  採用について相談する
                  <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            </div>
            <div className="detail-intro__media reveal">
              <img src={publicUrl(s.cover.src)} alt={s.cover.alt} width={800} height={600} decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--pearl">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="PROBLEM" title="こんなお悩みはありませんか。" />
          </div>
          <ul className="check-grid stagger">
            {RECRUIT_PAINS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal">
            <SectionHead
              eyebrow="WHY NO APPLICANTS"
              title="応募が来ない求人には、理由があります。"
              lead="条件が悪いから応募が来ない、とは限りません。多くの場合、読んだ人に「ここで働く自分」が見えていません。"
            />
          </div>
          <div className="point-grid stagger">
            {RECRUIT_CAUSES.map((c, i) => (
              <div className="point-card accent-card" key={c.title}>
                <span className="num-mark" lang="en" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="point-card__title">{c.title}</h3>
                  <p className="point-card__text">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--pearl">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="WHAT WE DO" title="私たちがお手伝いすること" lead="求人原稿を書くだけではなく、その前の整理と、その後の流れまで一緒に進めます。" />
          </div>
          <div className="menu-grid stagger">
            {RECRUIT_MENU.map((m) => (
              <article className="menu-card" key={m.title}>
                <Icon name={m.icon} size={28} strokeWidth={1.5} />
                <h3 className="menu-card__title">{m.title}</h3>
                <p className="menu-card__text">{m.text}</p>
                <ul className="tick-list">
                  {m.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="EXAMPLE" title="原稿は、こう変わります。" />
          </div>
          <div className="before-after reveal">
            <div className="before-after__col">
              <p className="before-after__label">{RECRUIT_EXAMPLE.before.label}</p>
              <p className="before-after__text">{RECRUIT_EXAMPLE.before.text}</p>
            </div>
            <Icon name="chevron-right" size={28} className="before-after__arrow" />
            <div className="before-after__col before-after__col--after">
              <p className="before-after__label">{RECRUIT_EXAMPLE.after.label}</p>
              <p className="before-after__text">{RECRUIT_EXAMPLE.after.text}</p>
            </div>
          </div>
          <p className="fine-note">※ {RECRUIT_EXAMPLE.note}</p>
        </div>
      </section>

      <section className="section section--pearl">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="FLOW" title="ご相談から掲載まで" />
          </div>
          <ol className="flow-steps flow-steps--5 stagger">
            {RECRUIT_FLOW.map((f, i) => (
              <li className="flow-step" key={f.title}>
                <span className="flow-step__no" lang="en" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="flow-step__title">{f.title}</h3>
                <p className="flow-step__text">{f.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="OUR STRENGTH" title="レゴリスに相談する理由" />
          </div>
          <div className="point-grid stagger">
            {RECRUIT_REASONS.map((r) => (
              <div className="point-card accent-card" key={r.title}>
                <Icon name={r.icon} size={28} strokeWidth={1.5} />
                <div>
                  <h3 className="point-card__title">{r.title}</h3>
                  <p className="point-card__text">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="service-note reveal">
            求人を載せる場所も一緒に整えるなら、REGOLITH ORBIT の
            <Link to="/services/orbit/recruit" onClick={scrollToTop}>
              採用ページ・Googleしごと検索
            </Link>
            をご覧ください。
          </p>
        </div>
      </section>

      <section className="section section--pearl section--tight">
        <div className="container container--narrow">
          <ArticleFaq items={RECRUIT_FAQ} />
        </div>
      </section>

      <ServiceLinks current="recruit" />
      <CtaBand />
    </>
  )
}
