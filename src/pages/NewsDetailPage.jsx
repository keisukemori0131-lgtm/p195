import { useParams } from 'react-router-dom'
import ArticleDetail from '../components/ArticleDetail.jsx'

// お知らせ記事詳細（R14-3: 個別 URL・固有メタ・NewsArticle JSON-LD）
export default function NewsDetailPage() {
  const { id } = useParams()
  return <ArticleDetail id={id} basePath="/news" listLabel="お知らせ" jsonLdType="NewsArticle" />
}
