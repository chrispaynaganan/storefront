'use client'
import { createContext, useContext, useState } from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  setUser: (user: User | null) => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
