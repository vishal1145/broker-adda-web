"use client";
import React, { Suspense } from 'react';
import ShopHero from './Hero';
import shopData from '../data/shop.json';
import furnitureData from '../data/furnitureData.json';
import HeaderFile from '../components/Header';
import Features from '../components/Features';

const Shop = () => (
  <div>
    <HeaderFile data={shopData} />
    <Suspense fallback={<div className="flex justify-center items-center py-12">Loading...</div>}>
      <ShopHero data={shopData} />
    </Suspense>
    <Features data={furnitureData.features} />
  </div>
);

export default Shop;
