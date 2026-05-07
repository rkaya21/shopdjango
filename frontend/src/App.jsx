import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import WishlistPage from './pages/WishlistPage'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              {/* Auth sayfaları — Navbar/Footer yok */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

              {/* Layout'lu sayfalar */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
              <Route
                path="/wishlist"
                element={
                  <Layout>
                    <ProtectedRoute><WishlistPage /></ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/cart"
                element={
                  <Layout>
                    <ProtectedRoute><CartPage /></ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <Layout>
                    <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/order-success"
                element={
                  <Layout>
                    <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/profile"
                element={
                  <Layout>
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                  </Layout>
                }
              />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
