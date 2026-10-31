import { useEffect, useState } from 'react'
import { scrollToTop } from '../constants/nav.js'

const SHOW_AFTER_PX = 640

/** 一定量スクロールしたら現れる「ページ先頭へ」ボタン */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let raf = 0
    const update = () => {
      raf = 0
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="ページ先頭へ戻る"
      tabIndex={visible ? 0 : -1}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
