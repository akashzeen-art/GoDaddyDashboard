import { useState } from 'react'
import { accountsApi } from '../api'
import toast from 'react-hot-toast'
import { X, Eye, EyeOff } from 'lucide-react'

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
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="card w-full max-w-md relative">
        <button className="absolute top-4 right-4 btn-ghost" style={{ padding: '0.25rem' }} onClick={onClose}>
          <X size={16} />
        </button>
        <h2 className="text-lg font-semibold mb-6">Add GoDaddy Account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>Account Number *</label>
            <input value={form.accountName} onChange={set('accountName')} placeholder="e.g. 108079001" required />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>API Key *</label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={form.apiKey} onChange={set('apiKey')}
                placeholder="GoDaddy API Key" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onClick={() => setShowKey(v => !v)}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary)' }}>API Secret *</label>
            <div className="relative">
              <input type={showSecret ? 'text' : 'password'} value={form.apiSecret} onChange={set('apiSecret')}
                placeholder="GoDaddy API Secret" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onClick={() => setShowSecret(v => !v)}>
                {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
