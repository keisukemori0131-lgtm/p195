import { Link } from 'react-router-dom'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import CtaBand from '../components/CtaBand.jsx'
import Icon from '../components/Icon.jsx'
import ServiceLinks from '../components/ServiceLinks.jsx'
import { SERVICES } from '../constants/services.js'
import { GYM_SNS } from '../constants/site.js'
import { publicUrl } from '../lib/publicUrl.js'

const CRUMBS = [{ to: '/services', label: 'サービス' }]

// 101FIT の詳細。営業時間・料金などは公式サイトが正のため、ここには確かな事実だけを書く
export default function ServiceFitPage() {
  const s = SERVICES.find((x) => x.id === 'fit')

  return (
    <>
      <DocumentMeta />
      <PageHero title={s.name} eyebrow="FITNESS GYM" crumbs={CRUMBS} />

      <section className="section" aria-labelledby="fit-intro-title">
        <div className="container">
          <div className="detail-intro">
            <div className="detail-intro__body reveal">
              <span className="eyebrow" lang="en">
                {s.eyebrow}
              </span>
              <h2 id="fit-intro-title" className="detail-intro__title">
                {s.catch}
              </h2>
              <p className="detail-intro__lead">{s.summary}</p>
              <p className="service-block__address">
                <Icon name="pin" size={18} />
                所在地: {s.address}
              </p>
              <div className="btn-row">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  {s.name} 公式サイト
                  <Icon name="arrow-right" size={16} />
                </a>
                <Link to="/company#access" className="btn btn--ghost">
                  アクセスを見る
                </Link>
              </div>
              {GYM_SNS.length > 0 && (
                <ul className="note-chips note-chips--links">
                  {GYM_SNS.map((sns) => (
                    <li key={sns.key}>
                      <a href={sns.url} target="_blank" rel="noopener noreferrer">
                        {sns.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="detail-intro__media reveal">
              <img src={publicUrl(s.cover.src)} alt={s.cover.alt} width={800} height={600} decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--pearl section--tight">
        <div className="container">
          <div className="reveal">
            <SectionHead
              eyebrow="FROM THE FIELD"
              title="ジムで試した方法を、お客様の提案へ。"
              lead="ここで試して効果があった集客と採用の方法を、求人コンサルと REGOLITH ORBIT のご提案に生かしています。営業時間や料金は公式サイトでご確認ください。"
            />
          </div>
        </div>
      </section>

      <ServiceLinks current="fit" />
      <CtaBand />
    </>
  )
}
