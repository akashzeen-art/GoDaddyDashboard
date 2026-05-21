import { useState, useMemo } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Search, ChevronUp, ChevronDown, Tag, ExternalLink, Globe, Inbox } from 'lucide-react'
import { domainsApi } from '../api'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status?.toLowerCase() ?? 'unknown'}`}>{status ?? 'Unknown'}</span>
)

const DaysLeft = ({ expiryDate }) => {
  if (!expiryDate) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const days = differenceInDays(new Date(expiryDate), new Date())
  const color = days < 0 ? '#f87171' : days < 30 ? '#facc15' : '#4ade80'
  return (
    <span className="font-medium tabular-nums" style={{ color, fontSize: '0.8rem' }}>
      {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
    </span>
  )
}

export default function DomainTable({ domains = [], onRefresh, loading }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [editingTag, setEditingTag] = useState(null)
  const [tagValue, setTagValue] = useState('')

  const accounts = useMemo(() => [...new Set(domains.map(d => d.accountName))].sort(), [domains])

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
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
      <div className="filter-bar flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[12rem]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            style={{ paddingLeft: '2.35rem' }}
            placeholder="Search domains..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING">Expiring</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <select style={{ width: 'auto' }} value={accountFilter} onChange={e => { setAccountFilter(e.target.value); setPage(1) }}>
          <option value="">All accounts</option>
          {accounts.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <span
          className="text-sm font-medium px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          {loading ? '…' : `${filtered.length} domains`}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Account</th>
              <th>
                <button
                  type="button"
                  className="flex items-center gap-1 font-semibold"
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}>
                  Expiry {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </th>
              <th>Days left</th>
              <th>Status</th>
              <th>Client tag</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading domains…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center py-14" style={{ color: 'var(--text-secondary)' }}>
                    <div className="empty-state-icon">
                      <Inbox size={28} color="#6366f1" style={{ opacity: 0.7 }} />
                    </div>
                    <p className="font-semibold text-base">No domains found</p>
                    <p className="text-sm mt-1">Try adjusting filters or sync from Accounts</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(d => (
                <tr
                  key={d.id}
                  style={
                    d.status === 'EXPIRING'
                      ? { background: 'rgba(234, 179, 8, 0.04)' }
                      : d.status === 'EXPIRED'
                        ? { background: 'rgba(239, 68, 68, 0.04)' }
                        : undefined
                  }>
                  <td>
                    <span className="font-semibold flex items-center gap-2">
                      <Globe size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {d.domainName}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.accountName}</td>
                  <td style={{ color: 'var(--text-secondary)' }} className="tabular-nums">
                    {d.expiryDate ? format(new Date(d.expiryDate), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td>
                    <DaysLeft expiryDate={d.expiryDate} />
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td>
                    {editingTag === d.id ? (
                      <div className="flex gap-1.5">
                        <input
                          style={{ width: '7rem', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                          value={tagValue}
                          onChange={e => setTagValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveTag(d.id)}
                          autoFocus
                        />
                        <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => saveTag(d.id)}>
                          Save
                        </button>
                        <button type="button" className="btn-ghost" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setEditingTag(null)}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost flex items-center gap-1"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => { setEditingTag(d.id); setTagValue(d.clientTag ?? '') }}>
                        <Tag size={12} /> {d.clientTag || 'Add tag'}
                      </button>
                    )}
                  </td>
                  <td>
                    <a
                      href={`https://${d.domainName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost inline-flex items-center gap-1"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                      <ExternalLink size={12} /> Open
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 filter-bar" style={{ borderBottom: 'none', borderTop: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <button type="button" className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
