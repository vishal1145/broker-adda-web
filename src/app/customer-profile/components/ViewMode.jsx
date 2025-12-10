'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ViewModeCustomerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const toPublicUrl = (raw) => {
    if (!raw || typeof raw !== 'string') return raw;
      const imageHost = process.env.NEXT_PUBLIC_API_IMAGE_URL ;
     
    if (raw.startsWith('/opt/lampp/htdocs/')) {
      const filename = raw.split('/').pop();
        return `${imageHost}/uploads/${filename}`;
    }
    if (raw.startsWith('/uploads/')) {
        return `${imageHost}${raw}`;
    }
    return raw;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        if (!user?.token) {
          setLoading(false);
          return;
        }
        
        const customerId = user.userId;
        if (!customerId) {
          setLoading(false);
          setError('Customer ID not found');
          return;
        }
        
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${base}/customers/${customerId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            Accept: 'application/json',
          }
        });
        
        // If profile doesn't exist (404), redirect to create mode
        if (res.status === 404) {
          router.push('/customer-profile?mode=create');
          return;
        }
        
        if (!res.ok) throw new Error('Failed to load customer profile');
        const body = await res.json();
        const customerData = body?.data?.customer || body?.data || body;
        
        // If no customer data found, redirect to create mode
        if (!customerData || (!customerData.name && !customerData.email)) {
          router.push('/customer-profile?mode=create');
          return;
        }
        
        setData(customerData || null);
      } catch (e) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.userId, user?.token]);

  const profile = useMemo(() => {
    const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0 && v !== 'null' && v !== 'undefined';
    const pick = (...vals) => vals.find(nonEmpty) || '';
    const joinedRaw = pick(data?.createdAt, data?.joinedAt);
    const joinedDate = joinedRaw ? new Date(joinedRaw) : null;
    
    const preferences = data?.preferences || data?.additionalDetails?.preferences || {};
    const propertyTypes = preferences.propertyType || [];
    
    // Format date of birth
    const dateOfBirthRaw = pick(data?.dateOfBirth, data?.dob, data?.customerDetails?.dateOfBirth);
    let dateOfBirthFormatted = '-';
    if (dateOfBirthRaw) {
      try {
        const dobDate = new Date(dateOfBirthRaw);
        if (!isNaN(dobDate.getTime())) {
          dateOfBirthFormatted = dobDate.toLocaleDateString(undefined, { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          });
        }
      } catch (e) {
        // If date parsing fails, try to extract just the date part
        const dateMatch = dateOfBirthRaw.match(/^\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          try {
            const dobDate = new Date(dateMatch[0]);
            if (!isNaN(dobDate.getTime())) {
              dateOfBirthFormatted = dobDate.toLocaleDateString(undefined, { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              });
            }
          } catch (e2) {
            // Keep as '-' if all parsing fails
          }
        }
      }
    }
    
    return {
      name: pick(data?.name, data?.user?.name, data?.userId?.name, 'Unknown'),
      email: pick(data?.email, data?.user?.email, data?.userId?.email),
      phone: pick(data?.phone, data?.user?.phone, data?.userId?.phone, data?.mobile),
      gender: pick(data?.gender),
      dateOfBirth: dateOfBirthFormatted,
      joinedDateFormatted: joinedDate ? joinedDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      image: toPublicUrl(pick(data?.customerImage, data?.images?.customerImage, data?.files?.customerImage, data?.profileImage, data?.image, '/images/user-1.webp')),
      budgetMin: preferences.budgetMin || '',
      budgetMax: preferences.budgetMax || '',
      propertyType: Array.isArray(propertyTypes) ? propertyTypes : [],
      inquiryCount: data?.inquiryCount || data?.additionalDetails?.inquiryCount || 0,
      regions: Array.isArray(data?.preferences?.region) ? data.preferences.region : 
               Array.isArray(data?.additionalDetails?.preferences?.region) ? data.additionalDetails.preferences.region : [],
    };
  }, [data]);

  return (
    <div className="w-full mx-auto">
      {/* Customer Information */}
      <div className="rounded-[10px] bg-white mb-6 p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
        {loading ? (
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-64" />
            </div>
          </div>
        ) : (
          <>
            {/* Top row with profile picture, name/email, and Edit button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={profile.image} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" 
                />
                <div>
                  <div className="text-[18px] font-semibold text-gray-900 mb-1">{profile.name}</div>
                  <div className="text-[14px] text-gray-500">{profile.email || '-'}</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => router.push('/customer-profile?mode=edit')} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-green-900 hover:bg-green-800 text-[14px] font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Info grid - Three columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-[12px] mb-1">Gender</div>
                  <div className="text-gray-900 text-[14px] capitalize">{profile.gender || '-'}</div>
                </div>
            
                <div>
                  <div className="text-gray-500 text-[12px] mb-1">Preferred Property Types</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.propertyType && profile.propertyType.length > 0 ? (
                      profile.propertyType.map((type, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px] text-gray-800 capitalize"
                        >
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-900 text-[14px]">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-[12px] mb-1">Date of Birth</div>
                  <div className="text-gray-900 text-[14px]">{profile.dateOfBirth || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px] mb-1">Budget Range</div>
                  <div className="text-gray-900 text-[14px]">
                    {profile.budgetMin && profile.budgetMax 
                      ? `₹${Number(profile.budgetMin).toLocaleString('en-IN')} - ₹${Number(profile.budgetMax).toLocaleString('en-IN')}`
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-[12px] mb-1">Joined Date</div>
                  <div className="text-gray-900 text-[14px]">{profile.joinedDateFormatted || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px] mb-1">Phone</div>
                  <div className="text-gray-900 text-[14px]">{profile.phone || '-'}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    

      {error && (
        <div className="text-[12px] text-red-600 mt-6">{error}</div>
      )}
    </div>
  );
}

