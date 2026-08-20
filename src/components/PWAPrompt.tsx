'use client'

import React, { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-[#22092C] text-white p-4 rounded-2xl shadow-2xl border border-[#BE3144] flex items-center justify-between gap-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#BE3144] text-white">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs">Install RockinRoll App</h4>
          <p className="text-[11px] text-neutral-300">Fast 1-tap ordering & live tracking</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-[#F05941] text-white text-xs font-bold rounded-lg hover:brightness-110"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-neutral-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
