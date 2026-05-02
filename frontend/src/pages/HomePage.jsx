import { useState, useEffect } from 'react'
import { getProducts, getCategories } from '../api/client'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (selectedCategory) params.category = selectedCategory
    if (search.trim()) params.search = search.trim()
    getProducts(params)
      .then((res) => {
        const data = res.data
        setProducts(Array.isArray(data) ? data : data.results ?? [])
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [selectedCategory, search])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mb-10 animate-fade-in" id="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)'
        }} />
        <div className="relative px-8 py-14 sm:px-12 sm:py-20 lg:py-24 flex flex-col items-start">
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-[0.2em] mb-4">
            Premium Alışveriş Deneyimi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-xl">
            Kaliteyi Keşfet,<br />
            <span className="text-brand-400">Tarzını</span> Yansıt
          </h1>
          <p className="mt-4 text-surface-300 text-sm sm:text-base max-w-md leading-relaxed">
            Özenle seçilmiş ürünler, güvenli ödeme ve hızlı teslimat ile premium alışveriş deneyimi.
          </p>

          {/* Search in hero */}
          <div className="mt-8 w-full max-w-lg">
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-surface-400 text-sm focus:outline-none focus:bg-white/15 focus:border-brand-400/50 transition-all duration-200"
                id="hero-search-input"
              />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-4 right-24 w-32 h-32 bg-brand-400/8 rounded-full blur-3xl" />
      </section>

      {/* Category chips */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-2 flex-wrap" id="category-filter">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'bg-surface-900 text-white shadow-md shadow-surface-900/20'
                : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300 hover:shadow-sm'
            }`}
            id="category-all"
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.slug
                  ? 'bg-surface-900 text-white shadow-md shadow-surface-900/20'
                  : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300 hover:shadow-sm'
              }`}
              id={`category-${cat.slug}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              <div className="aspect-[4/5] skeleton" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 skeleton w-1/3" />
                <div className="h-4 skeleton w-3/4" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 animate-fade-in" id="empty-state">
          <div className="w-20 h-20 mx-auto mb-5 bg-surface-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-700">Ürün bulunamadı</h3>
          <p className="text-sm text-surface-400 mt-1.5">Farklı bir arama terimi veya kategori deneyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 stagger-children">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
