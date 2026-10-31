import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// R16-5: グローバルなスクロールリビール。
// main 内の .reveal / .stagger を監視し、表示域に入ったら .is-visible を付与する。
//
// 表示判定は 2 系統を併用する:
//   1) IntersectionObserver（通常はこちらで発火）
//   2) スクロール／リサイズ時の矩形チェック（IO が動かない環境の保険）
// 「アニメーションのために本文が永久に見えない」事故だけは避けたいので、
// さらに一定時間後に残っている要素は無条件で表示する。
// prefers-reduced-motion: reduce では即時表示。
const FAILSAFE_MS = 2500

export default function ScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const main = document.getElementById('main') || document.body
    const SELECTOR = '.reveal:not(.is-visible), .stagger:not(.is-visible)'

    let revealedAny = false
    const show = (el) => {
      revealedAny = true
      el.classList.add('is-visible')
    }

    // .stagger の直下要素に順番（--reveal-i）を振る。CSS 側で transition-delay に使う
    const applyStagger = (root) => {
      root.querySelectorAll('.stagger:not([data-staggered])').forEach((group) => {
        group.setAttribute('data-staggered', '')
        Array.from(group.children).forEach((child, i) => {
          child.style.setProperty('--reveal-i', String(i))
        })
      })
    }

    if (reduced || typeof IntersectionObserver === 'undefined') {
      const revealAll = () => {
        applyStagger(main)
        main.querySelectorAll(SELECTOR).forEach(show)
      }
      revealAll()
      const mo = new MutationObserver(revealAll)
      mo.observe(main, { childList: true, subtree: true })
      return () => mo.disconnect()
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    // 保険: 画面内に入っている要素を矩形で判定する（IO が発火しない環境向け）
    let raf = 0
    const checkByRect = () => {
      raf = 0
      const vh = window.innerHeight || document.documentElement.clientHeight
      main.querySelectorAll(SELECTOR).forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < vh - 40 && r.bottom > 0) {
          show(el)
          io.unobserve(el)
        }
      })
    }
    const queueCheck = () => {
      if (!raf) raf = window.requestAnimationFrame(checkByRect)
    }

    // IO.observe は同じ要素を再 observe しても no-op なので dedup フラグは持たない。
    // （Strict Mode で effect cleanup → 新 IO 構築 のときに古いフラグが残って
    //   新 IO が observe しない事故を回避）
    const scan = () => {
      applyStagger(main)
      main.querySelectorAll(SELECTOR).forEach((el) => io.observe(el))
      queueCheck()
    }

    scan()
    const mo = new MutationObserver(scan)
    mo.observe(main, { childList: true, subtree: true })

    window.addEventListener('scroll', queueCheck, { passive: true })
    window.addEventListener('resize', queueCheck)

    // 最終保険: 一定時間経っても 1 つも表示されていない＝仕組みが動いていないので全部出す。
    // （1 つでも表示できていれば正常に動作しているため、通常のスクロール表示に任せる）
    const failsafe = window.setTimeout(() => {
      if (!revealedAny) main.querySelectorAll(SELECTOR).forEach(show)
    }, FAILSAFE_MS)

    return () => {
      io.disconnect()
      mo.disconnect()
      if (raf) window.cancelAnimationFrame(raf)
      window.clearTimeout(failsafe)
      window.removeEventListener('scroll', queueCheck)
      window.removeEventListener('resize', queueCheck)
    }
  // Layout の main は pathname を key にしてルート遷移ごとに作り直される。
  // 遷移後の新しい main を監視するため、pathname 変更時に Observer も再接続する。
  }, [pathname])

  return null
}
