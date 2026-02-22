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
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Sepetiniz boş</h2>
        <p className="text-gray-400 mb-6">Alışverişe başlamak için ürünlere göz atın.</p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Alışverişe Başla
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sepetim</h1>

      <div className="space-y-3 mb-6">
        {cart.cart_items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
              {item.product.image ? (
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                to={`/products/${item.product.slug}`}
                className="font-medium text-gray-900 hover:text-indigo-600 truncate block"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-400 mt-0.5">
                {Number(item.product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} × {item.quantity}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-gray-900">
                {Number(item.subtotal).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
              <button
                onClick={() => handleRemove(item.id)}
                disabled={removing === item.id}
                className="text-xs text-red-500 hover:text-red-700 mt-1 disabled:opacity-50 transition-colors"
              >
                {removing === item.id ? 'Siliniyor...' : 'Kaldır'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
          <span>Toplam</span>
          <span>{Number(cart.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
        </div>
        <Link
          to="/checkout"
          className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Siparişi Tamamla
        </Link>
        <Link
          to="/"
          className="block w-full text-center py-2 mt-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          Alışverişe Devam Et
        </Link>
      </div>
    </main>
  )
}
