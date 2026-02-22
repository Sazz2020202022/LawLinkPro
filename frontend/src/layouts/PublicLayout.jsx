import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function PublicLayout() {
  const location = useLocation()
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!location.state?.fromLogout && isAuthenticated && user?.role === 'client') {
    return <Navigate to="/client/dashboard" replace />
  }

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}
