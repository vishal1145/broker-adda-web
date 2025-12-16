'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [brokerDetails, setBrokerDetails] = useState(null);
  const brokerFetchRef = useRef(false);
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
        if (token && phone) {
          try {
            // Validate token
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenPayload.exp < currentTime) {
              logout();
              return;
            }

            // Get userId from localStorage or token
            const storedUserId = localStorage.getItem('userId');
            const userId = tokenPayload.userId || tokenPayload.id || tokenPayload.customerId || tokenPayload.brokerId || storedUserId;

            const userData = {
              phone: phone,
              role: tokenPayload.role || role || 'customer',
              token: token,
              userId: userId
            };
            setUser(userData);
          } catch (error) {
            logout();
          }
        } else {
          setUser(null);
        }
      } catch (error) {
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

  // Reset cached broker details whenever the logged-in user changes
  useEffect(() => {
    brokerFetchRef.current = false;
    setBrokerDetails(null);
  }, [user?.userId, user?.role, isMounted]);

  // Fetch current broker details once and share across the app
  useEffect(() => {
    if (!isMounted) return;
    if (!user || !user.token || !user.userId) return;
    if (user.role !== 'broker') return;

    // Prevent duplicate network calls (e.g. React StrictMode, multiple mounts)
    if (brokerFetchRef.current) return;
    brokerFetchRef.current = true;

    let cancelled = false;

    const loadBrokerDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        const response = await fetch(`${apiUrl}/brokers/${user.userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) return;

        const payload = await response.json();
        const broker =
          payload?.data?.broker ||
          payload?.broker ||
          payload?.data ||
          payload;

        if (!cancelled) {
          setBrokerDetails(broker || null);
        }
      } catch {
        if (!cancelled) {
          setBrokerDetails(null);
        }
      }
    };

    loadBrokerDetails();

    return () => {
      cancelled = true;
    };
  }, [isMounted, user?.userId, user?.role, user?.token]);

  const login = (userData) => {
    try {
      if (userData.token) localStorage.setItem('token', userData.token);
      if (userData.phone) localStorage.setItem('phone', userData.phone);
      if (userData.role) localStorage.setItem('role', userData.role);
      if (userData.userId) localStorage.setItem('userId', userData.userId);
      setUser(userData);
      
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
      }
    } catch (error) {
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
    brokerDetails,
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
