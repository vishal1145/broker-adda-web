import React from 'react';

export const metadata = {
  title: 'Broker Details',
};

export default function BrokerDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 flex justify-center">
      <div className="w-full ">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-transparent" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src="/images/user-1.webp" alt="Broker" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-4 ring-white shadow" />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-900 text-xs font-semibold">Top Rated Broker</div>
                <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-gray-900">Neha Mehta</h1>
                <p className="text-sm text-gray-500">Independent Real Estate Broker · Sheffield, UK</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded-full bg-green-700 hover:bg-green-800 text-white shadow">Contact Broker</button>
              <button className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Schedule Meeting</button>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left - About + Info */}
          <section className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
              <p className="mt-2 text-sm text-gray-600 leading-7">
                With years of experience in residential and commercial real estate, Melissa specializes in matching clients with the right properties and maximizing returns for investors. Her consultative approach focuses on long-term relationships and market insight.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Investment", "Luxury", "Rentals", "Commercial"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{tag}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Full Name</div>
                  <div className="font-medium text-gray-900">Neha Mehta</div>
                </div>
                <div>
                  <div className="text-gray-500">Gender</div>
                  <div className="font-medium text-gray-900">Female</div>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">+1 544 000 123</div>
                </div>
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">neha.mehta@example.com</div>
                </div>
                <div>
                  <div className="text-gray-500">WhatsApp Number</div>
                  <div className="font-medium text-gray-900">+1 544 000 123</div>
                </div>
                <div>
                  <div className="text-gray-500">Firm Name</div>
                  <div className="font-medium text-gray-900">Prime Homes Realty</div>
                </div>
                <div>
                  <div className="text-gray-500">Website</div>
                  <div className="font-medium text-green-700">examplebroker.com</div>
                </div>
                <div>
                  <div className="text-gray-500">Office</div>
                  <div className="font-medium text-gray-900">221B High St, Sheffield</div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">License Number</div>
                  <div className="font-medium text-gray-900">UK-BRK-2025-00123</div>
                </div>
                <div>
                  <div className="text-gray-500">Address</div>
                  <div className="font-medium text-gray-900">2024 Royal Enclave, Sheffield, UK</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-gray-500">Specializations</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Luxury Homes", "Investment", "Commercial", "Rentals"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-gray-500">Social Media & Online Presence</div>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>
                      <span className="font-medium">LinkedIn:</span> linkedin.com/in/nehamehta
                    </li>
                    <li>
                      <span className="font-medium">Facebook:</span> fb.com/nehamehta
                    </li>
                    <li>
                      <span className="font-medium">Instagram:</span> @neha.mehta
                    </li>
                  </ul>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-gray-500">Preferred Regions</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Sheffield Central", "Meadowhall", "Ecclesall", "Hillsborough"].map(r => (
                      <span key={r} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right - Stats */}
          <aside className="md:col-span-4 space-y-6">
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-green-100 p-5 text-sm font-semibold text-gray-900">Performance</div>
              <div className="p-5 text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span>Overall Rating</span>
                  <span className="font-semibold">4.8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Closed Deals</span>
                  <span className="font-semibold">126</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg. Days on Market</span>
                  <span className="font-semibold">13</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">License</h3>
              <div className="mt-2 text-sm text-gray-700">UK-BRK-2025-00123</div>
            </div>

            {/* Documents */}
            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li className="flex items-center justify-between">
                  <span>Aadhar Card</span>
                  <button className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs">View</button>
                </li>
                <li className="flex items-center justify-between">
                  <span>PAN Card</span>
                  <button className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs">View</button>
                </li>
                <li className="flex items-center justify-between">
                  <span>GST Certificate</span>
                  <button className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs">View</button>
                </li>
                <li className="flex items-center justify-between">
                  <span>Broker License</span>
                  <button className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs">View</button>
                </li>
                <li className="flex items-center justify-between">
                  <span>Company Identification Details</span>
                  <button className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 text-xs">View</button>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


