import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { confirmPasswordReset } from '../api/client'

export default function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== password2) { setError('Şifreler eşleşmiyor.'); return }
    setLoading(true); setError('')
    try {
      await confirmPasswordReset({ uid, token, new_password: password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Geçersiz veya süresi dolmuş link.'
      setError(msg)
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full border border-surface-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-surface-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-surface-900">Shop<span className="text-brand-600">Django</span></span>
          </Link>
        </div>

        {success ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-2">Şifre Sıfırlandı!</h2>
            <p className="text-sm text-surface-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-surface-900">Yeni Şifre Belirle</h1>
            <p className="mt-2 text-sm text-surface-400">Yeni şifrenizi girin.</p>

            {error && <div className="mt-4 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Yeni Şifre</label>
                <input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}
                  className={inputCls} placeholder="Min. 8 karakter"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Şifre Tekrar</label>
                <input type="password" required value={password2} onChange={e=>setPassword2(e.target.value)}
                  className={inputCls} placeholder="••••••••"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-surface-900 text-white py-3 rounded-xl font-semibold hover:bg-surface-800 transition-all shadow-lg shadow-surface-900/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading?'Sıfırlanıyor...':'Şifreyi Sıfırla'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
