import { useEffect, useState } from 'react'
import api from '../services/api'

const emptyForm = {
  name: '',
  contactPerson: '',
  phone: '',
  previousAveragePrice: '',
  currentAveragePrice: '',
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [summary, setSummary] = useState({ count: 0, averageIncrease: 0, flagged: 0 })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadAll() {
    const [supRes, sumRes] = await Promise.all([
      api.get('/suppliers'),
      api.get('/suppliers/summary'),
    ])
    setSuppliers(supRes.data.data || [])
    setSummary(sumRes.data.data || {})
  }

  useEffect(() => {
    loadAll().catch((e) => {
      console.error(e)
      setError('Failed to load suppliers.')
    })
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function startAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError('')
  }

  function startEdit(supplier) {
    setForm({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      previousAveragePrice: supplier.previousAveragePrice ?? '',
      currentAveragePrice: supplier.currentAveragePrice ?? '',
    })
    setEditingId(supplier.id)
    setShowForm(true)
    setError('')
  }

  function cancelForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Supplier name is required.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim() || null,
      phone: form.phone.trim() || null,
      previousAveragePrice: Number(form.previousAveragePrice || 0),
      currentAveragePrice: Number(form.currentAveragePrice || 0),
    }

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, payload)
      } else {
        await api.post('/suppliers', payload)
      }
      cancelForm()
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save supplier.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(supplier) {
    if (!window.confirm(`Delete supplier "${supplier.name}"?`)) return
    try {
      await api.delete(`/suppliers/${supplier.id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to delete supplier.')
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  function increaseStyle(pct) {
    if (pct <= 0) return 'text-emerald-700'
    if (pct <= 10) return 'text-amber-700'
    return 'text-red-700'
  }

  // Live preview in the form
  const previewIncrease = (() => {
    const prev = Number(form.previousAveragePrice) || 0
    const curr = Number(form.currentAveragePrice) || 0
    if (prev <= 0) return 0
    return ((curr - prev) / prev) * 100
  })()

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {summary.count} total · {summary.flagged} flagged for review
          </p>
        </div>
        <button
          onClick={() => (showForm ? cancelForm() : startAdd())}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      {error && !showForm && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3 md:p-6"
        >
          <div className="md:col-span-3 text-sm font-semibold text-slate-700">
            {editingId ? `Editing ${form.name}` : 'New supplier'}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Contact person</label>
            <input
              value={form.contactPerson}
              onChange={(e) => update('contactPerson', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="07XX XXX XXX"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Previous avg price (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.previousAveragePrice}
              onChange={(e) => update('previousAveragePrice', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Current avg price (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.currentAveragePrice}
              onChange={(e) => update('currentAveragePrice', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Increase: <strong className={increaseStyle(previewIncrease)}>
              {previewIncrease.toFixed(1)}%
            </strong>
          </div>

          {error && (
            <div className="md:col-span-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="md:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Suppliers</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.count}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Average price increase</div>
          <div className={`mt-2 text-2xl font-black ${increaseStyle(summary.averageIncrease)}`}>
            {Number(summary.averageIncrease || 0).toFixed(1)}%
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Flagged (&gt;10%)</div>
          <div className="mt-2 text-2xl font-black text-amber-600">{summary.flagged}</div>
        </div>
      </div>

      {suppliers.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
          No suppliers yet. Click <strong>Add Supplier</strong> to create one.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {suppliers.map((supplier) => {
          const pct = Number(supplier.priceIncrease || 0)
          const flagged = pct > 10
          return (
            <div key={supplier.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-bold text-slate-900">{supplier.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {supplier.contactPerson || '—'} · {supplier.phone || 'No phone'}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(supplier)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(supplier)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Previous avg price</span>
                  <span className="font-semibold text-slate-900">{fmt(supplier.previousAveragePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current avg price</span>
                  <span className="font-semibold text-slate-900">{fmt(supplier.currentAveragePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Increase</span>
                  <span className={`font-semibold ${increaseStyle(pct)}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {flagged && (
                <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  ⚠️ Supplier pricing increased by {pct.toFixed(1)}%. Review alternative suppliers before your margins are affected.
                </div>
              )}
              {!flagged && pct <= 0 && (
                <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  ✓ Price stable or decreased. No action needed.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}