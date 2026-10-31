import { publicUrl } from '../lib/publicUrl.js'

/**
 * R16-4: サブページのページヒーロー。画像（SVG カバー）のみの帯で文言は重ねない。
 * ページタイトルは visually-hidden の h1 で保持（SEO・スクリーンリーダー用）。
 * ファーストビューのため loading="lazy" は付けない。
 */
export default function PageHero({ title, image, alt }) {
  return (
    <div className="page-hero">
      <img src={publicUrl(image)} alt={alt} width={1600} height={600} loading="eager" decoding="async" fetchpriority="high" />
      <h1 className="visually-hidden">{title}</h1>
    </div>
  )
}
