import React from 'react';

export const metadata = {
  title: 'Lead Details',
};

export default function LeadDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 flex justify-center">
      <div className="w-full  space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/images/user-2.jpeg" alt="Lead" className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow" />
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">John Carter</h1>
                <p className="text-sm text-gray-500">Qualified Lead · Added 3 days ago</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2.5 rounded-full bg-green-700 hover:bg-green-800 text-white">Schedule Visit</button>
              <button className="px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Add Note</button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left */}
          <section className="md:col-span-8 space-y-6">
            {/* Lead Overview (all details combined) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                <h2 className="text-lg font-semibold text-green-900">Lead Overview</h2>
              </div>

              {/* Summary chips */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium">Name: John Carter</span>
                <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium">Type: Buy</span>
                <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium">Created: 3 days ago</span>
              </div>

              {/* Contact grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8"/><path d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">john.carter@example.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 12 19.79 19.79 0 0 1 0 3.18 2 2 0 0 1 2 1h4.09a2 2 0 0 1 2 1.72c.12.9.3 1.78.54 2.63a2 2 0 0 1-.45 2.11L7 8a16 16 0 0 0 6 6l.54-.62a2 2 0 0 1 2.11-.45c.85.24 1.73.42 2.63.54A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium text-gray-900">+1 555 010 7789</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z"/><path d="M4 22a8 8 0 1 1 16 0"/></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Preferred Contact</div>
                    <div className="font-medium text-gray-900">WhatsApp</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2l2 4 4 .5-3 3 .7 4.5L10 12l-3.7 2 0-4.5-3-3L7.9 6.5 10 2z"/></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Lead Source</div>
                    <div className="font-medium text-gray-900">Website Form</div>
                  </div>
                </div>
              </div>

              {/* Requirement inline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Property Type</div>
                  <div className="font-medium text-gray-900">3 BHK Apartment</div>
                </div>
                <div>
                  <div className="text-gray-500">Budget</div>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 text-sm font-semibold w-max">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6c-2.5 0-4 1.5-4 3s1.5 3 4 3 4 1.5 4 3-1.5 3-4 3"/><path d="M12 3v18"/></svg>
                    $350,000 - $420,000
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-gray-500">Preferred Locations</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Downtown', 'Riverside', 'Green Park'].map(r => (
                      <span key={r} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-lg font-semibold text-green-900">Notes</h3>
                </div>
                <p className="text-sm text-gray-600 leading-7">
                  Looking for a modern apartment with good connectivity and schools nearby. Prefers higher floors and east-facing.
                </p>
              </div>
            </div>
          </section>

          {/* Right - Simple Leads + Resources */}
          <aside className="md:col-span-4 space-y-6">
            {/* Simple leads list (click to open) */}
            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-sm font-semibold text-green-900">Similar Leads</h3>
              </div>
              <div className="divide-y divide-gray-100 text-sm">
                {[
                  { id: 'l1', title: 'Buy · 3 BHK Apartment', region: 'Downtown', budget: '$360k' },
                  { id: 'l2', title: 'Rent · Commercial Space', region: 'Riverside', budget: '$1.2k/mo' },
                  { id: 'l3', title: 'Buy · Plot', region: 'Green Park', budget: '$220k' },
                  { id: 'l4', title: 'Rent · 2 BHK', region: 'City Center', budget: '$900/mo' },
                  { id: 'l5', title: 'Sell · Shop', region: 'Market Road', budget: '$140k' },
                ].map((s) => (
                  <a key={s.id} href="/lead-details" className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition">
                    <div>
                      <div className="font-medium text-gray-900">{s.title}</div>
                      <div className="text-gray-500">{s.region}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-1">{s.budget}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Helpful info */}
            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-sm font-semibold text-green-900">Helpful Info</h3>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                <li>Response quickly to increase conversion chances.</li>
                <li>Verify budget and timeline on first call.</li>
                <li>Share 3–5 best‑fit properties based on regions.</li>
                <li>Schedule site visit within 48 hours where possible.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}



