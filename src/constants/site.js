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
// 文言はコピーライティングの原則で作成: 機能ではなく「お客様にとって何が変わるか」を先に書く。
// 数字・お客様の声は未提供のため使わない（捏造しない・R2）
export const USP_CARDS = [
  {
    eyebrow: '01 / PRACTICE',
    title: '提案するのは、自社で効いた方法だけ',
    desc: 'パーソナル＋24時間ジム「101FIT」を自ら運営し、集客と採用に毎日向き合っています。机の上で考えた理屈ではなく、自分たちで試して効果があった方法をお伝えします。',
  },
  {
    eyebrow: '02 / ONE STOP',
    title: '求人とホームページを、ひとつの窓口で',
    desc: '求人は求人の会社、ホームページは制作会社。別々に頼むと、伝える内容がちぐはぐになりがちです。レゴリスなら求人原稿とホームページを同じ考え方でそろえてつくります。',
  },
  {
    eyebrow: '03 / RECRUIT',
    title: '求人を出して終わりにしない',
    desc: '求人原稿の改善に加えて、自社ホームページの採用ページづくりとGoogleしごと検索への掲載まで。応募が届くところまで一緒に整えます。',
  },
]
