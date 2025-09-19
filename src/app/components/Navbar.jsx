'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaTimes } from 'react-icons/fa';

import shopData from '../data/shop.json';
import relatedProducts from '../data/relatedProduct.json';
import furnitureData from '../data/furnitureData.json'; // expects { products: { items: [] } }

const Navbar = ({ data }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Debug user object
  useEffect(() => {
    console.log('Navbar: User object updated:', user);
  }, [user]);

  // Load profile image from API
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user?.token || !user?.userId) {
        setProfileImage(null);
        return;
      }

      try {
        const currentUserRole = user.role || 'broker';
        const apiUrl = currentUserRole === 'customer' 
          ? `${process.env.NEXT_PUBLIC_API_URL}/customers/${user.userId}`
          : `${process.env.NEXT_PUBLIC_API_URL}/brokers/${user.userId}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (currentUserRole === 'customer') {
            const customerData = data.data?.customer || data.data || data;
            const customerImage = customerData.images?.customerImage || 
                                customerData.files?.customerImage || 
                                customerData.customerImage || 
                                customerData.profileImage || 
                                null;
            setProfileImage(customerImage);
          } else {
            const brokerData = data.data?.broker || data.data || data;
            const brokerImage = brokerData.brokerImage || brokerData.profileImage || null;
            setProfileImage(brokerImage);
          }
        }
      } catch (error) {
        console.log('Error loading profile image for navbar:', error);
        setProfileImage(null);
      }
    };

    if (user?.token && user?.userId) {
      loadProfileImage();
    }
  }, [user?.token, user?.userId, user?.role]);

  const router = useRouter();
  const pathname = usePathname();

  const isCartPage = pathname === '/cart';

  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);

  // Aggregate products from all sources
  const allProducts = useMemo(() => {
    return [
      ...(shopData?.products || []),
      ...(relatedProducts || []),
      ...(furnitureData?.products?.items || []),
    ];
  }, []);

  // Suggestions
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const filtered = allProducts.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allProducts]);

  const goPropertiesWithQuery = (q) => {
    const params = new URLSearchParams({ search: q, openSearch: '1' });
    router.push(`/properties?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      goPropertiesWithQuery(q);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s) => {
    const q = s?.name || '';
    if (q) {
      setSearchQuery(q);
      goPropertiesWithQuery(q);
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Counts from localStorage
  useEffect(() => {
    const updateCounts = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedWishlist = localStorage.getItem('wishlist');
          const wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];
          setWishlistCount(Array.isArray(wishlistItems) ? wishlistItems.length : 0);

          const savedCart = localStorage.getItem('cart');
          const cartItems = savedCart ? JSON.parse(savedCart) : [];
          setCartCount(Array.isArray(cartItems) ? cartItems.length : 0);
        } catch {
          setWishlistCount(0);
          setCartCount(0);
        }
      }
    };

    updateCounts();

    const onStorage = (e) => {
      if (e.key === 'wishlist' || e.key === 'cart') updateCounts();
    };

    const onWishlistUpdated = () => updateCounts();
    const onCartUpdated = () => updateCounts();

    window.addEventListener('storage', onStorage);
    window.addEventListener('wishlistUpdated', onWishlistUpdated);
    window.addEventListener('cartUpdated', onCartUpdated);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wishlistUpdated', onWishlistUpdated);
      window.removeEventListener('cartUpdated', onCartUpdated);
    };
  }, []);
const enableSuggestions = false; 
  return (
    <nav className="bg-white shadow-sm px-6 sm:px-12 lg:px-32 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
              {/* Keep plain <img> to allow arbitrary file names in /public */}
              <img
                src="/images/House and Handshake Logo (1).png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-semibold text-gray-700">
              {data?.logo?.text}
             
            </h1>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8 search-container relative">
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          onFocus={() =>
            enableSuggestions ? setShowSuggestions(true) : setShowSuggestions(false)
          }
        />

        {/* Search icon */}
        <FaSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />

        {/* Clear button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={14} />
          </button>
        )}

        {/* Disabled search button */}
        <button
          type="submit"
          disabled
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-400 text-white px-3 py-1 rounded-full text-xs cursor-not-allowed"
        >
          Search
        </button>
      </form>

      {/* Suggestions (disabled when enableSuggestions = false) */}
      {enableSuggestions && showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id ?? `${s.name}-${s.type}`}
              onClick={() =>
                enableSuggestions ? handleSuggestionClick(s) : null
              }
              disabled={!enableSuggestions}
              className={`w-full text-left p-3 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 ${
                enableSuggestions
                  ? "hover:bg-gray-100"
                  : "pointer-events-none opacity-60"
              }`}
            >
              <img
                src={s.image || "/images/chair2.png"}
                alt={s.name}
                className="w-10 h-10 object-contain rounded"
                onError={(e) => {
 e.currentTarget.src = "/images/chair2.png";
 }}
              />
              <div>
                <div className="font-medium text-gray-900">{s.name}</div>
                <div className="text-sm text-gray-500">
                  {s.type} • ${s.price}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
           </div>

          {/* Icons */}
          <div className="flex items-center gap-5 text-gray-700 text-[18px]">
            {/* Search (Mobile) */}
            <button
              className="md:hidden hover:text-green-600"
              onClick={(e) => e.preventDefault()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="hover:text-green-600 mt-2 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            {/* <Link href="/cart" className="hover:text-green-700 relative mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.6 13.3a1 1 0 001 .7h11.4a1 1 0 001-.8l1.4-7H6"/>
              </svg>
              {cartCount > 0 && !isCartPage && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link> */}

            {/* Authentication */}
            {isMounted && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    {/* My Account Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-600 hover:border-green-700 transition-colors">
                          <img
                            src={profileImage || '/images/user-1.webp'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/user-1.webp';
                            }}
                          />
                        </div>
                        {/* <span className="hidden md:block text-sm font-medium">My Account</span> */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          {user.role === 'broker' ? (
                            <>
                              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Dashboard
                              </Link>
                              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                              </Link>
                              <Link href="/leads" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Leads
                              </Link>
                              <Link href="/properties-management" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Properties
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Dashboard
                              </Link>
                              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                              </Link>
                              <Link href="/saved-properties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Saved Properties
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="text-sm text-gray-700 hover:text-green-600 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-green-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition-colors hidden"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-green-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <ul className={`md:hidden ${mobileMenuOpen ? 'flex' : 'hidden'} flex-col gap-4 mt-4 text-sm font-medium text-gray-700`}>
          {(data?.menuItems || []).map((item, i) => (
            <li key={i}>
              <Link href={item.href} className="hover:text-green-700 block">
                {item.name}
              </Link>
            </li>
          ))}
          {isMounted && (
            <>
              {user ? (
                <>
                  <li>
                    <Link 
                      href={user.role === 'broker' ? '/myaccount?tab=Profile' : '/myaccount-customer?tab=Profile'} 
                      className="hover:text-green-700 block flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-600">
                        <img
                          src={profileImage || '/images/user-1.webp'}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/user-1.webp';
                          }}
                        />
                      </div>
                      My Account
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-left hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="hover:text-green-700 block">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="hover:text-green-700 block">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
