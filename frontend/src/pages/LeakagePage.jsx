import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function LeakagePage() {
  const [leakages, setLeakages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await api.get('/leakage')
      setLeakages(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load leakage records.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const runDetection = async () => {
    setRunning(true)
    setError('')
    try { await api.post('/leakage/run-detection'); await load() }
    catch (err) { setError(err.response?.data?.message || 'Detection could not be completed.') }
    finally { setRunning(false) }
  }

  const total = leakages.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div><h1 className="text-3xl font-black text-slate-900">Potential Financial Leakage</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Detected variances are prompts for investigation, not automatic proof of theft or confirmed loss.</p></div>
        <div className="text-right"><div className="text-3xl font-black text-slate-900">KSh {total.toLocaleString()}</div><div className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Potential variance</div><button onClick={runDetection} disabled={running} className="mt-3 block rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{running ? 'Checking...' : 'Run detection'}</button></div>
      </div>
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-soft">Loading leakage records...</div> : leakages.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center shadow-soft"><h2 className="font-bold">No leakage detected</h2><p className="mt-2 text-sm text-slate-500">Your current records do not show significant financial variance.</p></div> : <div className="grid gap-4 lg:grid-cols-3">{leakages.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{item.riskLevel}</span><span className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.leakageType}</span></div><h3 className="text-xl font-bold">{item.title}</h3><div className="mt-4 text-2xl font-black">KSh {Number(item.amount || 0).toLocaleString()}</div><div className="mt-4 space-y-2 text-sm text-slate-600"><div>Expected: KSh {Number(item.expectedValue || 0).toLocaleString()}</div><div>Actual: KSh {Number(item.actualValue || 0).toLocaleString()}</div><div>Status: {item.status}</div></div><Link to={`/leakage/${item.id}`} className="mt-6 block w-full rounded-xl bg-brand-700 px-4 py-3 text-center font-semibold text-white">Investigate</Link></div>)}</div>}
    </div>
  )
}
