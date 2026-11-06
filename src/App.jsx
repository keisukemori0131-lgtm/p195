import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'

// トップ以外はルート単位で code splitting（R10 性能）
// ルートを追加・変更したら src/entry-server.jsx（SSG用・即時import）も両方更新すること
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'))
const ServiceRecruitPage = lazy(() => import('./pages/ServiceRecruitPage.jsx'))
const ServiceOrbitPage = lazy(() => import('./pages/ServiceOrbitPage.jsx'))
const ServiceFitPage = lazy(() => import('./pages/ServiceFitPage.jsx'))
const OrbitFeaturePage = lazy(() => import('./pages/OrbitFeaturePage.jsx'))
const WorksPage = lazy(() => import('./pages/WorksPage.jsx'))
const WorksDetailPage = lazy(() => import('./pages/WorksDetailPage.jsx'))
const CompanyPage = lazy(() => import('./pages/CompanyPage.jsx'))
const NewsPage = lazy(() => import('./pages/NewsPage.jsx'))
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage.jsx'))
const ColumnPage = lazy(() => import('./pages/ColumnPage.jsx'))
const ColumnDetailPage = lazy(() => import('./pages/ColumnDetailPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/recruit" element={<ServiceRecruitPage />} />
        <Route path="services/orbit" element={<ServiceOrbitPage />} />
        <Route path="services/orbit/:slug" element={<OrbitFeaturePage />} />
        <Route path="services/fit" element={<ServiceFitPage />} />
        <Route path="works" element={<WorksPage />} />
        <Route path="works/:id" element={<WorksDetailPage />} />
        <Route path="company" element={<CompanyPage />} />
        {/* アクセスは独立ページにしない（会社概要の #access に統合） */}
        <Route path="access" element={<Navigate to="/company?section=access" replace />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:id" element={<NewsDetailPage />} />
        <Route path="column" element={<ColumnPage />} />
        <Route path="column/:id" element={<ColumnDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
