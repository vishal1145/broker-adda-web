import React from 'react';

export const metadata = {
  title: 'Broker Details',
};

export default function BrokerDetailsPage() {
  return (
    <div className="min-h-screen py-10">
      <div className="w-full mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm mb-8 border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 via-white to-transparent" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/images/user-1.webp" alt="Broker" className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow" />
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-yellow-100 text-green-900 text-xs font-medium">Top Rated Broker</div>
                <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">Neha Mehta</h1>
                <p className="text-sm text-gray-500">Independent Real Estate Broker · Sheffield, UK</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2.5 rounded-full bg-green-900 hover:bg-green-800 text-white shadow-sm">Contact Broker</button>
              <button className="px-4 py-2.5 rounded-full border border-yellow-500 text-green-900 bg-white hover:bg-yellow-50">Schedule Meeting</button>
            </div>
          </div>
        </div>

        {/* Main Content Grid - 9 columns left, 3 columns right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left - All Broker Information (9 columns) */}
          <div className="lg:col-span-9 space-y-10">
            {/* About & Overview */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                <h2 className="text-lg font-semibold text-green-900">About Neha Mehta</h2>
              </div>
              <p className="text-sm text-gray-600 leading-7 mb-6">
                With over 8 years of experience in residential and commercial real estate, Neha specializes in matching clients with the right properties and maximizing returns for investors. Her consultative approach focuses on long-term relationships and market insight, making her one of the most trusted brokers in Sheffield.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <div className="text-2xl font-bold text-green-700">156</div>
                  <div className="text-sm text-gray-600">Properties Sold</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">4.8</div>
                  <div className="text-sm text-gray-600">Client Rating</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <div className="text-2xl font-bold text-purple-700">8+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white shadow-sm">
                  <div className="text-2xl font-bold text-orange-700">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-green-900">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Full Name</div>
                    <div className="font-medium text-gray-900">Neha Mehta</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 12 19.79 19.79 0 0 1 0 3.18 2 2 0 0 1 2 1h4.09a2 2 0 0 1 2 1.72c.12.9.3 1.78.54 2.63a2 2 0 0 1-.45 2.11L7 8a16 16 0 0 0 6 6l.54-.62a2 2 0 0 1 2.11-.45c.85.24 1.73.42 2.63.54A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium text-gray-900">+1 544 000 123</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8"/><path d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">neha.mehta@example.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Firm Name</div>
                    <div className="font-medium text-gray-900">Prime Homes Realty</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Office Address</div>
                    <div className="font-medium text-gray-900">221B High St, Sheffield</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" /></svg>
                  </span>
                  <div>
                    <div className="text-gray-500">Website</div>
                    <div className="font-medium text-green-700">examplebroker.com</div>
                  </div>
                </div>
              </div>
            </section>

   <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
  {/* Heading with yellow bar */}
  <div className="flex items-center gap-2 mb-4">
    <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
    <h3 className="text-base font-semibold text-green-900">Professional Details</h3>
  </div>

  {/* Grid layout (rows of 2) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
    {/* License Number */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l4 4-4 4-4-4 4-4z" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500">License Number</div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">UK-BRK-2025-00123</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 font-medium">
            Verified
          </span>
        </div>
      </div>
    </div>

    {/* WhatsApp Number */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92V21a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12 19.79 19.79 0 010 3.18 2 2 0 012 1h4.09a2 2 0 012 1.72c.12.9.3 1.78.54 2.63a2 2 0 01-.45 2.11L7 8a16 16 0 006 6l.54-.62a2 2 0 012.11-.45c.85.24 1.73.42 2.63.54A2 2 0 0122 16.92z" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500">WhatsApp Number</div>
        <div className="font-medium text-gray-900">+1 544 000 123</div>
      </div>
    </div>

    {/* Gender */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500">Gender</div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">Female</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
            Verified ID
          </span>
        </div>
      </div>
    </div>

    {/* Preferred Regions */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
          <path d="M12 10v10M7 22h10" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500">Preferred Regions</div>
        <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-800 text-xs border border-green-200">
          Sheffield Central, Hillsborough, Crookes
        </span>
      </div>
    </div>

    {/* Specializations (Full Width Row) */}
    <div className="sm:col-span-2 flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6v12m6-6H6" />
        </svg>
      </span>
      <div className="flex-1">
        <div className="text-gray-500 mb-2">Specializations</div>
        <div className="flex flex-wrap gap-2">
          {['Luxury Homes', 'Investment Properties', 'Commercial Real Estate', 'Property Management'].map(
            (tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-800 text-xs border border-gray-200"
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  </div>
</section>




            {/* Documents - moved to left column */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-green-900">Documents</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { name: 'Aadhar Card', verified: true },
                  { name: 'PAN Card', verified: true },
                  { name: 'GST Certificate', verified: true },
                  { name: 'Broker License', verified: true },
                  { name: 'Company Identification', verified: true },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      {doc.verified && (
                        <div className="mt-1 inline-flex items-center gap-2 text-xs text-emerald-600">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-50">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                          Verified
                        </div>
                      )}
                    </div>
                    <button className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1.5 text-xs font-medium hover:bg-emerald-200">
                      View
                    </button>
                  </div>
                ))}
            </div>
            </section>

            {/* Social Media */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-green-900">Social Media & Online Presence</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">LinkedIn</div>
                    <div className="text-xs text-gray-500">linkedin.com/in/nehamehta</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </div>
                <div>
                    <div className="text-sm font-medium text-gray-900">Twitter</div>
                    <div className="text-xs text-gray-500">@neha.mehta</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-900">Instagram</div>
                    <div className="text-xs text-gray-500">@neha.mehta</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right - Lead Generation Support (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lead Generation Support */}
            <div className="bg-gradient-to-br from-green-900 to-green-900 rounded-2xl p-6 text-white border border-yellow-500">
              <h3 className="text-lg font-semibold mb-4">Lead Generation Support</h3>
              <p className="text-green-100 mb-6 text-sm">
                Join our exclusive broker network and get access to premium lead generation tools and support.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Verified Leads</div>
                    <div className="text-xs text-green-100">Pre-qualified prospects ready to buy</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Exclusive Training</div>
                    <div className="text-xs text-green-100">Advanced sales techniques & market insights</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Higher Commissions</div>
                    <div className="text-xs text-green-100">Up to 15% more than standard rates</div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 px-4 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Join Our Network
              </button>
            </div>

            

            {/* Additional Benefits */}
            <div className="bg-white rounded-2xl border border-yellow-500/40 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-green-900 mb-4">Additional Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">24/7 Support Team</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Marketing Materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">CRM Integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Lead Analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Priority Listing</span>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white rounded-2xl border border-yellow-500/40 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-green-900 mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">
                  Send Message
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
                  Schedule Call
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
                  Share Profile
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-2xl border border-yellow-500/40 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-green-900 mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">4.8</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Closed Deals</span>
                  <span className="font-semibold text-gray-900">126</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold text-gray-900">&lt; 2 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Client Retention</span>
                  <span className="font-semibold text-gray-900">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

