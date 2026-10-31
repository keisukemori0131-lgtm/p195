/** 記事末尾の著者カード（cre-comsence.com 方式）。UpNote の author_* フィールドから組み立てる */
export default function ArticleAuthorCard({ author }) {
  if (!author) return null
  return (
    <aside className="article-author" aria-label="この記事を書いた人">
      <span className="article-author__label" lang="en">
        AUTHOR
      </span>
      <p className="article-author__name">
        {author.name}
        {author.title && <span className="article-author__title">{author.title}</span>}
      </p>
      {author.affiliation && <p className="article-author__aff">{author.affiliation}</p>}
      {author.profile && <p className="article-author__profile">{author.profile}</p>}
    </aside>
  )
}
