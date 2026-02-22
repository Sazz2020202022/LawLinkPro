import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/auth/Signup'
import FindLawyers from './pages/FindLawyers'
import LawyerPublicProfile from './pages/LawyerPublicProfile'
import LawyerDashboard from './pages/LawyerDashboard'
import ClientProtectedRoute from './components/ClientProtectedRoute'
import LawyerProtectedRoute from './components/LawyerProtectedRoute'
import ClientLayout from './layouts/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientProfile from './pages/client/ClientProfile'
import NewCase from './pages/client/NewCase'
import MyCases from './pages/client/MyCases'
import Requests from './pages/client/Requests'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lawyers" element={<FindLawyers />} />
            <Route path="/lawyers/:id" element={<LawyerPublicProfile />} />
          </Route>

          {/* Auth Routes (No Navbar/Footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />

          {/* Client Protected Routes */}
          <Route
            path="/client"
            element={
              <ClientProtectedRoute>
                <ClientLayout />
              </ClientProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="new-case" element={<NewCase />} />
            <Route path="cases" element={<MyCases />} />
            <Route path="requests" element={<Requests />} />
          </Route>

          {/* Lawyer Routes */}
          <Route
            path="/lawyer/dashboard"
            element={
              <LawyerProtectedRoute>
                <LawyerDashboard />
              </LawyerProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
