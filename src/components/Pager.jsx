function pagesToShow(current, total) {
  const out = []
  const push = (p) => out.push(p)
  const window = [current - 1, current, current + 1].filter((p) => p > 1 && p < total)
  push(1)
  if (window[0] > 2) push('…')
  for (const p of window) push(p)
  if (window[window.length - 1] < total - 1) push('…')
  if (total > 1) push(total)
  return out
}

export default function Pager({ current, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  const pages = pagesToShow(current, totalPages)
  return (
    <nav className="pager" aria-label="ページ送り">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        aria-label="前のページ"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span className="ellipsis" key={`e${i}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={p === current ? 'is-current' : undefined}
            aria-current={p === current ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current >= totalPages}
        aria-label="次のページ"
      >
        ›
      </button>
    </nav>
  )
}
