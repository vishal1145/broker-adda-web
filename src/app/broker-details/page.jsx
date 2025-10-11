import React from 'react';
import HeaderFile from '../components/Header';

export const metadata = {
  title: 'Broker Details',
};

const headerData = {
  title: 'Broker Details',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Broker Details', href: '/broker-details' }
  ]
};

export default function BrokerDetailsPage() {
  return (
    <div className="min-h-screen">
      <HeaderFile data={headerData} />
      <div className="py-10">
      <div className="w-full mx-auto">
        {/* Hero Section - Simple & Clean */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 p-6">
          <div className="flex items-center gap-4">
          <div className="relative">
                <img src="/images/user-1.webp" alt="Broker" className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-green-900 text-xs font-medium">Top Rated Broker</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Neha Mehta</h1>
              <p className="text-sm text-gray-500">Independent Real Estate Broker · Sheffield, UK</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>8+ Years Experience</span>
                <span>•</span>
                <span>156 Properties Sold</span>
                <span>•</span>
                <span>Available Today</span>
              </div>
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
                <h2 className="text-lg font-semibold text-gray-900">About Neha Mehta</h2>
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


   <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
  {/* Heading with yellow bar */}
  <div className="flex items-center gap-2 mb-4">
    <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
    <h3 className="text-base font-semibold text-gray-900">Professional Details</h3>
  </div>

  {/* Grid layout (rows of 2) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
    {/* Firm Name */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500">Firm Name</div>
        <div className="font-medium text-gray-900">Prime Homes Realty</div>
      </div>
    </div>

    {/* Website */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500">Website</div>
        <div className="font-medium text-green-700">examplebroker.com</div>
      </div>
    </div>

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


    {/* Preferred Regions */}
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
          <path d="M12 10v10M7 22h10" />
        </svg>
      </span>
      <div>
        <div className="text-gray-500 mb-2">Preferred Regions</div>
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




            {/* Similar Brokers */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <h3 className="text-base font-semibold text-gray-900">Similar Brokers</h3>
              </div>
              <div className="space-y-4">
                {[
                  {
                    name: 'Rajesh Kumar',
                    firm: 'Elite Properties',
                    experience: '6+ Years',
                    rating: '4.7',
                    specializations: ['Residential', 'Commercial'],
                    image: '/images/user-2.jpeg'
                  },
                  {
                    name: 'Priya Sharma',
                    firm: 'Dream Homes Agency',
                    experience: '5+ Years',
                    rating: '4.6',
                    specializations: ['Luxury Homes', 'Investment'],
                    image: '/images/user-3.jpeg'
                  },
                  {
                    name: 'Amit Patel',
                    firm: 'City Realty Group',
                    experience: '7+ Years',
                    rating: '4.8',
                    specializations: ['Commercial', 'Property Management'],
                    image: '/images/user-4.jpeg'
                  }
                ].map((broker, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="relative">
                      <img src={broker.image} alt={broker.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{broker.name}</h4>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{broker.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{broker.firm} • {broker.experience}</p>
                      <div className="flex flex-wrap gap-1">
                        {broker.specializations.map((spec, specIndex) => (
                          <span key={specIndex} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors">
                      View Profile
                    </button>
                  </div>
                ))}
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
              <h3 className="text-base font-semibold text-black mb-4">Additional Benefits</h3>
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
              <h3 className="text-base font-semibold text-black mb-4">Quick Contact</h3>
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
              <h3 className="text-base font-semibold text-black mb-4">Performance Summary</h3>
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
    </div>
  );
}

