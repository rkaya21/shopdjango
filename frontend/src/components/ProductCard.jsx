import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      window.location.href = '/login'
      return
    }
    setAdding(true)
    try {
      await addToCart(product.id)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link to={`/products/${product.slug}`} className="group block" id={`product-card-${product.id}`}>
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg hover:shadow-surface-200/50 transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="aspect-[4/5] bg-surface-50 overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-200">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
          )}

          {/* Stock badge */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-surface-900/40 flex items-center justify-center">
              <span className="bg-white/90 text-surface-800 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                Tükendi
              </span>
            </div>
          )}

          {/* Quick add button */}
          {product.in_stock && (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`absolute bottom-3 right-3 p-2.5 rounded-xl shadow-lg transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-surface-700 hover:bg-surface-900 hover:text-white'
              } disabled:opacity-60`}
              id={`product-quick-add-${product.id}`}
            >
              {adding ? (
                <svg className="w-4.5 h-4.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : added ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category?.name && (
            <span className="text-[11px] font-medium text-brand-600 uppercase tracking-wider">
              {product.category.name}
            </span>
          )}
          <h3 className="mt-1 font-semibold text-surface-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-base font-bold text-surface-900">
              {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
            {product.in_stock ? (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Stokta
              </span>
            ) : (
              <span className="text-[10px] text-red-500 font-medium">Tükendi</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
