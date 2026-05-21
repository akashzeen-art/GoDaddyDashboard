export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div
      className="card stat-card card-interactive flex items-start gap-4"
      style={{ '--stat-accent': color }}>
      <div
        className="p-3 rounded-xl flex-shrink-0"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}30`,
          boxShadow: `0 4px 12px ${color}15`,
        }}>
        <Icon size={22} style={{ color }} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
        <p className="text-2xl font-bold mt-1 tabular-nums tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {value ?? '—'}
        </p>
        {subtitle && (
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
