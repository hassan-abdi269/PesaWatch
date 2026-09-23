import { useEffect, useState } from 'react'
import api from '../services/api'

const emptyForm = {
  name: '',
  phone: '',
  amount: '',
  paid: '',
  dueDate: '',
  status: 'Open',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [summary, setSummary] = useState({ totalOutstanding: 0, overdueCount: 0, count: 0 })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadAll() {
    const [custRes, sumRes] = await Promise.all([
      api.get('/customers'),
      api.get('/customers/summary'),
    ])
    setCustomers(custRes.data.data || [])
    setSummary(sumRes.data.data || {})
  }

  useEffect(() => {
    loadAll().catch((e) => {
      console.error(e)
      setError('Failed to load customers.')
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

  function startEdit(customer) {
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      amount: customer.amount ?? '',
      paid: customer.paid ?? '',
      dueDate: customer.dueDate ? customer.dueDate.slice(0, 10) : '',
      status: customer.status || 'Open',
    })
    setEditingId(customer.id)
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
      setError('Customer name is required.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      amount: Number(form.amount || 0),
      paid: Number(form.paid || 0),
      dueDate: form.dueDate || null,
      status: form.status,
    }

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload)
      } else {
        await api.post('/customers', payload)
      }
      cancelForm()
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save customer.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(customer) {
    if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/customers/${customer.id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to delete customer.')
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  function statusStyle(status) {
    switch (status) {
      case 'Overdue': return 'bg-red-50 text-red-700'
      case 'Paid':    return 'bg-emerald-100 text-emerald-700'
      case 'Partial': return 'bg-amber-100 text-amber-700'
      default:        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {summary.overdueCount} overdue · {summary.count} total
          </p>
        </div>
        <button
          onClick={() => (showForm ? cancelForm() : startAdd())}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? 'Cancel' : 'Add Customer'}
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
            {editingId ? `Editing ${form.name}` : 'New customer'}
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
            <label className="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="07XX XXX XXX"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            >
              <option>Open</option>
              <option>Partial</option>
              <option>Overdue</option>
              <option>Paid</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Amount owed (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Paid (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.paid}
              onChange={(e) => update('paid', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div className="md:col-span-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Balance:{' '}
            <strong>
              {fmt((Number(form.amount) || 0) - (Number(form.paid) || 0))}
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
              {saving ? 'Saving…' : editingId ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Total outstanding</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {fmt(summary.totalOutstanding)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Overdue</div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {summary.overdueCount}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Total customers</div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {summary.count}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                    No customers yet. Click <strong>Add Customer</strong> to create one.
                  </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone || '—'}</td>
                  <td className="px-4 py-3">{fmt(customer.amount)}</td>
                  <td className="px-4 py-3">{fmt(customer.paid)}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(customer.balance)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {customer.dueDate ? new Date(customer.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(customer)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(customer)}
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