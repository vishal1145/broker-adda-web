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
import furnitureData from './data/furnitureData.json';

// Use a narrow, file-local lint override to allow bridging JSON to component props
const data = furnitureData as any;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Top hero/banner */}
      <Hero data={data.hero} />

      {/* Features section */}
      <Features data={data.features} />

      {/* Category tiles / collections */}
      <Categories data={data.categories} />

      {/* Deals strip / badges */}
      <Deals data={data.deals} />

      {/* Flash sale / limited-time offers */}
      <FlashSale data={data.flashSale} />

      {/* Choose ONE of the product sections you actually use */}
      <Products data={data.products} />
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
