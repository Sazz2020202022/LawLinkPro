import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LawyerProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'lawyer') {
    return <Navigate to="/client/dashboard" replace />;
  }

  return children;
}

export default LawyerProtectedRoute;
