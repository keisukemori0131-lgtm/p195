import { useParams } from 'react-router-dom'
import ArticleDetail from '../components/ArticleDetail.jsx'

// 実績・事例の詳細（個別 URL・固有メタ・Article JSON-LD）
export default function WorksDetailPage() {
  const { id } = useParams()
  return <ArticleDetail id={id} basePath="/works" listLabel="実績・事例" jsonLdType="Article" caseStudy />
}
