import { Link2, LoaderCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Card, fieldClass } from '../ui/primitives'

export function AuthPage() {
  const { user, login, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  if (user) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password })
      else {
        const signedIn = await signUp(form)
        if (!signedIn) setNotice('Check your email to confirm your account, then sign in.')
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Authentication failed') }
    finally { setBusy(false) }
  }

  return <div className="grid min-h-screen bg-[#FAF7F2] lg:grid-cols-2">
    <section className="hidden bg-[#2F6B4F] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3 font-heading text-2xl"><span className="grid size-10 place-items-center rounded-lg bg-white/15"><Link2 /></span>Connectly</div>
      <div className="max-w-lg"><p className="font-heading text-5xl font-semibold leading-tight">Find your people. Build something meaningful.</p><p className="mt-5 text-lg text-white/75">A warm space for communities, shared interests, and conversations that move ideas forward.</p></div>
      <p className="text-sm text-white/60">Community starts with a hello.</p>
    </section>
    <section className="flex items-center justify-center p-5 sm:p-10">
      <Card className="w-full max-w-md border-[#E7E0D6] p-6 sm:p-8">
        <div className="mb-7 flex items-center gap-2 font-heading text-xl lg:hidden"><span className="grid size-8 place-items-center rounded bg-[#2F6B4F] text-white"><Link2 className="size-4" /></span>Connectly</div>
        <h1 className="font-heading text-3xl font-semibold text-[#2B2622]">{mode === 'login' ? 'Welcome back' : 'Join the community'}</h1>
        <p className="mt-2 text-sm text-[#6F675E]">{mode === 'login' ? 'Sign in to continue to your network.' : 'Create your profile in just a moment.'}</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === 'signup' && <><label className="block text-sm font-medium">Full name<input required className={`${fieldClass} mt-1`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="block text-sm font-medium">Username<input required minLength={3} className={`${fieldClass} mt-1`} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} /></label></>}
          <label className="block text-sm font-medium">Email<input required type="email" className={`${fieldClass} mt-1`} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="block text-sm font-medium">Password<input required minLength={6} type="password" className={`${fieldClass} mt-1`} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p className="rounded-lg bg-[#E4F0E9] p-3 text-sm text-[#1E4633]">{notice}</p>}
          <Button className="w-full" disabled={busy}>{busy && <LoaderCircle className="size-4 animate-spin" />}{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-[#6F675E]">{mode === 'login' ? 'New to Connectly?' : 'Already have an account?'} <button className="font-semibold text-[#2F6B4F]" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setNotice('') }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
      </Card>
    </section>
  </div>
}
