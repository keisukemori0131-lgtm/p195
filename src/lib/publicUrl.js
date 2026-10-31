// public/ 配下の資産を base（GitHub Pages のサブパス等）付きで参照する
export function publicUrl(path) {
  const base = import.meta.env.BASE_URL || '/'
  if (!path) return base
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
