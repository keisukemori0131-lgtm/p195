// グローバルナビ — ヘッダーとフッターメニューの単一の正（R16-1）
// アクセスは独立ページにせず会社概要（/company#access）に統合する
export const MAIN_NAV = [
  { label: 'サービス', to: '/services' },
  { label: '会社概要', to: '/company' },
  { label: 'お知らせ', to: '/news' },
  { label: 'コラム', to: '/column' },
]

// ヘッダーの CTA
export const CTA_NAV = { label: 'お問い合わせ', to: '/contact' }

// フッター用（ホームを含めた一覧）
export const FOOTER_NAV = [
  { label: 'ホーム', to: '/' },
  ...MAIN_NAV,
  { label: 'アクセス', to: '/company#access' },
  CTA_NAV,
]

// ナビリンク・ロゴ・CTA クリック時のスクロール（同一ルートでも先頭へ・R16-1）
export function scrollToTop() {
  if (typeof window === 'undefined') return
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
