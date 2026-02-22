import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)

  const fetchCart = async () => {
    try {
      const { data } = await api.getCart()
      setCart(data)
    } catch {
      setCart(null)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user])

  const addToCart = async (productId, quantity = 1) => {
    await api.addToCart(productId, quantity)
    await fetchCart()
  }

  const removeFromCart = async (itemId) => {
    await api.removeFromCart(itemId)
    await fetchCart()
  }

  const cartCount = cart?.cart_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)
