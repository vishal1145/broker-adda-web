"use client";
import React from "react";
import { useParams } from "next/navigation";
export const dynamic = 'force-dynamic';
import blogData from "../../data/blog.json";
import furnitureData from "../../data/furnitureData.json";
import HeaderFile from '../../components/Header';
import Features from "../../components/Features";


import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const BlogDetails = () => {
  const params = useParams();
  const slug = params?.slug;
  const blog = blogData.blogDetails.find((b) => b.slug === slug);

  if (!blog) return <div className="text-center py-20">Blog not found.</div>;

  // Get the current page URL dynamically
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const title = blog.title || "Check out this amazing blog post!";

  return (
    <>
      <HeaderFile data={blogData} />
      
      {/* Hero Image */}
      <div className="flex justify-center mt-6">
        <div className="max-w-7xl w-full rounded-2xl overflow-hidden">
          <img
            src={blog.heroImage}
            alt={blog.title}
            className="w-full h-[500px] object-cover"
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-12 gap-10">
        {/* Left Share Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Share</h3>
           
            <div className="flex flex-col gap-3">
              {/* Facebook */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                title="Share on Facebook"
              >
                <FaFacebookF />
              </a>

              {/* Twitter */}
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}&hashtags=realestate,property,homes`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                title="Share on Twitter"
              >
                <FaTwitter />
              </a>

              {/* LinkedIn */}
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                title="Share on LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-7">
          {/* Tags */}
          <div className="flex gap-2 mb-6 justify-center">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-green-800 text-white text-xs font-medium px-4 py-2 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-medium text-gray-900 mb-6 text-center">
            {blog.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src={blog.authorImage}
              className="w-8 h-8 rounded-full"
              alt="Author"
            />
            <div className="text-left">
              <div className="text-sm">
                <span className="text-gray-500">Written by </span>
                <span className="text-gray-700 font-medium ">{blog.author}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {blog.date} | {blog.readTime}
              </div>
            </div>
          </div>

          {/* Introduction Paragraph with Drop Cap */}
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              <span className="float-left w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-5xl font-bold text-black mr-4 leading-none">
                {blog.introduction.dropCap}
              </span>
              {blog.introduction.firstParagraph}
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              {blog.introduction.secondParagraph}
            </p>
          </div>

          {/* Body Sections */}
          {blog.content.body.map((section, index) => (
            <div key={index} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {section.heading}
              </h2>
              
              {/* Regular text content */}
              <p className="text-gray-600 leading-relaxed mb-4">{section.text}</p>

              {/* Images if any */}
              {section.images && (
                <div className="grid grid-cols-2 gap-6 mt-6 mb-6">
                  {section.images.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={img}
                        alt="Blog Visual"
                        className="w-full h-96 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Text content after images */}
            </div>
          ))}

          {/* Also Read Section */}
          <div className="mb-10">
            <div className="bg-green-800 rounded-md p-6">
              <div className="text-yellow-400 text-sm font-medium mb-2">
                Also Read :
              </div>
              <div className="flex items-center">
                <div className="w-1 h-6 bg-yellow-400 mr-3"></div>
                <span className="text-green-100 text-lg font-medium">
                  {`"${blogData.alsoRead}"`}
                </span>
              </div>
            </div>
          </div>

          {/* Cleaning and Maintenance Tips */}
          {blog.content.cleaningTips && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {blog.content.cleaningTips.heading}
              </h2>
              
              <div className="space-y-4">
                {blog.content.cleaningTips.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 relative">
                    <div className="relative w-4 h-4 bg-green-800 rounded-full mt-2 flex-shrink-0">
                      <div className="absolute left-0 w-2 h-2 bg-yellow-400 rounded-full top-0.5"></div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Protecting Your Investment */}
          {blog.content.protectingInvestment && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {blog.content.protectingInvestment.heading}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {blog.content.protectingInvestment.text}
              </p>
            </div>
          )}

          {/* Testimonial/Quote Block */}
          {blog.content.testimonial && (
            <div className="mb-10">
              <div className="bg-yellow-500 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={blog.content.testimonial.image}
                      alt={blog.content.testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {blog.content.testimonial.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {blog.content.testimonial.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Spacer to align with paragraph content */}
          <div className="h-44"></div>
          
          {/* Filter by Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Filter by Categories</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                "Apartments", "Villas", "Commercial", "Investment", "Luxury", "Modern", 
                "Sustainable", "Smart Homes", "Location", "Rental", "Plots", "Offices"
              ].map((cat, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-sm text-gray-700 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer text-center"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Table of Content */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Property Guide Sections</h3>
            <div className="space-y-3">
              {blog.content.body.map((section, index) => (
                <div key={index} className="text-sm text-gray-600 hover:text-green-700 cursor-pointer transition-colors">
                  {section.heading}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Promo */}
          <div className="relative">
            <img
              src="/images/r5.png"
              className="w-full h-[500px] object-cover rounded-2xl"
              alt="Offer"
            />
            <div className="absolute inset-0  bg-opacity-50 rounded-2xl"></div>
            <div className="absolute bottom-4 left-28 text-white text-center">
              <p className="text-sm font-medium"> — Latest Listings</p>
              <p className="text-lg font-bold mt-1">Hot <span className="text-yellow-400">Property Deals</span></p>
              <p className="text-lg font-bold">in Your City</p>
              <a
                href="/properties"
                className="mt-3 inline-block bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-yellow-600 transition-colors"
              >
                Explore Now
              </a>
            </div>
          </div>
        </aside>
      </div>
      <Features data={furnitureData.features}/>
    </>
  );
};

export default BlogDetails;
