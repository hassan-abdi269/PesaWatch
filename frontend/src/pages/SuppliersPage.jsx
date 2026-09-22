import { useEffect, useState } from 'react'
import api from '../services/api'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/suppliers')
      setSuppliers(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-black text-slate-900">Suppliers</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-xl font-bold text-slate-900">{supplier.name}</div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>Previous Average Price: KSh {Number(supplier.previousAveragePrice || 0).toLocaleString()}</div>
              <div>Current Average Price: KSh {Number(supplier.currentAveragePrice || 0).toLocaleString()}</div>
              <div>Increase: {Number(supplier.priceIncrease || 0).toFixed(1)}%</div>
            </div>
            <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">⚠️ Supplier pricing increased by {Number(supplier.priceIncrease || 0).toFixed(1)}%. Review alternative suppliers before your margins are affected.</div>
          </div>
        ))}
      </div>
    </div>
  )
}
