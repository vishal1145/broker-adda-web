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
              <button className="px-4 py-2.5 rounded-full bg-green-700 hover:bg-green-800 text-white">Mark Won</button>
              <button className="px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Mark Lost</button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left */}
          <section className="md:col-span-8 space-y-6">
            {/* Lead Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Lead Information</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">john.carter@example.com</div>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">+1 555 010 7789</div>
                </div>
                <div>
                  <div className="text-gray-500">Preferred Contact</div>
                  <div className="font-medium text-gray-900">WhatsApp</div>
                </div>
                <div>
                  <div className="text-gray-500">Lead Source</div>
                  <div className="font-medium text-gray-900">Website Form</div>
                </div>
              </div>
            </div>

            {/* Requirement */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Requirement</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Property Type</div>
                  <div className="font-medium text-gray-900">3 BHK Apartment</div>
                </div>
                <div>
                  <div className="text-gray-500">Budget</div>
                  <div className="font-medium text-gray-900">$350,000 - $420,000</div>
                </div>
                <div>
                  <div className="text-gray-500">Preferred Locations</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Downtown', 'Riverside', 'Green Park'].map(r => (
                      <span key={r} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{r}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Timeline</div>
                  <div className="font-medium text-gray-900">Within 2 months</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <p className="mt-2 text-sm text-gray-600 leading-7">
                Looking for a modern apartment with good connectivity and schools nearby. Prefers higher floors and east-facing.
              </p>
            </div>
          </section>

          {/* Right */}
          <aside className="md:col-span-4 space-y-6">
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-green-100 p-5 text-sm font-semibold text-gray-900">Status</div>
              <div className="p-5 text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span>Current</span>
                  <span className="font-semibold text-gray-900">Qualified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Activity</span>
                  <span className="font-semibold text-gray-900">Site Visit Scheduled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Follow-up</span>
                  <span className="font-semibold text-gray-900">Tue, 5:30 PM</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              <div className="mt-3 space-x-2">
                <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700">Call</button>
                <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700">WhatsApp</button>
                <button className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white">Create Task</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}



