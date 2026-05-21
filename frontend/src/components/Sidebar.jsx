import { NavLink, useNavigate } from 'react-router-dom'
import { Globe, Server, LogOut, Mail, Lock, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: Globe, label: 'Dashboard', locked: false },
  { to: '/accounts', icon: Server, label: 'Accounts', locked: true },
]

export default function Sidebar() {
  const { email, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/accounts')
  }

  return (
    <aside className="sidebar flex flex-col h-screen flex-shrink-0">
      <div className="sidebar-brand p-5 flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 36,
            height: 36,
            background: 'var(--gradient-brand)',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}>
          <Globe size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-bold text-sm block leading-tight">Domain Dashboard</span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            GoDaddy
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
          Menu
        </p>
        {navItems.map(({ to, icon: Icon, label, locked }) => {
          const showLock = locked && !isAuthenticated
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Icon size={18} strokeWidth={2} />
              <span className="flex-1">{label}</span>
              {showLock && <Lock size={14} style={{ opacity: 0.6 }} />}
            </NavLink>
          )
        })}
      </nav>

      {isAuthenticated ? (
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg mb-2"
            style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{ width: 28, height: 28, background: 'rgba(99, 102, 241, 0.2)' }}>
              <Mail size={14} color="#a5b4fc" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Admin
              </div>
              <div className="truncate text-xs font-medium" style={{ color: '#c7d2fe' }} title={email}>
                {email}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="nav-link w-full">
            <LogOut size={18} />
            Lock Accounts
          </button>
        </div>
      ) : (
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Shield size={14} />
            <span>Accounts require login</span>
          </div>
        </div>
      )}
    </aside>
  )
}
