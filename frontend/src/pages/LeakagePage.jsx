import { useEffect, useState } from 'react'
import api from '../services/api'

export default function LeakagePage() {
  const [leakages, setLeakages] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/leakage')
      setLeakages(response.data.data)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Potential Financial Leakage</h1>
            <p className="mt-2 text-sm text-slate-500">This amount represents detected financial variances based on available business data.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900">KSh {leakages.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}</div>
            <div className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Medium Risk</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {leakages.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{item.riskLevel}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.leakageType}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
            <div className="mt-4 text-2xl font-black text-slate-900">KSh {Number(item.amount || 0).toLocaleString()}</div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>Expected: KSh {Number(item.expectedValue || 0).toLocaleString()}</div>
              <div>Actual: KSh {Number(item.actualValue || 0).toLocaleString()}</div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white">Investigate</button>
          </div>
        ))}
      </div>
    </div>
  )
}
