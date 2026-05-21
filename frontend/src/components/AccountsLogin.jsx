import { useState } from 'react'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Server, Lock, Mail, ShieldCheck } from 'lucide-react'

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
      toast.success('Accounts unlocked')
    } catch (err) {
      const status = err.response?.status
      if (status === 403 || status === 401) {
        toast.error(err.response?.data?.error || 'Invalid email or password')
      } else {
        toast.error('Login failed — try again')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg flex-1 overflow-auto flex items-center justify-center p-6 min-h-full">
      <div className="w-full max-w-md">
        <div className="card login-card">
          <div className="flex flex-col items-center mb-8 text-center">
            <div
              className="flex items-center justify-center rounded-2xl mb-4"
              style={{
                width: 56,
                height: 56,
                background: 'var(--gradient-brand)',
                boxShadow: '0 8px 24px var(--accent-glow)',
              }}>
              <ShieldCheck size={28} color="white" strokeWidth={2} />
            </div>
            <h1 className="page-title text-xl">Secure area</h1>
            <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
              Sign in to manage GoDaddy API keys. The dashboard is open without login.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="godaddy@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  style={{ paddingLeft: '2.5rem' }}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-1" disabled={loading}>
              <Server size={16} />
              {loading ? 'Unlocking...' : 'Unlock Accounts'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          API secrets are encrypted at rest (AES-256)
        </p>
      </div>
    </div>
  )
}
