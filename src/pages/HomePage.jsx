import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import Hero from '../components/Hero.jsx'
import Icon from '../components/Icon.jsx'
import HomeContentExcerpt from '../components/HomeContentExcerpt.jsx'
import CtaBand from '../components/CtaBand.jsx'
import RepCard from '../components/RepCard.jsx'
import { USP_CARDS, SITE } from '../constants/site.js'
import { SERVICES, ORBIT_FEATURES, SERVICE_ICONS } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import { CONTENT_TYPE_FOR, isEnabled } from '../config/upnoteContentTypes.js'
import { EMPTY_MESSAGES } from '../lib/upnote.js'
import { publicUrl } from '../lib/publicUrl.js'

// 名刺裏面の 2 本柱（ADVERTISING AGENCY / FITNESS GYM）で事業をまとめる
const SERVICE_GROUPS = [
  { label: 'ADVERTISING AGENCY', items: SERVICES.filter((s) => s.id !== 'fit') },
  { label: 'FITNESS GYM', items: SERVICES.filter((s) => s.id === 'fit') },
]

// 選ばれる理由のカードのアイコン（USP_CARDS と同じ順）
const USP_ICONS = ['handshake', 'monitor', 'users']

// サービス紹介の冒頭に置く「よくある悩み → 解決するサービス」（YAML のターゲット層から）
const PAINS = [
  { text: '求人を出しても、応募が来ない', to: '求人情報コンサル', icon: 'user' },
  { text: 'ホームページがない／あっても更新できていない', to: 'REGOLITH ORBIT', icon: 'monitor' },
  { text: '予約や問い合わせの対応に追われている', to: 'REGOLITH ORBIT', icon: 'phone' },
]

// トップに出す「困りごと → こう変わる」のピックアップ（ORBIT 機能一覧から抜粋）
const ORBIT_PICKS = [
  { ...ORBIT_FEATURES[0].items[0], icon: 'file', tone: 'green' }, // LINEからお知らせ投稿
  { ...ORBIT_FEATURES[1].items[0], icon: 'message', tone: 'blue' }, // 受信箱＋LINE即時通知
  { ...ORBIT_FEATURES[4].items[0], icon: 'users', tone: 'yellow' }, // 採用ページ・Googleしごと検索対応
  { ...ORBIT_FEATURES[3].items[0], icon: 'chart', tone: 'red' }, // 質問に一言で答えるアクセス分析
]

/** 欧文ラベル（左に置き、右に短い線） */
function Eyebrow({ children, light = false }) {
  return (
    <span className={`eyebrow${light ? ' eyebrow--light' : ''}`} lang="en">
      {children}
    </span>
  )
}

export default function HomePage() {
  const newsSlug = CONTENT_TYPE_FOR.news // 'news'
  const columnSlug = CONTENT_TYPE_FOR.blog // 'columns'

  return (
    <>
      <DocumentMeta />
      <Hero />

      {/* R16-3: 選ばれる理由 */}
      <section className="section section--pearl" aria-labelledby="strength-title">
        <div className="container">
          <div className="head-split reveal">
            <div>
              <Eyebrow>OUR STRENGTH</Eyebrow>
              <h2 id="strength-title" className="sec-head__title">
                自分たちで試して、効いた方法だけを。
              </h2>
            </div>
            <p className="head-split__lead">
              レゴリスは、石狩市でジム「{SITE.gym.name}」を運営し、自らの集客と採用に向き合ってきた会社です。
              そこで効果があった方法を、あなたの会社の求人とホームページに持ち込みます。
            </p>
          </div>
          <div className="usp-grid stagger">
            {USP_CARDS.map((c, i) => {
              const [no, en] = c.eyebrow.split(' / ')
              return (
                <article className="usp-card accent-card" key={c.eyebrow}>
                  <div className="usp-card__top">
                    <span className="usp-card__no" lang="en">
                      {no}
                      <span className="usp-card__en">{en}</span>
                    </span>
                    <Icon name={USP_ICONS[i]} size={40} strokeWidth={1.4} className="usp-card__icon" />
                  </div>
                  <h3 className="usp-card__title">{c.title}</h3>
                  <p className="usp-card__desc">{c.desc}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* サービス（名刺裏面の ADVERTISING AGENCY / FITNESS GYM の 2 本柱で並べる） */}
      <section className="section" aria-labelledby="pv-services">
        <div className="container">
          <div className="services-head">
            <div className="reveal">
              <Eyebrow>SERVICES</Eyebrow>
              <h2 id="pv-services" className="sec-head__title">
                人が来ない。問い合わせが来ない。
                <br />
                その悩み、まとめて相談できます。
              </h2>
              <p className="services-head__action">
                <Link to="/services" className="text-arrow" onClick={scrollToTop}>
                  3つのサービスを詳しく見る
                  <Icon name="arrow-right" size={16} />
                </Link>
              </p>
            </div>
            <div className="pain-box reveal">
              <p className="pain-box__label">よくある悩み</p>
              <ul className="pain-box__list">
                {PAINS.map((p) => (
                  <li key={p.text}>
                    <Icon name={p.icon} size={22} />
                    <span>
                      <span className="pain-box__text">{p.text}</span>
                      <span className="pain-box__to">→ {p.to}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="service-groups">
            {SERVICE_GROUPS.map((g) => (
              <div className={`service-group service-group--${g.items.length}`} key={g.label}>
                <p className="service-group__label" lang="en">
                  {g.label}
                </p>
                <ul className="service-group__cards stagger">
                  {g.items.map((s) => (
                    <li key={s.id}>
                      <Link to={`/services#${s.id}`} className="svc-card">
                        <span className="svc-card__media">
                          <img src={publicUrl(s.cover.src)} alt="" width={800} height={600} loading="lazy" decoding="async" />
                        </span>
                        <span className="svc-card__body">
                          <Icon name={SERVICE_ICONS[s.id]} size={34} strokeWidth={1.4} className="svc-card__icon" />
                          <span className="svc-card__text">
                            <span className="svc-card__name">{s.name}</span>
                            {s.sub && <span className="svc-card__sub">{s.sub}</span>}
                            <span className="svc-card__catch">{s.catch}</span>
                          </span>
                          <span className="circle-arrow" aria-hidden="true">
                            <Icon name="chevron-right" size={16} />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGOLITH ORBIT のピックアップ（困りごと → こう変わる） */}
      <section className="section section--night" aria-labelledby="pv-orbit">
        <div className="container orbit-pick">
          <div className="orbit-pick__head reveal">
            <Eyebrow light>REGOLITH ORBIT</Eyebrow>
            <h2 id="pv-orbit" className="orbit-pick__title">
              ホームページ、
              <br />
              公開してから止まっていませんか。
            </h2>
            <p className="orbit-pick__lead">
              REGOLITH ORBIT は、つくった後の更新・問い合わせ対応・予約・分析まで回し続ける仕組みです。
              パソコンを開く時間がない日でも、LINEから続けられます。
            </p>
            <Link to="/services#orbit" className="btn btn--outline-light" onClick={scrollToTop}>
              REGOLITH ORBIT でできることを見る
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <ul className="orbit-tiles stagger">
            {ORBIT_PICKS.map((f) => (
              <li className="orbit-tile" key={f.name}>
                <span className={`icon-badge icon-badge--${f.tone}`}>
                  <Icon name={f.icon} size={26} />
                </span>
                <span className="orbit-tile__body">
                  <span className="orbit-tile__name">{f.name}</span>
                  <span className="orbit-tile__pain">困りごと：{f.pain}</span>
                  <span className="orbit-tile__gain">→ {f.gain}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 会社概要（アクセスは会社概要の下部に統合） */}
      <section className="section section--pearl" aria-labelledby="pv-company">
        <div className="container about-split">
          <div className="about-split__body reveal">
            <Eyebrow>COMPANY</Eyebrow>
            <h2 id="pv-company" className="sec-head__title">
              石狩の会社だから、
              <br />
              石狩の採用と集客を知っています。
            </h2>
            <p className="about-split__text">
              {SITE.address.city}花川に本社を置き、{SITE.serviceArea}の中小企業・店舗を支えています。
              自分たちもこの地域で人を採用し、お客様を集めている当事者です。
              社名の「レゴリス」は、月や惑星の表面を覆う砂のこと。地域の足元から、事業を次の軌道へ押し上げます。
            </p>
            <RepCard className="rep-card--compact" />
            <div className="btn-row">
              <Link to="/company" className="btn btn--primary" onClick={scrollToTop}>
                レゴリスについて知る
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link to="/company#access" className="btn btn--ghost">
                アクセスを見る
              </Link>
            </div>
          </div>
          <div className="about-split__media reveal">
            <img
              src={publicUrl('/images/about/ishikari-night.svg')}
              alt="石狩湾の夜。灯台の立つ海岸の上に、軌道を描く灰色の月が浮かぶイメージ図"
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* お知らせ（R14-2: 3 件）＋ コラム */}
      {(isEnabled(newsSlug) || isEnabled(columnSlug)) && (
        <section className="section section--tight" aria-label="お知らせとコラム">
          <div className="container updates">
            {isEnabled(newsSlug) && (
              <div className="updates__col updates__col--news reveal">
                <div className="updates__head">
                  <h2 className="updates__title" id="pv-news">
                    <span className="mini-strip" aria-hidden="true" />
                    お知らせ
                  </h2>
                  <Link to="/news" className="text-arrow" onClick={scrollToTop}>
                    お知らせをすべて見る
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
                <HomeContentExcerpt slug={newsSlug} basePath="/news" emptyMessage={EMPTY_MESSAGES.news} limit={3} variant="list" />
              </div>
            )}
            {isEnabled(columnSlug) && (
              <div className="updates__col reveal">
                <div className="updates__head">
                  <h2 className="updates__title" id="pv-column">
                    <span className="mini-strip" aria-hidden="true" />
                    コラム
                  </h2>
                  <Link to="/column" className="text-arrow" onClick={scrollToTop}>
                    コラムをすべて読む
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
                <p className="updates__lead">求人原稿の書き方から、ホームページの更新まで。明日から試せる採用と集客のヒントです。</p>
                <HomeContentExcerpt slug={columnSlug} basePath="/column" emptyMessage={EMPTY_MESSAGES.columns} limit={3} />
              </div>
            )}
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}
