import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE, SITE_LABEL, SITE_URL } from '../constants/site.js'
import { PAGE_SEO, DEFAULT_DESCRIPTION } from '../constants/seo.js'
import { publicUrl } from '../lib/publicUrl.js'
import { buildPageJsonLd } from '../lib/structuredData.js'

// OG 画像: 既定は専用 1200×630 画像（public/og-image.png・scripts/build-brand.mjs で生成）
const OG_IMAGE = import.meta.env.VITE_OG_IMAGE_URL || '/og-image.png'
const SITE_PUBLIC = import.meta.env.VITE_SITE_PUBLIC === '1'
const GSC_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || ''

const MANAGED_ATTR = 'data-doc-meta'

function upsertMeta(attrName, attrValue, content) {
  const head = document.head
  let el = head.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (content == null || content === '') {
    if (el?.hasAttribute(MANAGED_ATTR)) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    el.setAttribute(MANAGED_ATTR, '1')
    head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  const head = document.head
  let el = head.querySelector(`link[rel="${rel}"]`)
  if (!href) {
    if (el?.hasAttribute(MANAGED_ATTR)) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute(MANAGED_ATTR, '1')
    head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(objects) {
  document.querySelectorAll(`script[${MANAGED_ATTR}-jsonld]`).forEach((el) => el.remove())
  for (const obj of objects) {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute(`${MANAGED_ATTR}-jsonld`, '1')
    el.textContent = JSON.stringify(obj)
    document.head.appendChild(el)
  }
}

/**
 * 各ルートの head 設定（R4: ルートごとの document head 設定方式）。
 * title / description 省略時は PAGE_SEO[pathname] から解決する。
 * SSG ではプリレンダ時に scripts/prerender.mjs が同内容を静的 HTML に焼き込み、
 * このコンポーネントはクライアント遷移時の更新を担う。
 */
export default function DocumentMeta({ title, description, ogType = 'website', noindex = false, jsonLd = [] }) {
  const { pathname: rawPath } = useLocation()
  // 末尾スラッシュ付き（/services/）でも同じページとして扱う（canonical はスラッシュ無しに統一）
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath

  const seo = PAGE_SEO[pathname] || {}
  const finalTitle = title || seo.title || PAGE_SEO['/'].title
  const finalDesc = description || seo.description || DEFAULT_DESCRIPTION

  useEffect(() => {
    const canonical = SITE_URL ? `${SITE_URL}${pathname === '/' ? '/' : pathname}` : null
    const robots = noindex || !SITE_PUBLIC ? 'noindex, nofollow' : 'index, follow'
    const ogImage = OG_IMAGE.startsWith('http') ? OG_IMAGE : SITE_URL ? `${SITE_URL}${OG_IMAGE}` : OG_IMAGE

    document.title = finalTitle
    upsertMeta('name', 'description', finalDesc)
    upsertMeta('name', 'robots', robots)
    upsertMeta('name', 'google-site-verification', GSC_VERIFICATION)
    upsertLink('canonical', canonical)
    // favicon は企業ロゴで統一（R4）
    upsertLink('icon', publicUrl('/logo.png'))
    upsertLink('apple-touch-icon', publicUrl('/logo.png'))

    upsertMeta('property', 'og:site_name', SITE_LABEL)
    upsertMeta('property', 'og:locale', 'ja_JP')
    upsertMeta('property', 'og:type', ogType)
    upsertMeta('property', 'og:title', finalTitle)
    upsertMeta('property', 'og:description', finalDesc)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', finalTitle)
    upsertMeta('name', 'twitter:description', finalDesc)

    // WebSite / LocalBusiness / ページ / パンくずの @graph（scripts/prerender.mjs と同じ関数で組み立てる）。
    // 記事詳細は呼び出し側が記事・3 階層パンくずを jsonLd で渡すので、ここではサイトと会社だけ出す。
    const routeSeo = PAGE_SEO[pathname]
    const graph = noindex
      ? []
      : [
          buildPageJsonLd({
            path: routeSeo ? pathname : null,
            title: finalTitle,
            description: finalDesc,
            label: routeSeo?.label,
            crumbs: routeSeo?.crumbs,
            siteUrl: SITE_URL,
            site: SITE,
          }),
        ]

    setJsonLd([...graph, ...jsonLd])
    // jsonLd は呼び出し側で毎レンダー新規オブジェクトになるため JSON 文字列で比較する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTitle, finalDesc, ogType, noindex, pathname, JSON.stringify(jsonLd)])

  return null
}
