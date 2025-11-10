'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import HeaderFile from '../components/Header';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || 'broker';
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingEmailNotification, setIsUpdatingEmailNotification] = useState(false);
  const [isUpdatingSmsNotification, setIsUpdatingSmsNotification] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Fetch current notification preferences on component mount
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      try {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        
        if (!token) {
          setIsLoadingPreferences(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        };

        const apiEndpoint = `${apiUrl}/notifications/preferences`;
        console.log('Fetching notification preferences:', apiEndpoint);

        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers
        });

        if (response.ok) {
          const responseData = await response.json().catch(() => ({}));
          console.log('Notification preferences fetched:', responseData);
          
          // Update state based on API response
          if (responseData?.data?.emailNotification !== undefined) {
            setEmailNotifications(responseData.data.emailNotification);
          }
          if (responseData?.data?.smsNotification !== undefined) {
            setSmsNotifications(responseData.data.smsNotification);
          }
          if (responseData?.data?.pushNotification !== undefined) {
            setPushNotifications(responseData.data.pushNotification);
          }
        } else {
          console.log('Failed to fetch notification preferences:', response.status);
          // Keep default values if fetch fails
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        // Keep default values if fetch fails
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    fetchNotificationPreferences();
  }, []);

  const handleEmailNotificationToggle = async () => {
    const newValue = !emailNotifications;
    
    try {
      setIsUpdatingEmailNotification(true);
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setIsUpdatingEmailNotification(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const apiEndpoint = `${apiUrl}/notifications/preferences`;
      console.log('Calling update email notification API:', apiEndpoint);
      console.log('Method: PATCH');
      console.log('Body:', { emailNotification: newValue });

      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          emailNotification: newValue
        })
      });

      console.log('Update email notification response status:', response.status);
      console.log('Update email notification response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log('Email notification updated successfully:', responseData);
        
        setEmailNotifications(newValue);
        toast.success(
          `Email notifications ${newValue ? 'enabled' : 'disabled'}`,
          {
            duration: 2000,
          }
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update email notification:', response.status, errorData);
        
        const errorMessage = errorData?.message || errorData?.error || 'Failed to update email notification preferences. Please try again.';
        toast.error(errorMessage, {
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Error updating email notification:', err);
      toast.error('An error occurred while updating email notification preferences. Please try again.', {
        duration: 3000,
      });
    } finally {
      setIsUpdatingEmailNotification(false);
    }
  };

  const handleSmsNotificationToggle = async () => {
    const newValue = !smsNotifications;
    
    try {
      setIsUpdatingSmsNotification(true);
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setIsUpdatingSmsNotification(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const apiEndpoint = `${apiUrl}/notifications/preferences`;
      console.log('Calling update SMS notification API:', apiEndpoint);
      console.log('Method: PATCH');
      console.log('Body:', { smsNotification: newValue });

      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          smsNotification: newValue
        })
      });

      console.log('Update SMS notification response status:', response.status);
      console.log('Update SMS notification response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log('SMS notification updated successfully:', responseData);
        
        setSmsNotifications(newValue);
        toast.success(
          `SMS notifications ${newValue ? 'enabled' : 'disabled'}`,
          {
            duration: 2000,
          }
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update SMS notification:', response.status, errorData);
        
        const errorMessage = errorData?.message || errorData?.error || 'Failed to update SMS notification preferences. Please try again.';
        toast.error(errorMessage, {
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Error updating SMS notification:', err);
      toast.error('An error occurred while updating SMS notification preferences. Please try again.', {
        duration: 3000,
      });
    } finally {
      setIsUpdatingSmsNotification(false);
    }
  };

  const handlePushNotificationToggle = () => {
    setPushNotifications(!pushNotifications);
    toast.success(
      `Push notifications ${!pushNotifications ? 'enabled' : 'disabled'}`,
      {
        duration: 2000,
      }
    );
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setIsDeleting(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const apiEndpoint = `${apiUrl}/auth/account`;
      console.log('Calling delete account API:', apiEndpoint);
      console.log('Method: DELETE');
      console.log('Headers:', headers);

      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers
      });

      console.log('Delete account response status:', response.status);
      console.log('Delete account response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log('Account deleted successfully:', responseData);
        
        toast.success('Account deleted successfully', {
          duration: 3000,
        });
        
        setShowDeleteConfirm(false);
        
        // Clear local storage and redirect to home/login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push('/');
            window.location.reload();
          }, 1500);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete account:', response.status, errorData);
        
        const errorMessage = errorData?.message || errorData?.error || 'Failed to delete account. Please try again.';
        toast.error(errorMessage, {
          duration: 3000,
        });
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error('An error occurred while deleting your account. Please try again.', {
        duration: 3000,
      });
      setIsDeleting(false);
    }
  };

  const headerData = {
    title: 'Settings',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
    ],
  };

  // Navigation items based on user role
  const getNavItems = () => {
    if (userRole === 'broker') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
        { label: 'Profile', href: '/profile?mode=view', icon: '👤' },
        { label: 'Leads', href: '/leads', icon: '📋' },
        { label: 'Properties', href: '/properties-management', icon: '🏠' },
      ];
    } else {
      return [
        { label: 'Profile', href: '/customer-profile?mode=view', icon: '👤' },
        { label: 'Saved Properties', href: '/saved-properties', icon: '❤️' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <ProtectedRoute>
      <HeaderFile data={headerData} />
      <div className="min-h-screen bg-white py-16">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="w-full mx-auto  px-4 ">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
       

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Account Settings
                </h2>

                {/* Notifications Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enable or disable email, SMS, and push notifications
                  </p>
                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Receive notifications via email
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleEmailNotificationToggle}
                        disabled={isUpdatingEmailNotification}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          emailNotifications
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={emailNotifications}
                        aria-label="Toggle email notifications"
                      >
                        {isUpdatingEmailNotification ? (
                          <span className="inline-block h-3 w-3 transform rounded-full bg-white translate-x-1">
                            <svg className="animate-spin h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              emailNotifications
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          SMS Notifications
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSmsNotificationToggle}
                        disabled={isUpdatingSmsNotification}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          smsNotifications
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={smsNotifications}
                        aria-label="Toggle SMS notifications"
                      >
                        {isUpdatingSmsNotification ? (
                          <span className="inline-block h-3 w-3 transform rounded-full bg-white translate-x-1">
                            <svg className="animate-spin h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        ) : (
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              smsNotifications
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    {/* Push Notifications */}
                    {/* <div className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Push Notifications
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Receive push notifications on your device
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePushNotificationToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          pushNotifications
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={pushNotifications}
                        aria-label="Toggle push notifications"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pushNotifications
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div> */}
                  </div>
                </div>

                {/* Privacy Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Privacy & Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Profile Visibility
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Control who can see your profile
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">Public</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Data Sharing
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Allow sharing of your data with partners
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">Enabled</span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                {/* <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user?.email || 'user@example.com'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Account Type</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {userRole}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date().toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div> */}

                {/* Delete Account Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-600 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                    </div>
                    <div className="ml-6">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete your account? This action is
              permanent and cannot be undone. All your data, properties, leads,
              and connections will be permanently deleted.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default Settings;

