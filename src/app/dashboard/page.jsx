'use client';

import { useMemo, useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import DashboardCharts from '../components/Charts';
import axios from 'axios';

const StatCard = ({ title, value, icon, subtext, change = '+0.0%', variant = 'default', gradientFrom = '#10b981', gradientTo = '#a7f3d0' }) => {
  return (
    variant === 'gradient' ? (
      <div
        className="rounded-[22px] p-5 shadow-sm text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        style={{
          background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/20">
              {icon}
            </div>
            <div className="text-[13px] opacity-90">{title}</div>
          </div>
        </div>
        <div className="mt-3 text-[28px] font-semibold leading-none">{value}</div>
        {subtext && <div className="mt-1 text-[12px] opacity-80">{subtext}</div>}
      </div>
    ) : (
      <div className="rounded-[18px] border border-gray-100 bg-gradient-to-b from-white to-[#0055AA]/3 p-0 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <div className="bg-gradient-to-r from-[#0055AA]/10 to-transparent px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#74a7e6] to-[#0055AA] text-white shadow-sm">{icon}</div>
            <p className="text-sm text-gray-700">{title}</p>
          </div>
        </div>
        <div className="px-5 pb-4">
          <div className="flex items-end justify-between">
            <p className="text-[28px] leading-none font-semibold text-gray-900 tracking-tight">{value}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {change}
            </span>
          </div>
          {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
        </div>
        {/* sparkline */}
        <div className="px-5 pb-5">
          <div className="flex items-end gap-1.5 h-10">
            {[18, 26, 22, 30, 24, 36, 28, 40, 34, 44].map((h, i) => (
              <div
                key={i}
                className="w-2.5 rounded-md bg-[#7aa6d9] opacity-60 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                style={{ height: `${Math.max(10, Math.min(h, 44))}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  );
};

const Section = ({ title, children, action }) => {
  return (
    <section className="rounded-xl border bg-white py-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalLeads: null,
    activeProperties: null,
    todaysLeads: null,
  });
  const [metricsLoading, setMetricsLoading] = useState(false);

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayPhone = user?.phone || '—';
  const displayRole = (user?.role || 'customer').toString().charAt(0).toUpperCase() + (user?.role || 'customer').toString().slice(1);

  useEffect(() => {
    const getBrokerIdFromToken = () => {
      try {
        if (typeof window === 'undefined') return '';
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) return '';
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (
          payload.brokerId ||
          payload.brokerDetailId ||
          payload.brokerDetailsId ||
          payload.brokerDetails?.id ||
          payload.brokerDetails?._id ||
          payload.userId ||
          payload.id ||
          ''
        );
      } catch {
        return '';
      }
    };
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        const brokerId = getBrokerIdFromToken() || (typeof window !== 'undefined' ? (localStorage.getItem('brokerId') || localStorage.getItem('brokerID')) : null) || user?.brokerId || '';
        if (typeof window !== 'undefined' && brokerId) {
          localStorage.setItem('brokerId', brokerId);
        }
        const url = `http://localhost:5000/api/leads/metrics?createdBy=${brokerId}`;
        const { data } = await axios.get(url);
        const payload = data?.data ?? data;
        setMetrics({
          totalLeads: payload?.totalLeads ?? 0,
          activeProperties: payload?.totalProperties ?? 0,
          todaysLeads: payload?.newLeadsToday ?? 0,
        });
      } catch (e) {
        setMetrics({ totalLeads: 0, activeProperties: 0, todaysLeads: 0 });
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
  }, [user]);

  const fmt = (n) => {
    if (n === null || n === undefined) return '—';
    try { return Number(n).toLocaleString('en-IN'); } catch { return String(n); }
  };

  return (
    <ProtectedRoute requiredRole="broker">
      <div className=" py-10 bg-white">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{greeting}, Broker</h1>
            <p className="text-gray-600">Executive overview of leads, properties, and performance.</p>
          </div>

          {/* Top summary cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            <StatCard variant="gradient" gradientFrom="#10b981" gradientTo="#a7f3d0" title="Total Leads" value={fmt(metrics.totalLeads)} subtext="vs last month" icon={<span className="font-semibold">TL</span>} />
            <StatCard variant="gradient" gradientFrom="#f59e0b" gradientTo="#fde68a" title="Active Properties" value={fmt(metrics.activeProperties)} subtext="currently live" icon={<span className="font-semibold">AP</span>} />
            <StatCard variant="gradient" gradientFrom="#10b981" gradientTo="#6ee7b7" title="Today's Leads" value={fmt(metrics.todaysLeads)} subtext="today" icon={<span className="font-semibold">NW</span>} />
            <StatCard variant="gradient" gradientFrom="#f59e0b" gradientTo="#fcd34d" title="Conversion Rate" value="18.5%" subtext="this month" icon={<span className="font-semibold">CR</span>} />
          </div>

          {/* Two-column layout: main + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main content (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Lead Overview Panel */}
              <section className="rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Lead overview</h2>
                  <a href="/leads" className="text-sm font-medium text-green-900 hover:opacity-90">View all</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Lead Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Contact</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Source</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Assigned Broker</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Last Contact</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Rohan Sharma', contact: '+91 98123 45678', source: 'Website', status: 'Hot', statusClasses: 'bg-red-50 text-red-700', broker: 'AK', last: 'Today' },
                        { name: 'Priya Kapoor', contact: 'priya@example.com', source: 'Referral', status: 'Warm', statusClasses: 'bg-yellow-50 text-yellow-700', broker: 'PK', last: 'Yesterday' },
                        { name: 'Sameer Khan', contact: '+91 98989 12345', source: 'Ad', status: 'Cold', statusClasses: 'bg-blue-50 text-blue-700', broker: 'SK', last: '2 days ago' },
                      ].map((row) => (
                        <tr key={row.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{row.name}</td>
                          <td className="px-4 py-3 text-gray-700">{row.contact}</td>
                          <td className="px-4 py-3 text-gray-700">{row.source}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.statusClasses}`}>{row.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0055AA]/10 text-[#0055AA] text-xs font-semibold">{row.broker}</span>
                              <span className="text-gray-800">Broker</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{row.last}</td>
                          <td className="px-4 py-3 text-right">
                            <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500">⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Property Performance Section */}
              <section className="rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Property performance</h2>
                  <a href="/properties-management" className="text-sm font-medium text-green-900 hover:opacity-90">View all</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[
                    { name: 'Sunset Heights', location: 'Andheri, Mumbai', price: '₹1.2Cr', type: 'House', status: 'For Sale', img: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop' },
                    { name: 'Emerald Residency', location: 'Baner, Pune', price: '₹85L', type: 'Condo', status: 'Under Offer', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop' },
                    { name: 'Lakeview Villa', location: 'Whitefield, Bengaluru', price: '₹2.5Cr', type: 'House', status: 'For Sale', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop' },
                  ].map((p) => (
                    <div key={p.name} className="rounded-[16px] border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                      <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                        <img src={p.img} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                        <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${p.status === 'For Sale' ? 'bg-emerald-500 text-white' : p.status === 'Under Offer' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'}`}>{p.status}</span>
                      </div>
                      <div className="p-4">
                        <div className="text-gray-900 font-medium">{p.name}</div>
                        <div className="mt-0.5 text-sm text-gray-600 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#0055AA]"><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                          {p.location}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-[15px] font-semibold text-[#0055AA]">{p.price}</div>
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">{p.type}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-5 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                            1.2k
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-yellow-500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" stroke="currentColor" strokeWidth="1.2"/></svg>
                            86
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" stroke="currentColor" strokeWidth="1.5"/></svg>
                            12
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-600">Status: {p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Analytics & Insights Row */}
              <section>
                <DashboardCharts />
              </section>
            </div>

            {/* Right sidebar (1 col) */}
            <aside className="space-y-6">
              <section className="rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent inquiries</h2>
                  <a href="/leads" className="text-sm font-medium text-green-900">View all</a>
                </div>
                <ul className="space-y-3">
                  {[
                    { name: 'Ravi K.', location: 'Andheri, Mumbai', budget: '₹95L', stage: 'Warm', badge: 'bg-yellow-50 text-yellow-700' },
                    { name: 'Meera S.', location: 'Baner, Pune', budget: '₹1.3Cr', stage: 'Hot', badge: 'bg-red-50 text-red-700' },
                    { name: 'Arjun P.', location: 'Whitefield, Bengaluru', budget: '₹75L', stage: 'Cold', badge: 'bg-blue-50 text-blue-700' },
                  ].map((l) => (
                    <li key={l.name} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{l.name}</div>
                        <div className="text-xs text-gray-500">{l.location} • Budget {l.budget}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${l.badge}`}>{l.stage}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Top listings</h2>
                  <a href="/properties-management" className="text-sm font-medium text-green-900">View all</a>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Sunset Heights', price: '₹1.2Cr', img: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=400&auto=format&fit=crop' },
                    { name: 'Emerald Residency', price: '₹85L', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop' },
                    { name: 'Lakeview Villa', price: '₹2.5Cr', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=400&auto=format&fit=crop' },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-3 rounded-lg border bg-white p-2">
                      <img src={p.img} alt="thumb" className="h-12 w-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{p.name}</div>
                        <div className="text-xs text-[#0055AA] font-medium">{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;