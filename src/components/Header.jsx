import { Fragment, useEffect, useRef, useState } from 'react'
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
  const [dropdown, setDropdown] = useState(null) // 開いているプルダウンの親の to
  const openedByHover = useRef(false)
  const { pathname } = useLocation()

  // ルート遷移でメニューを閉じる
  useEffect(() => {
    setOpen(false)
    setDropdown(null)
  }, [pathname])

  // Esc で閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setDropdown(null)
      }
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
    setDropdown(null)
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
          {MAIN_NAV.map((item) =>
            item.children ? (
              <div
                key={item.to}
                className={`nav-dd${dropdown === item.to ? ' is-open' : ''}`}
                onMouseEnter={() => {
                  openedByHover.current = true
                  setDropdown(item.to)
                }}
                onMouseLeave={() => {
                  openedByHover.current = false
                  setDropdown(null)
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDropdown(null)
                }}
              >
                <NavLink to={item.to} onClick={onNavClick} className={navClass}>
                  {item.label}
                </NavLink>
                <button
                  type="button"
                  className="nav-dd__toggle"
                  aria-label={`${item.label}のメニューを${dropdown === item.to ? '閉じる' : '開く'}`}
                  aria-expanded={dropdown === item.to}
                  aria-controls="nav-dd-menu"
                  onClick={() => {
                    // ホバーで開いた直後のクリック（タッチ端末のタップを含む）では閉じない
                    if (openedByHover.current) {
                      openedByHover.current = false
                      setDropdown(item.to)
                      return
                    }
                    setDropdown((d) => (d === item.to ? null : item.to))
                  }}
                >
                  <Icon name="chevron-down" size={14} strokeWidth={2.2} />
                </button>
                <div id="nav-dd-menu" className="nav-dd__panel">
                  <ul className="nav-dd__menu">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink to={child.to} onClick={onNavClick} className={navClass}>
                          <span className="nav-dd__label">{child.label}</span>
                          <span className="nav-dd__note">{child.note}</span>
                        </NavLink>
                      </li>
                    ))}
                    <li className="nav-dd__all">
                      <Link to={item.to} onClick={onNavClick}>
                        {item.label}の一覧を見る →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} onClick={onNavClick} className={navClass}>
                {item.label}
              </NavLink>
            ),
          )}
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
          <Fragment key={item.to}>
            <NavLink to={item.to} end={Boolean(item.children)} onClick={onNavClick} className={navClass} tabIndex={open ? 0 : -1}>
              {item.label}
            </NavLink>
            {item.children && (
              <ul className="nav-mobile__children">
                {item.children.map((child) => (
                  <li key={child.to}>
                    <NavLink to={child.to} onClick={onNavClick} className={navClass} tabIndex={open ? 0 : -1}>
                      {child.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </Fragment>
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
