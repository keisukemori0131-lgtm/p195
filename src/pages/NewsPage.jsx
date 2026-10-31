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

export default function NewsPage() {
  const slug = CONTENT_TYPE_FOR.news // 'news'

  // 一覧の ItemList 構造化データ（AI 検索が「何が何件あるか」を把握できるようにする）
  const [items, setItems] = useState([])
  const handleItems = useCallback((next) => setItems(next), [])
  const jsonLd = useMemo(() => {
    const list = itemListJsonLd(items, '/news', SITE_URL, 'お知らせ一覧')
    return list ? [list] : []
  }, [items])

  return (
    <>
      <DocumentMeta jsonLd={jsonLd} />
      <PageHero title="お知らせ" image="/images/news/cover.svg" alt="軌道線と通知の波紋を描いたお知らせのカバーイメージ" />

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="NEWS" title="お知らせ一覧" lead="サービスに関するお知らせや、運営するジム「101FIT」の情報などを掲載しています。" />
          {isEnabled(slug) ? (
            <ContentBoard slug={slug} basePath="/news" emptyMessage={EMPTY_MESSAGES.news} onItems={handleItems} />
          ) : (
            <p className="state-msg">現在公開中の情報はありません。</p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
