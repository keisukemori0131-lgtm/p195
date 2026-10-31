import { useCallback, useMemo, useState } from 'react'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import ContentBoard from '../components/ContentBoard.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { CONTENT_TYPE_FOR, isEnabled } from '../config/upnoteContentTypes.js'
import { EMPTY_MESSAGES } from '../lib/upnote.js'
import { itemListJsonLd } from '../lib/jsonld.js'
import { SITE_URL } from '../constants/site.js'

export default function ColumnPage() {
  const slug = CONTENT_TYPE_FOR.blog // 'columns'

  const [items, setItems] = useState([])
  const handleItems = useCallback((next) => setItems(next), [])
  const jsonLd = useMemo(() => {
    const list = itemListJsonLd(items, '/column', SITE_URL, 'コラム一覧')
    return list ? [list] : []
  }, [items])

  return (
    <>
      <DocumentMeta jsonLd={jsonLd} />
      <PageHero title="コラム" eyebrow="COLUMN" />

      <section className="section section--pearl">
        <div className="container">
          {isEnabled(slug) ? (
            <ContentBoard
              slug={slug}
              basePath="/column"
              listLabel="コラム"
              emptyMessage={EMPTY_MESSAGES.columns}
              onItems={handleItems}
              head={<SectionHead eyebrow="COLUMN" title="コラム一覧" />}
              lead="求人原稿の書き方、Googleしごと検索、ホームページの更新や問い合わせ対応。自社ジムの運営で試してきたことをもとに、明日から使える採用と集客のヒントをお届けします。"
            />
          ) : (
            <>
              <SectionHead eyebrow="COLUMN" title="コラム一覧" />
              <p className="board-lead">求人原稿の書き方、Googleしごと検索、ホームページの更新や問い合わせ対応。自社ジムの運営で試してきたことをもとに、明日から使える採用と集客のヒントをお届けします。</p>
              <p className="state-msg">現在公開中の情報はありません。</p>
            </>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
