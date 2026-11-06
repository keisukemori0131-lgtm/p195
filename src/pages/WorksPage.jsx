import { useCallback, useMemo, useState } from 'react'
import DocumentMeta from '../components/DocumentMeta.jsx'
import PageHero from '../components/PageHero.jsx'
import SectionHead from '../components/SectionHead.jsx'
import ContentBoard from '../components/ContentBoard.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { CONTENT_TYPE_FOR } from '../config/upnoteContentTypes.js'
import { EMPTY_MESSAGES } from '../lib/upnote.js'
import { itemListJsonLd } from '../lib/jsonld.js'
import { SITE_URL } from '../constants/site.js'

const LEAD = 'お客様の課題と、私たちの取り組み、その後の変化をご紹介します。'

// 実績・事例の一覧。UpNote 公開 API の case_studies から取得する
export default function WorksPage() {
  const slug = CONTENT_TYPE_FOR.works // 'case_studies'

  const [items, setItems] = useState([])
  const handleItems = useCallback((next) => setItems(next), [])
  const jsonLd = useMemo(() => {
    const list = itemListJsonLd(items, '/works', SITE_URL, '実績・事例一覧')
    return list ? [list] : []
  }, [items])

  return (
    <>
      <DocumentMeta jsonLd={jsonLd} />
      <PageHero title="実績・事例" eyebrow="WORKS" />

      <section className="section section--pearl">
        <div className="container">
          <ContentBoard
            slug={slug}
            basePath="/works"
            listLabel="実績・事例"
            restHeading="そのほかの実績・事例"
            emptyMessage={EMPTY_MESSAGES.case_studies}
            onItems={handleItems}
            head={<SectionHead eyebrow="WORKS" title="実績・事例一覧" />}
            lead={LEAD}
          />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
