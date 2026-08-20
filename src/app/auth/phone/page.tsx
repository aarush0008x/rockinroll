'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Phone, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react'

export default function PhoneLoginPage() {
  const router = useRouter()
  const { loginWithPhone } = useAuth()

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [countdown, setCountdown] = useState(0)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(data.message || 'OTP sent successfully to your WhatsApp')
        setStep('OTP')
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await loginWithPhone(phone, otp, name)
    if (res.success) {
      router.push('/menu')
    } else {
      setError(res.error || 'Invalid OTP code')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center mx-auto text-white shadow-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#22092C]">
            {step === 'PHONE' ? 'WhatsApp & Phone Login' : 'Enter 6-Digit OTP'}
          </h1>
          <p className="text-xs text-neutral-600 font-semibold">
            {step === 'PHONE'
              ? 'Instant passwordless access via WhatsApp OTP'
              : `Enter the code sent to +91 ${phone}`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs font-bold text-red-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide">
                Full Name (Optional for new users)
              </label>
              <input
                type="text"
                placeholder="e.g. Aarush Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#BE3144] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide">
                Mobile Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-100 text-neutral-700 font-extrabold text-xs">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 rounded-r-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#BE3144] transition-all tracking-wider"
                />
              </div>
              <p className="text-[10px] text-neutral-500 pt-1">
                🎁 New users instantly get 100 free RollPoints on login!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-black text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending WhatsApp OTP...' : 'Get WhatsApp OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide block">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full py-3.5 text-center text-2xl font-black tracking-[8px] rounded-xl border border-neutral-300 bg-neutral-50 text-[#22092C] focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
              <ShieldCheck className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="font-bold text-neutral-500 hover:text-neutral-800"
              >
                ← Change Number
              </button>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleSendOtp}
                className="font-extrabold text-[#BE3144] hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-neutral-600 font-semibold pt-2 border-t border-neutral-100 flex items-center justify-center gap-3">
          <span>Or prefer password?</span>
          <Link href="/auth/login" className="font-extrabold text-[#BE3144] hover:underline">
            Email & Password Login
          </Link>
        </div>

      </div>
    </div>
  )
}
