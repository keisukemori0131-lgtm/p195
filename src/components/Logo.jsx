import { publicUrl } from '../lib/publicUrl.js'
import { SITE, SITE_LABEL } from '../constants/site.js'

// ロゴは public/logo.png（ヘッダー・フッター・USP セクション・favicon で共通・R16-7）
// showName: マークの横に社名（和文）と欧文表記を並べる（ヘッダー・フッター用）
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
        <span className="logo-mark__en">REGOLITH</span>
        <span className="logo-mark__name">{SITE.name}</span>
      </span>
    </span>
  )
}
