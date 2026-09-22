import { useEffect, useState } from 'react'
import { ArrowUpRight, DollarSign, Eye, Package, ShieldAlert, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../services/api'

const monthData = [
  { name: 'Jan', revenue: 260000, expenses: 180000, profit: 70000 },
  { name: 'Feb', revenue: 290000, expenses: 195000, profit: 82000 },
  { name: 'Mar', revenue: 350000, expenses: 228000, profit: 98000 },
  { name: 'Apr', revenue: 370000, expenses: 240000, profit: 105000 },
  { name: 'May', revenue: 395000, expenses: 260000, profit: 118000 },
  { name: 'Jun', revenue: 428650, expenses: 291430, profit: 96420 },
]

const categoryData = [
  { name: 'Stock', value: 4600 },
  { name: 'Cash', value: 5600 },
  { name: 'Credit', value: 8400 },
  { name: 'Suppliers', value: 3200 },
  { name: 'Expenses', value: 2100 },
  { name: 'Discounts', value: 1800 },
]

export default function DashboardPage() {
  const [summary, setSummary] = useState({ revenue: 428650, expenses: 291430, estimatedProfit: 96420, potentialLeakage: 18740 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/dashboard/summary')
        setSummary(response.data.data)
      } catch (error) {
        console.error('Dashboard summary load failed', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const statCards = [
    { label: 'Revenue', value: `KSh ${summary.revenue.toLocaleString()}`, trend: '+8.4%', icon: DollarSign, tone: 'text-brand-700 bg-brand-50' },
    { label: 'Expenses', value: `KSh ${summary.expenses.toLocaleString()}`, trend: '+3.1%', icon: Wallet, tone: 'text-slate-700 bg-slate-100' },
    { label: 'Estimated Profit', value: `KSh ${summary.estimatedProfit.toLocaleString()}`, trend: 'Healthy', icon: TrendingUp, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Potential Leakage', value: `KSh ${summary.potentialLeakage.toLocaleString()}`, trend: '-12.5%', icon: ShieldAlert, tone: 'text-amber-700 bg-amber-50' },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Financial visibility and leakage overview</p>
        </div>
        <button className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white">Generate report</button>
      </div>

      {loading ? <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-soft">Loading dashboard...</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, trend, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></div>
              <div className="text-sm font-semibold text-brand-700">{trend}</div>
            </div>
            <div className="mt-5 text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Revenue and Profit</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">KES</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueFill)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#f59e0b" fillOpacity={0.3} fill="#f59e0b" name="Expenses" />
                <Area type="monotone" dataKey="profit" stroke="#2563eb" fillOpacity={0.2} fill="#2563eb" name="Estimated Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">Potential Leakage by Category</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
