import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import TabBar from './components/TabBar'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AddTransactionPage from './pages/AddTransactionPage'
import HistoryPage from './pages/HistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import CategoryDetailPage from './pages/CategoryDetailPage'
import './styles/app.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading-screen">MoneyTrack</div>
  if (!user) return <AuthPage />

  return (
    <div className="app-layout">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/add" element={<AddTransactionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/category/:id" element={<CategoryDetailPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
