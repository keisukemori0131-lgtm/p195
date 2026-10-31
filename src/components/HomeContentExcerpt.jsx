import { useContentList } from '../lib/useUpNote.js'
import { ContentCard } from './ContentBoard.jsx'
import ErrorMsg from './ErrorMsg.jsx'

/**
 * トップの UpNote 抜粋（R14-2: limit=3, page=1・fetchAll 禁止）。
 * カード押下で個別詳細ページへ遷移する（R14-3）。
 */
export default function HomeContentExcerpt({ slug, basePath, emptyMessage, limit = 3 }) {
  const { data, loading, error, reload } = useContentList(slug, { page: 1, limit })

  if (loading && !data) return <p className="state-msg">読み込み中…</p>
  if (error && !data) return <ErrorMsg onRetry={reload} />

  const items = (data?.items ?? []).slice(0, limit)
  if (!items.length) return <p className="state-msg">{emptyMessage}</p>

  return (
    <div className="content-grid content-grid--3 stagger">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} basePath={basePath} showLead={false} />
      ))}
    </div>
  )
}
