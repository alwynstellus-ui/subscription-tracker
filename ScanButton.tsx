'use client'
import { useState } from 'react'

interface ScanResult {
  jobId: string
  status: string
  progress_percentage?: number
  emails_processed?: number
  new_subscriptions_found?: number
  error_message?: string
}

export default function ScanButton({ accountId }: { accountId: string }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  async function startScan() {
    setScanning(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/email/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedAccountId: accountId }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const { jobId } = await res.json()

      const poll = setInterval(async () => {
        const statusRes = await fetch(`/api/email/scan-status?jobId=${jobId}`)
        const job = await statusRes.json()
        setResult(job)
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(poll)
          setScanning(false)
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setScanning(false)
    }
  }

  if (result?.status === 'completed') {
    return <span className="text-xs text-emerald-600 font-medium">✅ Found {result.new_subscriptions_found ?? 0} subscriptions</span>
  }

  return (
    <div>
      <button onClick={startScan} disabled={scanning}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-60">
        {scanning ? 'Starting┦' : '🔍 Scan emails'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
