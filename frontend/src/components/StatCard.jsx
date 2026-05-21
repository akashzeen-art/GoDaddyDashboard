export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card flex items-start gap-4">
      <div className="p-3 rounded-lg flex-shrink-0" style={{ background: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
    </div>
  )
}
