import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Uygulama açılınca mevcut cookie ile profil yükle
  useEffect(() => {
    api.getProfile()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))   // Cookie yoksa veya süresi dolmuşsa — normal durum
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.login({ email, password })
    // Backend cookie'leri set eder, response body'de user bilgisi döner
    setUser(data)
    return data
  }

  const register = async (username, email, password) => {
    await api.register({ username, email, password })
    return login(email, password)
  }

  const logout = async () => {
    try {
      await api.logout()  // Backend cookie'leri temizler
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
