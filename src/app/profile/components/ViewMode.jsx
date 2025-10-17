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
      <div className="flex items-center justify-between py-3 border-b last:border-b-0">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
          </span>
          <span className="text-sm text-gray-800">{label}</span>
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-gray-300 text-gray-600 bg-white">{value ? ext : '-'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={disabled}
            onClick={() => setPreview({ open: true, src: value, type: isPdfFile(value) ? 'pdf' : (isImageFile(value) ? 'image' : '') })}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded border ${disabled ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-white' : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'}`}
          >
            <svg className={`w-3.5 h-3.5 ${disabled ? 'text-gray-300' : 'text-green-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview
          </button>
          <a
            href={disabled ? '#' : value}
            download={downloadName}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded border ${disabled ? 'pointer-events-none text-gray-400 border-gray-200 bg-white' : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'}`}
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-gray-300 text-[10px] text-gray-600">D</span>
            Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      {/* Broker Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-6">
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
            {/* Action bar */}
            <div className="flex items-center justify-end mb-4">
              <button type="button" onClick={() => router.push('/profile?mode=edit')} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-white bg-green-600 hover:bg-green-700 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>

            {/* Top row */}
            <div className="flex items-center gap-4 mb-6">
              <img src={profile.image} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <div className="text-base font-semibold text-gray-900">{profile.name}</div>
                <div className="text-sm text-gray-600">{profile.firm || '-'}</div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
              <div>
                <div className="text-gray-500">Firm</div>
                <div className="text-gray-900">{profile.firm || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Gender</div>
                <div className="text-gray-900">{profile.gender || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">{profile.status || 'Active'}</div>
              </div>
              <div>
                <div className="text-gray-500">Joined Date</div>
                <div className="text-gray-900">{profile.joinedDateFormatted || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">License</div>
                <div className="text-gray-900">{profile.license || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Regions</div>
                <div className="text-gray-900">{profile.regions?.length ? profile.regions.join(', ') : '-'}</div>
              </div>
              <div className="md:col-span-3 lg:col-span-6">
                <div className="text-gray-500 mb-1">Specializations</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(data?.specializations) && data.specializations.length > 0 ? (
                    data.specializations.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-800">{s}</span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-800">-</span>
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
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-base font-semibold text-gray-900 mb-4">Contact Details</div>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92V21a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h4.09a1 1 0 01.95.68l1.1 3a1 1 0 01-.27 1.11L9.91 9.91a16 16 0 006.18 6.18l2.12-2.12a1 1 0 011.11-.27l3 1.1a1 1 0 01.68.95z"/></svg>
              </span>
              <div>
                <div className="text-gray-500">Mobile</div>
                <div className="text-gray-900">{profile.phone || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 13.5a4.5 4.5 0 01-6 4.24L9 20l2.26-6.5A4.5 4.5 0 1115 8.5"/></svg>
              </span>
              <div>
                <div className="text-gray-500">WhatsApp</div>
                <div className="text-gray-900">{profile.whatsapp || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
              </span>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="text-gray-900 break-all">{profile.email || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              </span>
              <div>
                <div className="text-gray-500">Office Address</div>
                <div className="text-gray-900">{profile.address || '-'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20"/></svg>
              </span>
              <div>
                <div className="text-gray-500">Website</div>
                <div className="text-green-700">{profile.website ? (<a href={profile.website} target="_blank" rel="noreferrer" className="underline">{profile.website}</a>) : '-'}</div>
              </div>
            </div>
          </div>
          {(profile.socials.linkedin || profile.socials.twitter || profile.socials.instagram || profile.socials.facebook) && (
            <div className="mt-4 flex items-center gap-3 text-gray-600">
              {profile.socials.linkedin && (
                <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4zM8.5 8h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.79-2.65 3.65V24h-4z"/></svg>
                </a>
              )}
              {profile.socials.twitter && (
                <a href={profile.socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
              )}
              {profile.socials.instagram && (
                <a href={profile.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-1.66-1.34-3-3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/></svg>
                </a>
              )}
              {profile.socials.facebook && (
                <a href={profile.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-gray-900">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.29.2 2.29.2v2.52h-1.29c-1.27 0-1.66.79-1.66 1.6V12h2.83l-.45 2.91h-2.38v7.04C19.55 21.47 22 17.1 22 12z"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="text-base font-semibold text-gray-900 mb-4">Documents</div>
          <div className="divide-y divide-gray-100">
            {[
              { label: 'Aadhar Card', value: profile.docs.aadhar },
              { label: 'PAN Card', value: profile.docs.pan },
              { label: 'GST Certificate', value: profile.docs.gst },
              { label: 'Broker License', value: profile.docs.license },
              { label: 'Company ID', value: profile.docs.companyId },
            ].map(({ label, value }) => {
              const getExt = (v) => {
                if (!v || typeof v !== 'string') return '-';
                const m = v.match(/\.([a-zA-Z0-9]+)$/);
                return (m ? m[1] : '-').toUpperCase();
              };
              const ext = getExt(value);
              const disabled = !value;
              const fileName = (() => {
                if (!value) return label.replace(/\s+/g, '_');
                try {
                  const u = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
                  const last = u.pathname.split('/').pop();
                  if (last && last.includes('.')) return last;
                } catch {}
                return `${label.replace(/\s+/g, '_')}${ext !== '-' ? `.${ext.toLowerCase()}` : ''}`;
              })();
              return (
                <div key={label} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700">{ext}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {disabled ? (
                      <span className="text-sm text-gray-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Preview
                      </span>
                    ) : (
                      <a href={value} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Preview
                      </a>
                    )}
                    {disabled ? (
                      <span className="text-sm border border-gray-200 px-2.5 py-1.5 rounded-md text-gray-400 flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-gray-300 text-[10px]">D</span>
                        Download
                      </span>
                    ) : (
                      <a href={value} download={fileName} className="text-sm border border-gray-200 px-2.5 py-1.5 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-gray-300 text-[10px]">D</span>
                        Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {error && (
        <div className="text-xs text-red-600 mt-6">{error}</div>
      )}

      {/* Preview Modal */}
      {preview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview({ open: false, src: '', type: '' })}>
          <div className="bg-white rounded-xl max-w-4xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-medium text-gray-900">Preview</div>
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


