import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const STATUSES = ['Open', 'Investigating', 'Resolved', 'Not a Loss']

const STATUS_STYLES = {
  Open:            'bg-red-50 text-red-700',
  Investigating:   'bg-amber-100 text-amber-700',
  Resolved:        'bg-emerald-100 text-emerald-700',
  'Not a Loss':    'bg-slate-100 text-slate-700',
}

function statusClass(status) {
  return STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'
}

export default function LeakageInvestigationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('Investigating')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get(`/leakage/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        setItem(data.data)
        setNotes(data.data.notes || '')
        setStatus(data.data.status || 'Investigating')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.response?.data?.message || 'Unable to load this investigation.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const { data } = await api.post(`/leakage/${id}/investigate`, {
        notes,
        status,
      })
      setItem(data.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save the investigation.')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading investigation…</div>
  }

  if (!item) {
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-red-50 p-4 text-red-700">
          {error || 'Investigation not found.'}
        </div>
        <Link
          to="/leakage"
          className="mt-4 inline-block text-sm font-semibold text-brand-700"
        >
          ← Back to leakage detector
        </Link>
      </div>
    )
  }

  const diff = Number(item.expectedValue || 0) - Number(item.actualValue || 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <Link to="/leakage" className="text-sm font-semibold text-brand-700">
        ← Back to leakage detector
      </Link>

      {/* Summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {item.leakageType}
            </div>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {item.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Potential variance only. This is not automatically proof of theft
              or confirmed loss.
            </p>
            <div className="mt-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                {item.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900">
              {fmt(item.amount)}
            </div>
            <div className="text-sm text-slate-500">Potential variance</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Expected</div>
            <div className="mt-1 font-bold text-slate-900">
              {fmt(item.expectedValue)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Actual</div>
            <div className="mt-1 font-bold text-slate-900">
              {fmt(item.actualValue)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Difference</div>
            <div className={`mt-1 font-bold ${diff > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {fmt(diff)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Risk</div>
            <div className="mt-1 font-bold text-slate-900">{item.riskLevel}</div>
          </div>
        </div>

        {item.notes && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Detection note
            </div>
            {item.notes}
          </div>
        )}

        <div className="mt-4 text-xs text-slate-400">
          Detected {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
          {item.updatedAt ? ` · Last updated ${new Date(item.updatedAt).toLocaleString()}` : ''}
        </div>
      </div>

      {/* Investigation form */}
      <form
        onSubmit={save}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
      >
        <h2 className="text-xl font-bold text-slate-900">Investigation notes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Record what you found, who you spoke to, and what should happen next.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            Investigation saved.
          </div>
        )}

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
          placeholder="e.g. Counted physical cash at 6 pm. KSh 5,600 missing vs the cash-up sheet. Asked Amina for the M-Pesa statement tomorrow."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save investigation'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/leakage')}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}