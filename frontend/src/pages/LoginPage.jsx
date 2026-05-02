import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Giriş başarısız. E-posta veya şifre hatalı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)'
        }} />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Shop<span className="text-brand-400">Django</span></span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Tekrar hoş geldin.<br />
              <span className="text-brand-400">Alışverişe devam et.</span>
            </h2>
            <p className="text-surface-400 text-sm max-w-sm leading-relaxed">
              Hesabına giriş yap, sepetindeki ürünlere göz at ve siparişlerini takip et.
            </p>
          </div>

          <p className="text-xs text-surface-500">© {new Date().getFullYear()} ShopDjango</p>
        </div>

        {/* Decorative */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-brand-400/8 rounded-full blur-3xl" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-surface-900">Shop<span className="text-brand-600">Django</span></span>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-surface-900" id="login-title">Giriş Yap</h1>
            <p className="mt-2 text-sm text-surface-400">Hesabına giriş yaparak alışverişe devam et</p>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm animate-fade-in">
              <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">E-posta</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm bg-white hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all duration-200"
                placeholder="ornek@email.com"
                id="login-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Şifre</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm bg-white hover:border-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all duration-200"
                placeholder="••••••••"
                id="login-password"
              />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors">
                Şifremi unuttum
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-surface-900 text-white py-3 rounded-xl font-semibold hover:bg-surface-800 transition-all duration-200 shadow-lg shadow-surface-900/20 hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
              id="login-submit"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Giriş yapılıyor...
                </>
              ) : 'Giriş Yap'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-400">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors" id="login-register-link">
              Üye ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
