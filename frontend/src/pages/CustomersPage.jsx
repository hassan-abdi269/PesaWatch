import { useEffect, useState } from 'react'
import api from '../services/api'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/customers')
      setCustomers(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">Total outstanding: KSh {customers.reduce((sum, item) => sum + Number(item.balance || 0), 0).toLocaleString()}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">KSh {Number(customer.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">KSh {Number(customer.balance || 0).toLocaleString()}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">{customer.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
