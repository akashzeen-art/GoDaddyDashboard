import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { accountsApi, domainsApi } from '../api'
import AddAccountModal from '../components/AddAccountModal'
import { Plus, Trash2, RefreshCw, Server } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AccountsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [syncingId, setSyncingId] = useState(null)

  const { data: accounts = [], refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll().then(r => r.data),
  })

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove account "${name}" and all its domains?`)) return
    try {
      await accountsApi.remove(id)
      await qc.invalidateQueries()
      toast.success('Account removed')
    } catch {
      toast.error('Failed to remove account')
    }
  }

  const handleSync = async (id) => {
    setSyncingId(id)
    try {
      await domainsApi.syncAccount(id)
      await qc.invalidateQueries()
      toast.success('Account synced')
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncingId(null)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">GoDaddy Accounts</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage connected GoDaddy accounts
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="card flex flex-col items-center py-16" style={{ color: 'var(--text-secondary)' }}>
          <Server size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p className="font-medium">No accounts connected</p>
          <p className="text-sm mt-1">Add a GoDaddy account to get started</p>
          <button className="btn-primary mt-4" onClick={() => setShowModal(true)}>Add Account</button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {accounts.map(acc => (
            <div key={acc.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Server size={16} color="#6366f1" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{acc.accountName}</p>
                  </div>
                </div>
                <span className={`badge ${acc.active ? 'badge-active' : 'badge-expired'}`}>
                  {acc.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {acc.domainCount} domains
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {acc.lastSyncedAt ? `Synced ${format(new Date(acc.lastSyncedAt), 'MMM dd, HH:mm')}` : 'Never synced'}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="btn-ghost flex-1 flex items-center justify-center gap-1 text-sm"
                  onClick={() => handleSync(acc.id)} disabled={syncingId === acc.id}>
                  <RefreshCw size={12} className={syncingId === acc.id ? 'animate-spin' : ''} />
                  {syncingId === acc.id ? 'Syncing...' : 'Sync'}
                </button>
                <button className="btn-ghost flex items-center gap-1 text-sm"
                  style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => handleDelete(acc.id, acc.accountName)}>
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddAccountModal onClose={() => setShowModal(false)} onAdded={() => { refetch(); qc.invalidateQueries() }} />
      )}
    </div>
  )
}
