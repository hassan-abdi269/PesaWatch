import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const RISK_STYLES = {
  Medium:    'bg-amber-100 text-amber-700',
  Warning:   'bg-orange-100 text-orange-700',
  Attention: 'bg-sky-100 text-sky-700',
  High:      'bg-red-100 text-red-700',
  Low:       'bg-emerald-100 text-emerald-700',
}

const STATUS_STYLES = {
  Open:            'bg-red-50 text-red-700',
  Investigating:   'bg-amber-100 text-amber-700',
  Resolved:        'bg-emerald-100 text-emerald-700',
  'Not a Loss':    'bg-slate-100 text-slate-700',
}

function riskClass(level) {
  return RISK_STYLES[level] || 'bg-slate-100 text-slate-700'
}

function statusClass(status) {
  return STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'
}

export default function LeakagePage() {
  const [leakages, setLeakages] = useState([])
  const [summary, setSummary] = useState({
    totalRecords: 0,
    openCount: 0,
    resolvedCount: 0,
    byType: {},
  })
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')  // all | open | resolved

  async function loadAll() {
    setLoading(true)
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/leakage'),
        api.get('/leakage/summary'),
      ])
      setLeakages(listRes.data.data || [])
      setSummary(sumRes.data.data || {})
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load leakage records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function runDetection() {
    setRunning(true)
    setError('')
    try {
      await api.post('/leakage/run-detection')
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Detection could not be completed.')
    } finally {
      setRunning(false)
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  const visible = leakages.filter((l) => {
    if (filter === 'open') return l.status === 'Open' || l.status === 'Investigating'
    if (filter === 'resolved') return l.status === 'Resolved' || l.status === 'Not a Loss'
    return true
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black text-slate-900">
            Potential Financial Leakage
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Detected variances are prompts for investigation, not automatic proof
            of theft or confirmed loss. Each row shows what the system expected,
            what it found, and the gap between them.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900">
            {summary.totalRecords ?? leakages.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            records · {summary.openCount ?? 0} open
            {summary.resolvedCount > 0 ? ` · ${summary.resolvedCount} resolved` : ''}
          </div>
          <button
            onClick={runDetection}
            disabled={running}
            className="mt-3 block rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {running ? 'Checking…' : 'Run detection'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Per-type totals */}
      {!loading && Object.keys(summary.byType || {}).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Object.entries(summary.byType).map(([type, amt]) => (
            <div
              key={type}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {type}
              </div>
              <div className="mt-2 text-xl font-black text-slate-900">
                {fmt(amt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && leakages.length > 0 && (
        <div className="flex gap-2">
          {[
            ['all', 'All'],
            ['open', 'Open / Investigating'],
            ['resolved', 'Resolved / Not a Loss'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                filter === key
                  ? 'bg-brand-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-soft">
          Loading leakage records…
        </div>
      ) : leakages.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">No leakage detected</h2>
          <p className="mt-2 text-sm text-slate-500">
            Run detection to scan your sales, expenses, customers, and suppliers
            for potential variances.
          </p>
          <button
            onClick={runDetection}
            disabled={running}
            className="mt-5 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {running ? 'Checking…' : 'Run detection'}
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
          Nothing matches the current filter.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskClass(item.riskLevel)}`}>
                  {item.riskLevel}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {item.leakageType}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>

              <div className="mt-3 text-2xl font-black text-slate-900">
                {fmt(item.amount)}
              </div>
              <div className="mt-1 text-xs text-slate-500">Potential variance</div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Expected</span>
                  <span className="font-semibold text-slate-900">
                    {fmt(item.expectedValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Actual</span>
                  <span className="font-semibold text-slate-900">
                    {fmt(item.actualValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {item.notes && (
                <p className="mt-4 line-clamp-3 text-xs text-slate-500">
                  {item.notes}
                </p>
              )}

              <Link
                to={`/leakage/${item.id}`}
                className="mt-5 block w-full rounded-xl bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
              >
                Investigate
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}