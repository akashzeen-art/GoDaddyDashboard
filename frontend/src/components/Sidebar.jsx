import { NavLink, useNavigate } from 'react-router-dom'
import { Globe, Server, LogOut, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: Globe, label: 'Dashboard' },
  { to: '/accounts', icon: Server, label: 'Accounts' },
]

export default function Sidebar() {
  const { email, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex flex-col h-screen w-56 flex-shrink-0" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
      <div className="p-5 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <Globe size={20} color="#6366f1" />
        <span className="font-bold text-sm">Domain Dashboard</span>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-white' : ''}`}
            style={({ isActive }) => ({
              background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: isActive ? '#a5b4fc' : 'var(--text-secondary)',
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Mail size={14} className="flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-secondary)' }}>Signed in</div>
            <div className="truncate font-medium" style={{ color: '#a5b4fc' }} title={email}>{email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
