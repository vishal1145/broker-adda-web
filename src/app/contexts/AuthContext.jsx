'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Initialize mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    if (!isMounted) return;

    const loadUser = () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const phone = localStorage.getItem('phone');
        const role = localStorage.getItem('role');
        
        console.log('AuthContext: Loading user, token:', !!token, 'phone:', phone, 'role:', role);
        
        if (token && phone) {
          try {
            // Validate token
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            console.log('AuthContext: Token payload:', tokenPayload);
            console.log('AuthContext: Role from token:', tokenPayload.role);
            console.log('AuthContext: Role from localStorage:', role);
            
            if (tokenPayload.exp < currentTime) {
              console.log('AuthContext: Token expired, clearing user data');
              logout();
              return;
            }

            const userData = {
              phone: phone,
              role: tokenPayload.role || role || 'customer',
              token: token,
              userId: tokenPayload.userId || tokenPayload.id
            };
            
            console.log('AuthContext: Final user data:', userData);
            setUser(userData);
          } catch (error) {
            console.error('AuthContext: Error parsing token:', error);
            logout();
          }
        } else {
          console.log('AuthContext: No token or phone found, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'authToken' || e.key === 'phone' || e.key === 'role') {
        loadUser();
      }
    };

    // Listen for custom login events (same tab)
    const handleLoginEvent = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleLoginEvent);
    window.addEventListener('userLoggedOut', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('userLoggedOut', handleLoginEvent);
    };
  }, [isMounted]);

  const login = (userData) => {
    try {
      console.log('AuthContext: Login called with:', userData);
      
      if (userData.token) localStorage.setItem('token', userData.token);
      if (userData.phone) localStorage.setItem('phone', userData.phone);
      if (userData.role) localStorage.setItem('role', userData.role);
      
      console.log('AuthContext: Setting user data:', userData);
      setUser(userData);
      
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
      }
    } catch (error) {
      console.error('AuthContext: Error during login:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('phone');
      localStorage.removeItem('role');
      
      setUser(null);
      
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
    }
  };

  const isAuthenticated = () => {
    return user !== null && user.token;
  };

  const isBroker = () => {
    return user && user.role === 'broker';
  };

  const isCustomer = () => {
    return user && user.role === 'customer';
  };

  const value = {
    user,
    loading,
    isMounted,
    login,
    logout,
    isAuthenticated,
    isBroker,
    isCustomer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
