import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full border-[3px] border-surface-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-surface-400 font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}
