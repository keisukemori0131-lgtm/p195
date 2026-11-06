import { Link } from 'react-router-dom'
import ArticleRichBody from './ArticleRichBody.jsx'
import { getCaseFacts, getCaseLinks, getCaseStory, getCaseTestimonial, isExternalUrl } from '../lib/upnoteContent.js'

/** 実績・事例の本文: 基本情報 → 本文 → 課題・取り組み・成果など → お客様の声 → 関連リンク */
export default function CaseStudyBody({ item, body }) {
  const facts = getCaseFacts(item)
  const story = getCaseStory(item)
  const voice = getCaseTestimonial(item)
  const links = getCaseLinks(item)

  return (
    <>
      {facts.length > 0 && (
        <dl className="case-facts">
          {facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {body && <ArticleRichBody body={body} />}

      {story.map((s) => (
        <section className="case-section" key={s.title}>
          <h2 className="case-section__title">{s.title}</h2>
          <ArticleRichBody body={s.body} />
        </section>
      ))}

      {voice && (
        <figure className="case-voice">
          <figcaption>お客様の声</figcaption>
          <blockquote>{voice.quote}</blockquote>
          {voice.author && <p>{voice.author}</p>}
        </figure>
      )}

      {links.length > 0 && (
        <ul className="case-links">
          {links.map((l) => (
            <li key={l.url}>
              {isExternalUrl(l.url) ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ) : (
                <Link to={l.url}>{l.label}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
