import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessType: 'Mini-Mart',
    location: '',
    employees: 5,
    averageMonthlyRevenue: 200000,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="grid md:grid-cols-2">

          {/* ---------------- Mobile hero (visible < md) ---------------- */}
          <div className="relative h-44 overflow-hidden md:hidden">
            <img
              src="/image/hassan.jpeg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 to-slate-950/40" />
            <div className="relative z-10 flex h-full items-center justify-between px-6 text-white">
              <div>
                <div className="text-lg font-black tracking-tight">PesaWatch</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-200">
                  Kenya
                </div>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-brand-200">
                  Tracked
                </div>
                <div className="text-sm font-black">KSh 18,740</div>
              </div>
            </div>
          </div>

          {/* ---------------- Left panel with image + money badge (visible ≥ md) ---------------- */}
          <div className="relative hidden overflow-hidden bg-slate-900 md:block">
            <img
              src="/image/hassan.jpeg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />

            {/* Softer overlay: dark at bottom for text, light at top for the face */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/55 to-slate-950/90" />

            {/* Money badge — top-right corner */}
            <div className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
                KSh
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200">
                  Tracked
                </div>
                <div className="text-sm font-black text-white">18,740</div>
              </div>
            </div>

            {/* Content — logo top, copy bottom */}
            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white backdrop-blur-md">
                  PW
                </div>
                <div>
                  <div className="text-2xl font-black leading-none tracking-tight">
                    PesaWatch
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-200">
                    Kenya
                  </div>
                </div>
              </div>

              {/* Copy + money card at bottom */}
              <div>
                {/* Money card */}
                <div className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200">
                        Money found this month
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">
                        KSh 42,000
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/30 text-brand-100">
                      ↑
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                  </div>
                  <div className="mt-2 text-[11px] text-brand-100">
                    Recovered from stock + credit leakage
                  </div>
                </div>

                <h2 className="text-3xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  Find the money your business is losing.
                </h2>
                <p className="mt-3 max-w-sm text-sm text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  Track cash variance, stock leakage, customer credit risk and
                  supplier surprises before they become damaging losses.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                    Cash variance
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                    Stock leakage
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                    Credit risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Right panel — the form ---------------- */}
          <div className="p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {isLogin ? 'Welcome back' : 'Create your account'}
                </div>
                <p className="text-sm text-slate-500">
                  {isLogin ? 'Login to continue' : 'Start tracking financial leakage'}
                </p>
              </div>
              <div className="rounded-full bg-brand-50 p-2 text-brand-700">
                {isLogin ? <LockKeyhole size={20} /> : <UserPlus size={20} />}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500"
                    placeholder="Jane Wanjiku"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500"
                  placeholder="you@company.com"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Business name
                    </label>
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500"
                      placeholder="Mwangaza Mini-Mart"
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Business type
                      </label>
                      <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500"
                      >
                        <option>Mini-Mart</option>
                        <option>Supermarket</option>
                        <option>Hardware</option>
                        <option>Restaurant</option>
                        <option>Pharmacy</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Location
                      </label>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500"
                        placeholder="Nairobi"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500"
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:opacity-70"
              >
                {loading ? 'Please wait…' : isLogin ? 'Login' : 'Create account'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <div>
                {isLogin ? 'Need an account?' : 'Already have an account?'}
                <Link
                  to={isLogin ? '/register' : '/login'}
                  className="ml-2 font-semibold text-brand-700"
                >
                  {isLogin ? 'Create one' : 'Login'}
                </Link>
              </div>
              {isLogin && (
                <Link to="/forgot-password" className="font-medium text-slate-500">
                  Forgot password?
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}