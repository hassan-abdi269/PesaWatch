import { useEffect, useState } from 'react'
import api from '../services/api'

export default function InventoryPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/inventory')
      setItems(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Inventory</h1>
        <button className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white">Add Product</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Expected</th>
                <th className="px-4 py-3">Difference</th>
                <th className="px-4 py-3">Unit Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{Math.max(0, item.quantity + 10)}</td>
                  <td className="px-4 py-3 text-amber-600">-{Math.max(0, 10 - item.quantity)}</td>
                  <td className="px-4 py-3">KSh {Number(item.purchasePrice || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Review</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
