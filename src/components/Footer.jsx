import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { FOOTER_NAV, scrollToTop } from '../constants/nav.js'
import { SITE, PHONE_DISPLAY, PHONE_TEL, GYM_SNS } from '../constants/site.js'

// 白地のフッター（リデザイン 2026-10）: ロゴと所在地 ／ メニュー ／ 外部リンクとコピーライト
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" onClick={scrollToTop} aria-label={`${SITE.name} トップへ`}>
            <Logo showName />
          </Link>
          <p className="site-footer__tagline">{SITE.tagline}</p>
          <address className="site-footer__address">
            〒{SITE.address.postal} {SITE.address.full}
            <br />
            TEL <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>　FAX {SITE.fax}
          </address>
        </div>

        <div className="site-footer__menus">
          <nav aria-label="フッターナビ">
            <ul className="site-footer__nav">
              {FOOTER_NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} onClick={item.to.includes('#') ? undefined : scrollToTop}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="site-footer__links" aria-label="運営サービス">
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
      <div className="container">
        <div className="site-footer__copy">
          <small>© {year} {SITE.name}</small>
          <small className="site-footer__credit" lang="en">
            created by{' '}
            <a href="https://cre-comsence.com/" target="_blank" rel="noopener noreferrer">
              CRE-COMSENCE
            </a>
          </small>
        </div>
      </div>
    </footer>
  )
}
