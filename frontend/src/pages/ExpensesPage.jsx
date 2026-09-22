import { useEffect, useState } from 'react'
import api from '../services/api'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/expenses')
      setExpenses(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Expenses</h1>
        <button className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white">Add Expense</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{expense.date || '2026-09-22'}</td>
                <td className="px-4 py-3">{expense.category}</td>
                <td className="px-4 py-3">{expense.description}</td>
                <td className="px-4 py-3">KSh {Number(expense.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">{expense.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
