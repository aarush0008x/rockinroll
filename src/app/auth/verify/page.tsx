'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const qEmail = searchParams.get('email')
    const qCode = searchParams.get('code')
    if (qEmail) setEmail(qEmail)
    if (qCode) setCode(qCode)
  }, [searchParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const json = await res.json()
      if (json.success) {
        setSuccess('Email verified successfully! Redirecting to menu...')
        setTimeout(() => router.push('/menu'), 2000)
      } else {
        setError(json.error || 'Verification failed')
      }
    } catch (e: any) {
      setError(e.message || 'Error verifying account')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address to resend code')
      return
    }
    setResending(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (json.success) {
        setSuccess('New 6-digit verification code sent to your email!')
      } else {
        setError(json.error || 'Failed to resend code')
      }
    } catch (e: any) {
      setError(e.message || 'Error resending code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center mx-auto text-white shadow-lg">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#22092C]">Verify Your Email</h1>
        <p className="text-xs text-neutral-600 font-semibold">
          Enter the 6-digit code sent to your email address
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs font-bold text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:ring-[#BE3144]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide">
            6-Digit Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center tracking-[8px] text-xl font-black py-3 rounded-xl border border-neutral-300 bg-white text-[#22092C] placeholder:text-neutral-400 focus:ring-[#BE3144]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Verifying...' : 'Verify Email & Continue'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-bold text-[#BE3144] hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {resending ? 'Sending...' : 'Resend Code'}
        </button>

        <Link href="/auth/login" className="font-semibold text-neutral-600 hover:text-neutral-900">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-md bg-white rounded-3xl animate-pulse" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
