"use client";
import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import data from '../data/furnitureData.json';

const TABS = [
  { label: 'Description' },
  { label: 'Additional Information' },
  { label: 'Review' },
];

function PropertyDetailsPageInner() {
  const searchParams = useSearchParams();
  const product = useMemo(() => {
    const items = data?.products?.items || [];
    const idParam = searchParams?.get('id');
    const idNum = idParam ? Number(idParam) : NaN;
    const found = items.find((p) => p.id === idNum);
    return found || items[0] || null;
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(0);

  const gallery = useMemo(() => {
    const primary = product?.image || '';
    // fallback thumbnails from JSON pool (ensure not duplicating)
    const pool = (data?.products?.items || [])
      .map((p) => p.image)
      .filter((src) => src && src !== primary);
    const a = pool[0] || primary;
    const b = pool[1] || primary;
    return [primary, a, b];
  }, [product]);

  const price = product?.price || 0;
  const originalPrice = product?.originalPrice || 0;
  const discount = product?.discount || '';

  return (
    <div className="bg-white py-8 px-4">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Main Content */}
        <section className="md:col-span-8 space-y-5">
          {/* Header row: title/location + actions */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{product?.name || 'Property'}</h1>
              <div className="text-xs text-gray-500 mt-1">Delhi NCR · Prime Location</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">{product?.category || 'Property'}</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs font-medium">{discount}</span>
                {product?.type && (
                  <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs font-medium">{product.type}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-900">₹{Math.round(price).toLocaleString('en-IN')}</div>
              {originalPrice > price && (
                <div className="text-xs text-gray-500 line-through">₹{Math.round(originalPrice).toLocaleString('en-IN')}</div>
              )}
              <div className="mt-3 flex gap-2 justify-end">
                <button className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium">Contact Broker</button>
                <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">Schedule Visit</button>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8 bg-gray-50 rounded-xl overflow-hidden relative">
              <img src={gallery[0]} alt="Property" className="w-full h-[360px] md:h-[420px] object-cover" />
            </div>
            <div className="col-span-4 flex flex-col gap-3">
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <img src={gallery[1]} alt="secondary" className="w-full h-[175px] md:h-[204px] object-cover" />
              </div>
              <div className="bg-gray-50 rounded-xl overflow-hidden relative">
                <img src={gallery[2]} alt="secondary" className="w-full h-[175px] md:h-[204px] object-cover" />
                <button className="absolute bottom-3 right-3 bg-white/90 text-gray-700 text-xs px-3 py-1 rounded-md shadow">Show all</button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Summary</div>
            <p className="text-sm text-gray-600 leading-6 mb-4">
              Premium property with modern interiors, near transit, schools, and shopping. Ideal for end-use and investment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="7" rx="1"/><path d="M7 10V7a2 2 0 012-2h6a2 2 0 012 2v3"/></svg>
                  </span>
                  <span>Bedrooms</span>
                </div>
                <div className="font-semibold text-gray-900">3</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>
                  </span>
                  <span>Property size</span>
                </div>
                <div className="font-semibold text-gray-900">1,450 sq.ft</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                  </span>
                  <span>Listed</span>
                </div>
                <div className="font-semibold text-gray-900">Recently</div>
              </div>
            </div>
            <button className="text-green-700 text-xs font-semibold mt-4">Learn more about plan sets in our FAQs</button>
          </div>
        </section>

        {/* Right Sidebar - Rating + Agent + Inspection */}
        <aside className="md:col-span-4 space-y-5 md:sticky md:top-24">
          {/* Rating and reviews summary */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-green-100 p-5">
              <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full border border-gray-400"></span>
                Rating and reviews
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-semibold text-gray-900">{(product?.rating || 4.6).toFixed(1)}</div>
                  <div className="flex items-center gap-1 text-gray-900">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.round((product?.rating || 4.6)) ? 'text-gray-900' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.164L12 18.896l-7.334 3.864 1.4-8.164L.132 9.21l8.2-1.192z"/></svg>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-700 mt-1">Based on 100 reviewers</div>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { label: 'Comfortable', value: 4.7, width: '85%' },
                  { label: 'Cleanliness', value: 4.8, width: '90%' },
                  { label: 'Facilities', value: 4.5, width: '75%' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-sm text-gray-900">
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                    <div className="mt-1 h-2 bg-white/70 rounded-full">
                      <div className="h-2 bg-green-600 rounded-full" style={{ width: row.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5">
              <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </span>
              <div className="text-sm font-semibold text-gray-900">Agent details</div>
            </div>
            <div className="px-5 pb-5 pt-4 flex flex-col items-center text-center gap-2">
              <img src="/images/user-1.webp" alt="Agent" className="w-14 h-14 rounded-full object-cover" />
              <div className="font-semibold text-gray-900">ABC Real Estate</div>
              <div className="text-xs text-gray-500">Expert Broker • Delhi NCR</div>
              <button className="w-full mt-3 bg-green-900 hover:bg-green-800 text-white py-2 rounded-lg font-medium">Contact Agent</button>
            </div>
          </div>

          {/* Inspection times */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5">
              <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </span>
              <div className="text-sm font-semibold text-gray-900">Inspection times</div>
            </div>
            <div className="px-5 pb-5 pt-4">
              <div className="flex flex-col items-center text-center">
                <img src="/images/user-1.webp" alt="Inspector" className="w-12 h-12 rounded-full object-cover" />
              </div>
              <ul className="mt-4 text-sm text-gray-700 space-y-2">
                <li className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span>Sat</span>
                  <span className="text-gray-500">10:00 AM - 11:00 AM</span>
                </li>
                <li className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span>Sun</span>
                  <span className="text-gray-500">02:00 PM - 03:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Product Tabs Section */}
      <div className=" mx-auto  bg-white rounded-xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 justify-center">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 text-lg font-medium focus:outline-none transition ${activeTab === idx ? 'text-green-900 border-b-4 border-green-900' : 'text-gray-400 border-b-4 border-transparent hover:text-green-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-6 justify-center">
          {activeTab === 0 && (
            <>
              <p className="text-gray-700 mb-4 ">
                Spacious, well-lit interiors with functional layout and quality finishes. Close to metro, schools and daily conveniences.
              </p>
              <ul className="space-y-2 mt-4">
                {['Prime location with strong connectivity', 'Ample natural light and ventilation', 'Gated community with 24x7 security', 'Great rental yield potential'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700">
                    <span className="w-5 h-5 flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-green-900"></span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {activeTab === 1 && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-200 rounded-2xl overflow-hidden">
                <thead>
                  <tr>
                    <th className="bg-yellow-500 text-left px-6 py-3 text-base font-semibold rounded-tl-2xl">Feature</th>
                    <th className="bg-yellow-500 text-left px-6 py-3 text-base font-semibold rounded-tr-2xl">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-6 py-3 border-t border-gray-200">Category</td>
                    <td className="px-6 py-3 border-t border-gray-200">{product?.category}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 border-t border-gray-200">Discount</td>
                    <td className="px-6 py-3 border-t border-gray-200">{discount || '—'}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-3 border-t border-gray-200">Listing Type</td>
                    <td className="px-6 py-3 border-t border-gray-200">{product?.type}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 border-t border-gray-200">Price</td>
                    <td className="px-6 py-3 border-t border-gray-200">₹{Math.round(price).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-3 border-t border-b border-gray-200 rounded-bl-2xl">Original Price</td>
                    <td className="px-6 py-3 border-t border-b border-gray-200 rounded-br-2xl">{originalPrice ? `₹${Math.round(originalPrice).toLocaleString('en-IN')}` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 2 && (
            <div className="pt-2">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8">
                <div className="flex flex-col items-center md:w-1/3 w-full">
                  <span className="text-5xl font-bold text-gray-900">{(product?.rating || 4.7).toFixed(1)}</span>
                  <span className="text-gray-500 text-lg">out of 5</span>
                  <div className="flex items-center mt-2 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-2xl">★</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm mt-1">({product?.reviewCount || 245} Review)</span>
                </div>
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    const barPercents = [90, 60, 25, 10, 5];
                    return (
                      <div key={star} className="flex items-center gap-2 mb-2">
                        <span className="w-12 text-gray-700 text-sm">{star} Star</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-yellow-500 rounded-full" style={{ width: `${barPercents[idx]}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Properties */}
      <div className="mt-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500">Related Properties</div>
            <h3 className="text-2xl font-semibold text-gray-900 mt-1">Explore Related Properties</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data?.products?.items || []).slice(0, 4).map((p) => (
              <Link key={p.id} href={`/property-details?id=${p.id}`} className="block group">
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-gray-500">{p.category}</div>
                    <div className="font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-green-900 font-semibold">₹{Math.round(p.price || 0).toLocaleString('en-IN')}</span>
                      {p.originalPrice && p.originalPrice > (p.price || 0) && (
                        <span className="text-xs text-gray-500 line-through">₹{Math.round(p.originalPrice).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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


