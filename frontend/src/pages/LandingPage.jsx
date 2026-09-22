import { ArrowRight, CheckCircle2, CircleDollarSign, Landmark, Package, ShieldCheck, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const featureList = [
  { icon: CircleDollarSign, title: 'Cash variance detection', text: 'Track mismatches between expected and actual cash flow.' },
  { icon: Package, title: 'Inventory checks', text: 'Spot stock shortages, expired goods, and dead stock faster.' },
  { icon: Landmark, title: 'Customer credit alerts', text: 'Identify overdue balances and collections risk early.' },
  { icon: TrendingUp, title: 'Supplier intelligence', text: 'Monitor price increases and margin pressure before it spreads.' },
]

const businessTypes = ['Duka', 'Mini-Mart', 'Supermarket', 'Restaurant', 'Pharmacy', 'Salon', 'Barbershop', 'Hardware', 'Electronics', 'Clothing']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">PW</div>
            <div>
              <div className="text-xl font-black tracking-tight">PesaWatch</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-700">KENYA</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#business-types">Business Types</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <Link to="/login" className="text-slate-900">Login</Link>
            <Link to="/register" className="rounded-full bg-brand-700 px-4 py-2 font-semibold text-white">Start Free</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              <ShieldCheck size={14} />
              Financial visibility for Kenyan businesses
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
              Find the money your business is losing.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              PesaWatch helps Kenyan businesses detect hidden financial leakage, stock discrepancies and unexplained losses before they become serious problems.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-800">
                Start Free <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700">See How It Works</a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-soft">
            <div className="rounded-2xl bg-slate-800 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">Monthly Revenue</div>
                  <div className="mt-2 text-3xl font-black">KSh 428,650</div>
                </div>
                <div className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">+8.4%</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-700 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Estimated Profit</div>
                  <div className="mt-2 text-2xl font-bold">KSh 96,420</div>
                </div>
                <div className="rounded-2xl bg-amber-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Potential Leakage</div>
                  <div className="mt-2 text-2xl font-bold text-amber-300">KSh 18,740</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-400/50 bg-amber-500/10 p-4 text-sm text-amber-200">
                ⚠️ KSh 18,740 potentially unaccounted for this month
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Leakage Rate</div>
                  <div className="mt-2 text-2xl font-bold">4.37%</div>
                </div>
                <div className="h-16 w-32 rounded-xl bg-gradient-to-t from-brand-500/30 to-brand-300/5" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Why businesses use PesaWatch</p>
              <h2 className="text-3xl font-black text-slate-900">Your biggest losses may not look like losses.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureList.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">How it works</p>
            <h2 className="text-3xl font-black text-slate-900">A simple process to find hidden variance</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {['Record', 'Compare', 'Detect', 'Act'].map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-700">0{index + 1}</div>
                <h3 className="text-xl font-bold">{step}</h3>
                <p className="mt-3 text-sm text-slate-600">
                  {index === 0 && 'Connect or enter sales, expenses, inventory and payments.'}
                  {index === 1 && 'The system compares expected numbers with actual business activity.'}
                  {index === 2 && 'Potential financial leaks are automatically identified.'}
                  {index === 3 && 'The owner receives specific recommendations on where to investigate.'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="business-types" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Business types</p>
              <h2 className="text-3xl font-black text-slate-900">Built for everyday Kenyan businesses</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {businessTypes.map((type) => (
                <div key={type} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-soft">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="font-semibold text-slate-800">{type}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">Pricing</p>
            <h2 className="text-3xl font-black text-slate-900">Simple plans for growing businesses</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Starter', price: 'KSh 0/month', features: ['Basic sales tracking', 'Basic expenses', 'Basic reports'], button: 'Start Free' },
              { name: 'Business', price: 'KSh 999/month', features: ['Leakage detection', 'Inventory tracking', 'Customer credit', 'Supplier analysis', 'Advanced reports'], button: 'Start Business Plan', highlight: true },
              { name: 'Pro', price: 'KSh 2,499/month', features: ['Everything in Business', 'Advanced analytics', 'Employee activity', 'Automated alerts', 'Multi-branch support'], button: 'Start Pro' },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-3xl border p-6 shadow-soft ${plan.highlight ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className={`mt-6 text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</div>
                <ul className={`mt-6 space-y-3 text-sm ${plan.highlight ? 'text-brand-50' : 'text-slate-600'}`}>
                  {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
                </ul>
                <button className={`mt-8 w-full rounded-full px-4 py-3 font-semibold ${plan.highlight ? 'bg-white text-brand-700' : 'bg-brand-700 text-white'}`}>
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer id="about" className="border-t border-slate-200 bg-slate-950 text-slate-200">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
            <div>
              <div className="mb-2 text-2xl font-black text-white">PesaWatch KE</div>
              <p className="text-sm text-slate-300">Find the money your business is losing.</p>
            </div>
            <div>
              <div className="mb-3 font-semibold text-white">Product</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Features</li>
                <li>Pricing</li>
                <li>How It Works</li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-white">Company</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>About</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold text-white">Legal</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 py-4 text-center text-sm text-slate-400">© 2026 PesaWatch KE</div>
        </footer>
      </main>
    </div>
  )
}
