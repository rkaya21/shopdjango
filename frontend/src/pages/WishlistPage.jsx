import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useWishlist } from '../context/WishlistContext'

export default function WishlistPage() {
  const { wishlist, loading } = useWishlist()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Favorilerim</h1>
          <p className="text-sm text-surface-500 mt-1">
            {wishlist.length > 0 ? `${wishlist.length} ürün favorilerinizde` : 'Beğendiğiniz ürünleri burada saklayın.'}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 hover:border-brand-200 hover:text-brand-700"
        >
          Alışverişe Devam Et
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              <div className="aspect-[4/5] skeleton" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 skeleton w-1/3" />
                <div className="h-4 skeleton w-3/4" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 stagger-children">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-surface-100">
          <div className="w-20 h-20 mx-auto mb-5 bg-brand-50 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-500 fill-transparent" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-surface-800">Favori listeniz boş</h2>
          <p className="text-sm text-surface-400 mt-1.5">Ürünlerdeki kalp ikonuna basarak listenizi oluşturabilirsiniz.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-surface-900 px-5 py-3 text-sm font-semibold text-white hover:bg-surface-800"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      )}
    </main>
  )
}
