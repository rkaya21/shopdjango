import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { createReview, getProductBySlug, getReviews } from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function StarRating({ value, onChange, readonly = false, size = 'w-5 h-5' }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => {
        const active = rating <= value
        const className = `${size} transition-colors ${active ? 'text-brand-500 fill-brand-500' : 'text-surface-300 fill-transparent'}`

        if (readonly) {
          return (
            <svg key={rating} className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          )
        }

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="p-0.5 rounded-md hover:bg-brand-50"
            aria-label={`${rating} yıldız`}
          >
            <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    getProductBySlug(slug)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  useEffect(() => {
    setReviewsLoading(true)
    getReviews(slug)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false))
  }, [slug])

  const hasUserReview = Boolean(user && reviews.some((review) => review.username === user.username))

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    setError('')
    try {
      await addToCart(product.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch {
      setError('Sepete eklenirken bir hata oluştu.')
    } finally {
      setAdding(false)
    }
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    setReviewSubmitting(true)
    setReviewError('')
    setReviewSuccess('')

    try {
      const { data } = await createReview(slug, {
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
      })
      setReviews((current) => [data, ...current.filter((review) => review.id !== data.id)])
      setReviewForm({ rating: 5, title: '', comment: '' })
      setReviewSuccess('Yorumunuz eklendi.')
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Yorum gönderilirken bir hata oluştu.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const reviewCount = reviews.length || product?.review_count || 0
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : (product?.average_rating ? Number(product.average_rating) : 0)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="aspect-square skeleton rounded-3xl" />
          <div className="space-y-5 py-4">
            <div className="h-4 skeleton w-1/4" />
            <div className="h-8 skeleton w-3/4" />
            <div className="h-4 skeleton w-full" />
            <div className="h-4 skeleton w-5/6" />
            <div className="h-10 skeleton w-1/3 mt-6" />
            <div className="h-14 skeleton w-full mt-4" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-8" id="breadcrumb">
        <Link to="/" className="hover:text-brand-600 transition-colors">Ürünler</Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        {product.category?.name && (
          <>
            <button onClick={() => navigate(`/?category=${product.category.slug || ''}`)} className="hover:text-brand-600 transition-colors">
              {product.category.name}
            </button>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </>
        )}
        <span className="text-surface-600 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Image */}
        <div className="aspect-square bg-surface-50 rounded-3xl overflow-hidden border border-surface-100 shadow-sm" id="product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-200">
              <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 16.5V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col py-2">
          {product.category?.name && (
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-[0.15em]">
              {product.category.name}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mt-2 leading-tight" id="product-title">
            {product.name}
          </h1>

          <p className="text-surface-500 mt-4 leading-relaxed text-[15px]">
            {product.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {averageRating > 0 ? (
              <>
                <StarRating value={Math.round(averageRating)} readonly />
                <span className="text-sm font-semibold text-surface-800">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-surface-400">({reviewCount} yorum)</span>
              </>
            ) : (
              <span className="text-sm text-surface-400">Henüz yorum yapılmadı</span>
            )}
          </div>

          {/* Price + Stock */}
          <div className="mt-8 flex items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-surface-900" id="product-price">
              {Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </span>
            {product.in_stock ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {product.stock} adet stokta
              </span>
            ) : (
              <span className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                Stokta yok
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-surface-100 my-6" />

          {product.in_stock && (
            <div className="space-y-4">
              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-surface-600">Adet</label>
                <div className="flex items-center bg-surface-50 rounded-xl border border-surface-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-l-xl transition-colors"
                    id="qty-decrease"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-12 text-center font-semibold text-surface-900 text-sm tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-r-xl transition-colors"
                    id="qty-increase"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </p>
              )}

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`w-full py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 ${
                  added
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-surface-900 text-white hover:bg-surface-800 shadow-lg shadow-surface-900/20 hover:shadow-xl hover:shadow-surface-900/25'
                } disabled:opacity-60`}
                id="add-to-cart-btn"
              >
                {adding ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Ekleniyor...
                  </>
                ) : added ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Sepete Eklendi!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    Sepete Ekle
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z', text: 'Güvenli Ödeme' },
                  { icon: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', text: 'Hızlı Kargo' },
                  { icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182', text: 'Kolay İade' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1.5 py-3 bg-surface-50 rounded-xl border border-surface-100">
                    <svg className="w-4.5 h-4.5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                    <span className="text-[11px] font-medium text-surface-500">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12 border-t border-surface-100 pt-8" id="reviews">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Ürün Değerlendirmeleri</h2>
            <p className="text-sm text-surface-500 mt-1">
              {reviewCount > 0 ? `${reviewCount} yorum` : 'Bu ürün için ilk yorumu siz yazın.'}
            </p>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(averageRating)} readonly size="w-4 h-4" />
              <span className="text-sm font-semibold text-surface-700">{averageRating.toFixed(1)} / 5</span>
            </div>
          )}
        </div>

        <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
          <div className="space-y-4">
            {reviewsLoading ? (
              <>
                <div className="h-28 skeleton" />
                <div className="h-28 skeleton" />
              </>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-surface-900">{review.username}</p>
                      <p className="text-xs text-surface-400">
                        {new Date(review.created_at).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <StarRating value={review.rating} readonly size="w-4 h-4" />
                  </div>
                  {review.title && (
                    <h3 className="mt-4 text-sm font-semibold text-surface-800">{review.title}</h3>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-surface-600">{review.comment}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-200 bg-white p-8 text-center">
                <p className="font-medium text-surface-700">Henüz yorum yok</p>
                <p className="text-sm text-surface-400 mt-1">Ürün deneyiminizi paylaşarak diğer kullanıcılara yardımcı olun.</p>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm h-fit">
            <h3 className="font-semibold text-surface-900">Yorum Yaz</h3>
            {!user ? (
              <div className="mt-4">
                <p className="text-sm text-surface-500">Yorum yazmak için giriş yapmanız gerekiyor.</p>
                <Link
                  to="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-surface-900 px-4 py-3 text-sm font-semibold text-white hover:bg-surface-800"
                >
                  Giriş Yap
                </Link>
              </div>
            ) : hasUserReview ? (
              <p className="mt-4 text-sm text-surface-500">Bu ürüne daha önce yorum yaptınız.</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Puan</label>
                  <StarRating value={reviewForm.rating} onChange={(rating) => setReviewForm((form) => ({ ...form, rating }))} size="w-6 h-6" />
                </div>

                <div>
                  <label htmlFor="review-title" className="block text-sm font-medium text-surface-700 mb-1.5">Başlık</label>
                  <input
                    id="review-title"
                    value={reviewForm.title}
                    onChange={(event) => setReviewForm((form) => ({ ...form, title: event.target.value }))}
                    maxLength={200}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-surface-900 placeholder:text-surface-400"
                    placeholder="Kısa bir başlık"
                  />
                </div>

                <div>
                  <label htmlFor="review-comment" className="block text-sm font-medium text-surface-700 mb-1.5">Yorum</label>
                  <textarea
                    id="review-comment"
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))}
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-surface-900 placeholder:text-surface-400"
                    placeholder="Ürünle ilgili deneyiminizi yazın"
                  />
                </div>

                {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                {reviewSuccess && <p className="text-sm text-emerald-600">{reviewSuccess}</p>}

                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewForm.comment.trim()}
                  className="w-full rounded-xl bg-surface-900 px-4 py-3 text-sm font-semibold text-white hover:bg-surface-800 disabled:opacity-60"
                >
                  {reviewSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                </button>
              </form>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
