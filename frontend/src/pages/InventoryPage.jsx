import { useEffect, useState } from 'react'
import api from '../services/api'

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  supplier: '',
  purchasePrice: '',
  sellingPrice: '',
  quantity: '',
  reorderLevel: '',
}

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const response = await api.get('/inventory')
    setItems(response.data.data || [])
  }

  useEffect(() => {
    load().catch((e) => {
      console.error(e)
      setError('Failed to load inventory.')
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

  function startEdit(item) {
    setForm({
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      supplier: item.supplier || '',
      purchasePrice: item.purchasePrice ?? '',
      sellingPrice: item.sellingPrice ?? '',
      quantity: item.quantity ?? '',
      reorderLevel: item.reorderLevel ?? '',
    })
    setEditingId(item.id)
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
      setError('Product name is required.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || `SKU-${Date.now()}`,
      category: form.category.trim() || 'General',
      supplier: form.supplier.trim() || 'Unknown',
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      quantity: Number(form.quantity || 0),
      reorderLevel: Number(form.reorderLevel || 0),
    }

    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, payload)
      } else {
        await api.post('/inventory', payload)
      }
      cancelForm()
      await load()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return
    try {
      await api.delete(`/inventory/${item.id}`)
      await load()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to delete product.')
    }
  }

  function statusOf(item) {
    const qty = Number(item.quantity || 0)
    const reorder = Number(item.reorderLevel || 0)
    if (qty <= 0) return { label: 'Out of stock', cls: 'bg-red-50 text-red-700' }
    if (qty <= reorder) return { label: 'Low stock', cls: 'bg-amber-100 text-amber-700' }
    return { label: 'In stock', cls: 'bg-emerald-100 text-emerald-700' }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Inventory</h1>
        <button
          onClick={() => (showForm ? cancelForm() : startAdd())}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? 'Cancel' : 'Add Product'}
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
            {editingId ? `Editing ${form.name || `#${editingId}`}` : 'New product'}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Product name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">SKU (optional)</label>
            <input
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Category</label>
            <input
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Supplier</label>
            <input
              value={form.supplier}
              onChange={(e) => update('supplier', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Purchase price (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={(e) => update('purchasePrice', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Selling price (KSh)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.sellingPrice}
              onChange={(e) => update('sellingPrice', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Quantity</label>
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Reorder level</label>
            <input
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={(e) => update('reorderLevel', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
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
              {saving ? 'Saving…' : editingId ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Reorder</th>
                <th className="px-4 py-3">Purchase</th>
                <th className="px-4 py-3">Selling</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                    No products yet. Click <strong>Add Product</strong> to create one.
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const s = statusOf(item)
                return (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-600">{item.reorderLevel}</td>
                    <td className="px-4 py-3">{fmt(item.purchasePrice)}</td>
                    <td className="px-4 py-3">{fmt(item.sellingPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(item)}
                        className="ml-2 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}