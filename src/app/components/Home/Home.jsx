import React from 'react';
import Hero from './Hero';
import Testimonials from './Testimonials';
import furnitureData from "../../data/furnitureData.json";
import Navbar from '../Navbar';
import Features from '../Features';
import Products from './Products'
import Categories from './Categories';
import FlashSale from './FlashSale';
import Deals from './Deals'
import Promotions from './Promotions';
import Blogs from './Blogs';
import Instagram from './Instagram'
import FAQ from './FAQ'
import Newsletter from './Newsletter'
import Footer from '../Footer';
// import other components as needed

const Home = () => {
  // You may need to import or define the data for Hero and Testimonials here
  return (
    <div>
      <Navbar data={furnitureData.navigation}/>
      <Hero data={furnitureData.hero} />
      <Features data={furnitureData.features}/>
      <Categories data={furnitureData.categories}/>
       <Products data={furnitureData.products}/>
        <FlashSale data={furnitureData.flashSale}/>
        <Deals data={furnitureData.deals}/>A
        <Promotions data={furnitureData.promotions}/>
      <Testimonials data={furnitureData.testimonials} />
      <Blogs data={furnitureData.blogs}/>
      <Instagram data={furnitureData.instagram}/>
      <FAQ data={furnitureData.faq}/>
      <Newsletter data={furnitureData.newsletter}/>
      <Footer data={furnitureData.footer}/>

      {/* Add other components here */}
    </div>
  );
};

export default Home; 