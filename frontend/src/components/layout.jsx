import { LayoutDashboard, BarChart3, Package, ReceiptText, Users, Truck, UserRound, AlertTriangle, Bell, Settings, Search, ChevronDown, Menu, Home, Wallet, FileText, MoreHorizontal } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Sales', to: '/sales', icon: ReceiptText },
  { label: 'Inventory', to: '/inventory', icon: Package },
  { label: 'Expenses', to: '/expenses', icon: Wallet },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Suppliers', to: '/suppliers', icon: Truck },
  { label: 'Employees', to: '/employees', icon: UserRound },
  { label: 'Leakage', to: '/leakage', icon: AlertTriangle },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function DashboardLayout({ children }) {
  const { logout, user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="hidden lg:flex">
        <aside className="fixed left-0 top-0 h-screen w-72 border-r border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">PW</div>
            <div>
              <div className="text-lg font-black">PesaWatch</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-brand-700">KENYA</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button onClick={logout} className="mt-8 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Logout</button>
        </aside>

        <div className="ml-72 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="relative w-full max-w-md">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500" placeholder="Search products, customers, suppliers..." />
              </div>
              <div className="ml-4 flex items-center gap-4">
                <button className="rounded-full border border-slate-200 p-2 text-slate-600"><Bell size={16} /></button>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Mwangaza Mini-Mart</div>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-screen bg-slate-50">{children}</main>
        </div>
      </div>

      <div className="lg:hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 p-2"><Menu size={16} /></button>
              <div className="text-lg font-black">PesaWatch</div>
            </div>
            <button className="rounded-xl border border-slate-200 p-2"><Bell size={16} /></button>
          </div>
        </header>

        <main className="pb-24">{children}</main>

        <nav className="fixed bottom-0 left-0 flex w-full justify-around border-t border-slate-200 bg-white px-2 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          {[
            { to: '/dashboard', label: 'Home', icon: Home },
            { to: '/sales', label: 'Sales', icon: ReceiptText },
            { to: '/inventory', label: 'Stock', icon: Package },
            { to: '/leakage', label: 'Leakage', icon: AlertTriangle },
            { to: '/more', label: 'More', icon: MoreHorizontal },
          ].map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-brand-700' : 'text-slate-500'}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export function MarketingLayout({ children }) {
  return <>{children}</>
}
