import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                Shop<span className="text-brand-400">Django</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-surface-400 leading-relaxed max-w-xs">
              Premium alışveriş deneyimi. En kaliteli ürünleri en iyi fiyatlarla keşfedin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">Keşfet</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm text-surface-400 hover:text-white transition-colors">Tüm Ürünler</Link></li>
              <li><Link to="/cart" className="text-sm text-surface-400 hover:text-white transition-colors">Sepetim</Link></li>
              <li><Link to="/profile" className="text-sm text-surface-400 hover:text-white transition-colors">Siparişlerim</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">Hesap</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-sm text-surface-400 hover:text-white transition-colors">Giriş Yap</Link></li>
              <li><Link to="/register" className="text-sm text-surface-400 hover:text-white transition-colors">Üye Ol</Link></li>
              <li><Link to="/profile" className="text-sm text-surface-400 hover:text-white transition-colors">Profilim</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">İletişim</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-surface-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                info@shopdjango.com
              </li>
              <li className="text-sm text-surface-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                İstanbul, Türkiye
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-500">© {new Date().getFullYear()} ShopDjango. Tüm hakları saklıdır.</p>
          <p className="text-xs text-surface-600">Django + React ile geliştirildi</p>
        </div>
      </div>
    </footer>
  )
}
