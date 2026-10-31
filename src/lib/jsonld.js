// 構造化データ（JSON-LD）の組み立て。
// SEO（リッチリザルト）と AIO（AI 検索が事実を抽出しやすくする）の両方を狙う。
// 同じ内容を scripts/prerender.mjs でも静的 HTML に焼き込む（そちらが正・JS を実行しない
// クローラー向け）。ここはクライアント遷移時に head を更新するためのもの。
import { getContentTitle, getContentBody } from './upnoteContent.js'

const stripHtml = (html) => String(html ?? '').replace(/<[^>]*>/g, '').trim()

/**
 * FAQPage（よくあるご質問）。Google のリッチリザルトと AI の引用に効く。
 * @param {Array} items UpNote faq の items
 */
export function faqPageJsonLd(items) {
  const entities = (items ?? [])
    .map((item) => ({ q: getContentTitle(item), a: stripHtml(getContentBody(item)) }))
    .filter((e) => e.q && e.a)
  if (!entities.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities.map((e) => ({
      '@type': 'Question',
      name: e.q,
      acceptedAnswer: { '@type': 'Answer', text: e.a },
    })),
  }
}

/**
 * 一覧ページの ItemList。何がいくつ並んでいるかを機械可読にする。
 * @param {Array} items    UpNote の items
 * @param {string} basePath 詳細ページのベースパス（例 '/news'）
 * @param {string} siteUrl  本番オリジン（未設定なら url を省略）
 * @param {string} name     リスト名
 */
export function itemListJsonLd(items, basePath, siteUrl, name) {
  const list = (items ?? []).filter((item) => item && item.id)
  if (!list.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: list.length,
    itemListElement: list.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: getContentTitle(item),
      ...(siteUrl ? { url: `${siteUrl}${basePath}/${item.id}` } : {}),
    })),
  }
}
