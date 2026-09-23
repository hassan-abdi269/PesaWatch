import { useEffect, useState } from 'react'
import api from '../services/api'

const TYPE_STYLES = {
  cash:     { label: 'Cash',     cls: 'bg-amber-100 text-amber-700' },
  credit:   { label: 'Credit',   cls: 'bg-sky-100 text-sky-700' },
  stock:    { label: 'Stock',    cls: 'bg-orange-100 text-orange-700' },
  supplier: { label: 'Supplier', cls: 'bg-violet-100 text-violet-700' },
  info:     { label: 'Info',     cls: 'bg-slate-100 text-slate-700' },
}

function typeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.info
}

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [summary, setSummary] = useState({ total: 0, unread: 0, read: 0 })
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')  // all | unread | read

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/summary'),
      ])
      setNotifications(listRes.data.data || [])
      setSummary(sumRes.data.data || {})
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function markRead(n) {
    if (n.read) return
    setWorking(true)
    try {
      await api.put(`/notifications/${n.id}/read`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to update notification.')
    } finally {
      setWorking(false)
    }
  }

  async function toggleRead(n) {
    setWorking(true)
    try {
      await api.put(`/notifications/${n.id}/${n.read ? 'unread' : 'read'}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to update notification.')
    } finally {
      setWorking(false)
    }
  }

  async function markAllRead() {
    if (summary.unread === 0) return
    if (!window.confirm(`Mark all ${summary.unread} unread notifications as read?`)) return
    setWorking(true)
    try {
      await api.put('/notifications/read-all')
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to mark all as read.')
    } finally {
      setWorking(false)
    }
  }

  async function remove(n) {
    if (!window.confirm(`Delete "${n.title}"?`)) return
    setWorking(true)
    try {
      await api.delete(`/notifications/${n.id}`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError('Failed to delete notification.')
    } finally {
      setWorking(false)
    }
  }

  const visible = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {summary.unread} unread · {summary.total} total
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={working || summary.unread === 0}
          className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Unread</div>
          <div className="mt-2 text-2xl font-black text-amber-700">{summary.unread}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Read</div>
          <div className="mt-2 text-2xl font-black text-slate-500">{summary.read}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-sm text-slate-500">Total</div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.total}</div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="flex gap-2">
          {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                filter === key
                  ? 'bg-brand-700 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-soft">
          Loading notifications…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">
            {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            When something needs your attention — cash variance, overdue credit,
            stock issues — it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((n) => {
            const t = typeStyle(n.type)
            return (
              <div
                key={n.id}
                onClick={() => markRead(n)}
                className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-soft transition hover:bg-slate-50 ${
                  n.read ? 'border-slate-200' : 'border-amber-200 bg-amber-50/40'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${t.cls}`}>
                        {t.label}
                      </span>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" title="Unread" />
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>

                    <div className={`mt-2 text-lg ${n.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                      {n.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{n.message}</div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleRead(n)}
                      disabled={working}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      {n.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      onClick={() => remove(n)}
                      disabled={working}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}