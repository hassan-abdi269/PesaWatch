import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail, UserPlus } from 'lucide-react'
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
          <div className="hidden bg-brand-900 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="text-3xl font-black">PesaWatch</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-brand-200">KENYA</div>
            </div>
            <div>
              <h2 className="text-3xl font-black">Find the money your business is losing.</h2>
              <p className="mt-4 text-sm text-brand-100">Track cash variance, stock leakage, customer credit risk and supplier surprises before they become damaging losses.</p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-slate-900">{isLogin ? 'Welcome back' : 'Create your account'}</div>
                <p className="text-sm text-slate-500">{isLogin ? 'Login to continue' : 'Start tracking financial leakage'}</p>
              </div>
              <div className="rounded-full bg-brand-50 p-2 text-brand-700">
                {isLogin ? <LockKeyhole size={20} /> : <UserPlus size={20} />}
              </div>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" placeholder="Jane Wanjiku" required />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" placeholder="you@company.com" required />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Business name</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" placeholder="Mwangaza Mini-Mart" required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Business type</label>
                      <select name="businessType" value={form.businessType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500">
                        <option>Mini-Mart</option>
                        <option>Supermarket</option>
                        <option>Hardware</option>
                        <option>Restaurant</option>
                        <option>Pharmacy</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
                      <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" placeholder="Nairobi" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" placeholder="********" required />
              </div>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:opacity-70">
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <div>
                {isLogin ? 'Need an account?' : 'Already have an account?'}
                <Link to={isLogin ? '/register' : '/login'} className="ml-2 font-semibold text-brand-700">{isLogin ? 'Create one' : 'Login'}</Link>
              </div>
              {isLogin && <Link to="/forgot-password" className="font-medium text-slate-500">Forgot password?</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
