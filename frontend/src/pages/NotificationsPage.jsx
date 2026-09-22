import { useEffect, useState } from 'react'
import api from '../services/api'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function load() {
      const response = await api.get('/notifications')
      setNotifications(response.data.data || [])
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
        <button className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-slate-900">{notification.title}</div>
                <div className="mt-1 text-sm text-slate-600">{notification.message}</div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${notification.read ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                {notification.read ? 'Read' : 'Unread'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
