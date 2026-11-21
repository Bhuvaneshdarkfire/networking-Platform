import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#FAF7F2]"><LoaderCircle className="size-8 animate-spin text-[#2F6B4F]" /></div>
  return user ? <Outlet /> : <Navigate to="/auth" replace />
}
