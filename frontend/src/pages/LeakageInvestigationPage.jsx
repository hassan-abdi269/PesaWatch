import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const statuses = ['Open', 'Investigating', 'Resolved', 'Not a Loss']

export default function LeakageInvestigationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('Investigating')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/leakage/${id}`)
      .then(({ data }) => {
        setItem(data.data)
        setNotes(data.data.notes || '')
        setStatus(data.data.status || 'Investigating')
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load this investigation.'))
      .finally(() => setLoading(false))
  }, [id])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await api.post(`/leakage/${id}/investigate`, { notes, status })
      setItem(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save the investigation.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading investigation...</div>
  if (!item) return <div className="p-6"><div className="rounded-2xl bg-red-50 p-4 text-red-700">{error || 'Investigation not found.'}</div></div>

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <Link to="/leakage" className="text-sm font-semibold text-brand-700">← Back to leakage detector</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.leakageType}</div>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{item.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Potential variance only. This is not automatically proof of theft or confirmed loss.</p>
          </div>
          <div className="text-right"><div className="text-3xl font-black">KSh {Number(item.amount).toLocaleString()}</div><div className="text-sm text-slate-500">Potential variance</div></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Expected</div><div className="mt-1 font-bold">KSh {Number(item.expectedValue).toLocaleString()}</div></div>
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Actual</div><div className="mt-1 font-bold">KSh {Number(item.actualValue).toLocaleString()}</div></div>
          <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Risk</div><div className="mt-1 font-bold">{item.riskLevel}</div></div>
        </div>
      </div>
      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Investigation notes</h2>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <label className="mt-5 block text-sm font-medium text-slate-700">Status</label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5">
          {statuses.map((value) => <option key={value}>{value}</option>)}
        </select>
        <label className="mt-4 block text-sm font-medium text-slate-700">Notes</label>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="6" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Record what you found and what should happen next." />
        <div className="mt-5 flex gap-3"><button disabled={saving} className="rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save investigation'}</button><button type="button" onClick={() => navigate('/leakage')} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Cancel</button></div>
      </form>
    </div>
  )
}
