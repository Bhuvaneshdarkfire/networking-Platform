import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthStateContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthContextProps {
  children: ReactNode
}

export function AuthContext({ children }: AuthContextProps) {
  const [session] = useState<Session | null>(null)
  const [loading] = useState(false)

  useEffect(() => {
    // TODO: [BACKEND TEAM] - Implement Supabase login/logout and session listener here.
  }, [])

  const login = async () => {
    // TODO: [BACKEND TEAM] - Implement Supabase login/logout and session listener here.
  }

  const logout = async () => {
    // TODO: [BACKEND TEAM] - Implement Supabase login/logout and session listener here.
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      login,
      logout,
    }),
    [session, loading],
  )

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- Keep the auth contract colocated with its provider shell.
export function useAuth() {
  const context = useContext(AuthStateContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContext')
  }

  return context
}
