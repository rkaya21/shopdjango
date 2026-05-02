import axios from 'axios'

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // HttpOnly cookie'leri her istekte gönder
})

// 401 gelince refresh dene; refresh da başarısızsa isteği reddet (yönlendirme yok).
// Yönlendirmeyi ProtectedRoute üstlenir — bu sayede herkese açık sayfalar
// giriş yapmamış kullanıcıları login'e zorlamaz.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isRefreshEndpoint = original.url?.includes('/api/auth/token/refresh/')
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true
      try {
        await axios.post('/api/auth/token/refresh/', {}, { withCredentials: true })
        return api(original)
      } catch {
        // Refresh başarısız — session'ı temiz bırak, ProtectedRoute yönlendirir
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const register = (data) => api.post('/api/auth/register/', data)
export const login = (data) => api.post('/api/auth/login/', data)
export const logout = () => api.post('/api/auth/logout/')
export const getProfile = () => api.get('/api/auth/profile/')

// Products
export const getProducts = (params) => api.get('/api/products/', { params })
export const getCategories = () => api.get('/api/products/categories/')
export const getProductBySlug = (slug) => api.get(`/api/products/${slug}/`)

// Cart
export const getCart = () => api.get('/api/orders/cart/')
export const addToCart = (productId, quantity = 1) =>
  api.post('/api/orders/cart/add/', { product_id: productId, quantity })
export const updateCartItem = (itemId, quantity) =>
  api.patch(`/api/orders/cart/update/${itemId}/`, { quantity })
export const removeFromCart = (itemId) => api.delete(`/api/orders/cart/remove/${itemId}/`)

// Orders
export const getOrders = () => api.get('/api/orders/')
export const createOrder = (shippingAddress) =>
  api.post('/api/orders/create/', { shipping_address: shippingAddress })

// Payments
export const initiatePayment = (data) => api.post('/api/payments/initiate/', data)
export const getPayments = () => api.get('/api/payments/history/')

// Addresses
export const getAddresses = () => api.get('/api/auth/addresses/')
export const createAddress = (data) => api.post('/api/auth/addresses/', data)
export const updateAddress = (id, data) => api.put(`/api/auth/addresses/${id}/`, data)
export const deleteAddress = (id) => api.delete(`/api/auth/addresses/${id}/`)

// Password
export const changePassword = (data) => api.post('/api/auth/password/change/', data)
export const requestPasswordReset = (email) => api.post('/api/auth/password/reset/', { email })
export const confirmPasswordReset = (data) => api.post('/api/auth/password/reset/confirm/', data)

// Reviews
export const getReviews = (slug) => api.get(`/api/products/${slug}/reviews/`)
export const createReview = (slug, data) => api.post(`/api/products/${slug}/reviews/create/`, data)

// Wishlist
export const getWishlist = () => api.get('/api/products/wishlist/')
export const toggleWishlist = (productId) => api.post(`/api/products/wishlist/${productId}/toggle/`)

// Promotions
export const applyCoupon = (code) => api.post('/api/promotions/apply/', { code })
export const removeCoupon = () => api.post('/api/promotions/remove/')

export default api
