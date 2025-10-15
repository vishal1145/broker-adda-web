"use client";
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import data from '../data/furnitureData.json';
import HeaderFile from '../components/Header';

const TABS = [
  { label: 'Description' },
  { label: 'Review' },
];

function PropertyDetailsPageInner() {
  const searchParams = useSearchParams();
  // Also support dynamic route /property-details/[id] by reading path when query is missing
  const [routeId, setRouteId] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const path = window.location.pathname || '';
      const m = path.match(/\/property-details\/(.+)$/);
      if (m && m[1]) setRouteId(m[1]);
    } catch {}
  }, []);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [agent, setAgent] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [similarProperties, setSimilarProperties] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // Fetch property details from API
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError('');
      
      const idParam = searchParams?.get('id') || routeId;
      if (!idParam) {
        // Wait until an id is available (from dynamic route or query)
        return;
      }

      try {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const res = await fetch(`${apiUrl}/properties/${encodeURIComponent(String(idParam))}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch property details');
        
        const responseData = await res.json();
        const propertyData = responseData?.data?.property || responseData?.property || responseData?.data || responseData;
        
        if (propertyData) {
          // Map API response to expected format
          const mappedProperty = {
            id: propertyData._id || propertyData.id || idParam,
            name: propertyData.title || propertyData.name || 'Property',
            category: propertyData.propertyType || propertyData.type || propertyData.category || 'Property',
            price: propertyData.price || 0,
            originalPrice: propertyData.originalPrice || propertyData.oldPrice || 0,
            discount: propertyData.discount || '',
            rating: propertyData.rating || 4.7,
            reviewCount: propertyData.reviewCount || 245,
            image: propertyData.images?.[0] || propertyData.image || '/images/pexels-binyaminmellish-106399.jpg',
            images: propertyData.images || [propertyData.image || '/images/pexels-binyaminmellish-106399.jpg'],
            propertyDescription: propertyData.propertyDescription || propertyData.description || '',
            description: propertyData.description || propertyData.propertyDescription || 'Modern property with excellent connectivity and amenities.',
            bedrooms: propertyData.bedrooms || 3,
            bathrooms: propertyData.bathrooms || 2,
            areaSqft: propertyData.propertySize || propertyData.areaSqft || propertyData.area || 1450,
            city: propertyData.city || 'Delhi NCR',
            region: propertyData.region || 'Prime Location',
            amenities: propertyData.amenities || [],
            nearbyAmenities: propertyData.nearbyAmenities || [],
            features: propertyData.features || [],
            locationBenefits: propertyData.locationBenefits || [],
            status: propertyData.status || 'Available',
            address: propertyData.address || '',
            propertyType: propertyData.propertyType || propertyData.type || 'Apartment',
            subType: propertyData.subType || '',
            facing: propertyData.facing || 'East',
            floor: propertyData.floor || '5th of 12 floors',
            maintenance: propertyData.maintenance || '₹3,000/month',
            propertyTax: propertyData.propertyTax || '₹1,200/month',
            registrationCost: propertyData.registrationCost || '₹50,000 (approx)',
            loanAvailable: propertyData.loanAvailable !== false,
            pricePerSqft: propertyData.pricePerSqft || (propertyData.price && propertyData.areaSqft ? Math.round(propertyData.price / propertyData.areaSqft) : 0),
            // capture possible agent identifiers for downstream fetch
            _raw: propertyData
          };
          setProduct(mappedProperty);

          // If broker object is embedded on the property, use it directly
          if (propertyData?.broker && typeof propertyData.broker === 'object') {
            const b = propertyData.broker;
            const mappedAgent = {
              id: b._id || b.id || '',
              name: b.name || b.fullName || b.firmName || 'Agent',
              phone: b.phone || b.mobile || '',
              email: b.email || '',
              firm: b.firmName || b.company || '',
              image: b.brokerImage || b.profileImage || b.avatar || '/images/user-1.webp',
              region: b.region || propertyData.city || propertyData.region || '',
              experience: b.experience || b.experienceYears || ''
            };
            setAgent(mappedAgent);
          }

          // Try to resolve an agent/broker id from the property payload
          const candidateId = (
            typeof propertyData?.createdBy === 'object' && propertyData.createdBy?._id ? propertyData.createdBy._id :
            (typeof propertyData?.createdBy === 'string' ? propertyData.createdBy : null)
          ) || propertyData?.brokerId || propertyData?.agentId || propertyData?.ownerId || propertyData?.userId;

          if (candidateId) {
            setAgentLoading(true);
            setAgentError('');
            try {
              const brokerRes = await fetch(`${apiUrl}/brokers/${encodeURIComponent(String(candidateId))}`, { headers });
              if (brokerRes.ok) {
                const brokerJson = await brokerRes.json().catch(() => ({}));
                const brokerData = brokerJson?.data?.broker || brokerJson?.broker || brokerJson?.data || brokerJson;
                if (brokerData) {
                  const mappedAgent = {
                    id: brokerData._id || brokerData.id || candidateId,
                    name: brokerData.name || brokerData.fullName || brokerData.firmName || 'Agent',
                    phone: brokerData.phone || brokerData.mobile || brokerData.contact || '',
                    email: brokerData.email || '',
                    firm: brokerData.firmName || brokerData.company || '',
                    image: brokerData.brokerImage || brokerData.profileImage || brokerData.avatar || '/images/user-1.webp',
                    region: (() => {
                      const r = brokerData.region;
                      if (Array.isArray(r) && r.length > 0) {
                        const first = r[0];
                        return typeof first === 'string' ? first : (first?.name || first?.city || first?.state || '');
                      }
                      if (typeof r === 'string') return r;
                      if (r && typeof r === 'object') return r.name || r.city || r.state || '';
                      return brokerData.city || brokerData.state || '';
                    })(),
                    experience: brokerData.experience || brokerData.experienceYears || ''
                  };
                  setAgent(mappedAgent);
                }
              } else {
                setAgentError('Failed to fetch agent details');
              }
            } catch (e) {
              setAgentError('Failed to fetch agent details');
            } finally {
              setAgentLoading(false);
            }
          }
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details');
        // Fallback to static data if API fails
    const items = data?.products?.items || [];
        const idNum = Number(idParam);
    const found = items.find((p) => p.id === idNum);
        if (found) {
          setProduct(found);
          setError('');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [searchParams, routeId]);

  // Fetch similar properties from API
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!product) return;
      
      setSimilarLoading(true);
      try {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Fetch properties - get all properties to have better selection
        const params = new URLSearchParams();
        // Remove city and propertyType filters to get more diverse properties
        params.append('limit', '20'); // Get more properties to have better selection
        
        console.log('Fetching similar properties with params:', params.toString());
        const res = await fetch(`${apiUrl}/properties?${params.toString()}`, { headers });
        console.log('API Response status:', res.status);
        
        if (res.ok) {
          const responseData = await res.json();
          console.log('Full API Response:', responseData);
          
          // Try different possible response structures
          let properties = [];
          if (responseData?.data?.properties) {
            properties = responseData.data.properties;
          } else if (responseData?.data?.items) {
            properties = responseData.data.items;
          } else if (responseData?.properties) {
            properties = responseData.properties;
          } else if (responseData?.data && Array.isArray(responseData.data)) {
            properties = responseData.data;
          } else if (Array.isArray(responseData)) {
            properties = responseData;
          }
          
          console.log('Properties found:', properties.length);
          console.log('Current property ID:', product.id || product._id);
          console.log('Product object:', product);
          
          // Filter out current property and map to expected format
          const currentPropertyId = product.id || product._id;
          console.log('Filtering with current ID:', currentPropertyId);
          
          const similar = properties
            .filter(p => {
              const propertyId = p._id || p.id;
              const isDifferent = propertyId !== currentPropertyId;
              console.log(`Property ${propertyId} vs current ${currentPropertyId}: ${isDifferent ? 'SHOW' : 'HIDE'}`);
              return isDifferent;
            })
            .slice(0, 4)
            .map(p => ({
              id: p._id || p.id,
              name: p.title || p.name || 'Property',
              category: p.propertyType || p.type || p.category || 'Property',
              price: p.price || 0,
              originalPrice: p.originalPrice || p.oldPrice || 0,
              image: p.images?.[0] || p.image || '/images/pexels-binyaminmellish-106399.jpg',
              areaSqft: p.propertySize || p.areaSqft || p.area || 0,
              bedrooms: p.bedrooms || 0,
              bathrooms: p.bathrooms || 0,
              city: p.city || '',
              region: p.region || ''
            }));
          
          console.log('Similar properties after filtering:', similar.length);
          setSimilarProperties(similar);
          
        }
      } catch (error) {
        console.error('Error fetching similar properties:', error);
        setSimilarProperties([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [product]);

  const gallery = useMemo(() => {
    if (!product) return ['/images/pexels-binyaminmellish-106399.jpg'];
    
    const images = product.images || [product.image];
    const primary = images[0] || '/images/pexels-binyaminmellish-106399.jpg';
    const secondary = images[1] || primary;
    const tertiary = images[2] || primary;
    
    return [primary, secondary, tertiary];
  }, [product]);

  const price = product?.price || 0;
  const originalPrice = product?.originalPrice || 0;
  const discount = product?.discount || '';

  const headerData = {
    title: 'Property Details',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Properties', href: '/properties' },
      { label: 'Property Details', href: '/property-details' }
    ]
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading property details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Property</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No property found
  if (!product) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Not Found</h3>
                <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or has been removed.</p>
                <Link 
                  href="/properties" 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeaderFile data={headerData} />
      <div className="py-10">
        <div className="w-full mx-auto">
        {/* Property Header - Lead Detail Style */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{product?.name || 'Property'}</h1>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">{product.status}</span>
                </div>
                <p className="text-sm text-gray-500">{product.city} · {product.region} · Listed 3 days ago</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-400">Price: ₹{Math.round(price).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">Size: {product.areaSqft?.toLocaleString('en-IN')} sq.ft</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2.5 text-sm rounded-full bg-green-700 hover:bg-green-800 text-white flex items-center gap-2 transition-all duration-200 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Contact Broker
              </button>
              <button className="px-4 py-2.5 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Schedule Visit
              </button>
              </div>
            </div>
          </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Main Content */}
          <section className="md:col-span-8 space-y-6">

            {/* Property Overview Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                  <h2 className="text-lg font-semibold text-gray-900">Property Overview</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Available</span>
                  <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">New Listing</span>
            </div>
          </div>

              {/* Enhanced Gallery */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 bg-gray-50 rounded-2xl overflow-hidden relative group">
                  <img src={gallery[0]} alt="Property" className="w-full h-[360px] md:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-semibold rounded-full shadow-lg">Featured</span>
                    <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">Available</span>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-lg hover:bg-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-lg hover:bg-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                      </svg>
                    </button>
                  </div>
            </div>
                <div className="col-span-4 flex flex-col gap-4">
                  <div className="bg-gray-50 rounded-2xl overflow-hidden relative group cursor-pointer">
                    <img src={gallery[1]} alt="secondary" className="w-full h-[175px] md:h-[204px] object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden relative group cursor-pointer">
                    <img src={gallery[2]} alt="secondary" className="w-full h-[175px] md:h-[204px] object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-sm px-4 py-2 rounded-xl shadow-lg hover:bg-white transition-colors font-medium">
                      +12 More
                    </button>
              </div>
            </div>
          </div>

              {/* Property Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="7" rx="1"/><path d="M7 10V7a2 2 0 012-2h6a2 2 0 012 2v3"/></svg>
                  </span>
          <div>
                    <div className="text-gray-500">Bedrooms</div>
                    <div className="font-medium text-gray-900">{product.bedrooms} BHK</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>
                  </span>
              <div>
                    <div className="text-gray-500">Property Size</div>
                    <div className="font-medium text-gray-900">{product.areaSqft?.toLocaleString('en-IN')} sq.ft</div>
                </div>
              </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                  </span>
              <div>
                    <div className="text-gray-500">Listed</div>
                    <div className="font-medium text-gray-900">3 days ago</div>
                </div>
              </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </span>
              <div>
                    <div className="text-gray-500">Price</div>
                    <div className="font-medium text-gray-900">₹{Math.round(price).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>
          </div>

            {/* Neighborhood Section - Compact Design */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-lg font-semibold text-gray-900">Nearby Amenities</h3>
              </div>
              
              {/* Bind from API nearbyAmenities if available */}
              <div className="space-y-2">
                {(product?.nearbyAmenities && product.nearbyAmenities.length > 0 ? product.nearbyAmenities : []).map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{name}</div>
                  </div>
                    </div>
                  </div>
                ))}
                {(!product?.nearbyAmenities || product.nearbyAmenities.length === 0) && (
                  <div className="text-sm text-gray-500">No nearby amenities listed.</div>
                )}
              </div>
            </div>
          </section>

          {/* Right Sidebar - Enhanced Content */}
          <aside className="md:col-span-4 space-y-6">
            {/* Contact Actions */}
            {/* <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-gray-900">Contact Agent</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  Call Now
                </button>
                <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Send Message
                </button>
                <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Schedule Visit
                </button>
                  </div>
                </div> */}

            {/* Agent Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-gray-900">Agent Details</h3>
              </div>
              {agentLoading ? (
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ) : agent ? (
                <div className="flex items-center gap-3">
                  <img src={agent.image} alt="Agent" className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    {agent.phone && (<div className="text-sm text-gray-500">{agent.phone}</div>)}
                    {agent.firm && (<div className="text-sm text-gray-500">{agent.firm}</div>)}
                    <div className="text-xs text-gray-400">Expert Broker {agent.region ? `• ${agent.region}` : ''}</div>
                    </div>
                    </div>
              ) : (
                <div className="text-sm text-gray-500">Agent details not available.</div>
              )}
                  </div>

            {/* Property Rating */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-gray-900">Property Rating</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{(product?.rating || 4.6).toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.round((product?.rating || 4.6)) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.164L12 18.896l-7.334 3.864 1.4-8.164L.132 9.21l8.2-1.192z"/>
                    </svg>
                ))}
              </div>
                <div className="text-sm text-gray-500 mt-1">Based on 100 reviews</div>
            </div>
          </div>

          

            {/* Inspection Times */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-gray-900">Inspection Times</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Saturday</span>
                  </div>
                  <span className="text-sm font-medium text-green-800">10:00 AM - 11:00 AM</span>
                </div>
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-blue-900">Sunday</span>
                  </div>
                  <span className="text-sm font-medium text-blue-800">02:00 PM - 03:00 PM</span>
            </div>
                <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Inspection
                </button>
            </div>
          </div>

            {/* Virtual Tour */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-gray-900">Virtual Tour</h3>
              </div>
              <div className="space-y-3">
                <div className="relative bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
            </div>
                  <h4 className="font-semibold text-purple-900 mb-1">360° Virtual Tour</h4>
                  <p className="text-sm text-purple-700 mb-3">Explore every corner of this property</p>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Start Tour
                  </button>
              </div>
            </div>
          </div>

        

        </aside>
      </div>

      {/* Property Details Tabs Section */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 justify-center">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3 text-base font-medium focus:outline-none transition ${activeTab === idx ? 'text-gray-900 border-b-2 border-green-900' : 'text-gray-400 border-b-2 border-transparent hover:text-gray-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 0 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                  <h3 className="text-xl font-bold text-gray-900">Property Description</h3>
                </div>
                <div className="prose prose-gray max-w-none">
                  {(product?.propertyDescription || product?.description) && (
                    <p className="text-sm text-gray-700 leading-6 mb-4">{product.propertyDescription || product.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Key Features
                    </h4>
                    <ul className="space-y-3">
                      {(product?.features && product.features.length > 0 ? product.features : ['Corner Unit','Park Facing']).map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-green-800">
                          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Location Benefits
                    </h4>
                    <ul className="space-y-3">
                      {(product?.locationBenefits && product.locationBenefits.length > 0 ? product.locationBenefits : ['Near IT Park','Easy Highway Access']).map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-blue-800">
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (<></>)}

          {activeTab === 1 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                  <h3 className="text-xl font-bold text-gray-900">Reviews & Ratings</h3>
                </div>
                
                {/* Overall Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="text-center md:text-left">
                      <div className="text-6xl font-bold text-gray-900 mb-2">{(product?.rating || 4.7).toFixed(1)}</div>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-6 h-6 ${i < Math.round((product?.rating || 4.7)) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                    ))}
                  </div>
                      <div className="text-lg text-gray-600 mb-1">Excellent</div>
                      <div className="text-sm text-gray-500">Based on {product?.reviewCount || 245} reviews</div>
                </div>
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    const barPercents = [90, 60, 25, 10, 5];
                    return (
                          <div key={star} className="flex items-center gap-3 mb-3">
                            <span className="w-12 text-gray-700 text-sm font-medium">{star} Star</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${barPercents[idx]}%` }}></div>
                        </div>
                            <span className="text-sm text-gray-600 w-8 text-right">{barPercents[idx]}%</span>
                      </div>
                    );
                  })}
                    </div>
                  </div>
                </div>
                
                {/* Individual Reviews */}
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h4>
                  {[
                    {
                      name: 'Rajesh Kumar',
                      rating: 5,
                      date: '2 days ago',
                      comment: 'Excellent property with great amenities. The location is perfect with metro connectivity. Highly recommended!',
                      verified: true
                    },
                    {
                      name: 'Priya Sharma',
                      rating: 4,
                      date: '1 week ago',
                      comment: 'Good property overall. The maintenance is well taken care of. Only minor issue is the parking space.',
                      verified: true
                    },
                    {
                      name: 'Amit Singh',
                      rating: 5,
                      date: '2 weeks ago',
                      comment: 'Amazing property! The view from the balcony is breathtaking. The builder has maintained high quality standards.',
                      verified: false
                    }
                  ].map((review, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900">{review.name}</h5>
                              {review.verified && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Verified</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-6">{review.comment}</p>
                    </div>
                  ))}
                  
                  <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                    Load More Reviews
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
        </div>
      </div>

      {/* Related Properties */}
      <div className="mt-8 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
            <h3 className="text-lg font-semibold text-gray-900">Related Properties</h3>
          </div>
          {similarLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : similarProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProperties.map((p) => (
                <Link key={p.id} href={`/property-details/${p.id}`} className="block group">
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                      <div className="font-medium text-gray-900 text-sm line-clamp-1 mb-2">{p.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{p.bedrooms} BHK • {p.areaSqft?.toLocaleString('en-IN')} sq.ft</div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-semibold text-sm">₹{Math.round(p.price || 0).toLocaleString('en-IN')}</span>
                        {p.originalPrice && p.originalPrice > (p.price || 0) && (
                          <span className="text-xs text-gray-500 line-through">₹{Math.round(p.originalPrice).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{p.city} • {p.region}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No similar properties found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={<div />}> 
      <PropertyDetailsPageInner />
    </Suspense>
  );
}


