
import React from 'react';
import { Navigate } from 'react-router-dom';
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
  
  if (isLoading) {
    // Loading state while checking authentication
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (requireAuth && !currentUser) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" />;
  }
  
  if (requireAuth && requireProfile && currentUser && userProfile && !userProfile.profileCompleted) {
    // Authenticated but profile not completed, redirect to onboarding
    return <Navigate to="/onboarding" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
