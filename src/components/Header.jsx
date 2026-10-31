import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import { MAIN_NAV, CTA_NAV, scrollToTop } from '../constants/nav.js'
import { SITE_LABEL } from '../constants/site.js'

/**
 * 白地の固定ヘッダー（リデザイン 2026-10）。ヒーローが濃紺になったため透過はしない。
 */
export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // ルート遷移でメニューを閉じる
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Esc で閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // 開いている間は body スクロールロック
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ページの読み進み具合（名刺の色ブロックの帯がヘッダーの下で伸びる）
  const progressRef = useRef(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  const onNavClick = () => {
    setOpen(false)
    scrollToTop()
  }

  const navClass = ({ isActive }) => (isActive ? 'is-active' : undefined)

  return (
    <header className="site-header">
      <span className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <div className="container site-header__inner">
        <Link to="/" className="brand" aria-label={`${SITE_LABEL} トップへ`} onClick={onNavClick}>
          <Logo showName height={40} />
        </Link>

        <nav className="nav-desktop" aria-label="グローバルナビ">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={onNavClick} className={navClass}>
              {item.label}
            </NavLink>
          ))}
          <Link to={CTA_NAV.to} className="btn btn--nav-cta" onClick={onNavClick}>
            {CTA_NAV.label}
            <Icon name="arrow-right" size={16} />
          </Link>
        </nav>

        <button
          type="button"
          className={`nav-toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </div>

      <div className={`nav-overlay${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <nav id="mobile-nav" className={`nav-mobile${open ? ' is-open' : ''}`} aria-label="モバイルナビ" aria-hidden={!open}>
        <NavLink to="/" end onClick={onNavClick} className={navClass} tabIndex={open ? 0 : -1}>
          ホーム
        </NavLink>
        {MAIN_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onNavClick} className={navClass} tabIndex={open ? 0 : -1}>
            {item.label}
          </NavLink>
        ))}
        <Link to="/company#access" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          アクセス
        </Link>
        <Link to={CTA_NAV.to} className="btn btn--nav-cta" onClick={onNavClick} tabIndex={open ? 0 : -1}>
          {CTA_NAV.label}
        </Link>
      </nav>
    </header>
  )
}
