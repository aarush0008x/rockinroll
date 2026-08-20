'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'DELIVERY_PARTNER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, pass: string, phone?: string, role?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const json = await res.json()
      if (json.success && json.data) {
        setUser(json.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      })
      const json = await res.json()
      if (json.success) {
        setUser(json.data.user)
        return { success: true }
      }
      return { success: false, error: json.error }
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed' }
    }
  }

  const register = async (name: string, email: string, pass: string, phone?: string, role?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, phone, role: role || 'CUSTOMER' }),
      })
      const json = await res.json()
      if (json.success) {
        setUser(json.data.user)
        return { success: true }
      }
      return { success: false, error: json.error }
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
