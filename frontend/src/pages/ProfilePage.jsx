import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrders } from '../api/client'

const STATUS_CONFIG = {
  pending:   { label: 'Beklemede',      color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  confirmed: { label: 'Onaylandı',      color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  shipped:   { label: 'Kargoda',        color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  delivered: { label: 'Teslim Edildi',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'İptal Edildi',    color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-500' },
}

export default function ProfilePage() {
  const { user } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  const orderSuccess = location.state?.orderSuccess

  useEffect(() => {
    if (orderSuccess) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [orderSuccess])

  useEffect(() => {
    getOrders()
      .then((res) => {
        const data = res.data
        setOrders(Array.isArray(data) ? data : data.results ?? [])
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">
      {/* Success toast */}
      {showSuccess && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 text-sm font-medium animate-slide-up" id="order-success-toast">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Siparişiniz başarıyla oluşturuldu!</p>
            <p className="text-xs text-emerald-600 mt-0.5">Sipariş durumunuzu aşağıda takip edebilirsiniz.</p>
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6 sm:p-8 mb-8" id="profile-card">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg shadow-brand-500/20">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900">{user?.username}</h1>
            <p className="text-sm text-surface-400 mt-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Toplam Sipariş', value: orders.length, icon: 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z' },
            { label: 'Teslim Edilen', value: orders.filter(o => o.status === 'delivered').length, icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
            { label: 'Aktif Sipariş', value: orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length, icon: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-surface-50 rounded-xl p-4 text-center border border-surface-100">
              <svg className="w-5 h-5 text-surface-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              <p className="text-2xl font-bold text-surface-900 tabular-nums">{loading ? '–' : value}</p>
              <p className="text-[11px] text-surface-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-surface-900" id="orders-title">Siparişlerim</h2>
        <Link to="/" className="text-sm text-surface-400 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Alışveriş
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-100 p-6">
              <div className="flex justify-between mb-4">
                <div className="h-5 skeleton w-1/4" />
                <div className="h-5 skeleton w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 animate-fade-in" id="no-orders">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-surface-700">Henüz sipariş yok</h3>
          <p className="text-sm text-surface-400 mt-1">İlk siparişinizi vermek için alışverişe başlayın.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-5 bg-surface-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-800 transition-all shadow-lg shadow-surface-900/20">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-surface-100 text-surface-600 border-surface-200', dot: 'bg-surface-400' }
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-surface-100 p-5 sm:p-6 hover:shadow-sm transition-shadow" id={`order-${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-surface-900 flex items-center gap-2">
                      <span className="text-surface-400 font-normal text-sm">#</span>
                      {order.id}
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-surface-600">
                        {item.product.name}
                        <span className="text-surface-300 ml-1">× {item.quantity}</span>
                      </span>
                      <span className="text-surface-700 font-medium tabular-nums">
                        {Number(item.subtotal).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-surface-50 flex justify-between items-center">
                  <span className="text-sm font-semibold text-surface-900">Toplam</span>
                  <span className="font-bold text-surface-900 tabular-nums">
                    {Number(order.total_price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>

                {order.shipping_address && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-surface-400">
                    <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <span>{order.shipping_address}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
