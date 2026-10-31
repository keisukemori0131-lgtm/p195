import { useEffect, useId, useState } from 'react'
import { publicUrl } from '../lib/publicUrl.js'

// 灰色の月 + 細い軌道の線（REGOLITH = 月の砂 / ORBIT = 軌道）。
// 軌道は「月の後ろ」と「月の手前」の 2 枚に分け、月を挟んで立体的に見せる。
// 軌道の上を小さな衛星（白い点）がゆっくり周回する。後ろ側では月に隠れ、手前側だけ見える。
// tone: 'dark'（濃紺の地・白い線） / 'light'（パールの地・灰色の線）
const RING = { cx: 400, cy: 300, rx: 300, ry: 96, rotate: -26 }
const ORBIT_SECONDS = 16

// 楕円を 1 周する経路（衛星の animateMotion 用。右端から反時計回りに手前 → 左 → 奥）
const { cx, cy, rx, ry } = RING
const ORBIT_PATH = `M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`

/** 動きを減らす設定の人には周回を止める（SSR では止めた状態で描き、表示後に判定する） */
function useOrbitMotion() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const update = () => setOn(!mq?.matches)
    update()
    mq?.addEventListener?.('change', update)
    return () => mq?.removeEventListener?.('change', update)
  }, [])
  return on
}

function Satellite({ moving }) {
  if (!moving) return <circle className="moon-orbit__dot" cx={cx + rx * 0.86} cy={cy + ry * 0.51} r="7" />
  return (
    <circle className="moon-orbit__dot" r="7">
      <animateMotion dur={`${ORBIT_SECONDS}s`} repeatCount="indefinite" path={ORBIT_PATH} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
    </circle>
  )
}

function Ring({ front, moving }) {
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
      <g transform={`rotate(${RING.rotate} ${cx} ${cy})`}>
        <g clipPath={front ? `url(#${clipId})` : undefined}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" />
          {(front || moving) && <Satellite moving={moving} />}
        </g>
      </g>
    </svg>
  )
}

export default function MoonOrbit({ className = '', tone = 'dark', eager = false }) {
  const moving = useOrbitMotion()
  return (
    <div className={`moon-orbit moon-orbit--${tone}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <Ring moving={moving} />
      <img
        className="moon-orbit__moon"
        src={publicUrl('/images/brand/moon.webp')}
        alt=""
        width={800}
        height={800}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      <Ring front moving={moving} />
    </div>
  )
}
