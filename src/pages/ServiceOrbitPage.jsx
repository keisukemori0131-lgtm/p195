import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import Icon from '../components/Icon.jsx'
import ArticleFaq from '../components/ArticleFaq.jsx'
import OrbitScreen from '../components/OrbitScreen.jsx'
import ServiceLinks from '../components/ServiceLinks.jsx'
import { SERVICES } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import {
  ORBIT_HERO,
  ORBIT_TRANSFORM,
  ORBIT_ANALYTICS_DEMO,
  ORBIT_ANALYTICS_POINTS,
  ORBIT_GROUPS,
  ORBIT_PLAN_INCLUDES,
  ORBIT_EXTRAS,
  ORBIT_BUNDLE_COMPARE,
  ORBIT_COMPARE_ROWS,
  ORBIT_PRODUCTION,
  ORBIT_FAQ,
} from '../constants/orbit.js'

const CRUMBS = [{ to: '/services', label: 'サービス' }]
const code = (g, i) => `${g.code}-${String(i + 1).padStart(2, '0')}`

function FeatureCard({ g, f, i }) {
  return (
    <Link to={`/services/orbit/${f.slug}`} className="orbit-card" onClick={scrollToTop}>
      <span className="orbit-card__media">
        <OrbitScreen slug={f.slug} alt={`${f.name}の説明画像`} sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 400px" />
      </span>
      <span className="orbit-card__body">
        <span className="orbit-card__code" lang="en">
          {code(g, i)}
          {f.hero && <span className="orbit-card__hot">よく使われる</span>}
        </span>
        <span className="orbit-card__name">{f.name}</span>
        <span className="orbit-card__pain">{f.pain}</span>
        <span className="orbit-card__text">{f.body}</span>
        {f.note && <span className="orbit-card__note">※ {f.note}</span>}
        <span className="content-card__more" aria-hidden="true">
          詳しく見る →
        </span>
      </span>
    </Link>
  )
}

// REGOLITH ORBIT の詳細（内容は cre-comsence.com/web と同じ。src/constants/orbit.js の冒頭コメント参照）
export default function ServiceOrbitPage() {
  const s = SERVICES.find((x) => x.id === 'orbit')

  return (
    <>
      <DocumentMeta />
      <PageHero title={s.name} eyebrow="HOMEPAGE × OPERATION" crumbs={CRUMBS} />

      <section className="section" aria-labelledby="orbit-intro-title">
        <div className="container">
          <div className="detail-intro">
            <div className="detail-intro__body reveal">
              <span className="eyebrow">{ORBIT_HERO.tag}</span>
              <h2 id="orbit-intro-title" className="detail-intro__title">
                {ORBIT_HERO.title[0]}
                <br />
                {ORBIT_HERO.title[1]}
              </h2>
              <p className="detail-intro__lead">{ORBIT_HERO.lead}</p>
              <div className="btn-row">
                <Link to="/contact" className="btn btn--primary" onClick={scrollToTop}>
                  ホームページについて相談する
                  <Icon name="arrow-right" size={16} />
                </Link>
                <a href="#features" className="btn btn--ghost">
                  27の機能を見る
                </a>
              </div>
              <ul className="note-chips">
                {ORBIT_HERO.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
            <div className="detail-intro__media detail-intro__media--screen reveal">
              <OrbitScreen slug="contents" alt="コンテンツ管理の説明画像" eager />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--pearl" id="change">
        <div className="container">
          <div className="reveal">
            <SectionHead
              eyebrow="BEFORE / AFTER"
              title="ホームページが、事業の「仕組み」になる。"
              lead="綺麗なページを作ることが目的ではありません。更新・問い合わせ・予約・分析が自動で回る状態を作ります。違いは、公開した翌日から始まります。"
            />
          </div>
          <div className="transform-list stagger">
            {ORBIT_TRANSFORM.map((t) => (
              <article className="transform-row" key={t.no}>
                <h3 className="transform-row__title">
                  <span lang="en">{t.no}</span>
                  {t.title}
                </h3>
                <p className="transform-row__before">
                  <span>いま</span>
                  {t.before}
                </p>
                <Icon name="chevron-right" size={24} className="transform-row__arrow" />
                <p className="transform-row__after">
                  <span>これから</span>
                  {t.after}
                </p>
              </article>
            ))}
          </div>
          <div className="split orbit-admin reveal">
            <div className="split__body">
              <h3 className="orbit-admin__title">多機能でも、操作はシンプルです。</h3>
              <p>お知らせの追加や内容の変更は、制作会社に頼まず、その場で反映できます。</p>
              <Link to="/services/orbit/platform" className="text-arrow" onClick={scrollToTop}>
                管理画面について詳しく見る
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
            <OrbitScreen slug="platform" alt="管理画面の説明画像" />
          </div>
        </div>
      </section>

      <section className="section" id="analytics">
        <div className="container">
          <div className="reveal">
            <SectionHead
              eyebrow="ANALYTICS"
              title="分析の知識がなくても、ぱっと判る。"
              lead="見出しが質問の形で並び、その下に一言の答えが出ます。「セッション」「直帰率」のような用語は画面に出しません。問い合わせ・予約・電話ボタンのタップが、どこから来た人のどのページで起きたかまで追えます。"
            />
          </div>
          <div className="analytics-demo reveal">
            <p className="analytics-demo__period">{ORBIT_ANALYTICS_DEMO.period}</p>
            <dl className="analytics-demo__numbers">
              {ORBIT_ANALYTICS_DEMO.numbers.map((n) => (
                <div key={n.label}>
                  <dt>{n.label}</dt>
                  <dd>
                    <strong lang="en">{n.value}</strong>
                    <span>{n.diff}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <dl className="analytics-demo__qa">
              {ORBIT_ANALYTICS_DEMO.blocks.map((b) => (
                <div key={b.q}>
                  <dt>{b.q}</dt>
                  <dd>{b.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="fine-note">※ 画面の構成を示す表示例です。数字は架空のものです。</p>
          <div className="point-grid point-grid--4 stagger">
            {ORBIT_ANALYTICS_POINTS.map((p) => (
              <div className="point-card accent-card" key={p.title}>
                <div>
                  <h3 className="point-card__title">{p.title}</h3>
                  <p className="point-card__text">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--pearl" id="features">
        <div className="container">
          <div className="reveal">
            <SectionHead
              eyebrow="INCLUDED FEATURES"
              title="事業を回す27の仕組みが、ぜんぶ入っています。"
              lead="更新・問い合わせ・予約・分析・集客・リピート・基盤の7分野、合計27。すべて同じ管理画面の中にあり、追加の契約はいりません。カードを押すと、各機能の詳しいページへ進めます。"
            />
          </div>
          <nav className="genre-nav reveal" aria-label="機能の分野">
            {ORBIT_GROUPS.map((g) => (
              <a key={g.code} href={`#group-${g.code}`}>
                <span lang="en">{g.code}</span>
                {g.genre}
                <small>×{g.features.length}</small>
              </a>
            ))}
          </nav>
          {ORBIT_GROUPS.map((g) => (
            <section className="orbit-group" id={`group-${g.code}`} key={g.code} aria-labelledby={`group-${g.code}-title`}>
              <h3 id={`group-${g.code}-title`} className="orbit-group__title reveal">
                <span lang="en">{g.code}</span>
                <Icon name={g.icon} size={22} />
                {g.genre}
              </h3>
              <div className="orbit-grid stagger">
                {g.features.map((f, i) => (
                  <FeatureCard key={f.slug} g={g} f={f} i={i} />
                ))}
              </div>
            </section>
          ))}
          <p className="service-note reveal">新しい機能も、追加費用なしで増えていきます。</p>
        </div>
      </section>

      <section className="section" id="plan">
        <div className="container">
          <div className="reveal">
            <SectionHead
              eyebrow="PLAN"
              title="シンプルなワンプラン。買っているのは、公開後の運用です。"
              lead="制作と全機能、ホスティング、SSL、公開後の窓口までを1つのプランにまとめています。料金はお問い合わせください。"
            />
          </div>
          <div className="plan-split reveal">
            <div className="plan-box">
              <h3 className="plan-box__title">プランに含まれるもの</h3>
              <ul className="tick-list">
                {ORBIT_PLAN_INCLUDES.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn--navy" onClick={scrollToTop}>
                料金を問い合わせる
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
            <div className="plan-box plan-box--sub">
              <h3 className="plan-box__title">追加費用がかかるもの</h3>
              <dl className="plan-extras">
                {ORBIT_EXTRAS.map((e) => (
                  <div key={e.name}>
                    <dt>{e.name}</dt>
                    <dd>{e.note}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--pearl" id="compare">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="COMPARE" title="他社と比べると。" lead="「同じことを別々に揃えたら」と「公開後に誰が何をやるか」の2つで並べました。" />
          </div>
          <h3 className="compare-heading reveal">同じことを、別々に揃えると。</h3>
          <div className="table-wrap reveal">
            <table className="compare-table compare-table--bundle">
              <thead>
                <tr>
                  <th scope="col">やりたいこと</th>
                  <th scope="col">別々に揃える場合</th>
                </tr>
              </thead>
              <tbody>
                {ORBIT_BUNDLE_COMPARE.map((r) => (
                  <tr key={r.item}>
                    <th scope="row">{r.item}</th>
                    <td>{r.alt}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">窓口の数</th>
                  <td>
                    別々に契約すると <strong>9つ</strong> ／ REGOLITH ORBIT なら <strong>1つ</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <h3 className="compare-heading reveal">公開後に、誰が何をやるか。</h3>
          <div className="table-wrap reveal">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">比べる点</th>
                  <th scope="col" className="is-ours">
                    REGOLITH ORBIT
                  </th>
                  <th scope="col">一般的な制作会社</th>
                  <th scope="col">テンプレート型</th>
                  <th scope="col">フリーランス</th>
                </tr>
              </thead>
              <tbody>
                {ORBIT_COMPARE_ROWS.map((r) => (
                  <tr key={r.axis}>
                    <th scope="row">{r.axis}</th>
                    <td className="is-ours">{r.ours}</td>
                    <td>{r.agency}</td>
                    <td>{r.template}</td>
                    <td>{r.freelance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fine-note">※ 他社の内容は、コーポレートサイト制作における一般的な目安です。</p>
        </div>
      </section>

      <section className="section" id="production">
        <div className="container">
          <div className="reveal">
            <SectionHead eyebrow="PRODUCTION" title="草案を見てから、決められます。" lead="お客様ごとに一から設計し、コードで組みます。テンプレートもノーコードツールも使いません。" />
          </div>
          <ol className="flow-steps stagger">
            {ORBIT_PRODUCTION.map((p) => (
              <li className="flow-step" key={p.no}>
                <span className="flow-step__no" lang="en" aria-hidden="true">
                  {p.no}
                </span>
                <h3 className="flow-step__title">{p.title}</h3>
                <p className="flow-step__text">{p.body}</p>
              </li>
            ))}
          </ol>
          <div className="section-actions reveal">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              {s.name} 公式サイト
              <Icon name="arrow-right" size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="section section--pearl section--tight">
        <div className="container container--narrow">
          <ArticleFaq items={ORBIT_FAQ} />
        </div>
      </section>

      <ServiceLinks current="orbit" />
      <CtaBand />
    </>
  )
}
