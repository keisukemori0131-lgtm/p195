import { parseArticleBody, splitLabeledItem } from '../lib/articleContent.js'
import { isHtml } from '../lib/upnoteContent.js'

function LabeledText({ text }) {
  const { label, body } = splitLabeledItem(text)
  if (!label) return body
  return (
    <>
      <strong className="rich-body__label">{label}</strong>
      <span aria-hidden="true"> — </span>
      {body}
    </>
  )
}

function Lines({ text }) {
  const lines = String(text).split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

/**
 * 記事本文を見出し・箇条書き・番号付き・段落として構造化表示する（cre-comsence.com 方式）。
 * HTML 本文（body_html 等）はそのまま整形表示する。
 */
export default function ArticleRichBody({ body }) {
  if (!body) return null
  if (isHtml(body)) {
    // UpNote 管理画面で入力された HTML（信頼済みソース）を整形表示する
    return <div className="rich-body" dangerouslySetInnerHTML={{ __html: body }} />
  }

  const blocks = parseArticleBody(body)
  if (!blocks.length) return null

  return (
    <div className="rich-body">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h2 key={i} className="rich-body__heading">
              {block.text}
            </h2>
          )
        }
        if (block.type === 'bullets') {
          return (
            <ul key={i} className="rich-body__bullets">
              {block.items.map((item, j) => (
                <li key={j}>
                  <LabeledText text={item} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === 'numbered') {
          return (
            <ol key={i} className="rich-body__numbered">
              {block.items.map((item, j) => (
                <li key={j}>
                  <span className="rich-body__num" aria-hidden="true">
                    {String(item.number).padStart(2, '0')}
                  </span>
                  <span>
                    <LabeledText text={item.text} />
                  </span>
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i}>
            <Lines text={block.text} />
          </p>
        )
      })}
    </div>
  )
}
