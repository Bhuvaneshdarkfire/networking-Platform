
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthStateContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthContextProps {
  children: ReactNode
}

export function AuthContext({ children }: AuthContextProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Session error:', error.message)
      }

      setSession(data?.session ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)
  }, [])

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw new Error(error.message)
    },
    [],
  )

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) throw new Error(error.message)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      login,
      signup,
      logout,
    }),
    [session, loading, login, signup, logout],
  )

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthStateContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContext')
  }

  return context
}
