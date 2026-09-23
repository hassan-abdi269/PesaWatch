import { useEffect, useState } from 'react'
import api from '../services/api'

const emptyForm = {
  invoiceNo: '',
  customerName: '',
  paymentMethod: 'Cash',
  amount: '',
  discount: '',
  status: 'Paid',
}

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [summary, setSummary] = useState({
    todaySales: 0,
    totalSales: 0,
    cashSales: 0,
    mpesaSales: 0,
  })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)   // null = adding, number = editing that sale
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadAll() {
    const [salesRes, sumRes] = await Promise.all([
      api.get('/sales'),
      api.get('/sales/summary'),
    ])
    setSales(salesRes.data.data || [])
    setSummary(sumRes.data.data || {})
  }

  useEffect(() => {
    loadAll().catch((e) => {
      console.error(e)
      setError('Failed to load sales.')
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

  function startEdit(sale) {
    setForm({
      invoiceNo: sale.invoiceNo || '',
      customerName: sale.customerName || '',
      paymentMethod: sale.paymentMethod || 'Cash',
      amount: sale.amount ?? '',
      discount: sale.discount ?? '',
      status: sale.status || 'Paid',
    })
    setEditingId(sale.id)
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

    setSaving(true)
    const payload = {
      invoiceNo: form.invoiceNo || undefined,
      customerName: form.customerName || 'Walk-in',
      paymentMethod: form.paymentMethod,
      amount: Number(form.amount),
      discount: Number(form.discount || 0),
      status: form.status,
    }

    try {
      if (editingId) {
        await api.put(`/sales/${editingId}`, payload)
      } else {
        await api.post('/sales', payload)
      }
      cancelForm()
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save sale.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(sale) {
    if (!window.confirm(`Delete invoice ${sale.invoiceNo}? This cannot be undone.`)) return
    try {
      await api.delete(`/sales/${sale.id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to delete sale.')
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  const cards = [
    ["Today's sales", fmt(summary.todaySales)],
    ['Total sales', fmt(summary.totalSales)],
    ['Cash sales', fmt(summary.cashSales)],
    ['M-Pesa sales', fmt(summary.mpesaSales)],
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Sales</h1>
        <button
          onClick={() => (showForm ? cancelForm() : startAdd())}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? 'Cancel' : 'Add Sale'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3 md:p-6"
        >
          <div className="md:col-span-3 text-sm font-semibold text-slate-700">
            {editingId ? `Editing invoice ${form.invoiceNo || `#${editingId}`}` : 'New sale'}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Invoice No (optional)</label>
            <input
              value={form.invoiceNo}
              onChange={(e) => update('invoiceNo', e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Customer</label>
            <input
              value={form.customerName}
              onChange={(e) => update('customerName', e.target.value)}
              placeholder="Walk-in"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
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
            <label className="mb-1 block text-xs font-semibold text-slate-600">Discount (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={(e) => update('discount', e.target.value)}
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
              <option>Paid</option>
              <option>Pending</option>
              <option>Refunded</option>
            </select>
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
              {saving ? 'Saving…' : editingId ? 'Update Sale' : 'Save Sale'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                  No sales yet. Click <strong>Add Sale</strong> to record one.
                </td>
              </tr>
            )}
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3">
                  {sale.date ? new Date(sale.date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">{sale.invoiceNo}</td>
                <td className="px-4 py-3">{sale.customerName}</td>
                <td className="px-4 py-3">{sale.paymentMethod}</td>
                <td className="px-4 py-3">{fmt(sale.amount)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {sale.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(sale)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(sale)}
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
  )
}