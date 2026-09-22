import { useEffect, useState } from 'react'
import api from '../services/api'

export default function ReportsPage() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    async function load() {
      const responses = await Promise.all([
        api.get('/reports/leakage'),
        api.get('/reports/customer-credit'),
        api.get('/reports/supplier-prices'),
      ])
      const merged = responses.flatMap((res) => res.data.data || [])
      setReports(merged)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-black text-slate-900">Reports</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
          <div key={`${report.title || report.name || index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Report</div>
            <div className="mt-3 text-xl font-bold text-slate-900">{report.title || report.name || 'Summary Report'}</div>
            <div className="mt-4 text-sm text-slate-600">{report.amount ? `Amount: KSh ${Number(report.amount).toLocaleString()}` : report.priceIncrease ? `Increase: ${Number(report.priceIncrease).toFixed(1)}%` : 'Generated from current data'} </div>
          </div>
        ))}
      </div>
    </div>
  )
}
