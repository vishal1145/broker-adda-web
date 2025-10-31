'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated, isBroker, isCustomer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!isAuthenticated()) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // Check role-specific access
    if (requiredRole === 'broker' && !isBroker()) {
      console.log('ProtectedRoute: User is not a broker, redirecting to login');
      router.push('/login');
      return;
    }

    if (requiredRole === 'customer' && !isCustomer()) {
      console.log('ProtectedRoute: User is not a customer, redirecting to login');
      router.push('/login');
      return;
    }
  }, [user, loading, isAuthenticated, isBroker, isCustomer, requiredRole, router]);

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated()) {
    return null;
  }

  if (requiredRole === 'broker' && !isBroker()) {
    return null;
  }

  if (requiredRole === 'customer' && !isCustomer()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
