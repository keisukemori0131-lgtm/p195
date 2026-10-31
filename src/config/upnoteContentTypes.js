// ページslug → UpNote contentTypeSlug のデフォルト対応表
//
// 顧客YAML の upnote.content_types で同名キーを書けばそちらが優先される。
// 生成時に Claude Code が YAML を読み、この表とマージした最終形を埋め込む。
//
// UpNote 側で利用可能な contentTypeSlug:
//   news / stores / members / products / rental_properties / sale_properties /
//   faq / events / player_roster / columns / case_studies

export const DEFAULT_PAGE_CONTENT_TYPES = {
  // ─── CMS連携あり ───
  news: 'news',                    // お知らせ
  blog: 'columns',                 // コラム/ブログ（このサイトでは /column）
  works: 'case_studies',           // 実績・事例
  shop_info: 'stores',             // 店舗一覧
  access: 'stores',                // アクセス(店舗から住所/緯度経度を取得)
  company: 'members',              // 会社情報(役員・従業員)
  service_detail: 'products',      // サービス詳細
  pricing: 'products',             // 価格

  // ─── CMS連携なし (本文ベース) ───
  top: null,                       // TOP は他ページの抜粋を組み合わせる
  recruit: null,                   // 既定は YAML/手書き。採用オプション契約案件のみ 'recruit'（R17）
  lp: null,                        // LP は YAML/手書き

  // ─── 問い合わせ系もCMS無し ───
  contact_google: null,
  contact_web3forms: null,
  contact_other: null,
}

/**
 * P195（株式会社レゴリス）の最終対応表。
 * 顧客YAML `upnote.content_types` は未指定のためデフォルトのまま。
 * company / service_detail は members / products が upnote.コンテンツ に無いため、
 * ページ側で API を送らない（ENABLED_CONTENT_TYPES で判定）。
 */
export const CONTENT_TYPE_FOR = {
  ...DEFAULT_PAGE_CONTENT_TYPES,
}

/**
 * この顧客が UpNote に実際に登録するコンテンツタイプ一覧。
 * 顧客YAML `upnote.コンテンツ: コラム, お知らせ` をそのまま書き出したもの。
 * ページコードはこの配列に含まれていない slug を取得しに行かない（必ず空になるため）。
 */
export const ENABLED_CONTENT_TYPES = ['columns', 'news']

/** その contentTypeSlug がこの顧客で有効か */
export const isEnabled = (slug) => ENABLED_CONTENT_TYPES.includes(slug)
