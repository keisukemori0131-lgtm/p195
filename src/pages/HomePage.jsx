import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import Hero from '../components/Hero.jsx'
import Logo from '../components/Logo.jsx'
import SectionHead from '../components/SectionHead.jsx'
import HomeContentExcerpt from '../components/HomeContentExcerpt.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { USP_CARDS, SITE } from '../constants/site.js'
import { SERVICES, ORBIT_FEATURES } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'
import { CONTENT_TYPE_FOR, isEnabled } from '../config/upnoteContentTypes.js'
import { EMPTY_MESSAGES } from '../lib/upnote.js'
import { publicUrl } from '../lib/publicUrl.js'

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
      <section className="section section--strength" aria-labelledby="strength-title">
        <div className="orbit-line orbit-line--a" aria-hidden="true" />
        <div className="container">
          <div className="section-logo reveal">
            <Logo height={128} />
          </div>
          <div className="sec-head sec-head--center reveal">
            <span className="eyebrow">OUR STRENGTH</span>
            <h2 id="strength-title" className="sec-head__title">
              レゴリスが選ばれる理由
            </h2>
            <p className="sec-head__lead">
              私たちは、自らジムを運営し、集客と採用を現場で実践している会社です。
              その経験をもとに、求人コンサルとホームページ制作・運用をセットでお届けします。
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

      {/* サービス（3事業を軌道上の3つの星として） */}
      <Preview
        id="pv-services"
        eyebrow="SERVICES"
        title="3つの事業で、採用と集客を前へ。"
        image={{ src: '/images/services/three-stars.svg', w: 800, h: 600, alt: '求人コンサル・REGOLITH ORBIT・101FIT の3つの星が同じ軌道を回る図' }}
        actions={
          <Link to="/services" className="btn btn--primary" onClick={scrollToTop}>
            サービスを見る
          </Link>
        }
      >
        <p className="preview__text">
          求人原稿で応募の入口をつくり、ホームページで見つけてもらい、自社ジムで方法を確かめる。
          3つの事業は、同じ軌道の上でつながっています。
        </p>
        <ul className="star-list">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <Link to={`/services#${s.id}`} className="star-list__item">
                <span className="star-list__no">{s.no}</span>
                <span className="star-list__name">{s.name}</span>
                {s.sub && <span className="star-list__sub">{s.sub}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </Preview>

      {/* REGOLITH ORBIT のピックアップ（困りごと → こう変わる） */}
      <section className="section section--dark" aria-labelledby="pv-orbit">
        <div className="orbit-line orbit-line--b" aria-hidden="true" />
        <div className="container">
          <div className="orbit-pick">
            <div className="orbit-pick__head reveal">
              <span className="eyebrow eyebrow--light">REGOLITH ORBIT</span>
              <h2 id="pv-orbit" className="orbit-pick__title">
                つくって終わりにしない、
                <br />
                回り続けるホームページ。
              </h2>
              <p className="orbit-pick__lead">
                更新・問い合わせ・予約・解析・集客・リピートまで。公開後の「困った」を、仕組みで変えていきます。
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
            <Link to="/services#orbit" className="btn btn--primary" onClick={scrollToTop}>
              REGOLITH ORBIT の機能一覧を見る
            </Link>
          </p>
        </div>
      </section>

      {/* 会社概要（アクセスは会社概要の下部に統合） */}
      <Preview
        id="pv-company"
        eyebrow="COMPANY"
        title="石狩から、地域の推進力に。"
        image={{ src: '/images/about/office.svg', w: 800, h: 600, alt: '石狩の地平線の上を軌道線が横切る会社のイメージ図' }}
        reverse
        actions={
          <>
            <Link to="/company" className="btn btn--primary" onClick={scrollToTop}>
              会社概要を見る
            </Link>
            <Link to="/company#access" className="btn btn--ghost">
              アクセスを見る
            </Link>
          </>
        }
      >
        <p className="preview__text">
          社名の「レゴリス」は、月や惑星の表面を覆う砂のこと。
          {SITE.address.city}を拠点に、{SITE.serviceArea}の中小企業・店舗の足元から、
          事業を次の軌道へ押し上げる推進力をつくります。
        </p>
      </Preview>

      {/* お知らせ（R14-2: 3 件） */}
      {isEnabled(newsSlug) && (
        <section className="section section--tint" aria-labelledby="pv-news">
          <div className="container">
            <div className="list-head reveal">
              <SectionHead eyebrow="NEWS" title={<span id="pv-news">お知らせ</span>} />
              <Link to="/news" className="btn btn--ghost" onClick={scrollToTop}>
                お知らせ一覧へ
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
                lead="採用・集客・ホームページ運用に役立つヒントをお届けします。"
              />
              <Link to="/column" className="btn btn--ghost" onClick={scrollToTop}>
                コラム一覧へ
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
