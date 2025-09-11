"use client";
import React, { useState, useEffect } from "react";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from "../components/Header";
import Features from "../components/Features";

const Wishlist = () => {
  // Initialize wishlist from localStorage
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      
      // Dispatch custom event to notify navbar about wishlist update
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }, [wishlistItems]);

  const removeItem = (id) => {
    setWishlistItems(prevItems => prevItems.filter((item) => item.id !== id));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const addAllToCart = () => {
    // Get current cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const currentCart = savedCart ? JSON.parse(savedCart) : [];
    
    // Add all wishlist items to cart
    const updatedCart = [...currentCart];
    
    wishlistItems.forEach(item => {
      const existingItem = updatedCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item exists, increase quantity
        existingItem.quantity += 1;
      } else {
        // If item doesn't exist, add it with quantity 1
        updatedCart.push({ ...item, quantity: 1 });
      }
    });
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Dispatch event to update navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Clear wishlist
    clearWishlist();
    
    console.log('Added all items to cart:', wishlistItems);
  };

  const handleAddCart = (item) => {
    // Get current cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const currentCart = savedCart ? JSON.parse(savedCart) : [];
    
    // Check if item already exists in cart
    const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      // If item exists, increase quantity
      const updatedCart = currentCart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      // If item doesn't exist, add it with quantity 1
      const updatedCart = [...currentCart, { ...item, quantity: 1 }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
    
    // Dispatch event to update navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Remove item from wishlist
    removeItem(item.id);
    
    console.log('Added item to cart:', item);
  };

  return (
    <>
      <HeaderFile data={{ 
        title: "Wishlist", 
        subtitle: "Your saved items",
        breadcrumb: [
          { label: "Home", href: "/" },
          { label: "Wishlist", href: "/wishlist" }
        ]
      }} />
<div className="px-6 sm:px-12 lg:px-32 py-12">
      <div className="max-w-7xl mx-auto ">
        <h2 className="text-2xl font-bold mb-8">Your Wishlist ({wishlistItems.length} items)</h2>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Start adding items to your wishlist from the shop!</p>
            <a 
              href="/shop" 
              className="bg-green-900 text-white px-6 py-3 rounded-full hover:bg-green-800 transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-[40px_2.5fr_1fr_1.2fr_1fr_120px] items-center text-center font-semibold text-base mb-4 bg-yellow-500 p-3 rounded-lg">
              <span></span>
              <span className="text-left">Product</span>
              <span>Price</span>
              <span>Date Added</span>
              <span>Stock Status</span>
              <span></span>
            </div>

            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[40px_2.5fr_1fr_1.2fr_1fr_120px] items-center py-6 border-b bg-white"
              >
                {/* Remove Button */}
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-2xl text-gray-400 hover:text-red-500"
                    aria-label="Remove from wishlist"
                  >
                    ×
                  </button>
                </div>
                {/* Product Info */}
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-gray-50 rounded-xl flex items-center justify-center w-16 h-16">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">Type: {item.type}</p>
                  </div>
                </div>
                {/* Price */}
                <span className="text-gray-900 font-semibold text-center">
                  ${item.price}.00
                </span>
                {/* Date Added */}
                <span className="text-gray-900 text-center">Today</span>
                {/* Stock Status */}
                <span className="text-green-600 font-medium px-10">Instock</span>
                {/* Add to Cart Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleAddCart(item)} 
                    className="bg-green-900 text-white py-2 px-4 rounded-full hover:bg-green-800 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}

            {/* Wishlist Link and Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 p-6 rounded-lg">
              {/* Wishlist Link Section */}
              <div className="flex items-center gap-4">
                <span className="text-gray-900 underline">Wishlist link:</span>
                <input
                  type="text"
                  value="https://www.example.com"
                  readOnly
                  className="px-4 py-2 border border-gray-300 rounded-full bg-white text-gray-600 text-sm min-w-64"
                />
                <button className="bg-green-900 text-white px-6 py-2 rounded-full hover:bg-green-800 transition-colors text-sm font-medium">
                  Copy Link
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-6">
                <button 
                  onClick={clearWishlist}
                  className="text-green-900 underline hover:text-gray-700 transition-colors"
                >
                  Clear Wishlist
                </button>
                <button 
                  onClick={addAllToCart}
                  className="bg-green-900 text-white px-8 py-2 rounded-full hover:bg-green-800 transition-colors"
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
      <Features data={furnitureData.features} />
    </>
  );
};

export default Wishlist;
