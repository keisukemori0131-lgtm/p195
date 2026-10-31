import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ScrollReveal from './ScrollReveal.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import BackToTop from './BackToTop.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  // 初回表示ではフェードしない（SSG HTML に opacity:0 が乗るのを防ぐ）
  const skipEnter = useRef(true)
  useEffect(() => {
    skipEnter.current = false
  }, [])

  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        本文へスキップ
      </a>
      <Header />
      {/* key にパスを渡し、クライアント遷移のときだけフェードインし直す */}
      <main id="main" key={pathname} className={skipEnter.current ? undefined : 'page-enter'}>
        <Suspense fallback={<div className="route-loading">読み込み中…</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {/* R16-5: グローバル スクロールリビール（.reveal 要素を IO で監視） */}
      <ScrollReveal />
      <BackToTop />
    </>
  )
}
