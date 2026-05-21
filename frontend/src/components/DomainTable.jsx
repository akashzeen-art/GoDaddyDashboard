import { useState, useMemo } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Search, ChevronUp, ChevronDown, Tag, ExternalLink } from 'lucide-react'
import { domainsApi } from '../api'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status?.toLowerCase() ?? 'unknown'}`}>
    {status ?? 'Unknown'}
  </span>
)

const DaysLeft = ({ expiryDate }) => {
  if (!expiryDate) return <span style={{ color: 'var(--text-secondary)' }}>—</span>
  const days = differenceInDays(new Date(expiryDate), new Date())
  const color = days < 0 ? '#f87171' : days < 30 ? '#facc15' : '#4ade80'
  return <span style={{ color, fontSize: '0.75rem' }}>{days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}</span>
}

export default function DomainTable({ domains = [], onRefresh }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [editingTag, setEditingTag] = useState(null)
  const [tagValue, setTagValue] = useState('')

  const accounts = useMemo(() => [...new Set(domains.map(d => d.accountName))], [domains])

  const filtered = useMemo(() => {
    let list = domains
    if (search) list = list.filter(d => d.domainName.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) list = list.filter(d => d.status === statusFilter)
    if (accountFilter) list = list.filter(d => d.accountName === accountFilter)
    list = [...list].sort((a, b) => {
      const da = a.expiryDate ? new Date(a.expiryDate) : new Date(0)
      const db = b.expiryDate ? new Date(b.expiryDate) : new Date(0)
      return sortDir === 'asc' ? da - db : db - da
    })
    return list
  }, [domains, search, statusFilter, accountFilter, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const saveTag = async (id) => {
    try {
      await domainsApi.updateTag(id, tagValue)
      toast.success('Tag updated')
      setEditingTag(null)
      onRefresh?.()
    } catch {
      toast.error('Failed to update tag')
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input style={{ paddingLeft: '2rem' }} placeholder="Search domains..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING">Expiring</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <select style={{ width: 'auto' }} value={accountFilter} onChange={e => { setAccountFilter(e.target.value); setPage(1) }}>
          <option value="">All Accounts</option>
          {accounts.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-sm self-center" style={{ color: 'var(--text-secondary)' }}>
          {filtered.length} domains
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Domain Name</th>
              <th>Account</th>
              <th>
                <button className="flex items-center gap-1" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  Expiry Date {sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </th>
              <th>Days Left</th>
              <th>Status</th>
              <th>Client Tag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No domains found</td></tr>
            ) : paginated.map(d => (
              <tr key={d.id} style={d.status === 'EXPIRING' ? { background: 'rgba(234,179,8,0.04)' } : d.status === 'EXPIRED' ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                <td className="font-medium">{d.domainName}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.accountName}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {d.expiryDate ? format(new Date(d.expiryDate), 'MMM dd, yyyy') : '—'}
                </td>
                <td><DaysLeft expiryDate={d.expiryDate} /></td>
                <td><StatusBadge status={d.status} /></td>
                <td>
                  {editingTag === d.id ? (
                    <div className="flex gap-1">
                      <input style={{ width: '100px', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        value={tagValue} onChange={e => setTagValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveTag(d.id)} autoFocus />
                      <button className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => saveTag(d.id)}>✓</button>
                      <button className="btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setEditingTag(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1 btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => { setEditingTag(d.id); setTagValue(d.clientTag ?? '') }}>
                      <Tag size={11} /> {d.clientTag || 'Add tag'}
                    </button>
                  )}
                </td>
                <td>
                  <a href={`https://${d.domainName}`} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost flex items-center gap-1" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex' }}>
                    <ExternalLink size={11} /> View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
