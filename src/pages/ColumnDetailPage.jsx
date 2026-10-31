import { useParams } from 'react-router-dom'
import ArticleDetail from '../components/ArticleDetail.jsx'

// コラム記事詳細（R14-3: 個別 URL・固有メタ・BlogPosting JSON-LD）
export default function ColumnDetailPage() {
  const { id } = useParams()
  return <ArticleDetail id={id} basePath="/column" listLabel="コラム" jsonLdType="BlogPosting" />
}
