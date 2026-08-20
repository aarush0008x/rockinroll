'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Flame, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await login(email, password)
    if (res.success) {
      router.push('/menu')
    } else {
      setError(res.error || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#BE3144] to-[#F05941] flex items-center justify-center mx-auto text-white shadow-lg">
            <Flame className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#22092C]">Welcome Back</h1>
          <p className="text-xs text-neutral-600 font-semibold">Sign in to your RockinRoll account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs font-bold text-red-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#BE3144] focus:border-[#BE3144] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#22092C] uppercase tracking-wide">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-[11px] font-bold text-[#BE3144] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1A1A1A] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#BE3144] focus:border-[#BE3144] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#BE3144] to-[#F05941] text-white font-black text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-neutral-600 font-semibold pt-2 border-t border-neutral-100">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-extrabold text-[#BE3144] hover:underline">
            Create Account
          </Link>
        </div>

        <div className="p-4 bg-[#FFF8F5] rounded-2xl text-xs text-[#22092C] border border-[#872341]/20 space-y-1.5 font-medium">
          <p className="font-black text-[#22092C] uppercase text-[11px] tracking-wider text-[#BE3144]">
            Demo Accounts (Password: RockinRoll@2026):
          </p>
          <div className="space-y-0.5 text-[11px] text-neutral-700">
            <p><span className="font-bold text-[#22092C]">• Admin:</span> admin@rockinroll.com</p>
            <p><span className="font-bold text-[#22092C]">• Kitchen:</span> kitchen@rockinroll.com</p>
            <p><span className="font-bold text-[#22092C]">• Rider:</span> rider@rockinroll.com</p>
            <p><span className="font-bold text-[#22092C]">• Customer:</span> customer@rockinroll.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
