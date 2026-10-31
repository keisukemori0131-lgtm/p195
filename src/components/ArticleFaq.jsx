import Icon from './Icon.jsx'

/** 記事末尾の「よくある質問」。details で開閉する（cre-comsence.com 方式） */
export default function ArticleFaq({ items }) {
  if (!items?.length) return null
  return (
    <section className="article-faq" aria-labelledby="article-faq-title">
      <span className="eyebrow" lang="en">
        FAQ
      </span>
      <h2 id="article-faq-title" className="article-faq__title">
        よくある質問
      </h2>
      <div className="article-faq__list">
        {items.map((item, i) => (
          <details key={item.question} className="article-faq__item" open={i === 0}>
            <summary>
              <span className="article-faq__q" aria-hidden="true">
                Q
              </span>
              <span className="article-faq__question">{item.question}</span>
              <span className="article-faq__toggle" aria-hidden="true">
                <Icon name="chevron-down" size={20} />
              </span>
            </summary>
            <div className="article-faq__answer">
              <span className="article-faq__a" aria-hidden="true">
                A
              </span>
              <span>{item.answer}</span>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
