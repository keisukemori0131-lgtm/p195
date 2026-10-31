// 宇宙の背景写真の上で、いくつかの星だけをゆっくり瞬かせる（opacity と scale のアニメーションのみ）。
// 位置は seed から決まる疑似乱数で作る（SSG の HTML とブラウザの描画が一致するように Math.random は使わない）。
// shooting: ときどき流れ星を流す（トップのファーストビューだけ）
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function Twinkle({ count = 24, seed = 7, shooting = false }) {
  const rand = mulberry32(seed)
  const stars = Array.from({ length: count }, (_, i) => ({
    key: i,
    left: `${(rand() * 100).toFixed(2)}%`,
    top: `${(rand() * 100).toFixed(2)}%`,
    size: `${(1.4 + rand() * 1.8).toFixed(1)}px`,
    delay: `${(rand() * 6).toFixed(2)}s`,
    dur: `${(3 + rand() * 4).toFixed(2)}s`,
  }))
  return (
    <span className="twinkle" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.key}
          className="twinkle__star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
        />
      ))}
      {shooting && (
        <>
          <span className="twinkle__shoot" />
          <span className="twinkle__shoot twinkle__shoot--2" />
        </>
      )}
    </span>
  )
}
