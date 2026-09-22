import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-slate-900">Reset password</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your email. We will send the reset instructions if the account exists.</p>
        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-500" placeholder="you@company.com" />
          </div>
          <button type="button" className="w-full rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white">Send reset link</button>
        </form>
        <div className="mt-6 text-sm text-slate-600">
          Back to <Link to="/login" className="font-semibold text-brand-700">Login</Link>
        </div>
      </div>
    </div>
  )
}
