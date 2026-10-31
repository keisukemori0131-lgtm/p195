import { publicUrl } from '../lib/publicUrl.js'
import { SITE, SITE_LABEL } from '../constants/site.js'

// showName: ヘッダー・フッターのロゴ組み（名刺の色ブロック 5 色 + 太い「REGOLITH」+ 小さな「株式会社レゴリス」）
// showName なし: public/logo.png のマーク（favicon・OGP と共通・R16-7）
export default function Logo({ className, showName = false, height = 44 }) {
  if (!showName) {
    return (
      <span className={className}>
        <img
          src={publicUrl('/logo.png')}
          alt={`${SITE_LABEL} ロゴ`}
          className="logo-image"
          width={height}
          height={height}
          style={{ width: `${height}px`, height: `${height}px` }}
          loading="eager"
          decoding="async"
        />
      </span>
    )
  }

  return (
    <span className={`logo-mark${className ? ` ${className}` : ''}`}>
      <span className="logo-mark__blocks" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="logo-mark__en">REGOLITH</span>
      <span className="logo-mark__name">{SITE.name}</span>
    </span>
  )
}
