/**
 * Home page (Next.js App Router)
 * Put this file at: src/app/page.jsx
 * Make sure these components exist at: src/app/components/Home/*
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Hero from './components/Home/Hero';
import Features from './components/Features';
import Categories from './components/Home/Categories';
import Deals from './components/Home/Deals';
import FlashSale from './components/Home/FlashSale';
import Products from './components/Home/Products';
import Promotions from './components/Home/Promotions';
import Testimonials from './components/Home/Testimonials';
import Blogs from './components/Home/Blogs';
import Instagram from './components/Home/Instagram';
import FAQ from './components/Home/FAQ';
import Newsletter from './components/Home/Newsletter';
import Leads from './components/Home/Brokers';
import furnitureData from './data/furnitureData.json';
import LatestLeads from '@/app/components/Home/LatestLeads';

// Type assertion to help TypeScript understand the data structure
const data = furnitureData as any;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Top hero/banner */}
      <Hero data={data.hero} />

      {/* Features section */}
      <Features data={data.features} />

      {/* Leads section */}
      <Leads />
<LatestLeads />
      {/* Category tiles / collections */}
      {/* <Categories data={data.categories} /> */}

      {/* Choose ONE of the product sections you actually use */}
      <Products data={data.products} />

      {/* Deals strip / badges */}
      {/* <Deals data={data.deals} /> */}

      {/* Flash sale / limited-time offers */}
      <FlashSale data={data.flashSale} />

      
      {/* <ProductGrid /> */}

      {/* Promo banners / CTAs */}
      <Promotions data={data.promotions} />

      {/* Social proof */}
      <Testimonials data={data.testimonials} />

      {/* Content / blog */}
      <Blogs data={data.blogs} />

      {/* Instagram gallery / UGC */}
      <Instagram data={data.instagram} />

      {/* FAQs */}
      <FAQ data={data.faq} />

      {/* Newsletter signup */}
      <Newsletter data={data.newsletter} />
    </div>
  );
}
