'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  NAVBAR                                                            */
/* ------------------------------------------------------------------ */
function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            GlassBox
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
          <a href="#why" className="hover:text-gray-900 transition-colors">About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-violet-200/50 transition-all"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#why" className="block text-sm text-gray-600" onClick={() => setOpen(false)}>About</a>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/login" className="text-sm text-gray-600">Log in</Link>
            <Link href="/register" className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center px-5 py-2.5 rounded-full">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  HERO                                                              */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-white via-violet-50/30 to-amber-50/20 overflow-hidden relative">
      {/* Subtle background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 border border-violet-100">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
              Trusted by 50+ Malaysian agencies
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6">
              Your ad{' '}
              <br className="hidden sm:block" />
              performance,{' '}
              <br className="hidden sm:block" />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                  crystal clear
                </span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 280 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8.5C60 2 140 2 278 8.5" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-gray-500 text-lg max-w-md mb-8 leading-relaxed">
              Transform complex Google Ads data into clear, actionable insights
              your clients actually understand.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium px-7 py-3 rounded-full hover:shadow-lg hover:shadow-violet-200/50 transition-all"
              >
                Get Started Free
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-7 py-3 rounded-full hover:border-gray-300 hover:bg-white transition-colors"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              {['Google Ads', 'Budget Tracking', 'Smart Alerts', 'Reports'].map((tag, i) => (
                <span key={tag} className="flex items-center gap-2">
                  <span className="text-gray-300 font-mono">0{i + 1}</span>
                  <span className="text-gray-500">{tag}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-200/30">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                alt="Marketing team collaborating"
                className="w-full h-[400px] lg:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-4 bg-white rounded-xl shadow-xl shadow-gray-200/50 p-5 border border-gray-100 w-56">
              <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Ad Spend Managed</p>
              <p className="text-2xl font-bold text-gray-900 mb-3">
                RM 2.5M<span className="text-emerald-500">+</span>
              </p>
              <div className="flex items-end gap-1.5 h-10">
                {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === 5 ? '#8B5CF6' : i === 3 ? '#F59E0B' : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-lg">
              +32% ROI
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  STATS BAR                                                         */
/* ------------------------------------------------------------------ */
function StatsBar() {
  const stats = [
    { value: '150+', label: 'Active Campaigns', color: 'text-violet-400' },
    { value: 'RM 2.5M+', label: 'Ad Spend Managed', color: 'text-emerald-400' },
    { value: '98%', label: 'Client Satisfaction', color: 'text-amber-400' },
    { value: '24/7', label: 'Real-Time Monitoring', color: 'text-rose-400' },
  ]

  return (
    <section className="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl md:text-3xl font-bold mb-1 ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FEATURES                                                          */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: 'Real-Time Dashboard',
    desc: 'Live metrics at a glance. See impressions, clicks, cost and conversions update in real-time across all campaigns.',
    iconBg: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Smart Budget Alerts',
    desc: 'Never overspend again. Get instant notifications when campaigns hit 80%, 90% or 100% of monthly budget.',
    highlighted: true,
    iconBg: 'bg-white/20 text-white',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    title: 'Campaign Analytics',
    desc: 'Deep dive into what works. Track CTR, CPC, ROAS and impression share across every campaign and channel.',
    iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  },
  {
    title: 'Client Portal',
    desc: 'White-label dashboards for your clients. They see clean, simple metrics without the Google Ads complexity.',
    iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Automated Reports',
    desc: 'One-click reporting. Generate polished performance summaries with plain-English notes your clients love.',
    iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
      </svg>
    ),
  },
  {
    title: 'Google Ads Sync',
    desc: 'Direct API integration. Connect your Google Ads MCC and sync campaigns, metrics and budgets automatically.',
    iconBg: 'bg-sky-50 text-sky-600 group-hover:bg-sky-100',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
      </svg>
    ),
  },
]

function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-emerald-500 bg-clip-text text-transparent">manage ads smarter</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl p-7 transition-all duration-300 ${
                f.highlighted
                  ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-violet-200/40 scale-[1.02]'
                  : 'bg-white text-gray-900 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/60 hover:-translate-y-0.5'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className={`text-sm leading-relaxed ${f.highlighted ? 'text-violet-100' : 'text-gray-500'}`}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                      */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Connect',
      desc: 'Link your Google Ads MCC account in one click. We handle OAuth, permissions and syncing automatically.',
      color: 'from-violet-600 to-indigo-600',
    },
    {
      num: '02',
      title: 'Monitor',
      desc: 'Watch every campaign in real-time. Set budget alerts, track performance shifts and spot opportunities.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      num: '03',
      title: 'Grow',
      desc: 'Share clear dashboards with clients. Make data-driven decisions that increase ROI month over month.',
      color: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80"
                alt="Analytics dashboard on screen"
                className="w-full h-[400px] object-cover"
              />
            </div>

            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100">
              <p className="text-2xl font-bold text-emerald-500">+237%</p>
              <p className="text-xs text-gray-500">Avg. ROI Increase</p>
            </div>
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100">
              <p className="text-2xl font-bold text-violet-500">+124%</p>
              <p className="text-xs text-gray-500">Monthly Leads</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-12">
              Three steps to
              <br />
              <span className="text-gray-400">smarter ad management</span>
            </h2>

            <div className="space-y-10">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-5">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg`}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  WHY GLASSBOX                                                      */
/* ------------------------------------------------------------------ */
function WhyGlassBox() {
  const points = [
    { text: 'Built specifically for Malaysian agencies managing Google Ads', color: 'text-violet-500' },
    { text: 'White-label dashboards your clients actually understand', color: 'text-indigo-500' },
    { text: 'Automatic budget alerts prevent costly overspending', color: 'text-emerald-500' },
    { text: 'Sync directly from Google Ads API — no manual data entry', color: 'text-amber-500' },
    { text: 'Plain-English performance notes, not confusing jargon', color: 'text-rose-500' },
  ]

  return (
    <section id="why" className="py-20 md:py-28 bg-gradient-to-br from-gray-50 via-violet-50/20 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Why GlassBox</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              Why agencies choose
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">GlassBox</span>
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              The ad management industry is growing rapidly, but most tools
              overwhelm agencies with raw data. GlassBox translates complexity
              into clarity so you can focus on strategy, not spreadsheets.
            </p>

            <ul className="space-y-4 mb-8">
              {points.map((point) => (
                <li key={point.text} className="flex items-start gap-3">
                  <svg className={`w-5 h-5 ${point.color} mt-0.5 flex-shrink-0`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">{point.text}</span>
                </li>
              ))}
            </ul>

            <a
              href="#features"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 px-6 py-2.5 rounded-full hover:bg-white transition-colors"
            >
              Learn more
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-violet-100/40">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80"
                alt="Data analytics on screen"
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-violet-200 to-indigo-200 rounded-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA                                                               */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950 rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Ready to demystify
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
                your marketing?
              </span>
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Join agencies across Malaysia who are already saving hours
              and impressing their clients with GlassBox.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-medium px-8 py-3.5 rounded-full hover:shadow-lg hover:shadow-violet-500/25 transition-all"
              >
                Get Started Free
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-gray-600 text-gray-300 text-sm font-medium px-8 py-3.5 rounded-full hover:border-gray-500 hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                            */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">GlassBox</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your Marketing, Demystified.
              <br />
              Transform Google Ads data into clarity.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="#features" className="hover:text-gray-900 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a></li>
              <li><Link href="/register" className="hover:text-gray-900 transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="#why" className="hover:text-gray-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
              <li><Link href="/login" className="hover:text-gray-900 transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} GlassBox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN LANDING PAGE                                                 */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <WhyGlassBox />
      <CTA />
      <Footer />
    </div>
  )
}
