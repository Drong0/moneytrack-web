import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, List, PieChart, Settings, Plus } from 'lucide-react'

const TABS = [
  { path: '/', icon: LayoutGrid, label: 'Панель' },
  { path: '/history', icon: List, label: 'История' },
  { path: '/add', icon: Plus, label: '' },
  { path: '/analytics', icon: PieChart, label: 'Отчет' },
  { path: '/settings', icon: Settings, label: 'Настройки' },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="tab-bar">
      {TABS.map(tab => {
        const isAdd = tab.path === '/add'
        const isActive = location.pathname === tab.path

        return (
          <button
            key={tab.path}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {isAdd ? (
              <div className="add-button">
                <Plus size={26} />
              </div>
            ) : (
              <>
                <tab.icon size={22} />
                <span>{tab.label}</span>
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}
