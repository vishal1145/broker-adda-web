'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ViewModeProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState({ open: false, src: '', type: '' });
  const [subscription, setSubscription] = useState(null);

  const toPublicUrl = (raw) => {
    if (!raw || typeof raw !== 'string') return raw;
    if (raw.startsWith('/opt/lampp/htdocs/')) {
      const filename = raw.split('/').pop();
      return `https://broker-adda-be.algofolks.com/uploads/${filename}`;
    }
    if (raw.startsWith('/uploads/')) {
      return `https://broker-adda-be.algofolks.com${raw}`;
    }
    return raw;
  };

  const isPdfFile = (val) => {
    if (!val) return false;
    if (typeof val === 'string') return /\.pdf$/i.test(val);
    return false;
  };
  const isImageFile = (val) => {
    if (!val) return false;
    if (typeof val === 'string') return /\.(png|jpe?g|webp)$/i.test(val);
    return false;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const brokerId = user?.userId;
        const token = user?.token || (typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null);
        if (!brokerId) { setLoading(false); return; }
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${base}/brokers/${encodeURIComponent(String(brokerId))}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Failed to load broker');
        const body = await res.json();
        const b = body?.data?.broker || body?.broker || body?.data || body;
        setData(b || null);
        setSubscription(b?.subscription || null);
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
    const regionsArr = Array.isArray(data?.region) ? data.region : [];
    const joinedRaw = pick(data?.createdAt, data?.joinedAt);
    const joinedDate = joinedRaw ? new Date(joinedRaw) : null;
    return {
      name: pick(data?.name, data?.fullName, 'Unknown'),
      firm: pick(data?.firmName),
      status: pick(data?.status, 'Active'),
      joinedDateFormatted: joinedDate ? joinedDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      license: pick(data?.licenseNumber),
      regions: regionsArr.map(r => (typeof r === 'string' ? r : r?.name || '')),
      gender: pick(data?.gender),
      image: pick(data?.brokerImage, data?.profileImage, data?.image, '/images/user-1.webp'),
      // contacts
      phone: pick(data?.phone, data?.userId?.phone, data?.mobile),
      whatsapp: pick(data?.whatsappNumber, data?.whatsapp),
      email: pick(data?.email, data?.userId?.email),
      address: pick(data?.address, data?.officeAddress),
      website: pick(data?.website),
      socials: {
        linkedin: pick(data?.socialMedia?.linkedin, data?.linkedin),
        twitter: pick(data?.socialMedia?.twitter, data?.twitter, data?.x),
        instagram: pick(data?.socialMedia?.instagram, data?.instagram),
        facebook: pick(data?.socialMedia?.facebook, data?.facebook)
      },
      // docs
      docs: {
        aadhar: toPublicUrl(pick(data?.kycDocs?.aadhar, data?.documents?.aadhar, data?.aadharCard)),
        pan: toPublicUrl(pick(data?.kycDocs?.pan, data?.documents?.pan, data?.panCard)),
        gst: toPublicUrl(pick(data?.kycDocs?.gst, data?.documents?.gst, data?.gstCertificate)),
        license: toPublicUrl(pick(data?.kycDocs?.brokerLicense, data?.documents?.brokerLicense, data?.brokerLicense)),
        companyId: toPublicUrl(pick(data?.kycDocs?.companyId, data?.documents?.companyId, data?.companyId))
      }
    };
  }, [data]);

  const DocRow = ({ label, value }) => {
    const getExt = (v) => {
      if (!v || typeof v !== 'string') return 'JPG';
      const m = v.match(/\.([a-zA-Z0-9]+)$/);
      return (m ? m[1] : 'JPG').toUpperCase();
    };
    const ext = getExt(value);
    const disabled = !value;
    const computeFilename = (v, fallbackBase) => {
      if (!v || typeof v !== 'string') return `${fallbackBase}.${ext.toLowerCase()}`;
      try {
        const url = new URL(v, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
        const last = url.pathname.split('/').pop();
        if (last && last.includes('.')) return last;
        return `${fallbackBase}.${ext.toLowerCase()}`;
      } catch {
        const parts = v.split('/');
        const last = parts[parts.length - 1];
        if (last && last.includes('.')) return last;
        return `${fallbackBase}.${ext.toLowerCase()}`;
      }
    };
    const downloadName = computeFilename(value, label.replace(/\s+/g, '_'));
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-4 h-4 flex items-center justify-center text-gray-600">
            <img src="/images/lucide-FileText-Outlined.svg" alt="Document" className="w-4 h-4" />
          </span>
          <span className="text-[12px] text-gray-900 truncate">{label}</span>
          <span className="ml-2 text-[10px] px-2.5 py-0.5 rounded-full border border-gray-300 text-gray-700 bg-gray-100 font-medium">{value ? ext : '-'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={disabled}
            onClick={() => setPreview({ open: true, src: value, type: isPdfFile(value) ? 'pdf' : (isImageFile(value) ? 'image' : '') })}
            className={`inline-flex items-center gap-1.5 text-[12px] px-0 py-0 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-green-900 hover:text-green-900'}`}
          >
            <svg className={`w-4 h-4 ${disabled ? 'text-gray-300' : 'text-green-900'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            Preview
          </button>
          <button
            disabled={disabled}
            onClick={async () => {
              if (!disabled && value) {
                try {
                  const response = await fetch(value);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = downloadName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Download failed:', error);
                  // Fallback to direct link
                  const link = document.createElement('a');
                  link.href = value;
                  link.download = downloadName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }
            }}
            className={`inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded border ${disabled ? 'pointer-events-none text-gray-400 border-gray-200 bg-white' : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      {/* Broker Information */}
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
            {/* Top row with action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <img src={profile.image} alt="Profile" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-semibold text-gray-900 truncate">{profile.name}</div>
                  <div className="text-[12px] text-gray-500 truncate">{profile.firm || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button type="button" onClick={() => router.push('/profile?mode=edit')} className="inline-flex items-center gap-2 px-3 md:px-3.5 py-1.5 rounded-md text-white bg-green-900 hover:bg-green-900 text-[12px] md:text-[14px] font-medium whitespace-nowrap">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button type="button" onClick={() => router.push('/settings')} className="inline-flex items-center gap-2 px-3 md:px-3.5 py-1.5 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 text-[12px] md:text-[14px] font-medium whitespace-nowrap">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </button>
              </div>
            </div>

            {/* Info grid - two lines */}
            <div className="space-y-4 text-sm">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-500 text-[12px]">Firm</div>
                  <div className="text-gray-900 text-[14px]">{profile.firm || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px]">Gender</div>
                  <div className="text-gray-900 text-[14px]">{profile.gender || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px]">Status</div>
                  <div className="inline-flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">{profile.status || 'Active'}</div>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-500 text-[12px]">Joined Date</div>
                  <div className="text-gray-900 text-[14px]">{profile.joinedDateFormatted || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px]">Subscription</div>
                  <div className="text-gray-900 text-[14px]">{subscription?.planType || 'Not Subscribed'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px]">License</div>
                  <div className="text-gray-900 text-[14px]">{profile.license || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[12px]">Regions</div>
                  <div className="text-gray-900 text-[14px]">{profile.regions?.length ? profile.regions.join(', ') : '-'}</div>
                </div>
              </div>
              <div className="h-px bg-gray-200" />
              <div>
                <div className="text-gray-500 text-[12px] mb-1">Specializations</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(data?.specializations) && data.specializations.length > 0 ? (
                    data.specializations.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px] text-gray-800">{s}</span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px] text-gray-800">-</span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Contact + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact Details */}
        {(() => {
          // Check if there are any documents with values
          const documentsList = [
            { label: 'Aadhar Card', value: profile.docs.aadhar },
            { label: 'PAN Card', value: profile.docs.pan },
            { label: 'GST Certificate', value: profile.docs.gst },
            { label: 'Broker License', value: profile.docs.license },
            { label: 'Company ID', value: profile.docs.companyId },
          ].filter(({ value }) => {
            if (!value) return false;
            if (typeof value === 'string') {
              const trimmed = value.trim();
              return trimmed !== '' && trimmed !== '-' && trimmed !== 'null' && trimmed !== 'undefined';
            }
            return true;
          });
          const hasDocuments = documentsList.length > 0;
          return (
            <div className={`${hasDocuments ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-[10px] bg-white shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-6`}>
              <div className="text-[16px] font-semibold text-gray-900 mb-4">Contact Details</div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h4a2 2 0 0 1 2 1.72l.3 2a2 2 0 0 1-.57 1.73L9.91 9.91a16 16 0 0 0 6.18 6.18l1.46-1.82a2 2 0 0 1 1.73-.57l2 .3A2 2 0 0 1 22 16.92z" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500 text-[12px]">Mobile</div>
                    <div className="text-gray-900 text-[14px]">{profile.phone || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500 text-[12px]">WhatsApp</div>
                    <div className="text-gray-900 text-[14px]">{profile.whatsapp || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M22 6 12 13 2 6" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500 text-[12px]">Email</div>
                    <div className="text-gray-900 text-[14px] break-all">{profile.email || '-'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500 text-[12px]">Office Address</div>
                    <div className="text-gray-900 text-[14px]">{profile.address || '-'}</div>
                  </div>
                </div>
                {profile.website && profile.website.trim() !== '' && profile.website !== '-' && (
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 0 20" /></svg>
                    </span>
                    <div>
                      <div className="text-gray-500 text-[12px]">Website</div>
                      <div className="text-green-900 text-[14px]">
                        <a href={profile.website} target="_blank" rel="noreferrer" className="underline hover:text-green-700 transition-colors">{profile.website}</a>
                      </div>
                    </div>
                  </div>
                )}
                {(profile.socials.linkedin || profile.socials.twitter || profile.socials.instagram || profile.socials.facebook) && (
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="text-gray-500 text-[12px] mb-2">Social</div>
                      <div className="flex items-center gap-3">
                        {profile.socials.linkedin && (
                          <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-gray-500 hover:text-gray-700 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 14C21 12.6739 20.4728 11.4025 19.5352 10.4648C18.5975 9.52716 17.3261 9 16 9C14.6739 9 13.4025 9.52716 12.4648 10.4648C11.5272 11.4025 11 12.6739 11 14V20H13V14C13 13.2043 13.3163 12.4415 13.8789 11.8789C14.4415 11.3163 15.2043 11 16 11C16.7957 11 17.5585 11.3163 18.1211 11.8789C18.6837 12.4415 19 13.2043 19 14V20H21V14ZM23 21C23 21.5523 22.5523 22 22 22H18C17.4477 22 17 21.5523 17 21V14C17 13.7348 16.8946 13.4805 16.707 13.293C16.5195 13.1054 16.2652 13 16 13C15.7348 13 15.4805 13.1054 15.293 13.293C15.1054 13.4805 15 13.7348 15 14V21C15 21.5523 14.5523 22 14 22H10C9.44772 22 9 21.5523 9 21V14C9 12.1435 9.73705 10.3626 11.0498 9.0498C12.3626 7.73705 14.1435 7 16 7C17.8565 7 19.6374 7.73705 20.9502 9.0498C22.263 10.3626 23 12.1435 23 14V21Z" fill="currentColor" />
                              <path d="M6 8L6.10254 8.00488C6.60667 8.05621 7 8.48232 7 9V21C7 21.5523 6.55228 22 6 22H2C1.44772 22 1 21.5523 1 21V9L1.00488 8.89746C1.05621 8.39333 1.48232 8 2 8H6ZM3 20H5V10H3V20Z" fill="currentColor" />
                              <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4C3 4.55228 3.44772 5 4 5C4.55228 5 5 4.55228 5 4ZM7 4C7 5.65685 5.65685 7 4 7C2.34315 7 1 5.65685 1 4C1 2.34315 2.34315 1 4 1C5.65685 1 7 2.34315 7 4Z" fill="currentColor" />
                            </svg>
                          </a>
                        )}
                        {profile.socials.twitter && (
                          <a href={profile.socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-gray-500 hover:text-gray-700 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.5752 3.58785C15.2923 2.69324 17.5324 2.74899 19.3115 4.15133C19.3985 4.13033 19.4992 4.10363 19.6123 4.06539C19.8904 3.9714 20.1894 3.84084 20.4727 3.70211C20.7535 3.56459 21.0049 3.42587 21.1865 3.32125C21.2769 3.26919 21.349 3.22562 21.3975 3.19625C21.4217 3.18158 21.4405 3.17025 21.4522 3.16305C21.4577 3.15961 21.4615 3.15671 21.4639 3.15524H21.4658L21.4668 3.15426H21.4658C21.8232 2.92856 22.2845 2.95217 22.6172 3.21285C22.908 3.4409 23.0457 3.8075 22.9863 4.16403L22.9483 4.31637V4.31832L22.9473 4.32028C22.9466 4.32223 22.9454 4.32513 22.9443 4.32809C22.9423 4.33397 22.9399 4.34187 22.9365 4.35153C22.9297 4.37112 22.9205 4.39847 22.9082 4.43258C22.8835 4.50106 22.8468 4.59812 22.7998 4.71676C22.7062 4.95344 22.5673 5.28148 22.3848 5.65328C22.0839 6.26615 21.6401 7.04085 21.0547 7.72555C22.3445 18.1499 11.0183 25.6897 1.88771 20.1132L1.44728 19.8339C1.07254 19.5856 0.910374 19.1168 1.04982 18.6894C1.18937 18.2624 1.59619 17.9808 2.04494 18.0009C3.40575 18.0628 4.75243 17.7802 5.91212 17.2002C1.55099 14.7939 -0.367632 9.10181 2.12111 4.52242L2.18654 4.41793C2.35225 4.18629 2.61124 4.03431 2.89845 4.00485C3.22665 3.97135 3.55058 4.1026 3.76369 4.35446C5.53242 6.44456 8.16475 7.75816 10.8916 7.97262C10.9026 5.97977 12.0241 4.39605 13.5752 3.58785ZM18.3174 5.93063C17.1474 4.83889 15.6363 4.77035 14.5 5.36227C13.3853 5.94302 12.6281 7.15838 12.9776 8.79C13.0397 9.0802 12.9702 9.38361 12.7871 9.61715C12.6039 9.85072 12.326 9.99124 12.0293 9.99996C8.85378 10.0933 5.68513 8.90712 3.334 6.77828C2.17413 10.5587 4.34448 14.859 8.28712 16.042C8.63564 16.1465 8.90039 16.4325 8.97755 16.788C9.04502 17.0992 8.95977 17.4211 8.75392 17.6572L8.65822 17.7529C7.727 18.5676 6.62472 19.1646 5.44435 19.54C12.655 21.7442 20.3027 15.6202 19.0127 7.55758C18.9622 7.24115 19.0665 6.91997 19.293 6.69332C19.4748 6.51154 19.6439 6.30513 19.8027 6.08883C19.5438 6.15261 19.2703 6.20016 19 6.20016C18.7467 6.20016 18.5026 6.10345 18.3174 5.93063Z" fill="currentColor" />
                            </svg>
                          </a>
                        )}
                        {profile.socials.instagram && (
                          <a href={profile.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-gray-500 hover:text-gray-700 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 7C21 4.79086 19.2091 3 17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7ZM23 17C23 20.3137 20.3137 23 17 23H7C3.68629 23 1 20.3137 1 17V7C1 3.68629 3.68629 1 7 1H17C20.3137 1 23 3.68629 23 7V17Z" fill="currentColor" />
                              <path d="M9.74052 7.51826C10.6739 7.03399 11.7365 6.85622 12.7766 7.01045L12.9749 7.04463C13.9599 7.23142 14.8673 7.71051 15.5784 8.42158C16.337 9.18014 16.8322 10.1622 16.9895 11.2233L17.014 11.4187C17.1198 12.3959 16.9357 13.3844 16.4817 14.2595C15.9974 15.1929 15.2306 15.9497 14.2913 16.4226C13.352 16.8953 12.2875 17.0602 11.2493 16.8933C10.211 16.7262 9.25175 16.2355 8.50809 15.4919C7.76444 14.7482 7.27381 13.789 7.10673 12.7507C6.93975 11.7125 7.10467 10.648 7.57743 9.70869C8.05026 8.76939 8.80709 8.0026 9.74052 7.51826ZM12.4837 8.98897C11.8595 8.89641 11.2215 9.00303 10.6614 9.29365C10.1013 9.58428 9.64726 10.0445 9.36356 10.6081C9.07991 11.1717 8.98111 11.8104 9.08134 12.4333C9.18158 13.0563 9.47597 13.6316 9.92216 14.0778C10.3683 14.524 10.9437 14.8184 11.5667 14.9187C12.1896 15.0189 12.8283 14.9201 13.3919 14.6364C13.9555 14.3527 14.4157 13.8987 14.7063 13.3386C14.9606 12.8486 15.0739 12.2993 15.0364 11.7517L15.011 11.5163C14.9166 10.8797 14.6194 10.2907 14.1643 9.83564C13.7662 9.43748 13.2655 9.16018 12.72 9.03389L12.4837 8.98897Z" fill="currentColor" />
                              <path d="M17.5098 5.5L17.6123 5.50488C18.1165 5.55611 18.5098 5.98224 18.5098 6.5C18.5098 7.01776 18.1165 7.44389 17.6123 7.49512L17.5098 7.5H17.5C16.9477 7.5 16.5 7.05228 16.5 6.5C16.5 5.94772 16.9477 5.5 17.5 5.5H17.5098Z" fill="currentColor" />
                            </svg>
                          </a>
                        )}
                        {profile.socials.facebook && (
                          <a href={profile.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-gray-500 hover:text-gray-700 transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13 7C13 6.46957 13.2109 5.96101 13.5859 5.58594C13.961 5.21087 14.4696 5 15 5H17V3H15C13.9391 3 12.922 3.42173 12.1719 4.17188C11.4217 4.92202 11 5.93913 11 7V10C11 10.5523 10.5523 11 10 11H8V13H10C10.5523 13 11 13.4477 11 14V21H13V14C13 13.4477 13.4477 13 14 13H16.2197L16.7197 11H14C13.4477 11 13 10.5523 13 10V7ZM15 9H18C18.3079 9 18.5986 9.14205 18.7881 9.38477C18.9775 9.62741 19.0443 9.94354 18.9697 10.2422L17.9697 14.2422C17.8584 14.6874 17.4589 15 17 15H15V22C15 22.5523 14.5523 23 14 23H10C9.44772 23 9 22.5523 9 22V15H7C6.44772 15 6 14.5523 6 14V10L6.00488 9.89746C6.05621 9.39333 6.48232 9 7 9H9V7C9 5.4087 9.63259 3.88303 10.7578 2.75781C11.883 1.63259 13.4087 1 15 1H18L18.1025 1.00488C18.6067 1.05621 19 1.48232 19 2V6C19 6.55228 18.5523 7 18 7H15V9Z" fill="currentColor" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Documents - Only show if there are documents */}
        {(() => {
          const documentsList = [
            { label: 'Aadhar Card', value: profile.docs.aadhar },
            { label: 'PAN Card', value: profile.docs.pan },
            { label: 'GST Certificate', value: profile.docs.gst },
            { label: 'Broker License', value: profile.docs.license },
            { label: 'Company ID', value: profile.docs.companyId },
          ].filter(({ value }) => {
            if (!value) return false;
            if (typeof value === 'string') {
              const trimmed = value.trim();
              return trimmed !== '' && trimmed !== '-' && trimmed !== 'null' && trimmed !== 'undefined';
            }
            return true;
          });

          if (documentsList.length === 0) {
            return null; // Don't render Documents section if no documents
          }

          return (
            <div className="lg:col-span-5 rounded-[10px] bg-white shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-6">
              <div className="text-[16px] font-semibold text-gray-900 mb-4">Documents</div>
              <div className="mb-2 grid grid-cols-2 text-[12px] text-gray-500 px-1">
                <span>Document</span>
                <span className="text-right pr-1">Actions</span>
              </div>
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {documentsList.map(({ label, value }) => (
                  <DocRow key={label} label={label} value={value} />
                ))}
              </div>
            </div>
          );
        })()}

          <div className="lg:col-span-5 rounded-[10px] bg-white shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[16px] font-semibold text-gray-900">Subscription</div>
              <span className={`inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full font-medium ${subscription?.status === 'active'
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : 'text-red-700 bg-red-50 border border-red-200'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${subscription?.status === 'active' ? 'bg-emerald-600'
                    : 'bg-red-600'
                  }`}></span>
                {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || 'Expired'}
              </span>
            </div>

            {subscription && (
              <div>
                {/* Plan Card */}
                <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[18px] font-semibold text-gray-900 mb-1">
                        {subscription.planType || 'Subscription Plan'}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[28px] font-bold text-gray-900">
                          ₹{subscription.amount?.toLocaleString('en-IN') || '0'}
                        </span>
                        <span className="text-[14px] text-gray-500">
                          / {subscription.periodValue || 1} {subscription.periodUnit || 'month'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] text-gray-500 mb-1">Currency</div>
                      <div className="text-[14px] font-medium text-gray-900">{subscription.currency || 'INR'}</div>
                    </div>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-500 text-[12px] mb-1">Start Date</div>
                      <div className="text-gray-900 text-[14px] font-medium">
                        {subscription.startDate
                          ? new Date(subscription.startDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-[12px] mb-1">End Date</div>
                      <div className="text-gray-900 text-[14px] font-medium">
                        {subscription.endDate
                          ? new Date(subscription.endDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                          : '-'}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-[12px] mb-1">Auto Renew</div>
                      <div className="text-gray-900 text-[14px]">
                        {subscription.autoRenew ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-[12px] mb-1">Payment ID</div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-gray-100 border border-gray-200 text-gray-700">
                        {subscription.paymentRef || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  {subscription.endDate && subscription.status === 'active' && (
                    <>
                      <div className="h-px bg-gray-200"></div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[12px] text-blue-700 font-medium">Days Remaining</span>
                          </div>
                          <span className="text-[14px] font-bold text-blue-900">
                            {Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Action Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push('/plans')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-white bg-green-900 hover:bg-green-800 text-[14px] font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {subscription?.status === 'active' ? 'Upgrade Plan' : 'Subscribe Now'}
              </button>
            </div>
          </div>
      </div>

      {error && (
        <div className="text-[12px] text-red-600 mt-6">{error}</div>
      )}

      {/* Preview Modal */}
      {preview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 mt-8" onClick={() => setPreview({ open: false, src: '', type: '' })}>
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-[14px] font-medium text-gray-900">Preview</div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setPreview({ open: false, src: '', type: '' })}>✕</button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto">
              {preview.type === 'pdf' ? (
                <iframe src={preview.src} className="w-full h-[70vh]" title="Document Preview" />
              ) : (
                <img src={preview.src} alt="Document" className="max-h-[70vh] w-auto mx-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


