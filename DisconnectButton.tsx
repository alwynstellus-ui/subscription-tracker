'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DisconnectButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function disconnect() {
    setLoading(true)
    await fetch(`/api/accounts/${id}/disconnect`, { method: 'POST' })
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">Disconnect?</span>
        <button onClick={disconnect} disabled={loading}
          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-60">
          {loading ? '…' : 'Yes'}
        </button>
        <button onClick={() => setConfirming(false)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition">
          No
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-xs font-medium rounded-lg transition">
      Disconnect
    </button>
  )
}
