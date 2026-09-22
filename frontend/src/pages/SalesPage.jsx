import { useEffect, useState } from 'react'
import api from '../services/api'

export default function SalesPage() {
  const [sales, setSales] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/sales')
      setSales(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Sales</h1>
        <button className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white">Add Sale</button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Today\'s sales', 'KSh 124,400'],
          ['Total sales', 'KSh 428,650'],
          ['Cash sales', 'KSh 172,300'],
          ['M-Pesa sales', 'KSh 143,600'],
        ].map(([label, value]) => (
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
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{sale.date || '2026-09-22'}</td>
                <td className="px-4 py-3">{sale.invoiceNo}</td>
                <td className="px-4 py-3">{sale.customerName}</td>
                <td className="px-4 py-3">{sale.paymentMethod}</td>
                <td className="px-4 py-3">KSh {Number(sale.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{sale.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
