import { useEffect, useState } from 'react'
import api from '../services/api'

const emptyForm = {
  category: '',
  description: '',
  amount: '',
  paymentMethod: 'Cash',
}

const CATEGORIES = [
  'Rent', 'Electricity', 'Water', 'Transport', 'Salaries',
  'Supplies', 'Marketing', 'Maintenance', 'Airtime', 'Other',
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({ totalExpenses: 0, todayExpenses: 0, count: 0 })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadAll() {
    const [expRes, sumRes] = await Promise.all([
      api.get('/expenses'),
      api.get('/expenses/summary'),
    ])
    setExpenses(expRes.data.data || [])
    setSummary(sumRes.data.data || {})
  }

  useEffect(() => {
    loadAll().catch((e) => {
      console.error(e)
      setError('Failed to load expenses.')
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

  function startEdit(expense) {
    setForm({
      category: expense.category || '',
      description: expense.description || '',
      amount: expense.amount ?? '',
      paymentMethod: expense.paymentMethod || 'Cash',
    })
    setEditingId(expense.id)
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

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than 0.')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required.')
      return
    }

    setSaving(true)
    const payload = {
      category: form.category || 'Other',
      description: form.description.trim(),
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
    }

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload)
      } else {
        await api.post('/expenses', payload)
      }
      cancelForm()
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save expense.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(expense) {
    if (!window.confirm(`Delete expense "${expense.description}"?`)) return
    try {
      await api.delete(`/expenses/${expense.id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to delete expense.')
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  const cards = [
    ["Today's expenses", fmt(summary.todayExpenses)],
    ['Total expenses', fmt(summary.totalExpenses)],
    ['Records', summary.count ?? 0],
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Expenses</h1>
        <button
          onClick={() => (showForm ? cancelForm() : startAdd())}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {error && !showForm && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-4 md:p-6"
        >
          <div className="md:col-span-4 text-sm font-semibold text-slate-700">
            {editingId ? 'Editing expense' : 'New expense'}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            >
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
            <input
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="e.g. Shop rent for September"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Amount (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Payment method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => update('paymentMethod', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            >
              <option>Cash</option>
              <option>M-Pesa</option>
              <option>Bank</option>
              <option>Card</option>
            </select>
          </div>

          {error && (
            <div className="md:col-span-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="md:col-span-4 flex justify-end gap-2">
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
              {saving ? 'Saving…' : editingId ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Recorded by</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    No expenses yet. Click <strong>Add Expense</strong> to record one.
                  </td>
                </tr>
              )}
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {expense.date ? new Date(expense.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{expense.description}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(expense.amount)}</td>
                  <td className="px-4 py-3">{expense.paymentMethod}</td>
                  <td className="px-4 py-3 text-slate-500">{expense.recordedBy || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(expense)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(expense)}
                      className="ml-2 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}