import { publicUrl } from '../lib/publicUrl.js'
import { SITE } from '../constants/site.js'

const squash = (s) => String(s ?? '').replace(/\s/g, '')

/** 著者が代表者なら、代表者の写真の URL を返す（それ以外の著者は写真なし） */
export function authorPhoto(author) {
  if (!author || squash(author.name) !== squash(SITE.representative.name)) return null
  return publicUrl('/images/about/representative.webp')
}

/** 記事末尾の著者カード（cre-comsence.com 方式）。UpNote の author_* フィールドから組み立てる */
export default function ArticleAuthorCard({ author }) {
  if (!author) return null
  const photo = authorPhoto(author)
  return (
    <aside aria-labelledby="article-author-title">
      <div className="article-author__head">
        <span className="eyebrow" lang="en">
          AUTHOR
        </span>
        <h2 id="article-author-title" className="article-faq__title">
          この記事を書いた人
        </h2>
      </div>
      <div className="article-author">
        {photo && (
          <span className="article-author__photo">
            <img src={photo} alt={`${author.name}の写真`} width={152} height={176} loading="lazy" decoding="async" />
          </span>
        )}
        <div>
          <p className="article-author__name">{author.name}</p>
          {(author.title || author.affiliation) && (
            <p className="article-author__title">{[author.title, author.affiliation].filter(Boolean).join('　')}</p>
          )}
          {author.profile && <p className="article-author__profile">{author.profile}</p>}
        </div>
      </div>
    </aside>
  )
}
