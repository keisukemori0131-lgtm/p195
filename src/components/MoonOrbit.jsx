import { useId } from 'react'
import { publicUrl } from '../lib/publicUrl.js'

// 灰色の月 + 細い軌道の線（REGOLITH = 月の砂 / ORBIT = 軌道）。
// 軌道は「月の後ろ」と「月の手前」の 2 枚に分け、月を挟んで立体的に見せる。
// tone: 'dark'（濃紺の地・白い線） / 'light'（パールの地・灰色の線）
const RING = { cx: 400, cy: 300, rx: 300, ry: 96, rotate: -26 }

function Ring({ front }) {
  const { cx, cy, rx, ry, rotate } = RING
  const clipId = `moon-orbit-front${useId().replace(/:/g, '')}`
  return (
    <svg className={`moon-orbit__ring${front ? ' moon-orbit__ring--front' : ''}`} viewBox="0 0 800 600" aria-hidden="true">
      {front && (
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y={cy} width="800" height={600 - cy} />
          </clipPath>
        </defs>
      )}
      <g transform={`rotate(${rotate} ${cx} ${cy})`}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          clipPath={front ? `url(#${clipId})` : undefined}
        />
        {front && <circle className="moon-orbit__dot" cx={cx + rx * 0.86} cy={cy + ry * 0.51} r="7" />}
      </g>
    </svg>
  )
}

export default function MoonOrbit({ className = '', tone = 'dark', eager = false }) {
  return (
    <div className={`moon-orbit moon-orbit--${tone}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <Ring />
      <img
        className="moon-orbit__moon"
        src={publicUrl('/images/brand/moon.svg')}
        alt=""
        width={600}
        height={600}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      <Ring front />
    </div>
  )
}
