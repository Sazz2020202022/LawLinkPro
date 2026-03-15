import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import ClientLogin from './pages/auth/ClientLogin'
import LawyerLogin from './pages/auth/LawyerLogin'
import Signup from './pages/auth/Signup'
import FindLawyers from './pages/FindLawyers'
import LawyerPublicProfile from './pages/LawyerPublicProfile'
import LawyerDashboard from './pages/lawyer/LawyerDashboard'
import LawyerRequests from './pages/lawyer/Requests'
import LawyerCases from './pages/lawyer/Cases'
import LawyerFeedback from './pages/lawyer/Feedback'
import LawyerProfile from './pages/lawyer/Profile'
import LawyerClientProfile from './pages/lawyer/ClientProfile'
import ClientProtectedRoute from './components/ClientProtectedRoute'
import LawyerProtectedRoute from './components/LawyerProtectedRoute'
import ClientLayout from './layouts/ClientLayout'
import LawyerLayout from './layouts/LawyerLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import ClientProfile from './pages/client/ClientProfile'
import NewCase from './pages/client/NewCase'
import MyCases from './pages/client/MyCases'
import Requests from './pages/client/Requests'
import Recommendations from './pages/client/Recommendations'
import CaseDetail from './pages/client/CaseDetail'
import CompleteProfile from './pages/client/CompleteProfile'
import CaseMessages from './pages/shared/CaseMessages'

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
          <Route path="/login/client" element={<ClientLogin />} />
          <Route path="/login/lawyer" element={<LawyerLogin />} />
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
            <Route path="complete-profile" element={<CompleteProfile />} />
            <Route path="new-case" element={<NewCase />} />
            <Route path="cases" element={<MyCases />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="cases/:id/recommendations" element={<Recommendations />} />
            <Route path="requests" element={<Requests />} />
            <Route path="requests/:requestId/messages" element={<CaseMessages />} />
          </Route>

          {/* Lawyer Protected Routes */}
          <Route
            path="/lawyer"
            element={
              <LawyerProtectedRoute>
                <LawyerLayout />
              </LawyerProtectedRoute>
            }
          >
            <Route path="dashboard" element={<LawyerDashboard />} />
            <Route path="requests" element={<LawyerRequests />} />
            <Route path="requests/:requestId/messages" element={<CaseMessages />} />
            <Route path="cases" element={<LawyerCases />} />
            <Route path="clients/:clientId" element={<LawyerClientProfile />} />
            <Route path="profile" element={<LawyerProfile />} />
            <Route path="feedback" element={<LawyerFeedback />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
