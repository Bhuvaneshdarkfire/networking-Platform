import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Credentials { email: string; password: string }
interface SignUpDetails extends Credentials { name: string; username: string }

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  login: (credentials: Credentials) => Promise<void>
  signUp: (details: SignUpDetails) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthStateContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthContext({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const login = useCallback(async ({ email, password }: Credentials) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async ({ email, password, name, username }: SignUpDetails) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, username } },
    })
    if (error) throw error
    return Boolean(data.session)
  }, [])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(() => ({ session, user: session?.user ?? null, loading, login, signUp, logout }), [session, loading, login, signUp, logout])
  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- Auth hook is the provider's public contract.
export function useAuth() {
  const context = useContext(AuthStateContext)
  if (!context) throw new Error('useAuth must be used within AuthContext')
  return context
}
