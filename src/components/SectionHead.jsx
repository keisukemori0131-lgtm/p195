/**
 * 見出しブロック: 欧文 Eyebrow → 大見出し（h2）→ リード。
 * @param {string} eyebrow  欧文ラベル（例「OUR STRENGTH」）
 * @param {ReactNode} title 見出し
 * @param {ReactNode} [lead]
 * @param {boolean} [light] 濃紺地の上で使う
 * @param {boolean} [center] 中央揃え
 * @param {'h1'|'h2'} [as]
 */
export default function SectionHead({ eyebrow, title, lead, light = false, center = false, as: Tag = 'h2' }) {
  return (
    <div className={`sec-head${light ? ' sec-head--light' : ''}${center ? ' sec-head--center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <Tag className="sec-head__title">{title}</Tag>
      {lead && <p className="sec-head__lead">{lead}</p>}
    </div>
  )
}
