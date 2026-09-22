export default function SettingsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-black text-slate-900">Settings</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Business profile</h2>
          <div className="mt-4 space-y-4">
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Business name" />
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Location" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-slate-900">Financial settings</h2>
          <div className="mt-4 space-y-4">
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Currency" value="KES" />
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Leakage threshold" value="5000" />
          </div>
        </div>
      </div>
    </div>
  )
}
