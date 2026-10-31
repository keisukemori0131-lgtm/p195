import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { FOOTER_NAV, scrollToTop } from '../constants/nav.js'
import { SITE, PHONE_DISPLAY, PHONE_TEL, GYM_SNS } from '../constants/site.js'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-footer__orbit" aria-hidden="true" />
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" onClick={scrollToTop} aria-label={`${SITE.name} トップへ`}>
            <Logo showName height={44} />
          </Link>
          <p className="site-footer__tagline">{SITE.tagline}</p>
          <address className="site-footer__address">
            {SITE.address.full}
            <br />
            TEL <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
          </address>
        </div>

        <nav className="site-footer__nav" aria-label="フッターナビ">
          <p className="site-footer__heading">MENU</p>
          <ul>
            {FOOTER_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={item.to.includes('#') ? undefined : scrollToTop}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__links">
          <p className="site-footer__heading">OUR SERVICES</p>
          <ul>
            <li>
              <a href={SITE.orbit.url} target="_blank" rel="noopener noreferrer">
                {SITE.orbit.name}（ホームページ制作・運用）
              </a>
            </li>
            <li>
              <a href={SITE.gym.url} target="_blank" rel="noopener noreferrer">
                {SITE.gym.name}（パーソナル＋24時間ジム）
              </a>
            </li>
            {GYM_SNS.map((s) => (
              <li key={s.key}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="site-footer__copy">
        <small>© {year} {SITE.name}</small>
      </p>
    </footer>
  )
}
