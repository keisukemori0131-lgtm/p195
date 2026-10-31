import { Link } from 'react-router-dom'
import MoonOrbit from './MoonOrbit.jsx'
import Twinkle from './Twinkle.jsx'

/**
 * サブページの見出し帯（リデザイン 2026-10）。
 * 濃紺の宇宙 + 左端に名刺の色ブロックの縦帯 + 右に月と軌道。
 * 左に 欧文ラベル → ページ名（h1）→ パンくず。
 */
export default function PageHero({ title, eyebrow }) {
  return (
    <div className="page-hero space">
      <Twinkle count={18} seed={23} />
      <span className="v-strip page-hero__strip" aria-hidden="true" />
      <MoonOrbit className="page-hero__moon" eager />
      <div className="container page-hero__inner">
        {eyebrow && (
          <span className="eyebrow eyebrow--light" lang="en">
            {eyebrow}
          </span>
        )}
        <h1 className="page-hero__title">{title}</h1>
        <nav className="breadcrumb breadcrumb--dark" aria-label="パンくず">
          <Link to="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{title}</span>
        </nav>
      </div>
    </div>
  )
}
