import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

// مكوّن حماية المسارات — يمنع الوصول غير المصرح به
export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Loader fullPage text="جاري التحقق..." />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
