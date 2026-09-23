import { useEffect, useState } from 'react'
import api from '../services/api'

const BUSINESS_TYPES = [
  'Mini-Mart', 'Duka', 'Supermarket', 'Pharmacy', 'Hardware',
  'Restaurant', 'Cafe', 'Boutique', 'Electronics', 'Agrovet', 'Other',
]

const CURRENCIES = ['KES', 'USD', 'UGX', 'TZS', 'EUR', 'GBP']

export default function SettingsPage() {
  const [business, setBusiness] = useState(null)
  const [settings, setSettings] = useState(null)
  const [employees, setEmployees] = useState({ total: 0, active: 0, inactive: 0 })
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [savingBiz, setSavingBiz] = useState(false)
  const [savingFin, setSavingFin] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/settings')
      setBusiness(data.data.business)
      setSettings(data.data.settings)
      setEmployees(data.data.employees || { total: 0, active: 0, inactive: 0 })
      setUser(data.data.user)
    } catch (err) {
      console.error(err)
      setError('Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function showFlash(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2500)
  }

  function updateBiz(field, value) {
    setBusiness((b) => ({ ...b, [field]: value }))
  }
  function updateFin(field, value) {
    setSettings((s) => ({ ...s, [field]: value }))
  }

  async function saveBusiness(e) {
    e.preventDefault()
    setSavingBiz(true)
    setError('')
    try {
      const { data } = await api.put('/settings/business', {
        name: business.name,
        businessType: business.businessType,
        location: business.location,
        averageMonthlyRevenue: business.averageMonthlyRevenue,
        paymentMethods: business.paymentMethods,
      })
      setBusiness(data.data)
      if (data.employees) setEmployees(data.employees)
      showFlash('Business profile saved.')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save business profile.')
    } finally {
      setSavingBiz(false)
    }
  }

  async function saveFinancial(e) {
    e.preventDefault()
    setSavingFin(true)
    setError('')
    try {
      const { data } = await api.put('/settings/financial', {
        currency: settings.currency,
        taxRate: settings.taxRate,
        stockAlertThreshold: settings.stockAlertThreshold,
        supplierPriceThreshold: settings.supplierPriceThreshold,
        expenseVarianceThreshold: settings.expenseVarianceThreshold,
      })
      setSettings(data.data)
      showFlash('Financial settings saved.')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to save financial settings.')
    } finally {
      setSavingFin(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading settings…</div>
  }
  if (!business || !settings) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || 'Settings unavailable.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Business profile and financial preferences.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {flash && (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business profile */}
        <form onSubmit={saveBusiness} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Business profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Used across receipts, reports and the dashboard header.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Business name</label>
              <input
                value={business.name || ''}
                onChange={(e) => updateBiz('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Business type</label>
              <input
                list="biz-types"
                value={business.businessType || ''}
                onChange={(e) => updateBiz('businessType', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
              <datalist id="biz-types">
                {BUSINESS_TYPES.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Location</label>
              <input
                value={business.location || ''}
                onChange={(e) => updateBiz('location', e.target.value)}
                placeholder="e.g. Garissa, Kenya"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            {/* Employees — real count, not editable here */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Employees
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  <strong>{employees.active}</strong> active
                  {' · '}
                  <span className="text-slate-500">{employees.inactive} inactive</span>
                  {' · '}
                  <span className="text-slate-500">{employees.total} total</span>
                </div>
                <a
                  href="/employees"
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Manage
                </a>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Counted from your <code>/employees</code> records. Add or edit them there.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Avg monthly revenue</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={business.averageMonthlyRevenue ?? 0}
                onChange={(e) => updateBiz('averageMonthlyRevenue', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Payment methods</label>
              <input
                value={business.paymentMethods || ''}
                onChange={(e) => updateBiz('paymentMethods', e.target.value)}
                placeholder="Cash, M-Pesa, Bank, Card"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Signed in as <strong>{user?.name}</strong> · {user?.email}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingBiz}
                className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {savingBiz ? 'Saving…' : 'Save business profile'}
              </button>
            </div>
          </div>
        </form>

        {/* Financial settings */}
        <form onSubmit={saveFinancial} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Financial settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thresholds used by the notification engine and leakage detector.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Currency</label>
              <select
                value={settings.currency || 'KES'}
                onChange={(e) => updateFin('currency', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Tax rate (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.taxRate ?? 0}
                onChange={(e) => updateFin('taxRate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Stock alert threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.stockAlertThreshold ?? 15}
                  onChange={(e) => updateFin('stockAlertThreshold', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Products ≤ this many units get flagged.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Supplier price threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.supplierPriceThreshold ?? 10}
                  onChange={(e) => updateFin('supplierPriceThreshold', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Supplier price increases above this trigger an alert.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Expense variance threshold (KSh)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.expenseVarianceThreshold ?? 5000}
                onChange={(e) => updateFin('expenseVarianceThreshold', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Single expenses above this amount are surfaced as notable.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingFin}
                className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {savingFin ? 'Saving…' : 'Save financial settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}