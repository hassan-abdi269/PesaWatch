import { useEffect, useState } from 'react'
import api from '../services/api'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/employees')
      setEmployees(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-black text-slate-900">Employees</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{employee.name}</td>
                <td className="px-4 py-3">{employee.position}</td>
                <td className="px-4 py-3">{employee.phone || '—'}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{employee.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
