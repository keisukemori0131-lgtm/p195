import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// ルート遷移時に先頭へスクロール（ハッシュ指定がある場合はその要素へ）。
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, hash])
  return null
}
