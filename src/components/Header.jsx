import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import { MAIN_NAV, CTA_NAV, scrollToTop } from '../constants/nav.js'
import { SITE_LABEL } from '../constants/site.js'

/**
 * R16-1: トップ（/）のヒーロー帯の上にいる間だけ透過オーバーレイ。
 * サブページ・404 は最上部でも通常表示（2026-07 変更）。
 */
export default function Header() {
  const [open, setOpen] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const { pathname } = useLocation()

  // ルート遷移でメニューを閉じる
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 透過判定: pathname === '/' かつ .hero の高さ内にいる間だけ
  useEffect(() => {
    if (pathname !== '/') {
      setOverlay(false)
      return
    }
    const check = () => {
      const hero = document.querySelector('.hero')
      if (!hero) {
        setOverlay(false)
        return
      }
      setOverlay(window.scrollY < hero.offsetHeight - 1)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    // lazy なページで .hero が後から描画されても再判定する
    const main = document.getElementById('main')
    const mo = main ? new MutationObserver(check) : null
    mo?.observe(main, { childList: true, subtree: true })
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      mo?.disconnect()
    }
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

  const onNavClick = () => {
    setOpen(false)
    scrollToTop()
  }

  const navClass = ({ isActive }) => (isActive ? 'is-active' : undefined)

  return (
    <header className={`site-header${overlay && !open ? ' header--overlay' : ''}`}>
      <span className="color-strip site-header__strip" aria-hidden="true" />
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
