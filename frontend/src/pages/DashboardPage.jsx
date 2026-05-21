import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { domainsApi } from '../api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import DomainTable from '../components/DomainTable'
import { Globe, AlertTriangle, Server, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const qc = useQueryClient()
  const [syncing, setSyncing] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => domainsApi.getStats().then(r => r.data),
    refetchInterval: 5 * 60 * 1000,
  })

  const { data: domains = [], refetch: refetchDomains, isLoading: domainsLoading } = useQuery({
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
    <div className="page-content flex-1 overflow-auto">
      <PageHeader
        title="Domain Overview"
        subtitle="Monitor expiry, status, and tags across all GoDaddy accounts"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
        }
      />

      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard
          title="Total Domains"
          value={statsLoading ? '…' : stats?.totalDomains}
          icon={Globe}
          color="#6366f1"
        />
        <StatCard
          title="Expiring Soon"
          value={statsLoading ? '…' : stats?.expiringSoon}
          icon={AlertTriangle}
          color="#facc15"
          subtitle="Next 30 days"
        />
        <StatCard
          title="Accounts"
          value={statsLoading ? '…' : stats?.totalAccounts}
          icon={Server}
          color="#4ade80"
        />
        <StatCard
          title="Expired"
          value={statsLoading ? '…' : stats?.expiredDomains}
          icon={XCircle}
          color="#f87171"
        />
      </div>

      <DomainTable domains={domains} onRefresh={refetchDomains} loading={domainsLoading} />
    </div>
  )
}
