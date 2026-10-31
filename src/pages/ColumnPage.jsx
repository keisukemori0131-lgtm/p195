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
      <PageHero title="コラム" image="/images/column/cover.svg" alt="開いたノートと軌道線を描いたコラムのカバーイメージ" />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="COLUMN"
            title="コラム一覧"
            lead="求人原稿の書き方、Googleしごと検索、ホームページの更新や問い合わせ対応など、採用と集客に役立つ情報をお届けします。"
          />
          {isEnabled(slug) ? (
            <ContentBoard slug={slug} basePath="/column" emptyMessage={EMPTY_MESSAGES.columns} onItems={handleItems} />
          ) : (
            <p className="state-msg">現在公開中の情報はありません。</p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
