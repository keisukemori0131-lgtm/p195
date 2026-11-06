import { publicUrl } from '../lib/publicUrl.js'

// 機能の説明画像（暫定: cre-comsence.com の UpNote の画像をコピー。納品直前に同名で差し替える）
const src = (slug, suffix = '') => publicUrl(`/images/orbit/screens/${slug}${suffix}.webp`)

/**
 * @param {string} slug   機能の slug（画像のファイル名と同じ）
 * @param {string} alt
 * @param {string} [sizes]
 * @param {boolean} [eager] ファーストビューの画像だけ true
 */
export default function OrbitScreen({ slug, alt, sizes = '(max-width: 900px) 100vw, 640px', eager = false }) {
  return (
    <img
      className="orbit-screen"
      src={src(slug, '-800')}
      srcSet={`${src(slug, '-480')} 480w, ${src(slug, '-800')} 800w, ${src(slug)} 1536w`}
      sizes={sizes}
      alt={alt}
      width={1536}
      height={1024}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
