import { publicUrl } from '../lib/publicUrl.js'
import { SITE, SITE_LABEL } from '../constants/site.js'

// ロゴは public/logo.png（ヘッダー・フッター・USP セクション・favicon で共通・R16-7）
// showName: マークの横に、名刺と同じ組み（小さな「株式会社 レゴリス」+ 太い「REGOLITH」）を並べる
export default function Logo({ className, showName = false, height = 44 }) {
  const mark = (
    <img
      src={publicUrl('/logo.png')}
      alt={showName ? '' : `${SITE_LABEL} ロゴ`}
      className="logo-image"
      width={height}
      height={height}
      style={{ width: `${height}px`, height: `${height}px` }}
      loading="eager"
      decoding="async"
    />
  )
  if (!showName) return <span className={className}>{mark}</span>

  return (
    <span className={`logo-mark${className ? ` ${className}` : ''}`}>
      {mark}
      <span className="logo-mark__text">
        <span className="logo-mark__name">株式会社 {SITE.nameShort}</span>
        <span className="logo-mark__en">REGOLITH</span>
      </span>
    </span>
  )
}
