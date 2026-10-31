import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import Hero from '../components/Hero.jsx'
import Logo from '../components/Logo.jsx'
import SectionHead from '../components/SectionHead.jsx'
import HomeContentExcerpt from '../components/HomeContentExcerpt.jsx'
import CtaBand from '../components/CtaBand.jsx'
import RepCard from '../components/RepCard.jsx'
import { USP_CARDS, SITE } from '../constants/site.js'
import { SERVICES, ORBIT_FEATURES } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import { CONTENT_TYPE_FOR, isEnabled } from '../config/upnoteContentTypes.js'
import { EMPTY_MESSAGES } from '../lib/upnote.js'
import { publicUrl } from '../lib/publicUrl.js'

// 名刺裏面の 2 本柱（ADVERTISING AGENCY / FITNESS GYM）で事業をまとめる
const SERVICE_GROUPS = [
  { label: 'ADVERTISING AGENCY', items: SERVICES.filter((s) => s.id !== 'fit') },
  { label: 'FITNESS GYM', items: SERVICES.filter((s) => s.id === 'fit') },
]

// サービス紹介の冒頭に置く「よくある悩み → 解決するサービス」（YAML のターゲット層から）
const PAINS = [
  { text: '求人を出しても、応募が来ない', to: '求人情報コンサル' },
  { text: 'ホームページがない／あっても更新できていない', to: 'REGOLITH ORBIT' },
  { text: '予約や問い合わせの対応に追われている', to: 'REGOLITH ORBIT' },
]

// トップに出す「困りごと → こう変わる」のピックアップ（ORBIT 機能一覧から抜粋）
const ORBIT_PICKS = [
  ORBIT_FEATURES[0].items[0], // LINEからお知らせ投稿
  ORBIT_FEATURES[1].items[0], // 受信箱＋LINE即時通知
  ORBIT_FEATURES[4].items[0], // 採用ページ・Googleしごと検索対応
  ORBIT_FEATURES[3].items[0], // 質問に一言で答えるアクセス分析
]

/** R12: ハブ構成のプレビューセクション（画像 + Eyebrow + 見出し + 説明 + ボタン） */
function Preview({ id, eyebrow, title, children, image, reverse = false, actions }) {
  return (
    <section className={`section preview${reverse ? ' preview--reverse' : ''}`} aria-labelledby={id}>
      <div className="container preview__inner">
        <div className="preview__media reveal">
          <img
            src={publicUrl(image.src)}
            alt={image.alt}
            width={image.w ?? 800}
            height={image.h ?? 600}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="preview__body reveal">
          <span className="eyebrow">{eyebrow}</span>
          <h2 id={id} className="preview__title">
            {title}
          </h2>
          {children}
          <div className="preview__actions">{actions}</div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const newsSlug = CONTENT_TYPE_FOR.news // 'news'
  const columnSlug = CONTENT_TYPE_FOR.blog // 'columns'

  return (
    <>
      <DocumentMeta />
      <Hero />

      {/* R16-3: 選ばれる理由 + ロゴ */}
      <section className="section section--pearl" aria-labelledby="strength-title">
        <span className="ghost-word ghost-word--tl" aria-hidden="true">
          REGOLITH
        </span>
        <div className="container">
          <div className="section-logo reveal">
            <Logo height={128} />
          </div>
          <div className="sec-head sec-head--center reveal">
            <span className="eyebrow">OUR STRENGTH</span>
            <h2 id="strength-title" className="sec-head__title">
              自分たちで試して、効いた方法だけを。
            </h2>
            <p className="sec-head__lead">
              レゴリスは、石狩市でジム「{SITE.gym.name}」を運営し、自らの集客と採用に向き合ってきた会社です。
              そこで効果があった方法を、あなたの会社の求人とホームページに持ち込みます。
            </p>
          </div>
          <div className="usp-grid stagger">
            {USP_CARDS.map((c, i) => (
              <article className="usp-card" key={c.eyebrow}>
                <span className="usp-card__no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="usp-card__eyebrow">{c.eyebrow}</span>
                <h3 className="usp-card__title">{c.title}</h3>
                <p className="usp-card__desc">{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* サービス（名刺裏面の ADVERTISING AGENCY / FITNESS GYM の 2 本柱で並べる） */}
      <Preview
        id="pv-services"
        eyebrow="SERVICES"
        title={
          <>
            人が来ない。問い合わせが来ない。
            <br />
            その悩み、まとめて相談できます。
          </>
        }
        image={{ src: '/images/services/three-stars.svg', w: 800, h: 600, alt: '求人コンサル・REGOLITH ORBIT・101FIT を3つの色ブロックで表した図' }}
        actions={
          <Link to="/services" className="btn btn--primary" onClick={scrollToTop}>
            3つのサービスを詳しく見る
          </Link>
        }
      >
        <ul className="pain-list">
          {PAINS.map((p) => (
            <li key={p.text}>
              <span className="pain-list__text">{p.text}</span>
              <span className="pain-list__to">→ {p.to}</span>
            </li>
          ))}
        </ul>
        {SERVICE_GROUPS.map((g) => (
          <div key={g.label}>
            <span className="star-list__group" lang="en">
              {g.label}
            </span>
            <ul className="star-list">
              {g.items.map((s) => (
                <li key={s.id}>
                  <Link to={`/services#${s.id}`} className={`star-list__item star-list__item--${s.id}`}>
                    <span className="star-list__no">{s.no}</span>
                    <span className="star-list__name">{s.name}</span>
                    {s.sub && <span className="star-list__sub">{s.sub}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Preview>

      {/* REGOLITH ORBIT のピックアップ（困りごと → こう変わる） */}
      <section className="section section--dark" aria-labelledby="pv-orbit">
        <span className="ghost-word ghost-word--br" aria-hidden="true">
          ORBIT
        </span>
        <div className="container">
          <div className="orbit-pick">
            <div className="orbit-pick__head reveal">
              <span className="eyebrow eyebrow--light">REGOLITH ORBIT</span>
              <h2 id="pv-orbit" className="orbit-pick__title">
                ホームページ、
                <br />
                公開してから止まっていませんか。
              </h2>
              <p className="orbit-pick__lead">
                REGOLITH ORBIT は、つくった後の更新・問い合わせ対応・予約・分析まで回し続ける仕組みです。
                パソコンを開く時間がない日でも、LINEから続けられます。
              </p>
              <img
                className="orbit-pick__img"
                src={publicUrl('/images/illustrations/reserve.png')}
                alt="スマートフォンで操作する男性のイラスト"
                width={410}
                height={624}
                loading="lazy"
                decoding="async"
              />
            </div>
            <ul className="change-list stagger">
              {ORBIT_PICKS.map((f) => (
                <li className="change-card" key={f.name}>
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
          <p className="section-actions reveal">
            <Link to="/services#orbit" className="btn btn--light" onClick={scrollToTop}>
              REGOLITH ORBIT でできることを見る
            </Link>
          </p>
        </div>
      </section>

      {/* 会社概要（アクセスは会社概要の下部に統合） */}
      <Preview
        id="pv-company"
        eyebrow="COMPANY"
        title="石狩の会社だから、石狩の採用と集客を知っています。"
        image={{ src: '/images/about/office.svg', w: 800, h: 600, alt: '灰色の月と石狩の地平線、色ブロックを組み合わせた会社のイメージ図' }}
        reverse
        actions={
          <>
            <Link to="/company" className="btn btn--primary" onClick={scrollToTop}>
              レゴリスについて知る
            </Link>
            <Link to="/company#access" className="btn btn--ghost">
              アクセスを見る
            </Link>
          </>
        }
      >
        <p className="preview__text">
          {SITE.address.city}花川に本社を置き、{SITE.serviceArea}の中小企業・店舗を支えています。
          自分たちもこの地域で人を採用し、お客様を集めている当事者です。
          社名の「レゴリス」は、月や惑星の表面を覆う砂のこと。地域の足元から、事業を次の軌道へ押し上げます。
        </p>
        <RepCard className="rep-card--compact" />
      </Preview>

      {/* お知らせ（R14-2: 3 件） */}
      {isEnabled(newsSlug) && (
        <section className="section section--tint" aria-labelledby="pv-news">
          <div className="container">
            <div className="list-head reveal">
              <SectionHead eyebrow="NEWS" title={<span id="pv-news">お知らせ</span>} />
              <Link to="/news" className="btn btn--ghost" onClick={scrollToTop}>
                お知らせをすべて見る
              </Link>
            </div>
            <HomeContentExcerpt slug={newsSlug} basePath="/news" emptyMessage={EMPTY_MESSAGES.news} limit={3} />
          </div>
        </section>
      )}

      {/* コラム */}
      {isEnabled(columnSlug) && (
        <section className="section" aria-labelledby="pv-column">
          <div className="container">
            <div className="list-head reveal">
              <SectionHead
                eyebrow="COLUMN"
                title={<span id="pv-column">コラム</span>}
                lead="求人原稿の書き方から、ホームページの更新まで。明日から試せる採用と集客のヒントです。"
              />
              <Link to="/column" className="btn btn--ghost" onClick={scrollToTop}>
                コラムをすべて読む
              </Link>
            </div>
            <HomeContentExcerpt slug={columnSlug} basePath="/column" emptyMessage={EMPTY_MESSAGES.columns} limit={3} />
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}
