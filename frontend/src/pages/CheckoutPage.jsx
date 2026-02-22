import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../api/client'
import { useCart } from '../context/CartContext'

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      setError('Teslimat adresi zorunludur.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createOrder(address)
      await fetchCart()
      navigate('/profile', { state: { orderSuccess: true } })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Sipariş oluşturulurken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (!cart || cart.cart_items?.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Siparişi Tamamla</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Address form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              required
              rows={5}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adres, mahalle, ilçe, şehir..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Sipariş Oluşturuluyor...' : 'Siparişi Onayla'}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
          <div className="space-y-3 divide-y divide-gray-50">
            {cart.cart_items.map((item) => (
              <div key={item.id} className="flex justify-between pt-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                  <p className="text-xs text-gray-400">× {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(item.subtotal).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold text-gray-900">
            <span>Toplam</span>
            <span>{Number(cart.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
