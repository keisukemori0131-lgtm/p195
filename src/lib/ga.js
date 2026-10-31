// GA4（アクセス解析・全新規案件標準）
// VITE_GA_MEASUREMENT_ID が設定されているときのみ gtag.js を読み込む。
// 未設定のローカル・プレビューでは何も送信しない。
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

export function initGa() {
  if (!GA_ID || typeof document === 'undefined') return

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID)
}
