import { NavLink } from 'react-router-dom'
import { Globe, Server } from 'lucide-react'

const navItems = [
  { to: '/', icon: Globe, label: 'Dashboard' },
  { to: '/accounts', icon: Server, label: 'Accounts' },
]

export default function Sidebar() {
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
    </aside>
  )
}
