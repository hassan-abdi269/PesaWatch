import { useEffect, useState } from 'react'
import api from '../services/api'

const emptyForm = {
  name: '',
  position: '',
  phone: '',
  status: 'Active',
}

const POSITIONS = [
  'Sales Associate', 'Cashier', 'Store Manager', 'Stock Keeper',
  'Cleaner', 'Security', 'Supervisor', 'Staff',
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadAll() {
    const [empRes, sumRes] = await Promise.all([
      api.get('/employees'),
      api.get('/employees/summary'),
    ])
    setEmployees(empRes.data.data || [])
    setSummary(sumRes.data.data || {})
  }

  useEffect(() => {
    loadAll().catch((e) => {
      console.error(e)
      setError('Failed to load employees.')
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

  function startEdit(employee) {
    setForm({
      name: employee.name || '',
      position: employee.position || '',
      phone: employee.phone || '',
      status: employee.status || 'Active',
    })
    setEditingId(employee.id)
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
      setError('Employee name is required.')
      return
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      position: form.position.trim() || 'Staff',
      phone: form.phone.trim() || null,
      status: form.status,
    }

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload)
      } else {
        await api.post('/employees', payload)
      }
      cancelForm()
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save employee.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(employee) {
    const withSales = Number(employee.salesCount || 0) > 0
    const msg = withSales
      ? `Delete "${employee.name}"? They have ${employee.salesCount} recorded sales — those sales will be kept but unlinked from this employee.`
      : `Delete "${employee.name}"?`
    if (!window.confirm(msg)) return
    try {
      await api.delete(`/employees/${employee.id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to delete employee.')
    }
  }

  const fmt = (n) => `KSh ${Number(n || 0).toLocaleString()}`

  function statusStyle(status) {
    switch (status) {
      case 'Active':   return 'bg-emerald-100 text-emerald-700'
      case 'Inactive': return 'bg-slate-100 text-slate-700'
      case 'On leave': return 'bg-amber-100 text-amber-700'
      default:         return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            {summary.active} active · {summary.inactive} inactive
          </p>
        </div>
        <button
          onClick={() => (showForm ? cancelForm() : startAdd())}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          {showForm ? 'Cancel' : 'Add Employee'}
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
            {editingId ? `Editing ${form.name}` : 'New employee'}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Full name</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Position</label>
            <input
              list="positions"
              value={form.position}
              onChange={(e) => update('position', e.target.value)}
              placeholder="Staff"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            />
            <datalist id="positions">
              {POSITIONS.map((p) => <option key={p} value={p} />)}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            >
              <option>Active</option>
              <option>On leave</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="07XX XXX XXX"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none md:max-w-xs"
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
              {saving ? 'Saving…' : editingId ? 'Update Employee' : 'Save Employee'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Total employees</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Active</div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{summary.active}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Inactive / On leave</div>
          <div className="mt-2 text-2xl font-black text-slate-500">{summary.inactive}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Sales count</th>
                <th className="px-4 py-3">Sales total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    No employees yet. Click <strong>Add Employee</strong> to create one.
                  </td>
                </tr>
              )}
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{employee.name}</td>
                  <td className="px-4 py-3">{employee.position}</td>
                  <td className="px-4 py-3">{employee.phone || '—'}</td>
                  <td className="px-4 py-3">{employee.salesCount || 0}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(employee.salesTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(employee)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(employee)}
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