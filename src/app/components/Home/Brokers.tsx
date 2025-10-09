'use client';

import React from 'react';
import Link from 'next/link';


const Brokers = () => {


  return (
    <>
   

<section id="popular-brokers" className="relative py-16   ">
  <div className="w-full mx-auto ">
    <div className="mb-10 text-center">
      <div className="flex items-center justify-center gap-2 text-sm ">
        <p className="text-xl text-gray-900">
            <span className="text-yellow-500">—</span> Our Brokers
          </p>
        </div>
      <h2 className="mt-2 text-4xl font-medium text-gray-900">
        Our <span className="text-green-900">Popular Brokers</span>
        </h2>
      {/* CTA: View All Brokers under header */}
      {/* <div className="mt-6">
        <Link href="/search" className="inline-flex items-center gap-3 rounded-full bg-green-900 px-6 py-3 text-white text-sm font-semibold shadow-sm hover:bg-green-800">
        View All Brokers
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div> */}
    </div>

    <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Residential Expert" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between ">
            <Link href="/broker-details" className="flex items-center gap-2 group/name" title="View details">
              <h3 className="text-lg font-semibold text-gray-900 group-hover/name:text-gray-900" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>Ravi Kumar</h3>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-700 group-hover/name:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </Link>
            <button className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" title="Chat">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </button>
          </div>

          <p className=" text-[13px] leading-5 text-gray-600 group-hover:text-gray-900">Residential Specialist</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Delhi NCR
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              120+ leads
            </span>
          </div>

          
        </div>
      </article>

      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Luxury Homes Advisor" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between ">
            <Link href="/broker-details" className="flex items-center gap-2 group/name" title="View details">
              <h3 className="text-lg font-semibold text-gray-900 group-hover/name:text-gray-900" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>Priya Shah</h3>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-700 group-hover/name:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </Link>
            <button className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" title="Chat">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </button>
          </div>
          <p className=" text-[13px] leading-5 text-gray-600 group-hover:text-gray-900">Luxury Homes Advisor</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Mumbai
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              95+ leads
            </span>
          </div>
          
        </div>
      </article>

      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Commercial Specialist" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300 opacity-95" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between ">
            <Link href="/broker-details" className="flex items-center gap-2 group/name" title="View details">
              <h3 className="text-lg font-semibold  text-gray-900 group-hover/name:text-gray-900" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>Aditi Verma</h3>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-700 group-hover/name:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </Link>
            <button className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" title="Chat">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </button>
          </div>
          <p className=" text-[13px] leading-5 text-gray-600 group-hover:text-gray-900">Commercial Specialist</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Bengaluru
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2.5 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              110+ leads
            </span>
          </div>
          
        </div>
      </article>

      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Land & Plots Consultant" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300 opacity-95" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between ">
            <Link href="/broker-details" className="flex items-center gap-2 group/name" title="View details">
              <h3 className="text-lg font-semibold text-gray-900 group-hover/name:text-gray-900" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>Sandeep Mehra</h3>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-700 group-hover/name:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </Link>
            <button className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" title="Chat">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </button>
          </div>
          <p className=" text-[13px] leading-5 text-gray-600 group-hover:text-gray-900">Land & Plots Consultant</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Pune
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2.5 py-1 group-hover:bg-white group-hover:text-gray-900">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              70+ leads
            </span>
          </div>
          
        </div>
      </article>

    </div>
   
  </div>

  <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(300px_200px_at_20%_20%,black,transparent)]">
    <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl"></div>
  </div>
</section>

{/* Advisory CTA */}
<section className="pb-12">
  <div className="max-w-5xl mx-auto text-center rounded-2xl bg-white p-8 border border-gray-100">
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Join India's Premier Broker Network</h3>
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-gray-700">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10l9-6 9 6-9 6-9-6z"/>
            <path d="M3 14l9 6 9-6"/>
          </svg>
        </span>
        <span>Lead generation support</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </span>
        <span>Verified leads</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14v7"/>
            <path d="M5 10.5v7"/>
            <path d="M19 10.5v7"/>
          </svg>
        </span>
        <span>Exclusive training</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17l6-6 4 4 7-7"/>
            <path d="M14 7h7v7"/>
          </svg>
        </span>
        <span>Higher commissions</span>
      </div>
    </div>
    <div className="mt-6 flex items-center justify-center gap-3">
      <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-green-700 px-6 py-2 text-white text-sm font-semibold shadow-sm">Become a Broker
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>
      <Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">View All Brokers
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>
    </div>
  </div>
</section>
    </>
  );
};

export default Brokers;
