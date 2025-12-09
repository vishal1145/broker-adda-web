"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import relatedProducts from "../data/relatedProduct.json";

// Local currency formatter (inlined to avoid external dependency)
const formatCurrency = (amount, options = {}) => {
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

export default function RelatedProduct() {
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

  const toggleHeart = (product, e) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    setWishlist((prevWishlist) => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  const handleAddCart = (product, e) => {
    e.stopPropagation(); // Prevent card click when clicking cart
    setAddCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    
    // Show success message (you can add a toast notification here)
   // console.log(`Added ${product.name} to cart`);
  };

  const handleCardClick = (product) => {
   // console.log('Card clicked for product:', product);
    
    // Transform the product data to match what ProductDetails expects
    const transformedProduct = {
      id: product.id,
      name: product.name,
      title: product.name,
      producttitle: product.name,
      type: product.type,
      price: product.price,
      oldPrice: product.oldPrice || product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount || 245,
      image: product.image,
      images: product.images || [product.image],
      description: product.description || "Premium quality furniture designed for comfort and style.",
      colors: product.colors || ['#8B4513', '#A0522D', '#FFFFFF'],
      sku: product.sku || `FRNC${product.id}ABC`,
      tags: product.tags || ["Furniture", product.type || "Chair"],
      inStock: product.inStock !== undefined ? product.inStock : true,
      category: product.category,
      discount: product.discount
    };

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentProduct', JSON.stringify(transformedProduct));
    }
    
   // console.log('Transformed product:', transformedProduct);
   // console.log('Navigating to:', `/shop/${product.type?.toLowerCase()}/product-details/${product.id}`);
    
    try {
      const productDataParam = encodeURIComponent(JSON.stringify(transformedProduct));
      router.push(`/properties/${product.type?.toLowerCase()}/product-details/${product.id}?productData=${productDataParam}`);
     // console.log('Navigation successful');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  return (
    <div className="py-14">
      {/* Section Title */}
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-center mb-10">
          <p className="text-xl text-gray-900 mb-2">
            <span className="text-yellow-500">—</span> Related Products
          </p>
          <h2 className="text-4xl font-medium text-gray-900">
            Explore <span className="text-green-900">Related Products</span>
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto ">
          {relatedProducts.map((product) => {
            const transformedProduct = {
              id: product.id,
              name: product.name,
              title: product.name,
              producttitle: product.name,
              type: product.type,
              price: product.price,
              oldPrice: product.oldPrice || product.originalPrice,
              rating: product.rating,
              reviewCount: product.reviewCount || 245,
              image: product.image,
              images: product.images || [product.image],
              description: product.description || "Premium quality furniture designed for comfort and style.",
              colors: product.colors || ['#8B4513', '#A0522D', '#FFFFFF'],
              sku: product.sku || `FRNC${product.id}ABC`,
              tags: product.tags || ["Furniture", product.type || "Chair"],
              inStock: product.inStock !== undefined ? product.inStock : true,
              category: product.category,
              discount: product.discount
            };
            const productDataParam = encodeURIComponent(JSON.stringify(transformedProduct));
            
            return (
            <Link
              key={product.id}
              href={`/properties/${product.type?.toLowerCase()}/product-details/${product.id}?productData=${productDataParam}`}
              className="bg-white rounded-2xl shadow group relative hover:shadow-md transition duration-300 cursor-pointer block"
            >
              {/* Discount Badge */}
              <span className="absolute top-3 left-3 bg-green-900 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                {product.discount}
              </span>

              {/* Action Icons (show on hover) */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Wishlist Button */}
                <button 
                  className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleHeart(product, e);
                  }}
                  title={wishlist.some(item => item.id === product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <i className={`${wishlist.some(item => item.id === product.id) ? "fas" : "far"} fa-heart text-base transition-all duration-300 ${wishlist.some(item => item.id === product.id) ? 'text-red-500' : 'text-gray-600'}`}></i>
                </button>
                
                {/* Quick View Button */}
                <button 
                  className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCardClick(product);
                  }}
                  title="Quick view"
                >
                  <i className="fas fa-expand text-gray-600 text-base"></i>
                </button>
                
                {/* Add to Cart Button */}
                <button 
                  className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddCart(product, e);
                  }}
                  title="Add to cart"
                >
                  <i className="fas fa-shopping-cart text-gray-600 text-base"></i>
                </button>
              </div>

              {/* Image */}
              <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', product.image);
                    e.target.src = '/images/realestate2.jpg'; // Fallback image
                  }}
                />
              </div>

              {/* Type and Rating */}
              <div className="flex items-center justify-between mt-4 px-4 mb-1">
                <div className="text-gray-500 text-sm">{product.type}</div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="text-gray-800 font-semibold">{product.rating}</span>
                </div>
              </div>
              
              {/* Name and Price */}
              <div className="px-4 mb-2">
                <div className="text-gray-900 font-semibold text-left text-base">{product.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-900 text-base font-bold">{formatCurrency(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through text-sm">{formatCurrency(product.oldPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
