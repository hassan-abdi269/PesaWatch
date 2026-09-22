import { Outlet, NavLink } from 'react-router-dom'
import { AlertTriangle, BarChart3, Bell, LayoutDashboard, LogOut, Package, ReceiptText, Settings, Truck, UserRound, Users, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const items = [
  ['Dashboard', '/dashboard', LayoutDashboard], ['Sales', '/sales', ReceiptText],
  ['Inventory', '/inventory', Package], ['Expenses', '/expenses', Wallet],
  ['Customers', '/customers', Users], ['Suppliers', '/suppliers', Truck],
  ['Employees', '/employees', UserRound], ['Leakage', '/leakage', AlertTriangle],
  ['Reports', '/reports', BarChart3], ['Notifications', '/notifications', Bell],
  ['Settings', '/settings', Settings],
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-brand-700 px-3 py-2 font-black text-white">PW</div>
          <div><div className="font-black">PesaWatch</div><div className="text-[10px] uppercase tracking-[0.25em] text-brand-700">Kenya</div></div>
        </div>
        <nav className="space-y-1">
          {items.map(([label, to, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={17} />{label}</NavLink>)}
        </nav>
        <button onClick={logout} className="mt-8 flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600"><LogOut size={17} />Logout</button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
          <div><div className="text-sm text-slate-500">Business workspace</div><div className="font-bold">{user?.business?.name || 'Your business'}</div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user?.name || 'User'}</div><div className="text-xs text-slate-500">{user?.email}</div></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</div></div>
        </header>
        <main className="min-h-screen pb-20"><Outlet /></main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-slate-200 bg-white px-2 py-3 lg:hidden">
        {items.slice(0, 5).map(([label, to, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-brand-700' : 'text-slate-500'}`}><Icon size={18}/>{label}</NavLink>)}
      </nav>
    </div>
  )
}

export function MarketingLayout() { return <Outlet /> }
