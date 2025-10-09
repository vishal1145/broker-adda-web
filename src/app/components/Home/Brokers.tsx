'use client';

import React from 'react';
import Link from 'next/link';


const Brokers = () => {


  return (
    <>
   

<section id="popular-brokers" className="relative py-16 bg-white">
  <div className="w-full mx-auto ">
    <div className="mb-10 flex items-start justify-between gap-4">
      <div className="text-left">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
          <span>Our Network</span>
        </div>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
          <span className="">Popular</span>
          <span className="pl-2 text-green-900">Brokers</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-600">Meet trusted property experts across major Indian cities. Verified profiles, transparent ratings, and quick connect.</p>
      </div>
      <a href="/brokers" className="whitespace-nowrap inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-2 text-white text-sm font-semibold shadow-sm ">
        View All Brokers
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>
    </div>

    <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Residential Expert" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ravi Kumar</h3>
            <div className="flex items-center gap-1" aria-label="Rating 4.8 out of 5">
              <svg className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 13.348a1 1 0 00-1.175 0L6.685 16.283c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.05 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1-3.294z"/></svg>
              <span className="text-sm font-medium text-gray-800">4.8</span>
            </div>
          </div>

          <p className="mt-1 text-sm text-gray-600">Residential Specialist • 8 yrs</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Delhi NCR
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              120+ deals
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <a href="#" className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40">Contact</a>
            <Link href="/broker-details" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">View Profile</Link>
          </div>
        </div>
      </article>

      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Luxury Homes Advisor" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Priya Shah</h3>
            <div className="flex items-center gap-1" aria-label="Rating 4.9 out of 5">
              <svg className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 13.348a1 1 0 00-1.175 0L6.685 16.283c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.05 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1-3.294z"/></svg>
              <span className="text-sm font-medium text-gray-800">4.9</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">Luxury Homes Advisor • 10 yrs</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Mumbai
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              95+ deals
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <a href="#" className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40">Contact</a>
            <Link href="/broker-details" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">View Profile</Link>
          </div>
        </div>
      </article>

      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Commercial Specialist" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold  text-gray-900">Aditi Verma</h3>
            <div className="flex items-center gap-1" aria-label="Rating 4.7 out of 5">
              <svg className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 13.348a1 1 0 00-1.175 0L6.685 16.283c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.05 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1-3.294z"/></svg>
              <span className="text-sm font-medium text-gray-800">4.7</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">Commercial Specialist • 7 yrs</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Bengaluru
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              110+ deals
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <a href="#" className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40">Contact</a>
            <Link href="/broker-details" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">View Profile</Link>
          </div>
        </div>
      </article>

      <article className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop" alt="Broker portrait - Land & Plots Consultant" className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Sandeep Mehra</h3>
            <div className="flex items-center gap-1" aria-label="Rating 4.6 out of 5">
              <svg className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 13.348a1 1 0 00-1.175 0L6.685 16.283c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.05 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1-3.294z"/></svg>
              <span className="text-sm font-medium text-gray-800">4.6</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">Land & Plots Consultant • 6 yrs</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
              Pune
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-2.5 py-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
              70+ deals
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <a href="#" className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40">Contact</a>
            <Link href="/broker-details" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">View Profile</Link>
          </div>
        </div>
      </article>

    </div>

   
  </div>

  <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(300px_200px_at_20%_20%,black,transparent)]">
    <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl"></div>
  </div>
</section>




    </>
  );
};

export default Brokers;
