import { useState } from 'react'
import { accountsApi } from '../api'
import toast from 'react-hot-toast'
import { X, Eye, EyeOff, KeyRound } from 'lucide-react'

export default function AddAccountModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ accountName: '', apiKey: '', apiSecret: '' })
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await accountsApi.add(form)
      toast.success('Account added successfully')
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to add account')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card modal-panel w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="absolute top-4 right-4 btn-ghost"
          style={{ padding: '0.4rem' }}
          onClick={onClose}
          aria-label="Close">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <KeyRound size={22} color="#818cf8" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Add GoDaddy Account</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Keys are encrypted before storage
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Account number *
            </label>
            <input value={form.accountName} onChange={set('accountName')} placeholder="e.g. 108079001" required />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              API key *
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={set('apiKey')}
                placeholder="Production API key"
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowKey(v => !v)}
                tabIndex={-1}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              API secret *
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={form.apiSecret}
                onChange={set('apiSecret')}
                placeholder="Production API secret"
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowSecret(v => !v)}
                tabIndex={-1}>
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-2 pt-2">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding…' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
