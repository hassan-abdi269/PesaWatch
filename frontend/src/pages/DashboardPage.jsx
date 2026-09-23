import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Wallet, ShieldAlert, Package } from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import api from '../services/api'

const fmt = (n, currency = 'KES') =>
  `${currency} ${Number(n || 0).toLocaleString()}`

function TrendBadge({ value, invert }) {
  if (value === null || value === undefined) {
    return <span className="text-xs font-semibold text-slate-400">—</span>
  }
  const positive = value >= 0
  const good = invert ? !positive : positive
  const cls = good
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-amber-50 text-amber-700'
  const arrow = positive ? '↑' : '↓'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/dashboard/summary')
      setSummary(data.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading dashboard…</div>
  }
  if (error || !summary) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || 'Dashboard unavailable.'}
        </div>
      </div>
    )
  }

  const currency = summary.currency || 'KES'

  const statCards = [
    {
      label: 'Revenue',
      value: fmt(summary.revenue, currency),
      trend: <TrendBadge value={summary.revenueTrendPct} />,
      icon: DollarSign,
      tone: 'text-brand-700 bg-brand-50',
    },
    {
      label: 'Expenses',
      value: fmt(summary.expenses, currency),
      trend: <TrendBadge value={summary.expensesTrendPct} invert />,
      icon: Wallet,
      tone: 'text-slate-700 bg-slate-100',
    },
    {
      label: 'Estimated profit',
      value: fmt(summary.estimatedProfit, currency),
      trend: (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          Number(summary.estimatedProfit) >= 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {Number(summary.estimatedProfit) >= 0 ? 'Healthy' : 'Loss'}
        </span>
      ),
      icon: TrendingUp,
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Potential leakage',
      value: fmt(summary.potentialLeakage, currency),
      trend: (
        <Link to="/leakage" className="text-xs font-semibold text-amber-700 hover:underline">
          Investigate →
        </Link>
      ),
      icon: ShieldAlert,
      tone: 'text-amber-700 bg-amber-50',
    },
  ]

  const monthly = summary.monthlySeries || []
  const leakageByType = summary.leakageByType || []

  return (
    <div className="space-y-6 p-4 md:p-6 xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {summary.businessName} · Financial visibility and leakage overview
          </p>
        </div>
        <Link
          to="/reports"
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Generate report
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, trend, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${tone}`}>
                <Icon size={20} />
              </div>
              {trend}
            </div>
            <div className="mt-5 text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats: credit + inventory value */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-50 p-3 text-sky-700">
              <Wallet size={18} />
            </div>
            <div>
              <div className="text-sm text-slate-500">Customer credit outstanding</div>
              <div className="text-lg font-bold text-slate-900">
                {fmt(summary.customerCredit, currency)}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Package size={18} />
            </div>
            <div>
              <div className="text-sm text-slate-500">Total potential leakage</div>
              <div className="text-lg font-bold text-slate-900">
                {fmt(summary.potentialLeakage, currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        {/* Revenue / expenses / profit chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Revenue, expenses and profit</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {currency}
            </span>
          </div>
          <div className="h-72">
            {monthly.every((m) => m.revenue === 0 && m.expenses === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No sales or expenses yet in the last 6 months.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => fmt(value, currency)} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueFill)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fillOpacity={0.25} fill="#f59e0b" name="Expenses" />
                  <Area type="monotone" dataKey="profit" stroke="#2563eb" fillOpacity={0.15} fill="#2563eb" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Leakage by type chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Leakage by type</h2>
            <Link to="/leakage" className="text-xs font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-5 h-72">
            {leakageByType.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No leakage detected yet. Run detection from the leakage page.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leakageByType} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => fmt(value, currency)} />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}