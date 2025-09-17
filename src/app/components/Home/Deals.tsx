"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Local currency formatter (inlined to avoid external dependency)
const formatCurrency = (
  amount: number | string,
  options: { currency?: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
) => {
  const { currency = 'USD', locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(num)) return '';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num);
  } catch {
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

interface DealItem {
  type: string;
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  image: string;
  description: string;
  reviewCount?: number;
  images?: string[];
  colors?: string[];
  sku?: string;
  tags?: string[];
  inStock?: boolean;
}

interface DealsData {
  subtitle: string;
  title: string;
  description: string;
  items: DealItem[];
}

const Deals = ({ data = { subtitle: '', title: '', description: '', items: [] } }: { data: DealsData }) => {
  const router = useRouter();
  
  // Initialize wishlist from localStorage
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  // Initialize cart from localStorage
  const [addCart, setAddCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }, [wishlist]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(addCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [addCart]);

  const toggleHeart = (deal: DealItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    setWishlist((prevWishlist: DealItem[]) => {
      const isInWishlist = prevWishlist.some(item => item.id === deal.id);
      if (isInWishlist) {
        return prevWishlist.filter(item => item.id !== deal.id);
      } else {
        return [...prevWishlist, deal];
      }
    });
  };

  const handleAddCart = (deal: DealItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking cart
    setAddCart((prevCart: (DealItem & { quantity: number })[]) => {
      const existingItem = prevCart.find(item => item.id === deal.id);
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map(item =>
          item.id === deal.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevCart, { ...deal, quantity: 1 }];
      }
    });
    
    // Show success message (you can add a toast notification here)
    console.log(`Added ${deal.name} to cart`);
  };

  const openProductDetails = (item: DealItem) => {
    // Transform the product data to match what ProductDetails expects
    const transformedProduct = {
      id: item.id,
      name: item.name,
      title: item.name,
      producttitle: item.name,
      type: item.type || item.category,
      price: item.price,
      oldPrice: item.originalPrice,
      rating: item.rating,
      reviewCount: item.reviewCount || 245,
      image: item.image,
      images: item.images || [item.image],
      description: item.description || "Premium quality furniture designed for comfort and style.",
      colors: item.colors || ['#8B4513', '#A0522D', '#FFFFFF'],
      sku: item.sku || `FRNC${item.id}ABC`,
      tags: item.tags || ["Furniture", item.type || item.category || "Chair"],
      inStock: item.inStock !== undefined ? item.inStock : true,
      category: item.category,
      discount: item.discount
    };

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProduct', JSON.stringify(transformedProduct));
    }

    // Use the correct Next.js App Router path
    const category = (item.type || item.category || 'chair').toLowerCase();
    const productDataParam = encodeURIComponent(JSON.stringify(transformedProduct));
    router.push(`/shop/${category}/product-details/${item.id}?productData=${productDataParam}`);
  };

  return (
    <section className="px-6 sm:px-12 lg:px-32 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-2  text-left">
          <h2 className="text-3xl font-medium ">
            <span className="text-gray-900 text-xl ">  <span className="text-yellow-500">—</span>{data.subtitle}</span><br />
            <span className="text-green-900 text-4xl font-medium">{(data.title || '').split(' ')[0]}</span> {(data.title || '').split(' ').slice(1).join(' ')}
          </h2>
          <p className="max-w-md text-sm text-gray-500">
            {data.description}
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data.items || []).map((deal) => (
            <div key={deal.id} className="flex rounded-2xl overflow-hidden border shadow-sm w-full max-w-lg bg-white h-80">
              {/* LEFT SIDE - Image */}
              <div className="relative w-1/2 h-full">
                {/* Discount Badge */}
                <span className="absolute top-2 left-2 bg-green-900 text-white text-xs font-semibold px-2 py-1 rounded-xl z-20">
                  {deal.discount}
                </span>

                {/* Icons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
                  {/* Wishlist Button */}
                  <button 
                    className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                    onClick={(e) => toggleHeart(deal, e)}
                    title={wishlist.some((item: DealItem) => item.id === deal.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <i className={`${wishlist.some((item: DealItem) => item.id === deal.id) ? "fas" : "far"} fa-heart text-sm transition-all duration-300 ${wishlist.some((item: DealItem) => item.id === deal.id) ? 'text-red-500' : 'text-gray-500'}`}></i>
                  </button>
                  
                  {/* Quick View Button */}
                  <button 
                    className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProductDetails(deal);
                    }}
                    title="Quick view"
                  >
                    <i className="fas fa-expand text-sm text-gray-500"></i>
                  </button>
                  
                  {/* Add to Cart Button */}
                  <button 
                    className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                    onClick={(e) => handleAddCart(deal, e)}
                    title="Add to cart"
                  >
                    <i className="fas fa-shopping-bag text-sm text-gray-500"></i>
                  </button>
                </div>

                {/* Product Image - Full half card */}
                <div className="w-full h-full bg-gray-50 flex justify-center items-center">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* RIGHT SIDE - Text */}
              <div className="w-1/2 px-3 py-6 flex flex-col justify-between text-left">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{deal.category}</p>
                  <h3 className="text-base font-semibold text-gray-900 truncate max-w-full">{deal.name}</h3>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-900 font-semibold text-base">{formatCurrency(deal.price)}</span>
                    <span className="line-through text-gray-400 text-base">{formatCurrency(deal.originalPrice)}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-yellow-500 text-base">★</span>
                    <span className="text-gray-900 text-base font-medium">{deal.rating}</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {deal.description}
                  </p>
                </div>

                <button 
                  onClick={() => openProductDetails(deal)}
                  className="text-green-900 text-sm font-medium flex items-center gap-1 hover:underline "
                >
                  Shop Now <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Deals; 