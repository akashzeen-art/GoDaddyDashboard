import { useState } from 'react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Server, Lock, Mail } from 'lucide-react'

export default function AccountsLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      login(data.token, data.email)
      toast.success('Unlocked — you can manage API keys')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 rounded-full mb-3" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Server size={28} color="#6366f1" />
          </div>
          <h1 className="text-xl font-bold">Accounts locked</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Sign in to add GoDaddy accounts and manage API keys. The dashboard stays open without login.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="email"
                style={{ paddingLeft: '2rem' }}
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="godaddy@gmail.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="password"
                style={{ paddingLeft: '2rem' }}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Unlocking...' : 'Unlock Accounts'}
          </button>
        </form>
      </div>
    </div>
  )
}
