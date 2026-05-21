import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { accountsApi, domainsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import AccountsLogin from '../components/AccountsLogin'
import AddAccountModal from '../components/AddAccountModal'
import PageHeader from '../components/PageHeader'
import { Plus, Trash2, RefreshCw, Server, KeyRound } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AccountsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AccountsLogin />
  }

  return <AccountsManager />
}

function AccountsManager() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [syncingId, setSyncingId] = useState(null)

  const { data: accounts = [], refetch, isLoading } = useQuery({
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
    <div className="page-content flex-1 overflow-auto">
      <PageHeader
        title="GoDaddy Accounts"
        subtitle="Add accounts and manage encrypted API keys & secrets"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Account
          </button>
        }
      />

      {isLoading ? (
        <div className="card flex items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          Loading accounts…
        </div>
      ) : accounts.length === 0 ? (
        <div className="card flex flex-col items-center py-20">
          <div className="empty-state-icon">
            <KeyRound size={32} color="#6366f1" style={{ opacity: 0.8 }} />
          </div>
          <p className="font-semibold text-lg">No accounts yet</p>
          <p className="text-sm mt-1 mb-6 text-center max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            Connect a GoDaddy account with your API key and secret to sync domains.
          </p>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add your first account
          </button>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {accounts.map(acc => (
            <div key={acc.id} className="card card-interactive">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                    }}>
                    <Server size={20} color="#818cf8" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-base">{acc.accountName}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      GoDaddy account
                    </p>
                  </div>
                </div>
                <span className={`badge ${acc.active ? 'badge-active' : 'badge-expired'}`}>
                  {acc.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div
                className="flex items-center justify-between text-sm py-3 px-3 rounded-lg mb-4"
                style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)' }}>
                <span className="font-semibold tabular-nums" style={{ color: '#c7d2fe' }}>
                  {acc.domainCount} <span className="font-normal" style={{ color: 'var(--text-secondary)' }}>domains</span>
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {acc.lastSyncedAt ? format(new Date(acc.lastSyncedAt), 'MMM dd, HH:mm') : 'Never synced'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleSync(acc.id)}
                  disabled={syncingId === acc.id}>
                  <RefreshCw size={14} className={syncingId === acc.id ? 'animate-spin' : ''} />
                  {syncingId === acc.id ? 'Syncing…' : 'Sync'}
                </button>
                <button
                  type="button"
                  className="btn-ghost btn-danger-ghost flex items-center gap-2"
                  onClick={() => handleDelete(acc.id, acc.accountName)}>
                  <Trash2 size={14} /> Remove
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
