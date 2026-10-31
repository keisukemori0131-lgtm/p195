// サイト全体で使う事実情報の単一ソース
//
// 出典: 顧客YAML P195（特記事項の確認結果を含む）
//   - 電話は 101FIT の番号を会社窓口として掲載可（特記事項で了承済み）
//   - 公開用メールアドレス・設立年・郵便番号は未提供のため持たない（R2）
// 実データは site-data.json（sitemap / llms.txt / プリレンダスクリプトと共用）
import SITE_DATA from './site-data.json'

export const SITE = SITE_DATA

/** 表記ゆれ防止: 見出し・メタ・JSON-LD で使う正式表記 */
export const SITE_LABEL = SITE_DATA.label

export const SITE_URL = (import.meta.env.VITE_SITE_URL || SITE_DATA.domain || '').replace(/\/$/, '')

/** tel: 用（ハイフン無し）と表示用（ハイフン有り） */
export const PHONE_DISPLAY = SITE_DATA.phone
export const PHONE_TEL = SITE_DATA.phone.replace(/[^\d+]/g, '')

/** 外部 SNS（101FIT の公式アカウント。会社のアカウントは未提供） */
export const GYM_SNS = [
  { key: 'instagram', label: '101FIT Instagram', url: SITE_DATA.gym.sns.instagram },
  { key: 'x', label: '101FIT X（旧Twitter）', url: SITE_DATA.gym.sns.x },
].filter((s) => s.url)

/** Google マップ埋め込み（住所検索。API キー不要の埋め込み形式） */
export const MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(SITE_DATA.address.full)}&z=16&output=embed`
export const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_DATA.address.full)}`

// R16-3: トップ「選ばれる理由」の 3 点カード（YAML の USP を分解）
export const USP_CARDS = [
  {
    eyebrow: '01 / PRACTICE',
    title: '自社ジムで、集客と採用を実践',
    desc: 'パーソナル＋24時間ジム「101FIT」を自ら運営し、集客と採用を現場で試しています。机上の提案ではなく、自社で効果があった方法を根拠にお伝えします。',
  },
  {
    eyebrow: '02 / ONE STOP',
    title: '求人コンサルとホームページをセットで',
    desc: '求人原稿の作成・改善と、ホームページの制作・運用をひとつの窓口で。採用と集客の打ち手を同じ視点でそろえられます。',
  },
  {
    eyebrow: '03 / RECRUIT',
    title: '採用まで、一貫して支援',
    desc: 'REGOLITH ORBIT の「採用ページ・Googleしごと検索」機能と求人コンサルを組み合わせ、求人を出すところから応募が届くまでを支えます。',
  },
]
