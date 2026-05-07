import { createContext, useContext, useEffect, useState } from 'react'
import { getWishlist, toggleWishlist } from '../api/client'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([])
      return []
    }

    setLoading(true)
    try {
      const { data } = await getWishlist()
      const products = Array.isArray(data) ? data : data.results ?? []
      setWishlist(products)
      return products
    } catch {
      setWishlist([])
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const isWishlisted = (productId) => wishlist.some((product) => product.id === productId)

  const toggle = async (product) => {
    const wasWishlisted = isWishlisted(product.id)
    setWishlist((current) => (
      wasWishlisted
        ? current.filter((item) => item.id !== product.id)
        : [product, ...current]
    ))

    try {
      const { data } = await toggleWishlist(product.id)
      if (data.status === 'removed') {
        setWishlist((current) => current.filter((item) => item.id !== product.id))
      } else {
        setWishlist((current) => (
          current.some((item) => item.id === product.id) ? current : [product, ...current]
        ))
      }
      return data.status
    } catch (error) {
      setWishlist((current) => (
        wasWishlisted
          ? (current.some((item) => item.id === product.id) ? current : [product, ...current])
          : current.filter((item) => item.id !== product.id)
      ))
      throw error
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        fetchWishlist,
        isWishlisted,
        toggleWishlist: toggle,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => useContext(WishlistContext)
