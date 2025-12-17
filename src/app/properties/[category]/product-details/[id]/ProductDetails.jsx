"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import productData from '../../../../data/productDetails.json';
import RelatedProducts from '../../../../components/RelatedProducts';
import furnitureData from '../../../../data/furnitureData.json'; 
import HeaderFile from '../../../../components/Header';
import { FaStar, FaFacebookF, FaTwitter, FaPinterestP,  } from "react-icons/fa";
import Features from '../../../../components/Features';
// Local currency formatter (inlined to avoid external dependency)
const formatCurrency = (amount, { currency = 'USD', locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) => {
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(num)) return '';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num);
  } catch (e) {
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

const TABS = [
  { label: "Description" },
  { label: "Additional Information" },
  { label: "Review" },
];

const descriptionList = [
  "100% Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "Ut at nunc vel nisi gravida dictum.",
  "Donec non velit sed risus tincidunt susc  import RelatedProducts from '../../../../components/RelatedProducts';ipit.",
  "Cras laoreet lacus in dui posuere fringilla.",
];

const reviews = [
  {
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Kristin Watson",
    verified: true,
    date: "1 month ago",
    title: "Ultimate Comfort and Support - A Gamer's Dream Chair!",
    text: "I've been using this gaming chair for a few weeks now, and I have to say, it's been a game-changer for me. The comfort level is off the charts, and I no longer feel sore after long gaming sessions. Definitely worth the investment!",
    rating: 5,
    images: [
      { url: "/images/chair7.png", isVideo: true },
      { url: "/images/chair7.png", isVideo: false },
      { url: "/images/chair7.png", isVideo: false },
    ],
  },
  {
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Darlene Robertson",
    verified: true,
    date: "2 month ago",
    title: "Amazing Product, Awesome!",
    text: "As someone who spends a lot of time at my computer, having a comfortable chair is essential. This gaming chair not only meets but exceeds my expectations. It's comfortable, supportive, and looks great in my setup. 10/10 would recommend!",
    rating: 5,
    images: [],
  },
  {
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Jerome Bell",
    verified: true,
    date: "2 month ago",
    title: "Amazing Product, Awesome!",
    text: "As someone who spends a lot of time at my computer, having a comfortable chair is essential. This gaming chair not only meets but exceeds my expectations. It's comfortable, supportive, and looks great in my setup. 10/10 would recommend!",
    rating: 5,
    images: [],
  },
];

const ProductDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id, category } = params;
  
  // Get product data from URL params or search params
  const productFromState = searchParams.get('productData') ? JSON.parse(searchParams.get('productData')) : null;
  
 
  
  // Initialize wishlist from localStorage
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Dispatch custom event to notify navbar about wishlist update
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }, [wishlist]);

  const toggleHeart = (product) => {
    setWishlist((prevWishlist) => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  // Initialize cart from localStorage
  const [addCart, setAddCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(addCart));
      
      // Dispatch custom event to notify navbar about cart update
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [addCart]);

  const handleAddCart = (product) => {
    setAddCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, increase quantity by the selected quantity
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If item doesn't exist, add it with the selected quantity
        return [...prevCart, { ...product, quantity: quantity }];
      }
    });
    
    // Show success state
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2000);
    
    // Show success message (you can add a toast notification here)
  };

  // Use product from state if available, otherwise fall back to static data
  const displayProduct = {
    ...productData, // Use static data as base
    ...productFromState, // Override with actual product data
    producttitle: productFromState?.name || productFromState?.title || productData.producttitle,
    title: productFromState?.name || productFromState?.title || productData.title,
    type: productFromState?.type || productData.type,
    price: productFromState?.price || productData.price,
    oldPrice: productFromState?.oldPrice || productFromState?.originalPrice || productData.oldPrice,
    rating: productFromState?.rating || productData.rating,
    reviewCount: productFromState?.reviewCount || productData.reviewCount || 245,
    image: productFromState?.image || productData.image,
    images: productFromState?.images || [productFromState?.image || productData.image],
    description: productFromState?.description || productData.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    colors: productFromState?.colors || productData.colors || ['#8B4513', '#A0522D', '#FFFFFF', '#008080', '#0000FF'],
    sku: productFromState?.sku || productData.sku || "FRNC87654ABC",
    tags: productFromState?.tags || productData.tags || ["Furniture", "Office", productFromState?.type || "Chair"],
    inStock: productFromState?.inStock !== undefined ? productFromState.inStock : productData.inStock,
    // Handle home page specific fields
    category: productFromState?.category || productData.category,
    discount: productFromState?.discount || productData.discount,
    hasTimer: productFromState?.hasTimer || false
  };

  // Get the current page URL dynamically - MOVED AFTER displayProduct
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const productTitle = displayProduct.title || displayProduct.producttitle || 'Check out this amazing furniture!';
  const productImage = displayProduct.image || displayProduct.images?.[0] || '';
  
  
  
  const [selectedColor, setSelectedColor] = useState(displayProduct.selectedColor || '#8B4513');
  const [quantity, setQuantity] = useState(displayProduct.quantity || 1);
  const [selectedImage, setSelectedImage] = useState(displayProduct.images?.[0] || displayProduct.image);
  const [activeTab, setActiveTab] = useState(0);
  const [cartSuccess, setCartSuccess] = useState(false);

  return (
    <>
      <HeaderFile data={displayProduct} />
      {/* Property Details Layout - matches reference design */}
      <div className="bg-white flex items-start justify-center py-8 px-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Main Content */}
          <section className="md:col-span-8 space-y-5">
            {/* Header row: title/location + actions */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">{displayProduct.producttitle || displayProduct.title}</h1>
                <div className="text-xs text-gray-500 mt-1">Sheffield, UK · Grader Home</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>
                  Share
                </button>
                <button className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                  Save
                </button>
              </div>
            </div>

            {/* Gallery - large left image with two stacked on right */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8 bg-gray-50 rounded-xl overflow-hidden relative">
                <img src={selectedImage || displayProduct.images?.[0] || displayProduct.image || ''} alt={displayProduct.title || 'Property image'} className="w-full h-[360px] md:h-[420px] object-cover" />
              </div>
              <div className="col-span-4 flex flex-col gap-3">
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <img src={displayProduct.images?.[1] || displayProduct.image || ''} alt="secondary" className="w-full h-[175px] md:h-[204px] object-cover" />
                </div>
                <div className="bg-gray-50 rounded-xl overflow-hidden relative">
                  <img src={displayProduct.images?.[2] || displayProduct.image || ''} alt="secondary" className="w-full h-[175px] md:h-[204px] object-cover" />
                  <button className="absolute bottom-3 right-3 bg-white/90 text-gray-700 text-xs px-3 py-1 rounded-md shadow">Show all</button>
                </div>
              </div>
            </div>

            {/* Summary (no card) */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">Summary</div>
              <p className="text-sm text-gray-600 leading-6 mb-4">
                {displayProduct.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="7" rx="1"/><path d="M7 10V7a2 2 0 012-2h6a2 2 0 012 2v3"/></svg>
                  </span>
                  <span>Median price</span>
                </div>
                <div className="font-semibold text-gray-900">5 beds</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                  </span>
                  <span>Weekly median price</span>
                </div>
                <div className="font-semibold text-gray-900">$500</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                  </span>
                  <span>Vacancy rate</span>
                </div>
                <div className="font-semibold text-gray-900">0.6%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                  </span>
                  <span>Listed</span>
                </div>
                <div className="font-semibold text-gray-900">0.7%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                  <span>Minimum stay</span>
                </div>
                <div className="font-semibold text-gray-900">1 night</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>
                  </span>
                  <span>Property size</span>
                </div>
                <div className="font-semibold text-gray-900">2,500 sq. ft / 224 sq. meters</div>
              </div>
              </div>
              <button className="text-green-700 text-xs font-semibold mt-4">Learn more about plan sets in our FAQs</button>
            </div>
          </section>

          {/* Right Sidebar - Rating + Agent + Inspection */}
          <aside className="md:col-span-4 space-y-5">
            {/* Rating and reviews */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-green-100 p-5">
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded-full border border-gray-400"></span>
                  Rating and reviews
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-semibold text-gray-900">4.0</div>
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <FaStar key={i} className="text-gray-900" />
                      ))}
                      <FaStar className="text-gray-300" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">Based on 100 reviewers</div>
                </div>
                {/* Three rating rows with values on the right */}
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-900">
                      <span>Comfortable</span>
                      <span>4.7</span>
                    </div>
                    <div className="mt-1 h-2 bg-white/70 rounded-full">
                      <div className="h-2 bg-green-600 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-900">
                      <span>Cleanliness</span>
                      <span>4.8</span>
                    </div>
                    <div className="mt-1 h-2 bg-white/70 rounded-full">
                      <div className="h-2 bg-green-600 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-900">
                      <span>Facilities</span>
                      <span>4.5</span>
                    </div>
                    <div className="mt-1 h-2 bg-white/70 rounded-full">
                      <div className="h-2 bg-green-600 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 pt-5">
                <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </span>
                <div className="text-sm font-semibold text-gray-900">Agent details</div>
              </div>
              <div className="px-5 pb-5 pt-4 flex flex-col items-center text-center gap-2">
                <img src="/images/user-1.webp" alt="Agent" className="w-14 h-14 rounded-full object-cover" />
                <div className="font-semibold text-gray-900">Melissa Joyne Alle</div>
                <div className="text-xs text-gray-500">2024 Royal In. Melissa, Sheffield, UK</div>
                <button className="w-full mt-3 bg-green-200 hover:bg-green-300 text-gray-900 py-2 rounded-lg font-medium">Contact Agent</button>
              </div>
            </div>

            {/* Inspection times */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 pt-5">
                <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </span>
                <div className="text-sm font-semibold text-gray-900">Inspection times</div>
              </div>
              <div className="px-5 pb-5 pt-4">
                {/* Optional person/agent image like reference */}
                <div className="flex flex-col items-center text-center">
                  <img src="/images/user-1.webp" alt="Inspector" className="w-12 h-12 rounded-full object-cover" />
                </div>
                <ul className="mt-4 text-sm text-gray-700 space-y-2">
                  <li className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span>Sat</span>
                    <span className="text-gray-500">10:00 AM - 11:00 AM</span>
                  </li>
                  <li className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span>Sun</span>
                    <span className="text-gray-500">02:00 PM - 03:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Product Tabs Section */}
      <div className=" mx-auto  bg-white rounded-xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 justify-center">
          {TABS.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 text-lg font-medium focus:outline-none transition
                ${activeTab === idx
                  ? "text-green-900 border-b-4 border-green-900"
                  : "text-gray-400 border-b-4 border-transparent hover:text-green-900"}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-6 justify-center">
          {activeTab === 0 && (
            <>
              <p className="text-gray-700 mb-4 ">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-gray-700 mb-4">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
              <ul className="space-y-2 mt-4">
                {descriptionList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    {/* Custom yellow/green dot */}
                    <span className="w-5 h-5 flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-green-900"></span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
          {activeTab === 1 && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-200 rounded-2xl overflow-hidden">
                <thead>
                  <tr>
                    <th className="bg-yellow-500 text-left px-6 py-3 text-base font-semibold rounded-tl-2xl">
                      Feature
                    </th>
                    <th className="bg-yellow-500 text-left px-6 py-3 text-base font-semibold rounded-tr-2xl">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-6 py-3 border-t border-gray-200">Seat Material</td>
                    <td className="px-6 py-3 border-t border-gray-200">Leather</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 border-t border-gray-200">Color</td>
                    <td className="px-6 py-3 border-t border-gray-200">Black, Brown, Grey, Green, Blue</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-3 border-t border-gray-200">Item Weight</td>
                    <td className="px-6 py-3 border-t border-gray-200">25 Kilograms</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 border-t border-gray-200">Dimensions</td>
                    <td className="px-6 py-3 border-t border-gray-200">21"D x 21"W x 48"H</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-3 border-t border-b border-gray-200 rounded-bl-2xl">Brand</td>
                    <td className="px-6 py-3 border-t border-b border-gray-200 rounded-br-2xl">KD Design</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 2 && (
            <div className="pt-2">
              {/* Rating Summary */}
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8">
                {/* Left: Average Rating */}
                <div className="flex flex-col items-center md:w-1/3 w-full">
                  <span className="text-5xl font-bold text-gray-900">4.9</span>
                  <span className="text-gray-500 text-lg">out of 5</span>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-xl" />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm mt-1">(245 Review)</span>
                </div>
                {/* Right: Bar Chart */}
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map((star, idx) => {
                    // Dummy data for bar lengths
                    const barPercents = [90, 60, 25, 10, 5];
                    return (
                      <div key={star} className="flex items-center gap-2 mb-2">
                        <span className="w-12 text-gray-700 text-sm">{star} Star</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-yellow-500 rounded-full"
                            style={{ width: `${barPercents[idx]}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review List Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <div>
                  <span className="font-semibold text-gray-900">Review List</span>
                  <div className="text-gray-500 text-sm mt-1">Showing 1-4 of 24 results</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm">Sort by :</span>
                  <select className="border bg-white rounded-full px-3 py-1 text-sm">
                    <option>Newest</option>
                    <option>Oldest</option>
                    <option>Highest</option>
                    <option>Lowest</option>
                  </select>
                </div>
              </div>

              {/* Review List */}
              {reviews.map((review, idx) => (
                <div key={idx} className="py-8 border-b">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-gray-900">{review.name}</span>
                          {review.verified && (
                            <span className="text-gray-500 text-xs mt-1">(Verified)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm min-w-max mt-2 md:mt-0">{review.date}</div>
                  </div>
                  {(review.title || review.text) && (
                    <div className="mt-3">
                      {review.title && (
                        <div className="font-semibold text-gray-900 text-base mb-1">
                          {review.title}
                        </div>
                      )}
                      {review.text && (
                        <div className="text-gray-700 mb-2">
                          {review.text}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <FaStar key={i} className="text-yellow-400 text-base" />
                          ))}
                        </div>
                        <span className="text-gray-900 font-semibold text-base">{review.rating}.0</span>
                      </div>
                      {/* Attached Images/Video */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-6 mt-4">
                          {review.images.map((img, i) => (
                            <div
                              key={img.url}
                              className="relative bg-gray-50 rounded-xl flex items-center justify-center w-32 h-32"
                            >
                              <img
                                src={img.url}
                                alt={`Review product ${i + 1}`}
                                className="object-contain w-24 h-24"
                              />
                              {img.isVideo && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  {/* Play icon */}
                                  <svg
                                    className="w-10 h-10 text-white bg-black bg-opacity-50 rounded-full p-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.4" />
                                    <polygon points="10,8 16,12 10,16" fill="#fff" />
                                  </svg>
                                </span>
                              )}
                            </div>
                       
                          ))}
                        </div>
                      )}

                      
                    </div>
                  )}
                </div>
              ))}

              {/* Add your review section */}
              <div className="bg-white rounded-xl shadow-sm mt-10 max-w-7xl mx-auto ">
                <h3 className="text-2xl font-semibold text-gray-900 mb-1">Add your review</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Your email address will not be published. Required fields are marked<span className="text-red-500">*</span>
                </p>
                <form className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <label className="block text-gray-900 font-medium mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex. John Doe"
                        className="w-full border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-900 transition text-base"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-900 font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="example@gmail.com"
                        className="w-full border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-900 transition text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-900 font-medium mb-2">
                      Your Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-2xl">★</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-900 font-medium mb-2">
                      Add Review Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Write Title here"
                      className="w-full border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-900 transition text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-medium mb-2">
                      Add Detailed Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Write here"
                      rows={4}
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-900 transition resize-none text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-medium mb-2">
                      Photo / Video <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div
                      className="w-full border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-10 cursor-pointer transition hover:border-green-900"
                      style={{ minHeight: 120 }}
                    >
                      <span className="text-4xl mb-2 text-gray-400">
                        {/* Simple image+ icon SVG */}
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="8.5" cy="12.5" r="1.5" fill="currentColor" opacity="0.2" />
                          <path d="M21 15l-5-5-4 4-2-2-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M16 7.5v3m1.5-1.5h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <span className="text-gray-500 text-base">Drag a Photo or Video</span>
                      <label className="text-green-900 font-semibold cursor-pointer mt-1">
                        <span>Browse</span>
                        <input type="file" className="hidden" multiple />
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-full font-semibold text-base shadow transition"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
        
      </div>
 <RelatedProducts />
 <Features data={furnitureData.features}/>
    </>
  );
};

export default ProductDetails;


