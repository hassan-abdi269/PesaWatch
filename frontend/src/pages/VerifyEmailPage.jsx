import { Link } from 'react-router-dom'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-black text-slate-900">Verify your email</h1>
        <p className="mt-3 text-sm text-slate-600">Your account is ready. Continue to the dashboard once the email is verified.</p>
        <Link to="/login" className="mt-6 inline-flex w-full justify-center rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white">Go to login</Link>
      </div>
    </div>
  )
}
