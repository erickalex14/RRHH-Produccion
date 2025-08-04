import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    // Redirect to employee dashboard if user is not an admin
    console.log("User is not admin, redirecting to employee dashboard");
    return <Navigate to="/dashboard/employee" replace />;
  }

  return children;
};

export default AdminRoute;
