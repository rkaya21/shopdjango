import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function CartPage() {
  const { cart, removeFromCart } = useCart()
  const [removing, setRemoving] = useState(null)

  const handleRemove = async (itemId) => {
    setRemoving(itemId)
    try {
      await removeFromCart(itemId)
    } finally {
      setRemoving(null)
    }
  }

  if (!cart || cart.cart_items?.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-surface-800 mb-2">Sepetiniz boş</h2>
        <p className="text-surface-400 mb-8 text-sm">Alışverişe başlamak için ürünlere göz atın.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-surface-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-surface-800 transition-all duration-200 shadow-lg shadow-surface-900/20 hover:shadow-xl"
          id="cart-start-shopping"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Alışverişe Başla
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900" id="cart-title">Sepetim</h1>
          <p className="text-sm text-surface-400 mt-1">{cart.cart_items.length} ürün</p>
        </div>
        <Link to="/" className="text-sm text-surface-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Alışverişe Devam Et
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.cart_items.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-surface-100 p-4 sm:p-5 flex items-center gap-4 hover:shadow-sm transition-shadow duration-200"
              style={{ animationDelay: `${i * 0.05}s` }}
              id={`cart-item-${item.id}`}
            >
              {/* Image */}
              <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-50 rounded-xl overflow-hidden border border-surface-100">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V16.5" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="font-semibold text-surface-900 hover:text-brand-600 transition-colors text-sm sm:text-base truncate block"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-surface-400 mt-1">
                  {Number(item.product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} × {item.quantity}
                </p>
              </div>

              {/* Price & Remove */}
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                <p className="font-bold text-surface-900 tabular-nums">
                  {Number(item.subtotal).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removing === item.id}
                  className="text-xs text-surface-400 hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-50"
                  id={`cart-remove-${item.id}`}
                >
                  {removing === item.id ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  )}
                  {removing === item.id ? 'Siliniyor...' : 'Kaldır'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24" id="cart-summary">
            <h3 className="font-semibold text-surface-900 mb-5">Sipariş Özeti</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-surface-500">
                <span>Ara Toplam</span>
                <span className="text-surface-700 font-medium tabular-nums">
                  {Number(cart.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Kargo</span>
                <span className="text-emerald-600 font-medium">Ücretsiz</span>
              </div>
            </div>

            <div className="border-t border-surface-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-surface-900">Toplam</span>
              <span className="text-xl font-extrabold text-surface-900 tabular-nums">
                {Number(cart.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>

            <Link
              to="/checkout"
              className="mt-5 block w-full bg-surface-900 text-white text-center py-3.5 rounded-xl font-semibold hover:bg-surface-800 transition-all duration-200 shadow-lg shadow-surface-900/20 hover:shadow-xl"
              id="cart-checkout-btn"
            >
              Siparişi Tamamla
            </Link>

            {/* Trust */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-surface-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              SSL ile güvenli ödeme
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
