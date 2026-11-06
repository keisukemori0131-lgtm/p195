import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import SectionHead from './SectionHead.jsx'
import { SERVICES, SERVICE_ICONS } from '../constants/services.js'
import { scrollToTop } from '../constants/nav.js'

/** サービス詳細の末尾: ほかのサービスへの導線 */
export default function ServiceLinks({ current }) {
  return (
    <section className="section section--tight" aria-labelledby="other-services-title">
      <div className="container">
        <div className="reveal">
          <SectionHead eyebrow="OTHER SERVICES" title={<span id="other-services-title">ほかのサービス</span>} />
        </div>
        <nav className="service-links stagger" aria-label="ほかのサービス">
          {SERVICES.filter((s) => s.id !== current).map((s) => (
            <Link key={s.id} to={`/services/${s.id}`} className="service-links__item accent-card" onClick={scrollToTop}>
              <Icon name={SERVICE_ICONS[s.id]} size={30} strokeWidth={1.5} />
              <span className="service-links__body">
                <span className="service-links__name">{s.name}</span>
                <span className="service-links__catch">{s.catch}</span>
              </span>
              <Icon name="chevron-right" size={20} />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
