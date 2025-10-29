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
            <svg className={`w-4 h-4 ${disabled ? 'text-gray-300' : 'text-green-900'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <img src={profile.image} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <div className="text-[16px] font-semibold text-gray-900">{profile.name}</div>
                  <div className="text-[12px] text-gray-500">{profile.firm || '-'}</div>
                </div>
              </div>
              <button type="button" onClick={() => router.push('/profile?mode=edit')} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-white bg-green-900 hover:bg-green-900 text-[14px] font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit Profile
              </button>
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
        <div className="lg:col-span-7 rounded-[10px] bg-white shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-6">
          <div className="text-[16px] font-semibold text-gray-900 mb-4">Contact Details</div>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h4a2 2 0 0 1 2 1.72l.3 2a2 2 0 0 1-.57 1.73L9.91 9.91a16 16 0 0 0 6.18 6.18l1.46-1.82a2 2 0 0 1 1.73-.57l2 .3A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <div>
                <div className="text-gray-500 text-[12px]">Mobile</div>
                <div className="text-gray-900 text-[14px]">{profile.phone || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
              </span>
              <div>
                <div className="text-gray-500 text-[12px]">WhatsApp</div>
                <div className="text-gray-900 text-[14px]">{profile.whatsapp || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg>
              </span>
              <div>
                <div className="text-gray-500 text-[12px]">Email</div>
                <div className="text-gray-900 text-[14px] break-all">{profile.email || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div>
                <div className="text-gray-500 text-[12px]">Office Address</div>
                <div className="text-gray-900 text-[14px]">{profile.address || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-4 h-4 flex items-center justify-center" style={{ color: '#565D6DFF' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/></svg>
              </span>
              <div>
                <div className="text-gray-500 text-[12px]">Website</div>
                <div className="text-green-900 text-[14px]">{profile.website ? (<a href={profile.website} target="_blank" rel="noreferrer" className="underline">{profile.website}</a>) : '-'}</div>
              </div>
            </div>
          </div>
          {(profile.socials.linkedin || profile.socials.twitter || profile.socials.instagram || profile.socials.facebook) && (
            <div className="mt-4 flex items-center gap-3 text-gray-600">
              {profile.socials.linkedin && (
                <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {profile.socials.twitter && (
                <a href={profile.socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
              )}
              {profile.socials.instagram && (
                <a href={profile.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
              {profile.socials.facebook && (
                <a href={profile.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v9h4v-9h3l1-4h-4V6a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="lg:col-span-5 rounded-[10px] bg-white shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-6">
          <div className="text-[16px] font-semibold text-gray-900 mb-4">Documents</div>
          <div className="mb-2 grid grid-cols-2 text-[12px] text-gray-500 px-1">
            <span>Document</span>
            <span className="text-right pr-1">Actions</span>
          </div>
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {[
              { label: 'Aadhar Card', value: profile.docs.aadhar },
              { label: 'PAN Card', value: profile.docs.pan },
              { label: 'GST Certificate', value: profile.docs.gst },
              { label: 'Broker License', value: profile.docs.license },
              { label: 'Company ID', value: profile.docs.companyId },
            ].map(({ label, value }) => (
              <DocRow key={label} label={label} value={value} />
            ))}
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


