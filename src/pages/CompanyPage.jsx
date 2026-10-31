import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import RepCard from '../components/RepCard.jsx'
import { SITE, PHONE_DISPLAY, PHONE_TEL, MAP_EMBED_URL, MAP_LINK_URL, GYM_SNS } from '../constants/site.js'
import { publicUrl } from '../lib/publicUrl.js'

// 会社概要。郵便番号・オフィス・FAX・代表者のローマ字表記は代表の名刺より。
// 設立年・公開用メールは未確定のため行ごと出さない（R2・HANDOFF 参照）
const PROFILE_ROWS = [
  { label: '商号', value: SITE.name },
  {
    label: '代表者',
    value: (
      <>
        {SITE.representative.title}　{SITE.representative.name}
        <span className="profile-table__roman" lang="en">
          {SITE.representative.nameRoman}
        </span>
      </>
    ),
  },
  {
    label: '本社',
    value: (
      <>
        〒{SITE.address.postal}
        <br />
        {SITE.address.full}
      </>
    ),
  },
  {
    label: 'オフィス',
    value: (
      <>
        〒{SITE.office.postal}
        <br />
        {SITE.office.full}
      </>
    ),
  },
  {
    label: '電話番号',
    value: <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>,
  },
  { label: 'FAX', value: SITE.fax },
  {
    label: '事業内容',
    value: (
      <ul className="plain-list">
        {SITE.businesses.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    ),
  },
  {
    label: '運営施設',
    value: (
      <>
        {SITE.gym.kind}「{SITE.gym.name}」
        <br />
        {SITE.gym.address}
      </>
    ),
  },
  { label: '法人番号', value: SITE.corporateNumber },
]

export default function CompanyPage() {
  const { search, hash } = useLocation()

  // /access（旧URL・ブックマーク）→ /company?section=access、または #access でアクセスへスクロール
  useEffect(() => {
    const wantsAccess = hash === '#access' || new URLSearchParams(search).get('section') === 'access'
    if (!wantsAccess) return
    const t = window.setTimeout(() => {
      document.getElementById('access')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => window.clearTimeout(t)
  }, [search, hash])

  return (
    <>
      <DocumentMeta />
      <PageHero title="会社概要・アクセス" image="/images/company/cover.svg" alt="パールの地に月と色ブロックを配した会社概要のカバーイメージ" />

      {/* 社名の由来・ブランド */}
      <section className="section" aria-labelledby="origin-title">
        <div className="container split">
          <div className="split__body reveal">
            <span className="eyebrow">ABOUT US</span>
            <h2 id="origin-title" className="sec-head__title">
              月面の砂から、次の軌道へ。
            </h2>
            <p>
              社名の「レゴリス」は、月や惑星の表面を覆う砂のこと。サービス名の「ORBIT」は軌道を意味します。
            </p>
            <p>
              私たちは{SITE.address.city}を拠点に、{SITE.serviceArea}の中小企業・店舗の採用と集客を支えています。
              自らジム「{SITE.gym.name}」を運営し、集客と採用を現場で実践しているからこそ、
              「自社で試して効果があった方法」をもとにご提案できます。
            </p>
            <p>採用・集客・健康づくり。地域の会社と人の推進力をつくることが、私たちの仕事です。</p>
            <RepCard />
          </div>
          <div className="split__media reveal">
            <img
              src={publicUrl('/images/about/philosophy.svg')}
              alt="名刺と同じ色ブロックと灰色の月で構成した REGOLITH のブランドイメージ"
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* 会社概要 */}
      <section className="section section--tint" aria-labelledby="profile-title">
        <div className="container narrow">
          <SectionHead eyebrow="COMPANY PROFILE" title={<span id="profile-title">会社概要</span>} />
          <dl className="profile-table reveal">
            {PROFILE_ROWS.map((r) => (
              <div className="profile-table__row" key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* アクセス（独立ページにせず会社概要の最下部に統合・2026-05 確定） */}
      <section id="access" className="section access" aria-labelledby="access-title">
        <img
          className="access__deco"
          src={publicUrl('/images/access/map-deco.svg')}
          alt=""
          aria-hidden="true"
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
        />
        <div className="container">
          <SectionHead eyebrow="ACCESS" title={<span id="access-title">アクセス</span>} />
          <div className="access__grid">
            <div className="access__info reveal">
              <h3 className="access__name">{SITE.name}</h3>
              <p>〒{SITE.address.postal} {SITE.address.full}</p>
              <p>
                TEL <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              </p>
              <p>
                <a href={MAP_LINK_URL} target="_blank" rel="noopener noreferrer" className="text-link">
                  Google マップで開く
                </a>
              </p>

              <h3 className="access__name access__name--sub">
                {SITE.gym.kind}「{SITE.gym.name}」
              </h3>
              <p>{SITE.gym.address}</p>
              <ul className="inline-links">
                <li>
                  <a href={SITE.gym.url} target="_blank" rel="noopener noreferrer" className="text-link">
                    101FIT 公式サイト
                  </a>
                </li>
                {GYM_SNS.map((s) => (
                  <li key={s.key}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="access__map reveal">
              <iframe
                title={`${SITE.name} 所在地の地図`}
                src={MAP_EMBED_URL}
                width="600"
                height="420"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
