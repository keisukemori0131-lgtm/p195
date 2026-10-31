import { SITE_LABEL } from './site.js'
import ROUTES from './site-routes.json'

// ルートごとの title / description / label の単一ソースは site-routes.json
// （sitemap / llms.txt / ルート別プリレンダ HTML も同じ JSON から生成される）
export const DEFAULT_DESCRIPTION = ROUTES.find((r) => r.path === '/').description

// 各ルートで固有の title / description（全ページ固有・R4）
export const PAGE_SEO = Object.fromEntries(
  ROUTES.map((r) => [r.path, { title: r.title, description: r.description, label: r.label }]),
)

export const NOT_FOUND_SEO = {
  title: `ページが見つかりません｜${SITE_LABEL}`,
  description: 'お探しのページは見つかりませんでした。URLをご確認いただくか、トップページからお進みください。',
}
