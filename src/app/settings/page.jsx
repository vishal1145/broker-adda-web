'use client';

import { useState } from 'react';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [dataSharing, setDataSharing] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [newEmail, setNewEmail] = useState('');

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      `Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`,
      {
        duration: 2000,
      }
    );
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully', { duration: 3000 });
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleEmailChange = () => {
    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Email update request sent. Please check your inbox.', {
      duration: 3000,
    });
    setShowEmailModal(false);
    setNewEmail('');
  };

  const handleDeleteAccount = () => {
    // Hardcoded - no API call
    toast.success('Account deletion request submitted', {
      duration: 3000,
    });
    setShowDeleteConfirm(false);
    // In a real implementation, you would make an API call here
    // For now, just show a success message
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
        { label: 'Settings', href: '/settings', icon: '⚙️', active: true },
      ];
    } else {
      return [
        { label: 'Profile', href: '/customer-profile?mode=view', icon: '👤' },
        { label: 'Saved Properties', href: '/saved-properties', icon: '❤️' },
        { label: 'Settings', href: '/settings', icon: '⚙️', active: true },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <ProtectedRoute>
      <HeaderFile data={headerData} />
      <div className="min-h-screen bg-white py-16">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="max-w-7xl w-full mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">
                  Navigation
                </h3>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active
                          ? 'bg-green-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </nav>
                
                {/* Quick Info Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 px-2">
                    Quick Info
                  </h4>
                  <div className="space-y-2 px-2">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Role:</span>{' '}
                      <span className="capitalize">{userRole}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="flex space-x-1 px-6 pt-4">
                    {[
                      { id: 'general', label: 'General', icon: '⚙️' },
                      { id: 'notifications', label: 'Notifications', icon: '🔔' },
                      { id: 'security', label: 'Security', icon: '🔒' },
                      { id: 'privacy', label: 'Privacy', icon: '👁️' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? 'border-green-600 text-green-600 bg-white'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8">
                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          General Settings
                        </h2>
                        <p className="text-sm text-gray-600">
                          Manage your account information and preferences
                        </p>
                      </div>

                      {/* Account Information */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Account Information
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Email Address
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {user?.email || 'user@example.com'}
                              </p>
                            </div>
                            <button
                              onClick={() => setShowEmailModal(true)}
                              className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              Change
                            </button>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Account Type
                              </p>
                              <p className="text-xs text-gray-500 mt-1 capitalize">
                                {userRole}
                              </p>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full capitalize">
                              {userRole}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Member Since
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date().toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Notification Preferences
                        </h2>
                        <p className="text-sm text-gray-600">
                          Choose how you want to be notified about updates and
                          activities
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* General Notifications */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                  Enable Notifications
                                </h3>
                                <p className="text-xs text-gray-600">
                                  Master switch for all notifications
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleNotificationToggle}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                notificationsEnabled
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                              role="switch"
                              aria-checked={notificationsEnabled}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notificationsEnabled
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Email Notifications */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  Email Notifications
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  Receive notifications via email
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEmailNotifications(!emailNotifications);
                                toast.success(
                                  `Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                emailNotifications
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  emailNotifications
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Push Notifications */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  Push Notifications
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  Receive push notifications on your device
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPushNotifications(!pushNotifications);
                                toast.success(
                                  `Push notifications ${!pushNotifications ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                pushNotifications
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  pushNotifications
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Marketing Emails */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-orange-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  Marketing Emails
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  Receive updates about new features and offers
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMarketingEmails(!marketingEmails);
                                toast.success(
                                  `Marketing emails ${!marketingEmails ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                marketingEmails
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  marketingEmails
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Security Settings
                        </h2>
                        <p className="text-sm text-gray-600">
                          Manage your password and security preferences
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Password Change */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                Password
                              </h3>
                              <p className="text-xs text-gray-600 mt-1">
                                Change your account password
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full mt-4 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Change Password
                          </button>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-yellow-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  Two-Factor Authentication
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  Add an extra layer of security to your account
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTwoFactorAuth(!twoFactorAuth);
                                toast.success(
                                  `Two-factor authentication ${!twoFactorAuth ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                twoFactorAuth
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  twoFactorAuth
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                Active Sessions
                              </h3>
                              <p className="text-xs text-gray-600 mt-1">
                                Manage devices where you're currently signed in
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Current Device
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {typeof window !== 'undefined' &&
                                  navigator?.userAgent?.includes('Chrome')
                                    ? 'Chrome Browser'
                                    : 'Web Browser'}
                                </p>
                              </div>
                              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Privacy Tab */}
                  {activeTab === 'privacy' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Privacy Settings
                        </h2>
                        <p className="text-sm text-gray-600">
                          Control your privacy and data sharing preferences
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Profile Visibility */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                Profile Visibility
                              </h3>
                              <p className="text-xs text-gray-600 mt-1">
                                Control who can see your profile information
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-3">
                            {['public', 'private', 'contacts'].map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setProfileVisibility(option);
                                  toast.success(
                                    `Profile visibility set to ${option}`
                                  );
                                }}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                                  profileVisibility === option
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Data Sharing */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">
                                  Data Sharing
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  Allow sharing of your data with trusted partners
                                  for better service
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setDataSharing(!dataSharing);
                                toast.success(
                                  `Data sharing ${!dataSharing ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                dataSharing
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  dataSharing
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Delete Account */}
                        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-red-900">
                                Delete Account
                              </h3>
                              <p className="text-xs text-red-700 mt-1">
                                Permanently delete your account and all associated
                                data. This action cannot be undone.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Change Password
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Enter your current password and choose a new one.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ current: '', new: '', confirm: '' });
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEmailModal(false);
            setNewEmail('');
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Change Email Address
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              We'll send a verification link to your new email address.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Email
                </label>
                <input
                  type="email"
                  value={user?.email || 'user@example.com'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Enter new email address"
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false);
                  setNewEmail('');
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmailChange}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Update Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-600">
                Confirm Account Deletion
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete your account? This action is
              permanent and cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-red-800 font-medium mb-2">
                This will permanently delete:
              </p>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                <li>All your account data</li>
                <li>Your properties and listings</li>
                <li>Your leads and connections</li>
                <li>All saved preferences</li>
              </ul>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default Settings;

