import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { domainsApi } from '../api'
import StatCard from '../components/StatCard'
import DomainTable from '../components/DomainTable'
import { Globe, AlertTriangle, Server, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const qc = useQueryClient()
  const [syncing, setSyncing] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => domainsApi.getStats().then(r => r.data),
    refetchInterval: 5 * 60 * 1000,
  })

  const { data: domains = [], refetch: refetchDomains } = useQuery({
    queryKey: ['domains'],
    queryFn: () => domainsApi.getAll().then(r => r.data),
    refetchInterval: 5 * 60 * 1000,
  })

  const handleSync = async () => {
    setSyncing(true)
    try {
      await domainsApi.syncAll()
      await qc.invalidateQueries()
      toast.success('Domains synced successfully')
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Domain Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            All domains across connected GoDaddy accounts
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleSync} disabled={syncing}>
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="Total Domains" value={stats?.totalDomains} icon={Globe} color="#6366f1" />
        <StatCard title="Expiring Soon" value={stats?.expiringSoon} icon={AlertTriangle} color="#facc15" subtitle="Next 30 days" />
        <StatCard title="Accounts Connected" value={stats?.totalAccounts} icon={Server} color="#4ade80" />
        <StatCard title="Expired" value={stats?.expiredDomains} icon={XCircle} color="#f87171" />
      </div>

      <DomainTable domains={domains} onRefresh={refetchDomains} />
    </div>
  )
}
