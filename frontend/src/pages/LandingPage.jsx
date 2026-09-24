import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Landmark,
  LineChart,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ---------------------------------------------------------------
// Content
// ---------------------------------------------------------------
const FEATURES = [
  {
    icon: CircleDollarSign,
    title: 'Cash variance detection',
    text: 'Continuous reconciliation between expected and recorded cash flow across every shift.',
  },
  {
    icon: Package,
    title: 'Inventory intelligence',
    text: 'Spot shortages, expired goods, and dead stock before they become write-offs.',
  },
  {
    icon: Landmark,
    title: 'Customer credit alerts',
    text: 'Automatic overdue notifications so nothing slips past your collection window.',
  },
  {
    icon: TrendingUp,
    title: 'Supplier price watch',
    text: 'Monitor supplier price increases and protect your margins in real time.',
  },
  {
    icon: Users,
    title: 'Employee activity',
    text: 'Flag unusual discount or void patterns by staff, without micromanaging.',
  },
  {
    icon: LineChart,
    title: 'Profit & loss clarity',
    text: 'Know your true margin per period, not just what the till says.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Record',
    text: 'Enter sales, expenses, stock movements and payments as they happen. Bank, M-Pesa, and cash — all in one place.',
  },
  {
    n: '02',
    title: 'Compare',
    text: 'The engine continuously compares expected numbers with actual activity across every category.',
  },
  {
    n: '03',
    title: 'Detect',
    text: 'Potential financial leaks are flagged with exact amounts, dates, and the employees or items involved.',
  },
  {
    n: '04',
    title: 'Act',
    text: 'Investigate each finding with a clear workflow. Mark resolved, add notes, close the loop.',
  },
]

const BUSINESS_TYPES = [
  'Duka', 'Mini-Mart', 'Supermarket', 'Restaurant', 'Pharmacy',
  'Salon', 'Barbershop', 'Hardware', 'Electronics', 'Clothing',
]

const METRICS = [
  { value: '4.37%', label: 'Average leakage rate detected' },
  { value: 'KSh 18,740', label: 'Median monthly variance' },
  { value: '< 24h', label: 'From sale to alert' },
  { value: '8+', label: 'Leakage detectors running' },
]

const TESTIMONIALS = [
  {
    quote:
      'We found KSh 42,000 of missing stock in the first two weeks. The system flagged it before we even suspected anything.',
    name: 'Amina H.',
    role: 'Mini-Mart owner, Garissa',
  },
  {
    quote:
      'The supplier price alerts alone paid for a year of subscription. We renegotiated three contracts.',
    name: 'John N.',
    role: 'Duka, Nairobi',
  },
  {
    quote:
      'Now I know which employee is discounting too much, which customer is delaying payment, and which product is leaking.',
    name: 'Fatuma A.',
    role: 'Pharmacy, Mombasa',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: 'KSh 0',
    cadence: 'forever',
    tagline: 'Get started tracking.',
    features: [
      'Sales & expense tracking',
      'Inventory basics',
      'Customer credit tracker',
      'Basic reports',
    ],
    cta: 'Start free',
  },
  {
    name: 'Business',
    price: 'KSh 999',
    cadence: 'per month',
    tagline: 'For shops serious about margins.',
    features: [
      'Everything in Starter',
      'Leakage detection engine',
      'Supplier price alerts',
      'Employee discount checks',
      'Investigation workflow',
      'CSV exports',
    ],
    cta: 'Start Business plan',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Pro',
    price: 'KSh 2,499',
    cadence: 'per month',
    tagline: 'Multi-branch operations.',
    features: [
      'Everything in Business',
      'Multi-branch support',
      'Advanced analytics',
      'Automated notifications',
      'Priority support',
    ],
    cta: 'Start Pro plan',
  },
]

// ---------------------------------------------------------------
// Small components
// ---------------------------------------------------------------
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white shadow-md">
        PW
      </div>
      <div>
        <div className="text-lg font-black tracking-tight text-slate-900">PesaWatch</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-700">
          Kenya
        </div>
      </div>
    </div>
  )
}

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const duration = 900
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      setDisplay(Math.floor(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </>
  )
}

// ---------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ---------------- Header ---------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/"><Logo /></Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            <a href="#features" className="hover:text-brand-700">Features</a>
            <a href="#how-it-works" className="hover:text-brand-700">How it works</a>
            <a href="#business-types" className="hover:text-brand-700">For your business</a>
            <a href="#pricing" className="hover:text-brand-700">Pricing</a>
            <a href="#about" className="hover:text-brand-700">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-slate-700 hover:text-brand-700 md:block">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-800"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="relative overflow-hidden bg-white">
          {/* Background accents — constrained so they don't wash out cards */}
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-brand-100 opacity-70 blur-3xl" />
            <div className="absolute top-32 -right-32 h-80 w-80 rounded-full bg-amber-100 opacity-60 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 md:grid-cols-2 md:px-6 lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                <ShieldCheck size={14} />
                Financial visibility for Kenyan businesses
              </div>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
                Find the money
                <br />
                your business is <span className="text-brand-700">losing.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-slate-700">
                PesaWatch detects hidden cash leaks, stock discrepancies,
                unpaid credit and supplier price creep — every day, automatically.
                Built for dukas, mini-marts, pharmacies and shops across Kenya.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-800"
                >
                  Start free <ArrowRight size={18} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:border-slate-400"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-brand-700" /> No credit card
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock size={16} className="text-brand-700" /> Your data stays yours
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-brand-700" /> Setup in 5 minutes
                </div>
              </div>
            </div>

            {/* Hero dashboard mockup */}
            <HeroDashboard />
          </div>
        </section>

        {/* ---------------- Trust strip ---------------- */}
        <section className="border-y border-slate-200 bg-slate-900">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-6 text-xs uppercase tracking-[0.2em] md:px-6">
            <span className="font-semibold text-slate-400">Trusted by shops across</span>
            <span className="font-semibold text-white">Nairobi</span>
            <span className="font-semibold text-white">Mombasa</span>
            <span className="font-semibold text-white">Garissa</span>
            <span className="font-semibold text-white">Kisumu</span>
            <span className="font-semibold text-white">Nakuru</span>
            <span className="font-semibold text-white">Eldoret</span>
          </div>
        </section>

        {/* ---------------- Metrics ---------------- */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-4">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md"
                >
                  <div className="text-3xl font-black text-brand-700">{m.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="bg-slate-100 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
                Why businesses use PesaWatch
              </p>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
                Your biggest losses rarely look like losses.
              </h2>
              <p className="mt-4 text-slate-700">
                Most shops don't fail from a single dramatic theft. They bleed
                slowly through small discrepancies that nobody notices until the
                year-end numbers come out wrong.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xl"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how-it-works" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
                How it works
              </p>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
                Four steps from raw records to real answers.
              </h2>
            </div>

            <div className="relative grid gap-6 md:grid-cols-4">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-md"
                >
                  <div className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-brand-700">
                    {s.n}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-3 text-sm text-slate-700">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Business types ---------------- */}
        <section id="business-types" className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-400">
                Built for Kenya
              </p>
              <h2 className="text-3xl font-black md:text-4xl">
                Everyday businesses, serious financials.
              </h2>
              <p className="mt-4 text-slate-300">
                From a single counter duka to a multi-branch pharmacy chain —
                the same engine works.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {BUSINESS_TYPES.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 transition hover:border-brand-500 hover:bg-slate-700"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="font-semibold text-white">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Testimonials ---------------- */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
                Real shops, real numbers
              </p>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
                What owners find in the first month.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-md"
                >
                  <blockquote className="text-slate-800">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 border-t border-slate-200 pt-4">
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-600">{t.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Pricing ---------------- */}
        <section id="pricing" className="bg-slate-100 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
                Pricing
              </p>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
                Simple plans for growing businesses.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-700">
                Start free. Upgrade when the numbers say it's worth it — and
                they usually do within the first month.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-3xl border p-6 shadow-lg ${
                    plan.highlight
                      ? 'border-brand-800 bg-brand-700 text-white'
                      : 'border-slate-200 bg-white text-slate-900'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${plan.highlight ? 'text-brand-50' : 'text-slate-600'}`}>
                    {plan.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-brand-50' : 'text-slate-600'}`}>
                      {plan.cadence}
                    </span>
                  </div>

                  <ul className={`mt-6 space-y-3 text-sm ${plan.highlight ? 'text-white' : 'text-slate-700'}`}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2
                          size={16}
                          className={plan.highlight ? 'mt-0.5 text-brand-200' : 'mt-0.5 text-brand-700'}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`mt-8 block w-full rounded-full px-4 py-3 text-center font-semibold transition ${
                      plan.highlight
                        ? 'bg-white text-brand-700 hover:bg-brand-50'
                        : 'bg-brand-700 text-white hover:bg-brand-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-slate-600">
              Prices in Kenyan shillings. Cancel any time. M-Pesa and card accepted.
            </p>
          </div>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="rounded-3xl bg-slate-900 px-8 py-14 text-center text-white shadow-2xl md:px-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                <Sparkles size={14} /> Free to start
              </div>
              <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight md:text-4xl">
                Stop guessing where the money is going.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                Set up your shop in under five minutes. The first leakage finding
                is usually there within the week.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
                >
                  Create your account <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer id="about" className="border-t border-slate-800 bg-slate-950 text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
          <div>
            <div className="mb-3 text-2xl font-black text-white">PesaWatch KE</div>
            <p className="max-w-xs text-sm text-slate-400">
              Find the money your business is losing. Built in Kenya, for Kenyan
              shops, dukas, and pharmacies.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Lock size={14} /> Bank-grade encryption
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Product</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How it works</a></li>
              <li><a href="#business-types" className="hover:text-white">Business types</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Company</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#about" className="hover:text-white">Contact</a></li>
              <li><a href="#about" className="hover:text-white">Careers</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">Legal</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-white">Privacy policy</a></li>
              <li><a href="#about" className="hover:text-white">Terms of service</a></li>
              <li><a href="#about" className="hover:text-white">Data handling</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 md:px-6">
            <span>© 2026 PesaWatch KE. All rights reserved.</span>
            <span className="flex items-center gap-2">
              <Zap size={12} className="text-brand-500" />
              Built for the Kenyan small business economy
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------
// Hero dashboard mockup — pure CSS/SVG
// ---------------------------------------------------------------
function HeroDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand-200 via-white to-amber-200 opacity-70 blur-2xl" />

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white shadow-2xl">
        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
            Live · Mwangaza Mini-Mart
          </div>
          <div className="text-xs text-slate-400">Today</div>
        </div>

        {/* KPI block */}
        <div className="rounded-2xl bg-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Revenue today
              </div>
              <div className="mt-1 text-3xl font-black">
                KSh <AnimatedNumber value={428650} />
              </div>
            </div>
            <div className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-200">
              ↑ 8.4%
            </div>
          </div>

          <svg viewBox="0 0 320 80" className="mt-5 h-20 w-full">
            <defs>
              <linearGradient id="heroArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 L40 52 L80 55 L120 40 L160 45 L200 30 L240 35 L280 20 L320 22 L320 80 L0 80 Z"
              fill="url(#heroArea)"
            />
            <path
              d="M0 60 L40 52 L80 55 L120 40 L160 45 L200 30 L240 35 L280 20 L320 22"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Alert card */}
        <div className="mt-4 rounded-2xl border border-amber-400/60 bg-amber-500/15 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/25 text-amber-300">
              <BarChart3 size={16} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                Potential leakage
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-300">
                KSh 18,740
              </div>
              <div className="mt-1 text-xs text-amber-100">
                3 items need your attention today
              </div>
            </div>
          </div>
        </div>

        {/* Two mini stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Wallet size={14} /> Estimated profit
            </div>
            <div className="mt-2 text-lg font-bold">KSh 96,420</div>
          </div>
          <div className="rounded-2xl bg-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Package size={14} /> Low stock items
            </div>
            <div className="mt-2 text-lg font-bold">4</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-brand-500" />
            Detection running
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            Updated 2 min ago
          </span>
        </div>
      </div>
    </div>
  )
}