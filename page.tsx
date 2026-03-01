import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">⚡ SubTracker</span>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-4 py-2 rounded-lg text-sm text-white/80 hover:text-white transition">Sign in</Link>
          <Link href="/auth/signup" className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 transition font-medium">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          AI-powered subscription detection
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Know exactly what<br />you're paying for
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
          Connect your Gmail or Outlook and SubTracker automatically finds all your subscriptions using AI — no manual entry needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-base transition">
            Start for free →
          </Link>
          <Link href="/auth/login" className="px-8 py-3.5 bg-white/10 hover:bg-white/15 rounded-xl font-semibold text-base transition border border-white/10">
            Sign in
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            { icon: '🔍', title: 'Auto-scan emails', desc: 'Connects to Gmail & Outlook to automatically find subscription emails.' },
            { icon: '🤖', title: 'AI extraction', desc: 'Claude AI reads emails and extracts service name, cost, billing cycle and dates.' },
            { icon: '📊', title: 'Track spending', desc: 'See your total monthly spend, upcoming renewals, and subscription history.' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
