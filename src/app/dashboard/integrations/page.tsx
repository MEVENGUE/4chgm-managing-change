'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plug, Check, RefreshCw, AlertTriangle, Plus, Database } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { useTranslation } from '@/i18n/I18nProvider'
import { CONNECTORS, type Connector, type ConnectorStatus } from '@/services/connectors'

const STATUS_META: Record<ConnectorStatus, { label: string; color: string; icon: typeof Check }> = {
  connected: { label: 'Connected', color: 'var(--success)', icon: Check },
  syncing: { label: 'Syncing', color: 'var(--info)', icon: RefreshCw },
  available: { label: 'Connect', color: 'var(--text-muted)', icon: Plus },
  error: { label: 'Action needed', color: 'var(--danger)', icon: AlertTriangle },
}

function ConnectorCard({ connector, index }: { connector: Connector; index: number }) {
  const meta = STATUS_META[connector.status]
  const Icon = meta.icon
  const isLive = connector.status === 'connected' || connector.status === 'syncing'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="glass-panel-strong hover-lift group flex flex-col rounded-3xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${connector.accent}, color-mix(in srgb, ${connector.accent} 55%, #000))` }}
          >
            {connector.name.slice(0, 2)}
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{connector.name}</p>
            <span className="pill mt-1 !py-0.5 !text-[10px]">{connector.category}</span>
          </div>
        </div>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
          style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 12%, transparent)` }}
        >
          <Icon className={`h-3 w-3 ${connector.status === 'syncing' ? 'animate-spin' : ''}`} />
          {meta.label}
        </span>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">{connector.description}</p>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <Database className="h-3 w-3" />
            {connector.records ? `${connector.records.toLocaleString()} records` : '—'}
          </span>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)]">{connector.status === 'error' ? connector.lastSync : 'Not connected'}</span>
        )}
        <button
          className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
        >
          {isLive ? 'Manage' : connector.status === 'error' ? 'Reconnect' : 'Connect'}
        </button>
      </div>
    </motion.div>
  )
}

export default function IntegrationsPage() {
  const { t } = useTranslation()
  const [connectors, setConnectors] = useState<Connector[]>(CONNECTORS)
  const [filter, setFilter] = useState<string>('All')

  useEffect(() => {
    setConnectors(CONNECTORS)
  }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(CONNECTORS.map((c) => c.category)))], [])
  const filtered = filter === 'All' ? connectors : connectors.filter((c) => c.category === filter)

  const connectedCount = connectors.filter((c) => c.status === 'connected').length
  const totalRecords = connectors.reduce((sum, c) => sum + (c.records ?? 0), 0)

  const stats = [
    { label: 'Connected Sources', value: connectedCount },
    { label: 'Records Ingested', value: totalRecords.toLocaleString() },
    { label: 'Available', value: connectors.filter((c) => c.status === 'available').length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Plug}
        title="Data Connectors"
        subtitle={t('integrations.subtitle')}
        actions={
          <button className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:opacity-90">
            <Plus className="h-4 w-4" /> Add source
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel-strong rounded-3xl p-5"
          >
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-2">{s.value}</p>
          </motion.div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: filter === cat ? 'var(--primary)' : 'var(--border-subtle)',
              background: filter === cat ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-surface)',
              color: filter === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <ConnectorCard key={c.id} connector={c} index={i} />
        ))}
      </section>
    </div>
  )
}
