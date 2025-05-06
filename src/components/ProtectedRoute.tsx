
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireProfile = true
}) => {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // This effect ensures proper navigation after authentication state changes
    if (!isLoading) {
      if (requireAuth && !currentUser) {
        navigate('/login', { replace: true });
      } else if (requireAuth && requireProfile && currentUser && userProfile && !userProfile.profileCompleted) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [currentUser, userProfile, isLoading, requireAuth, requireProfile, navigate]);
  
  if (isLoading) {
    // Loading state while checking authentication
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (requireAuth && !currentUser) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  if (requireAuth && requireProfile && currentUser && userProfile && !userProfile.profileCompleted) {
    // Authenticated but profile not completed, redirect to onboarding
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
