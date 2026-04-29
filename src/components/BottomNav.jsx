// src/components/BottomNav.jsx
import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/create',  label: 'Créer',      icon: '✍️' },
  { path: '/replies', label: 'Réponses',   icon: '💬' },
  { path: '/shop',    label: 'Ma boutique', icon: '🏪' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex bg-white border-t border-terra-light pb-safe">
      {TABS.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center gap-1 pt-2 pb-3">
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-[9px] font-semibold tracking-wide ${active ? 'text-terra' : 'text-brown-light'}`}>
              {tab.label}
            </span>
            {active && <div className="w-5 h-0.5 bg-terra rounded-full" />}
          </button>
        )
      })}
    </nav>
  )
}
