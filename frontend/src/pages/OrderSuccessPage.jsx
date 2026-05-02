import { Link, useLocation } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const order = state?.order
  const payment = state?.payment

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center animate-slide-up">
      {/* Success icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-surface-900 mb-2">Siparişiniz Alındı!</h1>
      <p className="text-surface-400 mb-8">Teşekkürler! Siparişiniz başarıyla oluşturuldu.</p>

      {order && (
        <div className="bg-white rounded-2xl border border-surface-100 p-6 text-left mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-surface-400">Sipariş No</p>
              <p className="font-bold text-surface-900 text-lg">#{order.id}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Onaylandı
            </span>
          </div>

          {payment && (
            <div className="border-t border-surface-100 pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-surface-500">
                <span>Ödeme Yöntemi</span>
                <span className="text-surface-700 font-medium">{payment.method_display}</span>
              </div>
              {payment.card_last_four && (
                <div className="flex justify-between text-surface-500">
                  <span>Kart</span>
                  <span className="text-surface-700 font-medium tabular-nums">•••• {payment.card_last_four}</span>
                </div>
              )}
              <div className="flex justify-between text-surface-500">
                <span>İşlem No</span>
                <span className="text-surface-700 font-mono text-xs">{payment.transaction_id?.slice(0,8)}...</span>
              </div>
            </div>
          )}

          <div className="border-t border-surface-100 pt-4 mt-4 flex justify-between">
            <span className="font-bold text-surface-900">Toplam</span>
            <span className="font-extrabold text-surface-900 tabular-nums">
              {Number(order.total_price).toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/profile" className="px-6 py-3 bg-surface-900 text-white rounded-xl font-semibold hover:bg-surface-800 transition-all shadow-lg shadow-surface-900/20">
          Siparişlerimi Gör
        </Link>
        <Link to="/" className="px-6 py-3 bg-surface-100 text-surface-700 rounded-xl font-medium hover:bg-surface-200 transition-colors">
          Alışverişe Devam Et
        </Link>
      </div>
    </main>
  )
}
