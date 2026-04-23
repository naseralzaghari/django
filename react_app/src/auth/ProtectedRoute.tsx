import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'regular';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    console.log('ProtectedRoute - User data:', user);
    console.log('ProtectedRoute - Required role:', requiredRole);
    console.log('ProtectedRoute - User userType:', user.userType);
    console.log('ProtectedRoute - Match:', user.userType?.toLowerCase() === requiredRole.toLowerCase());
    
    if (user.userType?.toLowerCase() !== requiredRole.toLowerCase()) {
      console.log('ProtectedRoute - Access DENIED, redirecting to home');
      return <Navigate to="/" replace />;
    }
    console.log('ProtectedRoute - Access GRANTED');
  }

  return children;
};

export default ProtectedRoute;
