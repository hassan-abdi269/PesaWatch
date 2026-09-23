import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const REPORTS = [
  { key: 'sales',     title: 'Sales',              endpoint: '/reports/sales',            csvType: 'sales',     range: true  },
  { key: 'profit',    title: 'Profit & Loss',      endpoint: '/reports/profit',           csvType: 'profit',    range: true  },
  { key: 'expenses',  title: 'Expenses',           endpoint: '/reports/expenses',         csvType: 'expenses',  range: true  },
  { key: 'leakage',   title: 'Leakage',            endpoint: '/reports/leakage',          csvType: 'leakage',   range: false },
  { key: 'credit',    title: 'Customer Credit',    endpoint: '/reports/customer-credit',  csvType: 'credit',    range: false },
  { key: 'suppliers', title: 'Supplier Pricing',   endpoint: '/reports/supplier-prices',  csvType: 'suppliers', range: false },
]

function isoDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

export default function ReportsPage() {
  const [from, setFrom] = useState(isoDaysAgo(30))
  const [to, setTo] = useState(isoToday())
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState('sales')
  const [expandedKey, setExpandedKey] = useState(null)

  const range = useMemo(() => ({ from, to }), [from, to])

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.all(
        REPORTS.map((r) =>
          api
            .get(r.endpoint, r.range ? { params: range } : undefined)
            .then((res) => [r.key, res.data.data])
            .catch((err) => [r.key, { __error: err?.response?.data?.message || 'Failed' }])
        )
      )
      setData(Object.fromEntries(results))
    } catch (e) {
      console.error(e)
      setError('Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function downloadCsv(type) {
    const params = new URLSearchParams({ type })
    if (['sales', 'expenses', 'profit'].includes(type)) {
      params.set('from', from)
      params.set('to', to)
    }
    const url = `${api.defaults.baseURL}/reports/export?${params.toString()}`
    const token = localStorage.getItem('pesawatch_token')

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Export failed (${res.status})`)
        const blob = await res.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${type}_${from}_${to}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
      })
      .catch((e) => {
        console.error(e)
        setError('Failed to download CSV.')
      })
  }

  const activeReport = REPORTS.find((r) => r.key === active)
  const activeData = data[active]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-slate-900">Reports</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <label className="text-xs font-semibold text-slate-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="text-sm outline-none"
            />
            <label className="ml-2 text-xs font-semibold text-slate-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="text-sm outline-none"
            />
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setActive(r.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              active === r.key
                ? 'bg-brand-700 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* Active report */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{activeReport.title}</h2>
            {activeReport.range && (
              <div className="mt-1 text-xs text-slate-500">
                {from} → {to}
              </div>
            )}
          </div>
          <button
            onClick={() => downloadCsv(activeReport.csvType)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Download CSV
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : activeData?.__error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {activeData.__error}
            </div>
          ) : (
            <ReportBody kind={active} data={activeData} />
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------- Per-report renderers -------------------- */

function ReportBody({ kind, data }) {
  if (!data) return <div className="text-sm text-slate-500">No data.</div>

  switch (kind) {
    case 'sales':
      return <SalesReport data={data} />
    case 'profit':
      return <ProfitReport data={data} />
    case 'expenses':
      return <ExpensesReport data={data} />
    case 'leakage':
      return <LeakageReport data={data} />
    case 'credit':
      return <CreditReport data={data} />
    case 'suppliers':
      return <SuppliersReport data={data} />
    default:
      return null
  }
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-black ${accent || 'text-slate-900'}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

function SimpleTable({ columns, rows, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                {empty || 'No data.'}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-200">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SalesReport({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total sales" value={fmt(data.totalSales)} sub={`${data.count} transactions`} />
        <Stat label="Average sale" value={fmt(data.averageSale)} />
        <Stat label="Days with sales" value={(data.daily || []).length} />
      </div>
      <SimpleTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'count', label: 'Transactions' },
          { key: 'amount', label: 'Amount', render: (r) => fmt(r.amount) },
        ]}
        rows={data.daily || []}
        empty="No sales in this period."
      />
    </div>
  )
}

function ProfitReport({ data }) {
  const isPositive = Number(data.profit || 0) >= 0
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Revenue" value={fmt(data.revenue)} />
        <Stat label="Discounts" value={fmt(data.discounts)} accent="text-amber-700" />
        <Stat label="Expenses" value={fmt(data.expenses)} accent="text-red-700" />
        <Stat
          label="Profit"
          value={fmt(data.profit)}
          accent={isPositive ? 'text-emerald-700' : 'text-red-700'}
          sub={`${data.marginPct}% margin`}
        />
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold text-slate-700">Expenses by category</div>
        <SimpleTable
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'amount', label: 'Amount', render: (r) => fmt(r.amount) },
          ]}
          rows={data.expenseBreakdown || []}
          empty="No expenses in this period."
        />
      </div>
    </div>
  )
}

function ExpensesReport({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total expenses" value={fmt(data.totalExpenses)} />
        <Stat label="Records" value={data.count} />
        <Stat label="Categories" value={(data.byCategory || []).length} />
      </div>
      <SimpleTable
        columns={[
          { key: 'category', label: 'Category' },
          { key: 'amount', label: 'Amount', render: (r) => fmt(r.amount) },
        ]}
        rows={data.byCategory || []}
        empty="No expenses in this period."
      />
    </div>
  )
}

function LeakageReport({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Stat label="Records" value={data.totalRecords} />
        <Stat label="Types" value={(data.byType || []).length} />
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold text-slate-700">By type</div>
        <SimpleTable
          columns={[
            { key: 'type', label: 'Type' },
            { key: 'count', label: 'Records' },
            { key: 'amount', label: 'Amount', render: (r) => fmt(r.amount) },
          ]}
          rows={data.byType || []}
          empty="No leakage records."
        />
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold text-slate-700">All records</div>
        <SimpleTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'type', label: 'Type' },
            { key: 'risk', label: 'Risk' },
            { key: 'status', label: 'Status' },
            { key: 'amount', label: 'Amount', render: (r) => fmt(r.amount) },
          ]}
          rows={data.rows || []}
          empty="No leakage records."
        />
      </div>
    </div>
  )
}

function CreditReport({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total outstanding" value={fmt(data.totalOutstanding)} />
        <Stat label="Overdue" value={fmt(data.totalOverdue)} accent="text-red-700" />
        <Stat label="Customers with balance" value={data.count} />
      </div>
      <SimpleTable
        columns={[
          { key: 'name', label: 'Customer' },
          { key: 'phone', label: 'Phone' },
          { key: 'balance', label: 'Balance', render: (r) => fmt(r.balance) },
          { key: 'dueDate', label: 'Due' },
          {
            key: 'overdue',
            label: 'Status',
            render: (r) =>
              r.overdue ? (
                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">Overdue</span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Current</span>
              ),
          },
        ]}
        rows={data.rows || []}
        empty="No customers with outstanding balance."
      />
    </div>
  )
}

function SuppliersReport({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Suppliers" value={data.count} />
        <Stat label="Average increase" value={`${data.averageIncrease}%`} />
        <Stat label="Flagged (>10%)" value={data.flaggedCount} accent="text-amber-700" />
      </div>
      <SimpleTable
        columns={[
          { key: 'name', label: 'Supplier' },
          { key: 'phone', label: 'Phone' },
          { key: 'previousPrice', label: 'Previous', render: (r) => fmt(r.previousPrice) },
          { key: 'currentPrice', label: 'Current', render: (r) => fmt(r.currentPrice) },
          {
            key: 'increasePct',
            label: 'Increase',
            render: (r) => (
              <span className={
                r.increasePct > 10 ? 'text-red-700 font-semibold'
                : r.increasePct > 0 ? 'text-amber-700'
                : 'text-emerald-700'
              }>
                {r.increasePct.toFixed(1)}%
              </span>
            ),
          },
        ]}
        rows={data.rows || []}
        empty="No suppliers yet."
      />
    </div>
  )
}