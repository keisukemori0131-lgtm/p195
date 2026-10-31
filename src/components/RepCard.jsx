import { publicUrl } from '../lib/publicUrl.js'
import { SITE } from '../constants/site.js'

// 代表者の写真 + 役職・氏名（名刺と同じく氏名は明朝、ローマ字は欧文コンデンスド）。
// 写真は顧客提供（152×176px と小さいため、表示幅は CSS で 160px までに抑えている）
export default function RepCard({ className = '' }) {
  const { title, name, nameRoman } = SITE.representative
  return (
    <figure className={`rep-card${className ? ` ${className}` : ''}`}>
      <span className="rep-card__photo">
        <img
          src={publicUrl('/images/about/representative.webp')}
          alt={`${title} ${name}の写真`}
          width={152}
          height={176}
          loading="lazy"
          decoding="async"
        />
      </span>
      <figcaption className="rep-card__body">
        <span className="rep-card__title">{title}</span>
        <span className="rep-card__name">{name}</span>
        <span className="rep-card__roman" lang="en">
          {nameRoman}
        </span>
      </figcaption>
    </figure>
  )
}
