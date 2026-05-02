import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch { setError('Bir hata oluştu. Lütfen tekrar deneyin.') }
    finally { setLoading(false) }
  }

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

        {sent ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-2">E-posta Gönderildi</h2>
            <p className="text-sm text-surface-400 mb-6">Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi.</p>
            <Link to="/login" className="text-sm text-brand-600 font-semibold hover:text-brand-700">← Giriş sayfasına dön</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-surface-900">Şifremi Unuttum</h1>
            <p className="mt-2 text-sm text-surface-400">Kayıtlı e-posta adresinizi girin, size sıfırlama linki gönderelim.</p>

            {error && <div className="mt-4 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">E-posta</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all"
                  placeholder="ornek@email.com" id="forgot-email"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-surface-900 text-white py-3 rounded-xl font-semibold hover:bg-surface-800 transition-all shadow-lg shadow-surface-900/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading?<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Gönderiliyor...</>:'Sıfırlama Linki Gönder'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-surface-400">
              <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">← Giriş sayfasına dön</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
