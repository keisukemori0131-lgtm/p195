import {
  isImageUrl,
  isExternalUrl,
  isHtml,
  isIsoDate,
  resolveMediaUrl,
} from '../lib/upnoteContent.js'
import { formatDateJST } from '../lib/upnote.js'

// data.* の値を種別で自動判定して描画する（R14-3a）。
export default function UpnoteFieldValue({ value, label }) {
  if (isImageUrl(value)) {
    return (
      <img
        src={resolveMediaUrl(value)}
        alt={label || '画像'}
        loading="lazy"
        decoding="async"
        width={320}
        height={200}
        className="detail-item__img"
      />
    )
  }
  if (isExternalUrl(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
    )
  }
  if (isIsoDate(value)) {
    return <span>{formatDateJST(value)}</span>
  }
  if (typeof value === 'boolean') {
    return <span>{value ? 'はい' : 'いいえ'}</span>
  }
  if (isHtml(value)) {
    return <span dangerouslySetInnerHTML={{ __html: value }} />
  }
  return <span>{String(value)}</span>
}
